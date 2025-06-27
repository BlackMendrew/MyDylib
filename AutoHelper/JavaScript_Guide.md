# iOS 自动化脚本 API 文档

## 核心对象：`iOS`

所有与 iOS 设备交互的功能都通过全局的 `iOS` 对象来调用。

## API 参考

---

### 基础模拟操作

#### 1. `iOS.tap(x, y, [options])`

*   **描述:** 在屏幕的指定绝对坐标 (x, y) 处模拟一次点击。
*   **参数:**
    *   `x` (Number): 点击位置的 X 坐标（屏幕坐标系，单位：点）。
    *   `y` (Number): 点击位置的 Y 坐标（屏幕坐标系，单位：点）。
    *   `options` (Object, 可选): 一个包含额外选项的字典。
        *   `mode` (String): 点击模式。
            *   `'smart'` (默认): 智能模式。优先尝试发送 `UIControl` 事件，如果目标不是 `UIControl` 或事件无效，则回退到物理点击。
            *   `'physical'`: 物理模式。总是使用底层的 `PTFakeTouch` 模拟真实的物理触摸（按下和抬起）。**当智能模式点击无效时，请使用此模式。**
*   **返回:** `void`
*   **示例:**
    ```javascript
    // 智能点击屏幕坐标 (100, 250)
    iOS.tap(100, 250);

    // 对于某些特殊按钮，强制使用物理点击
    iOS.tap(320, 780, { mode: 'physical' });
    ```
*   **注意:**
    *   坐标是绝对屏幕坐标。
    *   推荐优先使用 `iOS.findElement...` 和 `iOS.tapElement`。仅在无法通过其他方式找到元素，或需要点击特定区域时，才考虑使用坐标点击。

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
    // 从屏幕中间向上滑动，持续 0.3 秒
    var screenWidth = iOS.getScreenWidth();
    var screenHeight = iOS.getScreenHeight();
    iOS.swipe(screenWidth / 2, screenHeight / 2, screenWidth / 2, screenHeight / 2 - 200, 0.3);
    ```

---

### 元素查找与交互

**核心概念：**

*   **查找:** 使用 `iOS.findElements...` 系列函数来定位屏幕上的元素。
*   **元素 ID:** 查找函数会返回一个包含数字 ID 的数组，每个 ID 代表一个找到的元素。
*   **交互:** 使用获取到的 `elementId` 调用 `iOS.tapElement`、`iOS.inputText` 或 `iOS.getElementFrame`。
*   **元素映射:** **每次调用任何 `find...` 函数都会清除之前查找的结果和 ID 映射。**

#### 3. `iOS.findElements(text, timeoutSeconds)`

*   **描述:** 在屏幕上查找与指定文本匹配的元素。它会优先查找具有匹配文本或 Accessibility Identifier 的 UI 控件，如果找不到，则会尝试使用 OCR 查找屏幕上的文本。此函数会等待指定的超时时间，期间不断重试查找。
*   **参数:**
    *   `text` (String): 要查找的文本内容。
    *   `timeoutSeconds` (Number): 最大查找等待时间（秒）。如果为 0，则只查找一次。
*   **返回:** `Array<Number>`: 包含所有找到且可见的元素的 ID 数组。如果超时或未找到，返回空数组 `[]`。
*   **示例:**
    ```javascript
    // 查找 "登录" 按钮，最多等待 5 秒
    var loginButtonIds = iOS.findElements("登录", 5.0);
    ```

#### 4. `iOS.findInputFields(placeholder, timeoutSeconds)`

*   **描述:** **（推荐用于查找输入框）** 专门用于查找 `UITextField` 或 `UITextView` 等输入框控件。
*   **参数:**
    *   `placeholder` (String): 用于匹配输入框的文本。会匹配输入框的 `placeholder`、当前文本、`accessibilityLabel` 或 `accessibilityIdentifier`。**如果传入空字符串 `""`，则会查找屏幕上所有可见的输入框。**
    *   `timeoutSeconds` (Number): 最大查找等待时间（秒）。
*   **返回:** `Array<Number>`: 包含所有找到的输入框元素的 ID 数组。
*   **示例:**
    ```javascript
    // 查找 placeholder 为 "请输入密码" 的输入框
    var passwordFieldIds = iOS.findInputFields("请输入密码", 3.0);
    ```

#### 5. `iOS.findElementByImage(base64ImageString)`

*   **描述:** **（当文本查找无效时使用）** 在当前屏幕上查找与提供的**Base64编码**的图片最匹配的区域。
*   **参数:**
    *   `base64ImageString` (String): 模板图片的 Base64 编码字符串（**不含** `data:image/png;base64,` 前缀）。
*   **返回:** `Object | null`: 如果找到，返回一个包含 `{x, y, width, height}` 的对象；否则返回 `null`。
*   **示例:**
    ```javascript
    // 假设 searchIconBase64 是已准备好的字符串
    var frame = iOS.findElementByImage(searchIconBase64);
    if (frame) {
        iOS.tap(frame.x + frame.width / 2, frame.y + frame.height / 2);
    }
    ```

#### 6. `iOS.findElementByImageURL(imageUrl)`

*   **描述:** **（推荐的图片查找方式）** 在当前屏幕上查找与指定 URL 的图片最匹配的区域。**内部会自动处理图片的下载和本地缓存。**
*   **参数:**
    *   `imageUrl` (String): 模板图片的公开 URL。
*   **返回:** `Object | null`: 如果找到，返回一个包含 `{x, y, width, height}` 的对象；如果图片下载失败或未找到，则返回 `null`。
*   **示例:**
    ```javascript
    var searchIconUrl = "https://example.com/search_icon.png";
    var frame = iOS.findElementByImageURL(searchIconUrl);
    ```
*   **注意:** 首次使用会从网络下载图片，可能耗时较长。后续使用会直接读取本地缓存，速度很快。

#### 7. `iOS.getElementFrame(elementId)`

*   **描述:** 获取指定 `elementId` 对应的元素在屏幕上的位置和大小（Frame）。
*   **参数:**
    *   `elementId` (Number): 由**当前**任何 `find...` 函数调用返回的元素 ID。
*   **返回:** `Object | null`: 如果找到，返回一个 `{x, y, width, height}` 对象；否则返回 `null`。

#### 8. `iOS.tapElement(elementId)`

*   **描述:** 模拟点击与指定 `elementId` 关联的元素。**这是推荐的点击元素的方式。**
*   **参数:**
    *   `elementId` (Number): 由**当前**任何 `find...` 函数调用返回的元素 ID。
*   **返回:** `void`

#### 9. `iOS.inputText(text, elementId, [options])`

*   **描述:** 向指定 `elementId` 对应的输入框输入文本。
*   **参数:**
    *   `text` (String): 要输入的字符串。
    *   `elementId` (Number): 由 `iOS.findInputFields` 或其他 `find...` 函数返回的目标输入框 ID。
    *   `options` (Object, 可选):
        *   `clear` (Boolean): 如果为 `true`，则在输入前先清空输入框的原有文本。默认为 `false`。
*   **返回:** `void`
*   **示例:**
    ```javascript
    var usernameIds = iOS.findInputFields("用户名", 3);
    if (usernameIds.length > 0) {
        iOS.inputText("my_username", usernameIds[0], { clear: true });
    }
    ```

---

### 辅助与流程控制

#### 10. `iOS.startInterval(functionName, intervalSeconds)`

*   **描述:** 启动一个原生定时器，以指定间隔重复调用一个 JavaScript **全局函数**。
*   **参数:**
    *   `functionName` (String): 要调用的**全局** JavaScript 函数的名称（字符串形式）。
    *   `intervalSeconds` (Number): 触发间隔（秒），必须大于 0。
*   **返回:** `Number | null`: 成功则返回唯一的定时器 ID，失败返回 `null`。

#### 11. `iOS.stopInterval(timerId)`

*   **描述:** 停止一个由 `iOS.startInterval` 启动的定时器。
*   **参数:**
    *   `timerId` (Number): `iOS.startInterval` 返回的 ID。
*   **返回:** `void`

#### 12. `iOS.log(message)`

*   **描述:** 将消息写入 dylib 的日志文件，用于调试。
*   **参数:**
    *   `message` (String): 要记录的日志消息。
*   **返回:** `void`

#### 13. `iOS.sleep(seconds)`

*   **描述:** **阻塞性**地暂停脚本执行指定的秒数。
*   **参数:**
    *   `seconds` (Number): 暂停的秒数，可以是小数。
*   **返回:** `void`
*   **注意:** **会阻塞整个 JS 线程**，请谨慎使用。优先使用带超时的查找函数来等待 UI 变化。

#### 14. `iOS.scriptDidComplete()`

*   **描述:** 通知原生 Tweak 脚本已完全执行完毕。脚本应在其所有逻辑（包括异步操作和定时器）完成后调用此方法，以便原生层正确清理状态。
*   **返回:** `void`

---

### 获取设备信息

#### 15. `iOS.getScreenWidth()`

*   **描述:** 获取当前设备屏幕的宽度（单位：点）。
*   **返回:** `Number`

#### 16. `iOS.getScreenHeight()`

*   **描述:** 获取当前设备屏幕的高度（单位：点）。
*   **返回:** `Number`