// Internationalization (i18n) Module
(function() {
  'use strict';

  const LANG_KEY = 'preferred_lang';

  // Detect current language from URL path
  function detectLang() {
    const path = window.location.pathname;
    if (path.startsWith('/zh') || path.includes('/zh/')) return 'zh';
    return 'en';
  }

  const CURRENT_LANG = detectLang();

  // Translation dictionaries
  const STRINGS = {
    // ===== Common =====
    'common.copied': { en: 'Copied!', zh: '已复制！' },
    'common.copyFailed': { en: 'Copy failed', zh: '复制失败' },
    'common.copyFailedAlt': { en: 'Copy failed, please select text and copy manually', zh: '复制失败，请手动选择文本并复制' },
    'common.characters': { en: ' chars', zh: ' 字符' },
    'common.close': { en: 'Close', zh: '关闭' },
    'common.tutorial': { en: 'Tutorial', zh: '教程说明' },

    // ===== Cookie Consent =====
    'cookie.text': {
      en: 'We use cookies and similar technologies to provide, protect, and improve our services, as well as to show ads. You can choose to accept or decline non-essential cookies.',
      zh: '我们使用 Cookie 和类似技术来提供、保护和改善我们的服务，以及展示广告。您可以选择接受或拒绝非必要的 Cookie。'
    },
    'cookie.learnMore': { en: 'Learn more', zh: '了解更多' },
    'cookie.acceptAll': { en: 'Accept All', zh: '全部接受' },
    'cookie.essentialOnly': { en: 'Essential Only', zh: '仅必要' },

    // ===== JSON Tool (app.js) =====
    'json.status.waiting': { en: 'Waiting for input', zh: '等待输入' },
    'json.status.autoFormatted': { en: 'Auto-formatted successfully', zh: '自动格式化成功 ✨' },
    'json.status.smartFormatted': { en: 'Formatted successfully (auto-fixed issues)', zh: '格式化成功 ✨ (已自动修复格式问题)' },
    'json.status.formatted': { en: 'Formatted successfully', zh: '格式化成功 ✨' },
    'json.status.minified': { en: 'Minified successfully', zh: '压缩成功' },
    'json.status.minifiedRatio': { en: 'Minified successfully', zh: '压缩成功 📦' },
    'json.status.valid': { en: 'Validation passed', zh: '验证通过 ✅' },
    'json.status.invalid': { en: 'Validation failed', zh: '验证失败' },
    'json.status.error': { en: 'JSON format error', zh: 'JSON 格式错误' },
    'json.status.checking': { en: 'Checking format...', zh: 'JSON格式检查中...' },
    'json.status.waitingComplete': { en: 'Waiting for complete JSON...', zh: '等待输入完整的JSON...' },
    'json.status.formatCheck': { en: 'Format check', zh: '格式检查' },
    'json.pleaseInput': { en: 'Please enter JSON data', zh: '请输入 JSON 数据' },
    'json.emptyState': { en: 'Paste your JSON here and watch the magic happen', zh: '在此粘贴您的 JSON，见证魔法发生✨' },
    'json.error.autoParseFailed': { en: 'Auto-parse failed', zh: '自动解析失败' },
    'json.error.parseError': { en: 'Parse Error', zh: '解析错误' },
    'json.error.hint': { en: 'Click the "Format" button for detailed error info', zh: '可以点击"格式化"按钮查看详细错误信息' },
    'json.error.hintLabel': { en: 'Tip:', zh: '提示：' },
    'json.error.checkList': {
      en: 'Check for:\n• Unclosed quotes\n• Mismatched brackets {} []\n• Property names without double quotes\n• Trailing commas (especially after the last element)\n• Incorrectly escaped special characters',
      zh: '常见问题检查：\n• 检查是否有未闭合的引号\n• 确认所有括号 {} [] 是否配对\n• 属性名是否用双引号包围\n• 是否有多余的逗号（特别是最后一个元素后）\n• 检查特殊字符是否正确转义'
    },
    'json.error.checkListShort': {
      en: 'Suggested checks:\n• All strings wrapped in double quotes\n• Property names wrapped in double quotes\n• No trailing commas\n• Brackets properly paired',
      zh: '建议检查：\n• 所有字符串是否用双引号包围\n• 对象属性名是否用双引号包围\n• 是否有多余的逗号\n• 括号是否正确配对'
    },
    'json.error.title.invalid': { en: 'JSON format invalid', zh: 'JSON 格式无效' },
    'json.error.title.valid': { en: 'JSON format valid', zh: 'JSON 格式有效' },
    'json.validation.smartFix': {
      en: 'Smart Fix: Auto-corrected formatting issues (single quotes to double quotes, added missing quotes, etc.)',
      zh: '智能修复：已自动修复格式问题（单引号转双引号、补全缺失引号等）'
    },
    'json.validation.structure': { en: 'Structure Analysis:', zh: '结构分析：' },
    'json.structure.array': { en: 'Array', zh: '数组' },
    'json.structure.items': { en: 'items', zh: '项' },
    'json.structure.firstType': { en: 'First item type', zh: '首项类型' },
    'json.structure.includesTypes': { en: 'Includes types', zh: '包含类型' },
    'json.structure.object': { en: 'Object', zh: '对象' },
    'json.structure.properties': { en: 'properties', zh: '个属性' },
    'json.structure.attributes': { en: 'Properties', zh: '属性' },
    'json.size.chars': { en: ' chars', zh: ' 字符' },

    // Error message translations (for app.js formatErrorMessage)
    'json.error.atPosition': { en: 'at position', zh: '在位置' },
    'json.error.lineColumn': { en: '(line $1 column $2)', zh: '（第 $1 行，第 $2 列）' },
    'json.error.unexpectedToken': { en: 'Unexpected token', zh: '意外的字符' },
    'json.error.expectedProperty': { en: 'Expected property name', zh: '期望属性名' },
    'json.error.expectedDoubleQuoted': { en: 'Expected double-quoted property name', zh: '属性名需要用双引号包围' },
    'json.error.unexpectedEnd': { en: 'Unexpected end of JSON input', zh: 'JSON 输入意外结束' },
    'json.error.expectedCommaBrace': { en: "Expected ',' or '}'", zh: "期望逗号 ',' 或右大括号 '}'" },
    'json.error.expectedCommaBracket': { en: "Expected ',' or ']'", zh: "期望逗号 ',' 或右方括号 ']'" },
    'json.error.unexpectedString': { en: 'Unexpected string', zh: '意外的字符串' },
    'json.error.unexpectedNumber': { en: 'Unexpected number', zh: '意外的数字' },
    'json.error.invalidToken': { en: 'Invalid or unexpected token', zh: '无效或意外的字符' },

    // ===== JSON Visualizer =====
    'viz.outputTitle': { en: 'Visual Output', zh: '可视化输出' },
    'viz.pathFormat': { en: 'Path Format:', zh: '路径格式:' },
    'viz.searchPlaceholder': { en: 'Search keys or values...', zh: '搜索键名或值...' },
    'viz.searchPlaceholderDisabled': { en: 'Enter JSON data first...', zh: '请先输入JSON数据...' },
    'viz.searchBtn': { en: 'Search', zh: '搜索' },
    'viz.prev': { en: 'Previous', zh: '上一个' },
    'viz.next': { en: 'Next', zh: '下一个' },
    'viz.fullscreen': { en: 'Fullscreen', zh: '全屏查看' },
    'viz.exitFullscreen': { en: 'Exit Fullscreen', zh: '退出全屏' },
    'viz.copyPath': { en: 'Copy path', zh: '复制路径' },
    'viz.copyContent': { en: 'Copy content', zh: '复制层级内容' },
    'viz.copyPathTitle': { en: 'Copy path:', zh: '复制路径:' },
    'viz.items': { en: 'items', zh: 'items' },
    'viz.properties': { en: 'properties', zh: 'properties' },
    'viz.formatChars': { en: ' chars', zh: ' 字符' },

    // Path format names
    'viz.pathFormat.jsonpath': { en: 'JSONPath', zh: 'JSONPath' },
    'viz.pathFormat.pythonDict': { en: 'Python Dict', zh: 'Python字典' },
    'viz.pathFormat.pythonData': { en: 'Python Data', zh: 'Python数据' },
    'viz.pathFormat.javascript': { en: 'JavaScript', zh: 'JavaScript' },
    'viz.pathFormat.javascriptData': { en: 'JavaScript Data', zh: 'JavaScript数据' },
    'viz.pathFormat.dotNotation': { en: 'Dot Notation', zh: '点分路径' },

    // ===== JSON Parser =====
    'parser.emptyInput': { en: 'Input is empty', zh: '输入内容为空' },
    'parser.tooShort': { en: 'Input is too short or empty', zh: '输入内容过短或为空' },
    'parser.mustStartWith': { en: 'JSON must start with { or [', zh: 'JSON必须以 { 或 [ 开始' },
    'parser.failed': {
      en: 'JSON parsing failed.\nOriginal error: $1\nSuggested checks:\n1. Strings wrapped in double quotes\n2. Property names quoted\n3. No trailing commas\n4. Brackets matched\n5. No JavaScript syntax (functions, undefined, etc.)',
      zh: 'JSON解析失败。\n原始错误: $1\n建议检查：\n1. 字符串是否使用双引号包围\n2. 属性名是否加了引号\n3. 是否有多余的逗号\n4. 括号是否匹配\n5. 是否包含JavaScript语法（如函数、undefined等）'
    },
    'parser.unsafeCode': { en: 'Contains unsafe code:', zh: '包含不安全的代码:' },
    'parser.evalFailed': { en: 'Safe eval failed:', zh: '安全eval失败:' },

    // ===== Timestamp Tool =====
    'ts.currentTimestamp': { en: 'Current timestamp: ', zh: '当前时间戳: ' },
    'ts.localTime': { en: 'Local time', zh: '本地时间' },
    'ts.utcTime': { en: 'UTC time', zh: 'UTC 时间' },
    'ts.isoFormat': { en: 'ISO format', zh: 'ISO 格式' },
    'ts.secondsTs': { en: 'Seconds timestamp', zh: '秒级时间戳' },
    'ts.millisTs': { en: 'Milliseconds timestamp', zh: '毫秒时间戳' },
    'ts.year': { en: 'Year', zh: '年份' },
    'ts.month': { en: 'Month', zh: '月份' },
    'ts.day': { en: 'Day', zh: '日期' },
    'ts.weekday': { en: 'Weekday', zh: '星期' },
    'ts.hour': { en: 'Hour', zh: '时' },
    'ts.minute': { en: 'Minute', zh: '分' },
    'ts.second': { en: 'Second', zh: '秒' },
    'ts.weekdays': {
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      zh: ['日', '一', '二', '三', '四', '五', '六']
    },
    'ts.error.invalidTs': { en: 'Error: Please enter a valid numeric timestamp', zh: '错误: 请输入有效的数字时间戳' },
    'ts.error.invalidDate': {
      en: 'Error: Please enter a valid date format\nExamples: 2026-01-15 or 2026-01-15T10:30:00',
      zh: '错误: 请输入有效的日期格式\n示例: 2026-01-15 或 2026-01-15T10:30:00'
    },

    // ===== QR Code Generator =====
    'qr.alert.enterText': { en: 'Please enter text to generate QR code', zh: '请输入要生成二维码的文本' },
    'qr.generating': { en: 'Generating...', zh: '生成中...' },
    'qr.generateFailed': { en: 'Generation failed', zh: '生成失败' },
    'qr.noImage': { en: 'Unable to generate QR code image', zh: '无法生成二维码图像' },
    'qr.placeholder': { en: 'QR code will appear here', zh: '二维码将在此显示' },
    'qr.noDownload': { en: 'No QR code available to download', zh: '没有可下载的二维码' },
    'qr.downloadFailed': { en: 'Download failed, please try again', zh: '下载失败，请重试' },

    // ===== Base64 Tool =====
    'base64.encodeError': { en: 'Encoding error: ', zh: '编码错误: ' },
    'base64.decodeError': { en: 'Decode error: Input is not a valid Base64 string', zh: '解码错误: 输入不是有效的 Base64 字符串' },

    // ===== Hash Tool =====
    'hash.error': { en: 'Error: ', zh: '错误: ' },

    // ===== URL Tool =====
    'url.error': { en: 'Error: ', zh: '错误: ' }
  };

  // Get translated string
  function t(key) {
    const entry = STRINGS[key];
    if (!entry) return key;
    const value = entry[CURRENT_LANG];
    if (value === undefined) return entry['en'] || key;
    return value;
  }

  // Get locale string for date formatting
  function getLocale() {
    return CURRENT_LANG === 'zh' ? 'zh-CN' : 'en-US';
  }

  // Get current page name (e.g., 'about.html', 'index.html')
  function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename;
  }

  // Build the switch URL for the other language
  function getAltLangUrl(targetLang) {
    const page = getCurrentPage();
    const targetPage = (page === 'index.html' || page === '') ? 'index.html' : page;
    return '../' + targetLang + '/' + targetPage;
  }

  // Save language preference
  function saveLangPref(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
  }

  // Get saved language preference
  function getSavedLang() {
    try {
      return localStorage.getItem(LANG_KEY);
    } catch (e) {
      return null;
    }
  }

  // Auto-detect language on first visit and redirect if needed
  // Disabled: caused redirect loop when user explicitly switches language
  function autoRedirect() {
    return;
  }

  // Setup lang-switcher click handlers to save preference before navigating
  function setupLangSwitcher() {
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.lang-btn');
      if (btn) {
        var lang = btn.getAttribute('data-lang');
        if (lang) saveLangPref(lang);
      }
    });
  }

  // Export to global scope
  window.CURRENT_LANG = CURRENT_LANG;
  window.t = t;
  window.getLocale = getLocale;
  window.i18n = {
    lang: CURRENT_LANG,
    t: t,
    getLocale: getLocale,
    getAltLangUrl: getAltLangUrl,
    saveLangPref: saveLangPref,
    autoRedirect: autoRedirect
  };

  // Run auto-redirect on load
  autoRedirect();
  // Setup lang-switcher click handlers
  setupLangSwitcher();
})();
