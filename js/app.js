// JSON 可视化组件
class JsonVisualizer {
  constructor(container) {
    this.container = container;
  }

  render(data, isRoot = true) {
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

// 应用主类
class TextToolsApp {
  constructor() {
    this.currentTool = 'link-extractor';
    this.jsonVisualizer = new JsonVisualizer(document.getElementById('json-output'));
    this.init();
  }

  init() {
    this.initNavigation();
    this.initLinkExtractor();
    this.initJsonFormatter();
  }

  // 导航功能
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
        document.getElementById(toolName).classList.add('active');
        
        this.currentTool = toolName;
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
    const jsonStatus = document.getElementById('json-status');
    const jsonSize = document.getElementById('json-size');

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
        currentJsonData = minified;
        copyJsonBtn.disabled = false;
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
        this.updateJsonStatus('JSON 格式正确', 'valid');
        this.updateJsonSize(input.length);
        
        // 显示 JSON 结构信息
        const info = this.analyzeJsonStructure(parsed);
        this.jsonVisualizer.container.innerHTML = `
          <div style="padding: 15px; background-color: #d4edda; border-radius: 6px; color: #155724;">
            <h4 style="margin: 0 0 10px 0;">✅ JSON 验证通过！</h4>
            <pre style="margin: 0; font-size: 12px; line-height: 1.4;">${info}</pre>
          </div>
        `;
        currentJsonData = info;
        copyJsonBtn.disabled = false;
      } catch (error) {
        this.updateJsonStatus(`JSON 格式错误: ${error.message}`, 'invalid');
        this.jsonVisualizer.container.innerHTML = `<div style="color: #721c24; padding: 10px; background-color: #f8d7da; border-radius: 4px;">验证失败：${error.message}</div>`;
        copyJsonBtn.disabled = true;
      }
    });

    // 复制 JSON
    copyJsonBtn.addEventListener('click', () => {
      let textToCopy = '';
      if (typeof currentJsonData === 'string') {
        textToCopy = currentJsonData;
      } else if (currentJsonData !== null) {
        textToCopy = JSON.stringify(currentJsonData, null, 2);
      } else {
        textToCopy = this.jsonVisualizer.container.textContent || '';
      }
      this.copyToClipboard(textToCopy, copyJsonBtn, true);
    });

    // 清空 JSON
    clearJsonBtn.addEventListener('click', () => {
      jsonInput.value = '';
      this.jsonVisualizer.container.innerHTML = '';
      this.updateJsonStatus('等待输入', 'waiting');
      this.updateJsonSize(0);
      currentJsonData = null;
      copyJsonBtn.disabled = true;
    });

    // 实时输入监听
    jsonInput.addEventListener('input', () => {
      const length = jsonInput.value.length;
      this.updateJsonSize(length);
      if (length === 0) {
        this.updateJsonStatus('等待输入', 'waiting');
      }
    });
  }

  // 富文本转换为带链接的纯文本
  convertRichTextToPlainWithLinks(element) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = element.innerHTML;
    
    const links = tempDiv.querySelectorAll('a');
    
    if (links.length === 0) {
      return this.processFormattedText(tempDiv);
    }
    
    for (let i = links.length - 1; i >= 0; i--) {
      const link = links[i];
      const linkText = link.textContent;
      const linkHref = link.getAttribute('href');
      const replacementText = document.createTextNode(`${linkText}（${linkHref}）`);
      link.parentNode.replaceChild(replacementText, link);
    }
    
    return this.processFormattedText(tempDiv);
  }

  // 处理格式化文本
  processFormattedText(element) {
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }
      
      let nodeText = '';
      for (const child of node.childNodes) {
        nodeText += processNode(child);
      }
      
      if (['B', 'STRONG'].includes(node.nodeName)) {
        nodeText = `<b>${nodeText}</b>`;
      }
      
      const headingElements = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
      if (headingElements.includes(node.nodeName)) {
        nodeText = '<br><br>' + nodeText + '<br><br>';
      }
      
      const blockElements = ['DIV', 'P', 'LI', 'UL', 'OL', 'BLOCKQUOTE'];
      if (blockElements.includes(node.nodeName) && nodeText.trim().length > 0) {
        if (!nodeText.startsWith('<br>')) {
          nodeText = '<br>' + nodeText;
        }
        if (!nodeText.endsWith('<br>')) {
          nodeText = nodeText + '<br>';
        }
      }
      
      if (node.nodeName === 'BR') {
        return '<br>';
      }
      
      return nodeText;
    };
    
    let result = processNode(element);
    result = result.replace(/<br><br><br><br>+/g, '<br><br><br>');
    return result;
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
    statusElement.textContent = message;
    statusElement.className = `status-${type}`;
  }

  // 更新 JSON 大小
  updateJsonSize(size) {
    const sizeElement = document.getElementById('json-size');
    if (size < 1024) {
      sizeElement.textContent = `${size} 字符`;
    } else if (size < 1024 * 1024) {
      sizeElement.textContent = `${(size / 1024).toFixed(1)} KB`;
    } else {
      sizeElement.textContent = `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
        // 移除 HTML 标签，保留换行
        textToCopy = text.replace(/<br>/g, '\n').replace(/<\/?b>/g, '');
      }
      
      // 尝试使用现代 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // 降级到传统方法
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
      setTimeout(() => {
        button.textContent = originalText;
      }, 1500);
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