// --- iOS 自动化脚本示例 (使用新 API) ---
// 麦当劳

// --- 配置 ---
const DEFAULT_FIND_TIMEOUT_S = 5.0; // 默认查找元素的超时时间 (秒)
const WAIT_AFTER_TAP_MS = 3000;
const WAIT_GENERIC_MS = 1500;
const SWIPE_INTERVAL_S = 1.0;     // 滑动查找的间隔时间 (秒) - 改为秒
const FIND_ELEMENT_TIMEOUT_S = 1; // 每次查找元素的超时时间 (秒)

// --- 全局状态变量 ---
var g_swipeFindTimerId = null;     // 存储 iOS.startInterval 返回的 ID
var g_swipeFindCount = 0;          // 当前滑动次数
var g_swipeFindText = "";          // 要查找的文本
var g_swipeFindMaxCount = 10;      // 最大滑动次数
var g_swipeFindOk = false;         // 标记是否找到
var g_swipeStartX = 0;             // 滑动起始 X
var g_swipeStartY = 0;             // 滑动起始 Y
var g_swipeEndX = 0;               // 滑动结束 X
var g_swipeEndY = 0;               // 滑动结束 Y
var g_isSwipeFindRunning = false;  // 标记查找函数是否正在运行，防止重入

// --- 辅助函数 (新) ---

function findElementAndTap(text, idx=0, timeoutSeconds = DEFAULT_FIND_TIMEOUT_S) {
    iOS.log(`尝试查找并点击元素: "${text}" (超时: ${timeoutSeconds}s)`);
    const elementIds = findElement(text, timeoutSeconds)
    if (elementIds && elementIds.length > idx) {
        const elementId = elementIds[idx];
        iOS.log(`找到元素 "${text}", 使用 ID: ${elementId} (共找到 ${elementIds.length} 个). 调用 iOS.tapElement...`);
        iOS.tapElement(elementId);
        iOS.log(`已调用 iOS.tapElement 尝试点击 ID: ${elementId} ("${text}")`);
        return true;
    } else {
        iOS.log(`查找元素 "${text}" 失败 (超时或未找到).`);
        return false;
    }
}

function findElement(text, timeoutSeconds = DEFAULT_FIND_TIMEOUT_S) {
    iOS.log(`尝试查找元素: "${text}" (超时: ${timeoutSeconds}s)`);
    return iOS.findElements(text, timeoutSeconds);
}

// --- 全局的计时器回调函数 ---
// 这个函数会被 iOS.startInterval 定期调用
function swipeFindCallback() {
    // 防止重入：如果上一次回调还在执行中（虽然不太可能，但作为保险）
    if (g_isSwipeFindRunning) {
        iOS.log("[swipeFindCallback] 警告：检测到重入，跳过此次执行。");
        return;
    }
    g_isSwipeFindRunning = true; // 标记开始执行

    iOS.log(`[计时器回调 swipeFindCallback] 开始查找: "${g_swipeFindText}", 次数: ${g_swipeFindCount + 1}/${g_swipeFindMaxCount}`);

    // 1. 尝试查找元素
    var elem = findElement(g_swipeFindText, FIND_ELEMENT_TIMEOUT_S); // 使用较短超时

    if (elem && elem.length > 0) {
        // 找到了！
        iOS.log(`[计时器回调 swipeFindCallback] 找到元素 "${g_swipeFindText}"! 停止计时器 ID: ${g_swipeFindTimerId}`);
        // iOS.tapElement(elem[0]); // 无法直接点击原始生效，采用坐标点击
        var eleframe = iOS.getElementFrame(elem[0]);
        iOS.tap(eleframe.x+eleframe.width/2, eleframe.y+eleframe.height/2);
        g_swipeFindOk = true;
        // --- 使用正确的停止函数和全局 ID ---
        if (g_swipeFindTimerId !== null) {
            iOS.stopInterval(g_swipeFindTimerId); // 正确停止
            g_swipeFindTimerId = null; // 清除 ID
        }
        g_isSwipeFindRunning = false; // 标记执行结束
        return; // 结束回调
    }

    // 未找到，增加计数并检查是否达到最大次数
    g_swipeFindCount++;
    if (g_swipeFindCount >= g_swipeFindMaxCount) {
        iOS.log(`[计时器回调 swipeFindCallback] 达到最大滑动次数 (${g_swipeFindMaxCount}). 停止计时器 ID: ${g_swipeFindTimerId}`);
        g_swipeFindOk = false; // 标记未找到
        // --- 使用正确的停止函数和全局 ID ---
        if (g_swipeFindTimerId !== null) {
            iOS.stopInterval(g_swipeFindTimerId); // 正确停止
            g_swipeFindTimerId = null; // 清除 ID
        }
        g_isSwipeFindRunning = false; // 标记执行结束
        return; // 结束回调
    }

    // 未找到且未达最大次数，执行滑动
    iOS.log(`[计时器回调 swipeFindCallback] 未找到，执行第 ${g_swipeFindCount} 次滑动...`);
    iOS.swipe(g_swipeStartX, g_swipeStartY, g_swipeEndX, g_swipeEndY, 0.2);

    // 滑动后不需要做任何事，等待下一次计时器触发
    iOS.log(`[计时器回调 swipeFindCallback] 滑动完成，等待下一次触发...`);
    g_isSwipeFindRunning = false; // 标记执行结束
}

// --- 启动滑动查找的函数 ---
function findProdTap(text) {
    iOS.log(`findProdTap: 初始化查找 "${text}"...`);

    // --- 重置全局状态 ---
    g_swipeFindText = text;
    g_swipeFindCount = 0;
    g_swipeFindMaxCount = 10; // 可在此处设置不同的最大次数
    g_swipeFindOk = false;
    g_isSwipeFindRunning = false; // 重置运行标记

    // --- 如果存在旧计时器，先停止 ---
    if (g_swipeFindTimerId !== null) {
        iOS.log(`findProdTap: 检测到旧的计时器 ID: ${g_swipeFindTimerId}，正在停止...`);
        iOS.stopInterval(g_swipeFindTimerId);
        g_swipeFindTimerId = null;
    }

    // --- 计算滑动坐标 ---
    var screenWidth = iOS.getScreenWidth();
    var screenHeight = iOS.getScreenHeight();
    g_swipeStartX = screenWidth / 2;
    g_swipeStartY = screenHeight / 10 * 8;
    g_swipeEndX = screenWidth / 2;
    g_swipeEndY = screenHeight / 10 * 7; // Y 减小，是向上滑动

    // --- 执行第一次查找 ---
    iOS.log(`findProdTap: 执行第一次查找 "${text}"...`);
    var firstElem = findElement(text, FIND_ELEMENT_TIMEOUT_S);
    if (firstElem && firstElem.length > 0) {
        iOS.sleep(3)
        iOS.log(`findProdTap: 第一次查找成功，点击元素.`);
        // iOS.tapElement(firstElem[0]);
        var eleframe = iOS.getElementFrame(firstElem[0]);
        iOS.tap(eleframe.x+eleframe.width/2, eleframe.y+eleframe.height/2);
        g_swipeFindOk = true;
        // 找到了就不需要启动计时器了
        return; // 直接返回
    }

    // --- 第一次未找到，执行首次滑动并准备启动计时器 ---
    iOS.log(`findProdTap: 第一次未找到，执行首次滑动...`);
    iOS.swipe(g_swipeStartX, g_swipeStartY, g_swipeEndX, g_swipeEndY, 0.2);
    g_swipeFindCount = 1; // 记录已经滑动的次数

    // --- 启动计时器，使用全局回调函数名 ---
    // 注意：这里传递的是字符串 "swipeFindCallback"
    iOS.log(`findProdTap: 启动计时器，每隔 ${SWIPE_INTERVAL_S} 秒调用 'swipeFindCallback' 函数...`);
    g_swipeFindTimerId = iOS.startInterval("swipeFindCallback", SWIPE_INTERVAL_S);

    if (g_swipeFindTimerId === null || typeof g_swipeFindTimerId === 'undefined') {
         iOS.log(`findProdTap: 错误！启动计时器失败！返回的 ID: ${g_swipeFindTimerId}`);
         g_swipeFindTimerId = null; // 确保 ID 为 null
    } else {
         iOS.log(`findProdTap: 计时器已启动，ID: ${g_swipeFindTimerId}. 等待查找结果...`);
    }

    // 这个函数会立即返回，查找和滑动将在后台通过计时器进行。
}

// --- 主逻辑 ---
function runAutomation() {
    iOS.log("自动化脚本开始运行 (使用新 API)...");

    if (!findElementAndTap("到店取餐")) { // 使用新的辅助函数
        iOS.log("错误：未能找到并尝试点击 '到店取餐'，脚本终止。");
        return; // 关键步骤失败，退出
    }

    // 2. 等待界面更新 (等待应用响应点击操作)
    iOS.log(`等待 ${WAIT_AFTER_TAP_MS / 1000} 秒让界面加载...`);
    iOS.sleep(WAIT_AFTER_TAP_MS / 1000.0);

    // 3. 查找并点击 "购买"
    if (!findElementAndTap("去点餐")) {
        // 根据需要决定是否继续
    } else {
         iOS.log(`等待 ${WAIT_GENERIC_MS / 1000} 秒...`);
         iOS.sleep(WAIT_GENERIC_MS / 1000.0);
    }

    findProdTap("精选单人餐三件套");

    // --- 等待 findProdTap 完成 ---
    // 使用轮询检查 g_swipeFindTimerId 是否变为 null 来等待
    var waitLoops = 0;
    // 计算最大等待时间：(最大滑动次数 + 1 次初始查找) * (查找超时 + 滑动间隔 + 一点额外时间)
    var maxWaitTimeS = (g_swipeFindMaxCount + 1) * (FIND_ELEMENT_TIMEOUT_S + SWIPE_INTERVAL_S + 0.5);
    var maxWaitLoops = Math.ceil(maxWaitTimeS); // 等待的秒数

    iOS.log(`开始轮询等待 findProdTap 完成 (最多 ${maxWaitLoops} 秒)...`);

    while (g_swipeFindTimerId !== null && waitLoops < maxWaitLoops) {
        iOS.log(`等待中... (${waitLoops + 1}/${maxWaitLoops}) Timer ID: ${g_swipeFindTimerId}`);
        iOS.sleep(1.0); // 使用原生的 sleep 阻塞等待
        waitLoops++;
    }

    // 检查最终结果
    if (g_swipeFindTimerId !== null) {
         iOS.log(`警告：等待 findProdTap 超时 (${maxWaitLoops}秒)！可能仍在后台滑动。强制停止计时器 ID: ${g_swipeFindTimerId}`);
         // 强制停止计时器
         iOS.stopInterval(g_swipeFindTimerId);
         g_swipeFindTimerId = null;
         g_swipeFindOk = false; // 超时视为失败
    } else {
         iOS.log(`findProdTap 已完成 (计时器 ID 为 null)，查找结果: ${g_swipeFindOk ? '成功' : '失败或未找到'}`);
    }


    // 在这里可以根据 g_swipeFindOk 的值执行后续操作
    if (g_swipeFindOk) {
        iOS.log("产品查找成功，可以执行加入购物车等操作...");
        // ...

        findElementAndTap("加入购物车")

        iOS.sleep(1)

        findElementAndTap("去结算")

        findElementAndTap("外带")
        
    } else {
        iOS.log("产品查找失败或超时，脚本可能需要终止或执行其他逻辑。");
        // ...
    }


    // ... (其他注释掉的代码) ...

    iOS.log("自动化脚本执行完毕。");
}

// --- 脚本入口 ---
runAutomation();