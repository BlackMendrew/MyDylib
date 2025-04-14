# iOS 自动化脚本 API 文档

## 核心对象：`iOS`

所有与 iOS 设备交互的功能都通过全局的 `iOS` 对象来调用。

## API 参考

---

### 基础模拟操作

#### 1. `iOS.tap(x, y)`

*   **描述:** 在屏幕的指定绝对坐标 (x, y) 处模拟一次点击（按下并抬起）。
    *   `x` (Number): 点击位置的 X 坐标（屏幕坐标系，单位：点）。
    *   `y` (Number): 点击位置的 Y 坐标（屏幕坐标系，单位：点）。
*   **返回:** `void`
*   **示例:**
    ```javascript
    // 点击屏幕坐标 (100, 250)
    iOS.tap(100, 250);
    ```
*   **注意:**
    *   坐标是绝对屏幕坐标。
    *   由于 UI 元素可能滚动或移动，直接使用固定坐标点击动态界面（如列表、滚动视图）可能不可靠。
    *   **推荐**：尽可能使用 `iOS.findElement` 和 `iOS.tapElement` 来点击可识别的元素。仅在无法通过文本或 ID 找到元素时，或需要点击屏幕特定区域（而非元素）时，才考虑使用 `iOS.tap(x, y)`。

#### 2. `iOS.swipe(startX, startY, endX, endY, duration)`

*   **描述:** 模拟一次从起点 (startX, startY) 到终点 (endX, endY) 的滑动操作。
*   **参数:**
    *   `startX` (Number): 滑动起点的 X 坐标。
    *   `startY` (Number): 滑动起点的 Y 坐标。
    *   `endX` (Number): 滑动终点的 X 坐标。
    *   `endY` (Number): 滑动终点的 Y 坐标。
    *   `duration` (Number): 滑动持续时间（秒）。影响滑动速度。
*   **返回:** `void`
*   **示例:**
    ```javascript
    // 从屏幕中间向上滑动一小段距离，持续 0.3 秒
    var screenWidth = iOS.getScreenWidth();
    var screenHeight = iOS.getScreenHeight();
    var startX = screenWidth / 2;
    var startY = screenHeight / 2;
    var endX = startX;
    var endY = startY - 100;
    iOS.swipe(startX, startY, endX, endY, 0.3);
    ```
*   **注意:**
    *   坐标是绝对屏幕坐标。
    *   `duration` 不宜过短（可能导致滑动不被识别）或过长（影响效率）。通常 0.2 到 0.8 秒比较合适。

---

### 元素查找与交互

**核心概念：**

*   **查找:** 使用 `iOS.findElements` 来定位屏幕上的元素。
*   **元素 ID:** `iOS.findElements` 返回一个包含数字 ID 的数组，每个 ID 代表一个找到的元素。
*   **交互:** 使用获取到的 `elementId` 调用 `iOS.tapElement` 或 `iOS.getElementFrame`。
*   **元素映射:** 每次调用 `iOS.findElements` 都会清除之前查找的结果和 ID 映射。

#### 3. `iOS.findElements(text, timeoutSeconds)`

*   **描述:** 在屏幕上查找与指定文本匹配的元素。它会优先查找具有匹配文本或 Accessibility Identifier 的 UI 控件，如果找不到，则会尝试使用 OCR 查找屏幕上的文本。此函数会等待指定的超时时间，期间不断重试查找，直到找到元素或超时。**只返回中心点在屏幕可见范围内的元素。**
*   **参数:**
    *   `text` (String): 要查找的文本内容。可以是控件的 `text`, `accessibilityLabel`, `accessibilityIdentifier`，或是屏幕上可见的任意文本（用于 OCR）。
    *   `timeoutSeconds` (Number): 最大查找等待时间（秒）。如果设置为 0 或负数，则只查找一次，不等待。推荐设置一个合理的超时时间（例如 3-10 秒）。
*   **返回:** `Array<Number>`: 包含所有找到且可见的元素的 ID 数组。如果超时或未找到可见元素，则返回空数组 `[]`。
*   **示例:**
    ```javascript
    // 查找 "登录" 按钮，最多等待 5 秒
    var loginButtonIds = iOS.findElements("登录", 5.0);
    if (loginButtonIds && loginButtonIds.length > 0) {
        iOS.log("找到了登录按钮，ID: " + loginButtonIds[0]);
    } else {
        iOS.log("未找到登录按钮。");
    }
    ```
*   **注意:**
    *   **重要:** 每次调用此函数都会清除之前的查找结果和 ID 映射。后续使用 `elementId` 时，必须确保它是本次 `findElements` 调用返回的。
    *   返回的元素可能是 UI 控件，也可能是 OCR 识别的文本区域。
    *   **边界检查:** 此函数内部已进行优化，只会返回中心点在当前屏幕边界内的元素，避免了点击屏幕外元素的问题。
    *   OCR 查找可能较慢且依赖设备性能和屏幕内容清晰度。

#### 4. `iOS.getElementFrame(elementId)`

*   **描述:** 获取指定 `elementId` 对应的元素在屏幕上的位置和大小（Frame）。
*   **参数:**
    *   `elementId` (Number): 由**当前** `iOS.findElements` 调用返回的元素 ID。
*   **返回:** `Object | null`: 如果找到元素且能获取 Frame，返回一个包含 `x`, `y`, `width`, `height` 属性（均为 Number 类型）的对象；如果 `elementId` 无效或无法获取 Frame，则返回 `null`。
*   **示例:**
    ```javascript
    var ids = iOS.findElements("用户名", 3.0);
    if (ids && ids.length > 0) {
        var frame = iOS.getElementFrame(ids[0]);
        if (frame) {
            iOS.log(`用户名输入框位置: x=${frame.x}, y=${frame.y}`);
        } else {
            iOS.log("无法获取用户名输入框的 Frame。");
        }
    }
    ```
*   **注意:**
    *   返回的坐标和尺寸是基于屏幕坐标系的。
    *   务必使用最近一次 `findElements` 返回的 `elementId`。

#### 5. `iOS.tapElement(elementId)`

*   **描述:** 模拟点击与指定 `elementId` 关联的元素。**这是推荐的点击元素的方式。**
*   **参数:**
    *   `elementId` (Number): 由**当前** `iOS.findElements` 调用返回的元素 ID。
*   **返回:** `void`
*   **示例:**
    ```javascript
    var confirmIds = iOS.findElements("确认", 5.0);
    if (confirmIds && confirmIds.length > 0) {
        iOS.tapElement(confirmIds[0]); // 点击第一个找到的 "确认" 按钮
        iOS.sleep(1.0); // 点击后可能需要等待 UI 响应
    }
    ```
*   **注意:**
    *   这是比 `iOS.tap(x, y)` 更健壮的点击方式，因为它能适应元素位置的变化，并优先使用更可靠的事件发送机制。
    *   务必使用最近一次 `findElements` 返回的 `elementId`。

---

### 辅助函数

#### 6. `iOS.startInterval(functionName, intervalSeconds)`

*   **描述:** 启动一个原生定时器，该定时器会以指定的间隔（秒）重复调用一个在 JavaScript **全局作用域**中定义的函数。
*   **参数:**
    *   `functionName` (String): 要重复调用的 **全局** JavaScript 函数的名称（**必须是字符串形式的函数名，不能是函数引用或匿名函数**）。
    *   `intervalSeconds` (Number): 定时器触发的时间间隔（秒）。必须大于 0。
*   **返回:** `Number | null`: 如果定时器成功启动，返回一个唯一的定时器 ID (Number 类型)，用于后续调用 `iOS.stopInterval`；如果启动失败（例如函数名无效、间隔无效），则返回 `null`。
*   **示例:**
    ```javascript
    // 1. 定义一个全局函数
    function checkMessages() {
        iOS.log("正在检查新消息...");
        // ... 其他逻辑 ...
    }

    // 2. 启动定时器，每 10 秒调用一次 checkMessages
    var messageTimerId = iOS.startInterval("checkMessages", 10.0);

    if (messageTimerId !== null) {
        iOS.log("消息检查定时器已启动，ID: " + messageTimerId);
    } else {
        iOS.log("启动消息检查定时器失败！");
    }
    ```
*   **注意:**
    *   **全局函数限制:** 传递给 `functionName` 的必须是在脚本顶层定义的函数名（字符串）。不能是局部函数、匿名函数或闭包。
    *   **状态访问:** 全局回调函数无法直接访问定义在其他函数作用域内的局部变量。如果需要在回调中访问或修改状态，需要将状态存储在全局变量中（请谨慎使用，避免命名冲突）。
    *   **停止定时器:** 必须使用返回的 `timerId` 和 `iOS.stopInterval` 来停止定时器，否则它会一直运行。
    *   **原生实现:** 这个定时器是由原生代码 (NSTimer) 管理的，比纯 JavaScript 的 `setInterval`（如果环境支持的话）在应用后台或锁屏时可能表现更稳定（取决于具体实现）。

#### 7. `iOS.stopInterval(timerId)`

*   **描述:** 停止一个由 `iOS.startInterval` 启动的原生定时器。
*   **参数:**
    *   `timerId` (Number): 之前调用 `iOS.startInterval` 时返回的定时器 ID。
*   **返回:** `void`
*   **示例:**
    ```javascript
    // 假设 messageTimerId 是之前 startInterval 返回的 ID
    if (messageTimerId !== null) {
        iOS.stopInterval(messageTimerId);
        iOS.log("已停止消息检查定时器，ID: " + messageTimerId);
        messageTimerId = null; // 清除本地保存的 ID
    }
    ```
*   **注意:**
    *   必须传递正确的 `timerId`。
    *   停止一个已经被停止的定时器通常没有副作用。

#### 8. `iOS.log(message)`

*   **描述:** 将指定的字符串消息写入到 dylib 的日志文件中。这对于调试脚本非常有用。
*   **参数:**
    *   `message` (String): 要记录的日志消息。
*   **返回:** `void`
*   **示例:**
    ```javascript
    var userName = "testUser";
    iOS.log("正在处理用户: " + userName);
    ```
*   **注意:**
    *   日志文件通常位于应用沙盒的 `Documents` 目录下，文件名为 `AutoHelper.log`（具体名称取决于 dylib 实现）。你可以通过连接设备或使用文件管理工具查看日志内容。
    *   日志会包含时间戳。

#### 9. `iOS.sleep(seconds)`

*   **描述:** 暂停当前 JavaScript 脚本的执行指定的秒数。这是一个**阻塞性**操作。
*   **参数:**
    *   `seconds` (Number): 需要暂停的秒数。可以是小数。
*   **返回:** `void`
*   **示例:**
    ```javascript
    iOS.log("操作 A 完成。");
    iOS.sleep(2.5); // 等待 2.5 秒
    iOS.log("继续执行操作 B。");
    ```
*   **注意:**
    *   **警告:** `iOS.sleep()` 会**完全阻塞** JavaScript 线程。在 sleep 期间，**所有** JavaScript 代码（包括由 `iOS.startInterval` 安排的定时器回调）都**不会**执行。
    *   **用途:** 主要用于在自动化流程的步骤之间添加短暂的、固定的等待时间，以允许 UI 更新或等待网络请求响应。
    *   **避免滥用:** 不要使用非常长的 `sleep` 时间，这会导致脚本看起来卡死且无响应。对于需要等待某个条件满足的情况，应优先考虑使用带有超时的轮询查找（例如结合 `iOS.findElements` 的 `timeoutSeconds`）。

---

### 获取设备信息

#### 10. `iOS.getScreenWidth()`

*   **描述:** 获取当前设备屏幕的宽度。
*   **参数:** 无
*   **返回:** `Number`: 屏幕宽度（单位：点）。
*   **示例:** `var width = iOS.getScreenWidth();`

#### 11. `iOS.getScreenHeight()`

*   **描述:** 获取当前设备屏幕的高度。
*   **参数:** 无
*   **返回:** `Number`: 屏幕高度（单位：点）。
*   **示例:** `var height = iOS.getScreenHeight();`
