// --- iOS 自动化脚本示例 (使用新 API) ---
// 麦当劳

// --- 配置 ---
const DEFAULT_FIND_TIMEOUT_S = 5.0; // 默认查找元素的超时时间 (秒)

const SEARCH_IMG_STR = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/2wBDAQICAgICAgUDAwUKBwYHCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgr/wgARCAA8ADwDAREAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAYHBAUIAQn/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAD7kAAAAEfKjMsxi2zfgHPp0Cenhz8dAnpHCJlngFXkwJAYBUxdABS5bZmgpk3pYJX5Up1EACGkJJsZhtTYgAAAH//EADYQAAECBQAHBQYGAwAAAAAAAAECAwQFBgcRAAgSEyExYRAiQVFyFBUgMlKxGDAzYoGhcZKy/9oACAEBAAE/APybjXMpW1lPOVFVEYUpJ2WIdvBciF/SgePU8h94KptaC/RMwo8M0pIXOLES4dlbqMnBC9krUeqQlOn4Ybwge2DWRmxiupiMf7b7P9aRtUazlgkGY1ghmrZC1gPRLasuNDjxK9kLT6lBSevnbe5lK3Tp4VFSsYVozsxEO6AHGF/SoA8Oh5HtJShBWtYSAMqJ8NKElB1nLyzC4dSo31NSF0MSuCcHceIJKQR4g/qKzz2kp5ckNobQG20hKUjCQngAOxSG3EFt1AUlQwpKuRGlbSr8MN5ICuqZaLVNVA7uZpBjg2wc94Dyx86R0UnlohSVp2kKBBAwRyI7Lux8TK7VVHHwhO9akkSWynmk7tWD/HPTU+l0PBWNgYlkAKi4uJed6qDpb/5Qn4NcKXw0ZY6PiXsFUJGQzrORyUXAj7LVpaWOiJna+nphFq2nXpJCqcV9St0nJ7KokbdS0xMaceUAiYQLsMpXkFoKc/3pqbVOtmnJrauc5amUij3DuF892pWFAelwKz6x8GuLUq4yRSm08kG+mk9mDahDoPHdhRCcj9zhGPQrSmJI1TNNy+m2F7SJfAtQyFeYbQEj7dt8LV1jT1YNX1s6yTNGMe9Zc0gn2pPIqCR8+U8FJ5nAUOOlsNaG29fwiIebzNqSzQcHoOYOhCCrzQ4e6odDhXTQTeUmG9s96Q26Cc73fJ2ceec40uZrP24oOGXCSeYtzyanuswUvdC0hf73BkJ/wMq6aWzqpyV6wCat1hZZFwUymDAXKXotBbZhivuo7quSQnKQc90/Nx4gcRzHQ/BXtgbWXIeXHVDTaERiucdBL3LquqiOCz6gdE6jdrN9tmo58UfQYhn77nSgrA2qt08iNkFMNrjG+KY6MUXnQfMFXBB9IGl0rTUpduQe46lYUlbatqEjWQA7Dq8SknwPIg8D/AIpGnGKQpeBpeHjX4lEBCoYQ/EKytYSMZJ/K//EABQRAQAAAAAAAAAAAAAAAAAAAGD/2gAIAQIBAT8AAf/EABQRAQAAAAAAAAAAAAAAAAAAAGD/2gAIAQMBAT8AAf/Z";
const CLOSE_IMG_STR = "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";

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

function findImageElementAndTap(imgStr) {
    // http开头
    if (imgStr.startsWith("http")) {
        var frame = iOS.findElementByImageURL(imgStr);
    } else {
        var frame = iOS.findElementByImage(imgStr);
    }

    if (frame) {
        iOS.log("成功通过图片找到控件！位置: " + JSON.stringify(frame));
        
        // 既然找到了 Frame，我们可以直接点击它的中心点
        var centerX = frame.x + frame.width / 2;
        var centerY = frame.y + frame.height / 2;
        
        iOS.log("步骤2: 点击找到的控件中心点 (" + centerX + ", " + centerY + ")");
        iOS.tap(centerX, centerY);
        
        iOS.sleep(1.5);

        return true

    } else {
        iOS.log("错误：未能在屏幕上找到指定的图片。");

        return false
    }
}


// --- 主逻辑 ---
function runAutomation() {
    iOS.log("自动化脚本开始运行...");

    if (!findElementAndTap("到店取餐")) { // 使用新的辅助函数
        iOS.log("错误：未能找到并尝试点击 '到店取餐'，脚本终止。");
        return; // 关键步骤失败，退出
    }

    iOS.sleep(1);

    // 3. 查找并点击 "购买"
    findElementAndTap("去点餐", 5) // 有时候会有这个选项，3秒钟超时

    // 点搜索
    findImageElementAndTap(SEARCH_IMG_STR);

    let prodName = '板烧鸡腿堡套餐';

    var allInputIds = iOS.findInputFields("", 2); // 2秒超时
    iOS.inputText(prodName, allInputIds[0], { clear: true });  // 在第一个输入框中输入

    iOS.sleep(1)

    findElementAndTap(prodName)

    // 在这里可以根据 g_swipeFindOk 的值执行后续操作
    iOS.log("产品查找成功，可以执行加入购物车等操作...");
    findElementAndTap("加入购物车")

    iOS.sleep(3)
    
    // findElementAndTap("去结算")
    iOS.tap(319, 789)

    iOS.sleep(1)

    findImageElementAndTap(CLOSE_IMG_STR); // 关闭弹窗

    iOS.sleep(1)

    findElementAndTap("外带")

    iOS.log("调用 iOS.scriptDidComplete() 通知原生脚本结束。");
    iOS.scriptDidComplete();
}

// --- 脚本入口 ---
runAutomation();