// 主题管理类
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.themeToggle = document.getElementById('theme-toggle');
    this.themeDropdown = document.getElementById('theme-dropdown');
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.bindEvents();
  }

  bindEvents() {
    // 主题切换按钮点击
    this.themeToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // 主题选项点击
    this.themeDropdown?.addEventListener('click', (e) => {
      const themeOption = e.target.closest('.theme-option');
      if (themeOption) {
        const theme = themeOption.dataset.theme;
        this.setTheme(theme);
        this.hideDropdown();
      }
    });

    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', () => {
      this.hideDropdown();
    });
  }

  toggleDropdown() {
    this.themeDropdown?.classList.toggle('show');
  }

  hideDropdown() {
    this.themeDropdown?.classList.remove('show');
  }

  setTheme(theme) {
    this.currentTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem('theme', theme);
  }

  applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    
    // 更新主题选项的选中状态
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.classList.toggle('active', option.dataset.theme === theme);
    });
  }
}

// 导航管理类
class NavigationManager {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    this.overlay = document.getElementById('overlay');
    this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    this.sidebarClose = document.getElementById('sidebar-close');
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // 移动端菜单按钮
    this.mobileMenuToggle?.addEventListener('click', () => {
      this.openSidebar();
    });

    // 侧边栏关闭按钮
    this.sidebarClose?.addEventListener('click', () => {
      this.closeSidebar();
    });

    // 遮罩层点击
    this.overlay?.addEventListener('click', () => {
      this.closeSidebar();
    });

    // ESC键关闭侧边栏
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSidebar();
      }
    });
  }

  openSidebar() {
    this.sidebar?.classList.add('open');
    this.overlay?.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  closeSidebar() {
    this.sidebar?.classList.remove('open');
    this.overlay?.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// JsonVisualizer 类
class JsonVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID '${containerId}' not found`);
    }
  }

  render(data, isRoot = true) {
    if (!this.container) return;
    
    this.container.innerHTML = '';
    
    if (data === null) {
      this.container.innerHTML = '<span class="json-null">null</span>';
      return;
    }
    
    if (typeof data !== 'object') {
      this.container.innerHTML = this.renderPrimitive(data);
      return;
    }
    
    const node = this.createNode(data, '', isRoot);
    this.container.appendChild(node);
  }

  createNode(data, key, isRoot = false, level = 0) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'json-node';
    
    const isArray = Array.isArray(data);
    const isObject = typeof data === 'object' && data !== null && !isArray;
    const hasChildren = (isArray && data.length > 0) || (isObject && Object.keys(data).length > 0);
    
    // 创建节点头部
    const headerDiv = document.createElement('div');
    headerDiv.className = 'json-header';
    
    // 展开/折叠按钮
    if (hasChildren) {
      const toggle = document.createElement('span');
      toggle.className = 'json-toggle expanded';
      toggle.addEventListener('click', () => this.toggleNode(nodeDiv, toggle));
      headerDiv.appendChild(toggle);
    } else {
      const spacer = document.createElement('span');
      spacer.style.width = '17px';
      spacer.style.display = 'inline-block';
      headerDiv.appendChild(spacer);
    }
    
    // 键名
    if (!isRoot && key !== '') {
      const keySpan = document.createElement('span');
      keySpan.className = 'json-key';
      keySpan.textContent = `"${key}"`;
      headerDiv.appendChild(keySpan);
      
      const colon = document.createElement('span');
      colon.textContent = ': ';
      colon.className = 'json-bracket';
      headerDiv.appendChild(colon);
    }
    
    // 值类型和括号
    if (isArray) {
      const bracket = document.createElement('span');
      bracket.className = 'json-bracket';
      bracket.textContent = '[';
      headerDiv.appendChild(bracket);
      
      if (hasChildren) {
        const length = document.createElement('span');
        length.className = 'json-array-length';
        length.textContent = `${data.length} items`;
        headerDiv.appendChild(length);
      }
    } else if (isObject) {
      const bracket = document.createElement('span');
      bracket.className = 'json-bracket';
      bracket.textContent = '{';
      headerDiv.appendChild(bracket);
      
      if (hasChildren) {
        const length = document.createElement('span');
        length.className = 'json-object-length';
        length.textContent = `${Object.keys(data).length} properties`;
        headerDiv.appendChild(length);
      }
    } else {
      // 原始值
      const valueSpan = document.createElement('span');
      valueSpan.innerHTML = this.renderPrimitive(data);
      headerDiv.appendChild(valueSpan);
    }
    
    nodeDiv.appendChild(headerDiv);
    
    // 创建子节点容器
    if (hasChildren) {
      const childrenDiv = document.createElement('div');
      childrenDiv.className = 'json-children';
      
      if (isArray) {
        data.forEach((item, index) => {
          const childNode = this.createNode(item, index.toString(), false, level + 1);
          childrenDiv.appendChild(childNode);
          
          // 添加逗号（除了最后一个元素）
          if (index < data.length - 1) {
            const comma = document.createElement('span');
            comma.className = 'json-comma';
            comma.textContent = ',';
            childNode.appendChild(comma);
          }
        });
      } else {
        const keys = Object.keys(data);
        keys.forEach((objKey, index) => {
          const childNode = this.createNode(data[objKey], objKey, false, level + 1);
          childrenDiv.appendChild(childNode);
          
          // 添加逗号（除了最后一个属性）
          if (index < keys.length - 1) {
            const comma = document.createElement('span');
            comma.className = 'json-comma';
            comma.textContent = ',';
            childNode.appendChild(comma);
          }
        });
      }
      
      nodeDiv.appendChild(childrenDiv);
      
      // 结束括号
      const closingBracket = document.createElement('div');
      closingBracket.innerHTML = `<span style="margin-left: 17px;"></span><span class="json-bracket">${isArray ? ']' : '}'}</span>`;
      nodeDiv.appendChild(closingBracket);
    } else if (isArray || isObject) {
      // 空数组或对象的结束括号
      const closingBracket = document.createElement('span');
      closingBracket.className = 'json-bracket';
      closingBracket.textContent = isArray ? ']' : '}';
      headerDiv.appendChild(closingBracket);
    }
    
    return nodeDiv;
  }

  renderPrimitive(value) {
    if (typeof value === 'string') {
      return `<span class="json-string">"${this.escapeHtml(value)}"</span>`;
    } else if (typeof value === 'number') {
      return `<span class="json-number">${value}</span>`;
    } else if (typeof value === 'boolean') {
      return `<span class="json-boolean">${value}</span>`;
    } else if (value === null) {
      return `<span class="json-null">null</span>`;
    } else {
      return `<span class="json-string">"${this.escapeHtml(String(value))}"</span>`;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  toggleNode(nodeDiv, toggle) {
    const isExpanded = toggle.classList.contains('expanded');
    
    if (isExpanded) {
      toggle.classList.remove('expanded');
      toggle.classList.add('collapsed');
      nodeDiv.classList.add('collapsed');
    } else {
      toggle.classList.remove('collapsed');
      toggle.classList.add('expanded');
      nodeDiv.classList.remove('collapsed');
    }
  }

  getPlainText(data) {
    return JSON.stringify(data, null, 2);
  }
}

// 二维码生成器类
class QRCodeGenerator {
  constructor() {
    this.qrTextInput = document.getElementById('qr-text-input');
    this.qrOutput = document.getElementById('qr-output');
    this.generateBtn = document.getElementById('generate-qr-btn');
    this.clearBtn = document.getElementById('clear-qr-btn');
    this.downloadBtn = document.getElementById('download-qr-btn');
    this.qrSize = document.getElementById('qr-size');
    this.qrErrorLevel = document.getElementById('qr-error-level');
    this.currentQRCode = null;
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.generateBtn?.addEventListener('click', () => {
      this.generateQRCode();
    });

    this.clearBtn?.addEventListener('click', () => {
      this.clearQRCode();
    });

    this.downloadBtn?.addEventListener('click', () => {
      this.downloadQRCode();
    });

    // 回车键生成二维码
    this.qrTextInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.generateQRCode();
      }
    });
  }

  async generateQRCode() {
    const text = this.qrTextInput?.value.trim();
    if (!text) {
      alert('请输入要生成二维码的文本内容');
      return;
    }
  
    // 检查 QRCode 库是否加载
    if (typeof QRCode === 'undefined') {
      this.qrOutput.innerHTML = '<div class="qr-error">QRCode 库未加载，请刷新页面重试</div>';
      return;
    }
  
    const size = parseInt(this.qrSize?.value || '300');
    const errorCorrectionLevel = this.qrErrorLevel?.value || 'M';
  
    try {
      // 清空输出区域
      this.qrOutput.innerHTML = '<div class="qr-loading">生成中...</div>';
  
      // 创建容器元素
      const qrContainer = document.createElement('div');
      qrContainer.style.width = size + 'px';
      qrContainer.style.height = size + 'px';
      
      // 使用本地 QRCode 库生成二维码
      const qr = new QRCode(qrContainer, {
        text: text,
        width: size,
        height: size,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel[errorCorrectionLevel]
      });
  
      // 显示二维码
      this.qrOutput.innerHTML = '';
      this.qrOutput.appendChild(qrContainer);
      
      // 获取生成的 canvas 用于下载
      setTimeout(() => {
        const canvas = qrContainer.querySelector('canvas');
        if (canvas) {
          this.currentQRCode = canvas;
          this.downloadBtn.disabled = false;
        }
      }, 100);
  
    } catch (error) {
      console.error('生成二维码失败:', error);
      this.qrOutput.innerHTML = '<div class="qr-error">生成失败，请检查输入内容</div>';
      this.downloadBtn.disabled = true;
    }
  }
  
  // 新增：动态加载QRCode库的方法
  loadQRCodeLibrary() {
    return new Promise((resolve, reject) => {
      if (typeof QRCode !== 'undefined') {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js';
      script.onload = () => {
        if (typeof QRCode !== 'undefined') {
          resolve();
        } else {
          reject(new Error('QRCode库加载失败'));
        }
      };
      script.onerror = () => reject(new Error('QRCode库加载失败'));
      document.head.appendChild(script);
    });
  }

  clearQRCode() {
    this.qrTextInput.value = '';
    this.qrOutput.innerHTML = `
      <div class="qr-placeholder">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="5" height="5"/>
          <rect x="16" y="3" width="5" height="5"/>
          <rect x="3" y="16" width="5" height="5"/>
          <rect x="11" y="11" width="2" height="2"/>
          <rect x="15" y="11" width="2" height="2"/>
          <rect x="11" y="15" width="2" height="2"/>
          <rect x="19" y="15" width="2" height="2"/>
        </svg>
        <p>二维码将在此显示</p>
      </div>
    `;
    this.currentQRCode = null;
    this.downloadBtn.disabled = true;
  }

  downloadQRCode() {
    if (!this.currentQRCode) {
      alert('请先生成二维码');
      return;
    }

    try {
      // 创建下载链接
      const link = document.createElement('a');
      link.download = `qrcode_${Date.now()}.png`;
      link.href = this.currentQRCode.toDataURL('image/png');
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  }
}

// 应用主类
class TextToolsApp {
  constructor() {
    this.jsonVisualizer = new JsonVisualizer('json-output');
    this.themeManager = new ThemeManager();
    this.navigationManager = new NavigationManager();
    this.qrCodeGenerator = new QRCodeGenerator();
    this.currentTool = 'json-formatter';
    this.init();
  }

  init() {
    this.initNavigation();
    this.initLinkExtractor();
    this.initJsonFormatter();
    
    // 设置默认显示 JSON 工具
    this.setDefaultTool();
  }

  setDefaultTool() {
    // 清除所有导航按钮的active状态
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    // 设置JSON工具按钮为激活状态
    const jsonBtn = document.querySelector('[data-tool="json-formatter"]');
    if (jsonBtn) {
      jsonBtn.classList.add('active');
    }
    
    // 设置工具面板显示状态
    const toolSections = document.querySelectorAll('.tool-section');
    toolSections.forEach(section => section.classList.remove('active'));
    
    const jsonSection = document.getElementById('json-formatter');
    if (jsonSection) {
      jsonSection.classList.add('active');
    }
  }

  initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const toolSections = document.querySelectorAll('.tool-section');

    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const toolName = btn.dataset.tool;
        
        // 更新导航状态
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 切换工具面板
        toolSections.forEach(section => {
          section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(toolName);
        if (targetSection) {
          targetSection.classList.add('active');
        }
        
        this.currentTool = toolName;
        
        // 移动端自动关闭侧边栏
        if (window.innerWidth <= 768) {
          this.navigationManager.closeSidebar();
        }
      });
    });
  }

  // 链接提取器功能
  initLinkExtractor() {
    const richTextInput = document.getElementById('rich-text-input');
    const plainTextOutput = document.getElementById('plain-text-output');
    const convertBtn = document.getElementById('convert-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');

    if (!richTextInput || !plainTextOutput || !convertBtn || !copyBtn || !clearBtn) {
      console.error('链接提取器元素未找到');
      return;
    }

    convertBtn.addEventListener('click', () => {
      if (!richTextInput.innerHTML.trim()) {
        plainTextOutput.innerHTML = '请先粘贴包含链接的文本';
        return;
      }
      
      const convertedText = this.convertRichTextToPlainWithLinks(richTextInput);
      plainTextOutput.innerHTML = convertedText;
      copyBtn.disabled = false;
    });

    copyBtn.addEventListener('click', () => {
      this.copyToClipboard(plainTextOutput.innerHTML, copyBtn);
    });

    clearBtn.addEventListener('click', () => {
      richTextInput.innerHTML = '';
      plainTextOutput.innerHTML = '';
      copyBtn.disabled = true;
    });
  }

  // JSON 格式化器功能
  initJsonFormatter() {
    const jsonInput = document.getElementById('json-input');
    const formatBtn = document.getElementById('format-btn');
    const minifyBtn = document.getElementById('minify-btn');
    const validateBtn = document.getElementById('validate-btn');
    const copyJsonBtn = document.getElementById('copy-json-btn');
    const clearJsonBtn = document.getElementById('clear-json-btn');

    if (!jsonInput || !formatBtn || !minifyBtn || !validateBtn || !copyJsonBtn || !clearJsonBtn) {
      console.error('JSON格式化器元素未找到');
      return;
    }

    let currentJsonData = null;

    // 格式化 JSON
    formatBtn.addEventListener('click', () => {
      const input = jsonInput.value.trim();
      if (!input) {
        this.updateJsonStatus('请输入 JSON 数据', 'waiting');
        return;
      }

      try {
        const parsed = JSON.parse(input);
        currentJsonData = parsed;
        this.jsonVisualizer.render(parsed);
        this.updateJsonStatus('格式化成功', 'valid');
        this.updateJsonSize(JSON.stringify(parsed, null, 2).length);
        copyJsonBtn.disabled = false;
      } catch (error) {
        this.updateJsonStatus(`JSON 格式错误: ${error.message}`, 'invalid');
        this.jsonVisualizer.container.innerHTML = `<div style="color: #721c24; padding: 10px; background-color: #f8d7da; border-radius: 4px;">解析错误：${error.message}</div>`;
        copyJsonBtn.disabled = true;
      }
    });

    // 压缩 JSON
    minifyBtn.addEventListener('click', () => {
      const input = jsonInput.value.trim();
      if (!input) {
        this.updateJsonStatus('请输入 JSON 数据', 'waiting');
        return;
      }

      try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        this.jsonVisualizer.container.innerHTML = `<pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">${this.escapeHtml(minified)}</pre>`;
        this.updateJsonStatus('压缩成功', 'valid');
        this.updateJsonSize(minified.length);
        copyJsonBtn.disabled = false;
        currentJsonData = minified;
      } catch (error) {
        this.updateJsonStatus(`JSON 格式错误: ${error.message}`, 'invalid');
        this.jsonVisualizer.container.innerHTML = `<div style="color: #721c24; padding: 10px; background-color: #f8d7da; border-radius: 4px;">解析错误：${error.message}</div>`;
        copyJsonBtn.disabled = true;
      }
    });

    // 验证 JSON
    validateBtn.addEventListener('click', () => {
      const input = jsonInput.value.trim();
      if (!input) {
        this.updateJsonStatus('请输入 JSON 数据', 'waiting');
        return;
      }

      try {
        const parsed = JSON.parse(input);
        const analysis = this.analyzeJsonStructure(parsed);
        this.jsonVisualizer.container.innerHTML = `
          <div style="color: #155724; padding: 15px; background-color: #d4edda; border-radius: 4px; margin-bottom: 10px;">
            ✅ JSON 格式有效
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; font-family: monospace; white-space: pre-line;">
            <strong>结构分析：</strong>\n${analysis}
          </div>
        `;
        this.updateJsonStatus('验证通过', 'valid');
        this.updateJsonSize(input.length);
      } catch (error) {
        this.jsonVisualizer.container.innerHTML = `<div style="color: #721c24; padding: 10px; background-color: #f8d7da; border-radius: 4px;">❌ JSON 格式无效：${error.message}</div>`;
        this.updateJsonStatus(`验证失败: ${error.message}`, 'invalid');
      }
    });

    // 复制 JSON
    copyJsonBtn.addEventListener('click', () => {
      let textToCopy = '';
      if (typeof currentJsonData === 'string') {
        textToCopy = currentJsonData;
      } else if (currentJsonData) {
        textToCopy = JSON.stringify(currentJsonData, null, 2);
      } else {
        textToCopy = jsonInput.value;
      }
      this.copyToClipboard(textToCopy, copyJsonBtn, true);
    });

    // 清空 JSON
    clearJsonBtn.addEventListener('click', () => {
      jsonInput.value = '';
      this.jsonVisualizer.container.innerHTML = '';
      this.updateJsonStatus('等待输入', 'waiting');
      this.updateJsonSize(0);
      copyJsonBtn.disabled = true;
      currentJsonData = null;
    });
  }

  // 链接提取转换功能
  convertRichTextToPlainWithLinks(element) {
    const cleanedHTML = this.cleanPastedHTML(element.innerHTML);
    let processedText = cleanedHTML;
    
    // 处理链接
    const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi;
    processedText = processedText.replace(linkRegex, (match, url, text) => {
      const cleanUrl = url.trim();
      const cleanText = text.trim();
      return cleanText ? `${cleanText} (${cleanUrl})` : cleanUrl;
    });
    
    return this.processFormattedText(processedText);
  }

  processFormattedText(text) {
    return text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  cleanPastedHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return this.processNode(tempDiv);
  }

  processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }
    
    if (node.nodeName === 'A') {
      const href = node.getAttribute('href') || '';
      const text = node.textContent || '';
      return `<a href="${href}">${text}</a>`;
    }
    
    if (['B', 'STRONG'].includes(node.nodeName)) {
      let nodeText = '';
      for (const child of node.childNodes) {
        nodeText += this.processNode(child);
      }
      return `<b>${nodeText}</b>`;
    }
    
    if (node.nodeName === 'BR') {
      return '<br>';
    }
    
    let nodeText = '';
    for (const child of node.childNodes) {
      nodeText += this.processNode(child);
    }
    
    const blockElements = ['DIV', 'P', 'LI', 'UL', 'OL', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
    if (blockElements.includes(node.nodeName) && nodeText.trim().length > 0) {
      if (!nodeText.startsWith('<br>')) {
        nodeText = '<br>' + nodeText;
      }
      if (!nodeText.endsWith('<br>')) {
        nodeText = nodeText + '<br>';
      }
    }
    
    return nodeText;
  }

  // 分析 JSON 结构
  analyzeJsonStructure(obj, depth = 0) {
    const indent = '  '.repeat(depth);
    let info = '';
    
    if (Array.isArray(obj)) {
      info += `${indent}数组 (${obj.length} 个元素)\n`;
      if (obj.length > 0) {
        const firstItem = obj[0];
        info += `${indent}  └─ 元素类型: ${typeof firstItem}\n`;
        if (typeof firstItem === 'object' && firstItem !== null) {
          info += this.analyzeJsonStructure(firstItem, depth + 2);
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj);
      info += `${indent}对象 (${keys.length} 个属性)\n`;
      keys.slice(0, 5).forEach((key, index) => {
        const isLast = index === Math.min(4, keys.length - 1);
        const prefix = isLast ? '└─' : '├─';
        info += `${indent}  ${prefix} ${key}: ${typeof obj[key]}\n`;
      });
      if (keys.length > 5) {
        info += `${indent}  └─ ... 还有 ${keys.length - 5} 个属性\n`;
      }
    } else {
      info += `${indent}${typeof obj}: ${obj}\n`;
    }
    
    return info;
  }

  // 更新 JSON 状态
  updateJsonStatus(message, type) {
    const statusElement = document.getElementById('json-status');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status-${type}`;
    }
  }

  // 更新 JSON 大小
  updateJsonSize(size) {
    const sizeElement = document.getElementById('json-size');
    if (sizeElement) {
      if (size < 1024) {
        sizeElement.textContent = `${size} 字符`;
      } else if (size < 1024 * 1024) {
        sizeElement.textContent = `${(size / 1024).toFixed(1)} KB`;
      } else {
        sizeElement.textContent = `${(size / (1024 * 1024)).toFixed(1)} MB`;
      }
    }
  }

  // HTML 转义
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 复制到剪贴板
  async copyToClipboard(text, button, isPlainText = false) {
    try {
      let textToCopy = text;
      if (!isPlainText) {
        textToCopy = text.replace(/<br>/g, '\n').replace(/<\/?b>/g, '');
      }
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = textToCopy;
        tempTextarea.style.position = 'absolute';
        tempTextarea.style.left = '-9999px';
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
      }
      
      // 显示成功反馈
      const originalText = button.textContent;
      button.textContent = '已复制！';
      button.style.backgroundColor = '#28a745';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动选择文本并复制');
    }
  }
}

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
  new TextToolsApp();
});