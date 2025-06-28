// 主应用入口
class TextToolsApp {
  constructor() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    // 初始化各个模块
    this.themeManager = new ThemeManager();
    this.navigationManager = new NavigationManager();
    this.jsonParser = new JsonParser();
    this.jsonVisualizer = new JsonVisualizer('json-output');
    this.qrGenerator = new QRCodeGenerator();
    
    // 初始化工具
    this.initTools();
    this.setDefaultTool();
    this.initNavigation();
  }

  initTools() {
    this.initJsonFormatter();
    this.initLinkExtractor();
    // QR生成器在其自己的类中初始化
  }

  setDefaultTool() {
    // 默认显示JSON工具
    const defaultTool = 'json-formatter';
    const toolSections = document.querySelectorAll('.tool-section');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    toolSections.forEach(section => {
      section.classList.toggle('active', section.id === defaultTool);
    });
    
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === defaultTool);
    });
  }

  initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const toolSections = document.querySelectorAll('.tool-section');
    
    navButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTool = button.dataset.tool;
        
        // 更新按钮状态
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // 更新工具显示
        toolSections.forEach(section => {
          section.classList.toggle('active', section.id === targetTool);
        });
        
        // 关闭移动端侧边栏
        if (this.navigationManager) {
          this.navigationManager.closeSidebar();
        }
      });
    });
  }

  initJsonFormatter() {
    const jsonInput = document.getElementById('json-input');
    const formatBtn = document.getElementById('format-btn');
    const minifyBtn = document.getElementById('minify-btn');
    const validateBtn = document.getElementById('validate-btn');
    const copyJsonBtn = document.getElementById('copy-json-btn');
    const clearJsonBtn = document.getElementById('clear-json-btn');

    let currentJsonData = null;
    let debounceTimer = null;

    // 验证必需元素
    if (!jsonInput || !this.jsonVisualizer) {
      console.error('JSON格式化器初始化失败：缺少必需元素');
      return;
    }

    // 自动格式化
    jsonInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const input = jsonInput.value.trim();
        
        if (!input) {
          this.jsonVisualizer.container.innerHTML = '';
          this.updateJsonStatus('等待输入', 'waiting');
          this.updateJsonSize(0);
          if (copyJsonBtn) copyJsonBtn.disabled = true;
          this.jsonVisualizer.disableSearchFeatures();
          return;
        }

        try {
          const parsed = this.jsonParser.parse(input);
          currentJsonData = parsed;
          this.jsonVisualizer.render(parsed);
          this.updateJsonStatus('自动格式化成功 ✨', 'valid');
          this.updateJsonSize(JSON.stringify(parsed, null, 2).length);
          if (copyJsonBtn) copyJsonBtn.disabled = false;
        } catch (error) {
          this.handleJsonError(input, error);
          if (copyJsonBtn) copyJsonBtn.disabled = true;
        }
      }, 500);
    });

    // 格式化按钮
    if (formatBtn) {
      formatBtn.addEventListener('click', () => {
        const input = jsonInput.value.trim();
        if (!input) {
          this.updateJsonStatus('请输入 JSON 数据', 'waiting');
          return;
        }

        try {
          const parsed = this.jsonParser.parse(input);
          currentJsonData = parsed;
          this.jsonVisualizer.render(parsed);
          
          // 检测是否使用了智能解析
          let smartParseUsed = false;
          try {
            JSON.parse(input);
          } catch {
            smartParseUsed = true;
          }
          
          const message = smartParseUsed 
            ? '格式化成功 ✨ (已自动修复格式问题)' 
            : '格式化成功 ✨';
          this.updateJsonStatus(message, 'valid');
          this.updateJsonSize(JSON.stringify(parsed, null, 2).length);
          if (copyJsonBtn) copyJsonBtn.disabled = false;
          
        } catch (error) {
          this.updateJsonStatus(`JSON 格式错误: ${error.message}`, 'invalid');
          this.showJsonError(error.message);
          if (copyJsonBtn) copyJsonBtn.disabled = true;
        }
      });
    }

    // 压缩按钮
    if (minifyBtn) {
      minifyBtn.addEventListener('click', () => {
        const input = jsonInput.value.trim();
        if (!input) {
          this.updateJsonStatus('请输入 JSON 数据', 'waiting');
          return;
        }

        try {
          const parsed = this.jsonParser.parse(input);
          const minified = JSON.stringify(parsed);
          this.showMinifiedJson(minified);
          this.updateJsonStatus('压缩成功', 'valid');
          this.updateJsonSize(minified.length);
          if (copyJsonBtn) copyJsonBtn.disabled = false;
          currentJsonData = minified;
          
          // 显示压缩比例
          const ratio = ((input.length - minified.length) / input.length * 100).toFixed(1);
          this.updateJsonStatus(`压缩成功 📦 (减少${ratio}%)`, 'valid');
        } catch (error) {
          this.updateJsonStatus(`JSON 格式错误: ${error.message}`, 'invalid');
          this.showJsonError(error.message);
          if (copyJsonBtn) copyJsonBtn.disabled = true;
        }
      });
    }

    // 验证按钮
    if (validateBtn) {
      validateBtn.addEventListener('click', () => {
        const input = jsonInput.value.trim();
        if (!input) {
          this.updateJsonStatus('请输入 JSON 数据', 'waiting');
          return;
        }

        try {
          const parsed = this.jsonParser.parse(input);
          const analysis = this.analyzeJsonStructure(parsed);
          
          // 检测智能解析
          let smartParseUsed = false;
          try {
            JSON.parse(input);
          } catch {
            smartParseUsed = true;
          }
          
          this.showValidationResult(true, analysis, smartParseUsed);
          this.updateJsonStatus('验证通过 ✅', 'valid');
          this.updateJsonSize(input.length);
        } catch (error) {
          this.showValidationResult(false, error.message);
          this.updateJsonStatus(`验证失败: ${error.message}`, 'invalid');
        }
      });
    }

    // 复制按钮
    if (copyJsonBtn) {
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
    }

    // 清空按钮
    if (clearJsonBtn) {
      clearJsonBtn.addEventListener('click', () => {
        jsonInput.value = '';
        this.jsonVisualizer.container.innerHTML = '';
        this.updateJsonStatus('等待输入', 'waiting');
        this.updateJsonSize(0);
        if (copyJsonBtn) copyJsonBtn.disabled = true;
        currentJsonData = null;
        this.jsonVisualizer.disableSearchFeatures();
      });
    }
  }

  // JSON错误处理
  handleJsonError(input, error) {
    if ((input.includes('{') && input.includes('}')) || (input.includes('[') && input.includes(']'))) {
      if (input.length > 50) {
        this.updateJsonStatus(`格式检查: ${error.message}`, 'invalid');
        this.showJsonError(error.message, true);
      } else {
        this.updateJsonStatus('JSON格式检查中...', 'waiting');
      }
    } else {
      this.updateJsonStatus('等待输入完整的JSON...', 'waiting');
    }
  }

  // 优化JSON错误显示函数
  showJsonError(message, isAutoCheck = false) {
    const title = isAutoCheck ? '⚠️ 自动解析失败' : '❌ 解析错误';
    const hint = isAutoCheck 
      ? `<div style="font-size: 12px; margin-top: 12px; padding: 8px; background: rgba(255,255,255,0.3); border-radius: 4px; opacity: 0.9;">
           💡 <strong>提示：</strong>可以点击"格式化"按钮查看详细错误信息
         </div>` 
      : '';
    
    // 格式化错误信息，添加换行和缩进
    const formattedMessage = this.formatErrorMessage(message);
    
    this.jsonVisualizer.container.innerHTML = `
      <div style="color: #721c24; padding: 20px; background-color: #f8d7da; border-radius: 8px; line-height: 1.6; border-left: 4px solid #dc3545;">
        <div style="font-weight: bold; margin-bottom: 12px; font-size: 16px; display: flex; align-items: center; gap: 8px;">
          ${title}
        </div>
        <div style="font-size: 14px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; background: rgba(255,255,255,0.2); padding: 12px; border-radius: 4px; white-space: pre-line; word-break: break-word;">
          ${this.escapeHtml(formattedMessage)}
        </div>
        ${hint}
        <div style="margin-top: 12px; padding: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; font-size: 12px;">
          <strong>🔍 常见问题检查：</strong><br>
          • 检查是否有未闭合的引号<br>
          • 确认所有括号 {} [] 是否配对<br>
          • 属性名是否用双引号包围<br>
          • 是否有多余的逗号（特别是最后一个元素后）<br>
          • 检查特殊字符是否正确转义
        </div>
      </div>
    `;
  }

  // 新增：格式化错误信息函数
  formatErrorMessage(message) {
    // 处理常见的JSON错误信息，使其更易读
    let formatted = message;
    
    // 处理位置信息
    formatted = formatted.replace(/at position (\d+)/g, '在位置 $1');
    formatted = formatted.replace(/\(line (\d+) column (\d+)\)/g, '（第 $1 行，第 $2 列）');
    
    // 处理常见错误类型
    const errorMappings = {
      'Unexpected token': '意外的字符',
      'Expected property name': '期望属性名',
      'Expected double-quoted property name': '属性名需要用双引号包围',
      'Unexpected end of JSON input': 'JSON 输入意外结束',
      'Expected \',\' or \'}\'': '期望逗号 \',\' 或右大括号 \'}\'',
      'Expected \',\' or \']\'': '期望逗号 \',\' 或右方括号 \']\'',
      'Unexpected string': '意外的字符串',
      'Unexpected number': '意外的数字',
      'Invalid or unexpected token': '无效或意外的字符'
    };
    
    // 替换错误信息
    for (const [english, chinese] of Object.entries(errorMappings)) {
      formatted = formatted.replace(new RegExp(english, 'gi'), chinese);
    }
    
    // 添加换行，使长错误信息更易读
    if (formatted.length > 60) {
      // 在句号、逗号、分号后添加换行
      formatted = formatted.replace(/([。，；])\s*/g, '$1\n');
      // 在 "at position" 或类似位置信息前添加换行
      formatted = formatted.replace(/\s+(在位置|（第)/g, '\n$1');
    }
    
    return formatted.trim();
  }

  // 显示压缩后的JSON
  showMinifiedJson(minified) {
    this.jsonVisualizer.container.innerHTML = `
      <pre style="margin: 0; white-space: pre-wrap; word-break: break-all; padding: 15px; background-color: var(--bg-tertiary); border-radius: 4px; font-family: 'Fira Code', 'Consolas', monospace;">${this.escapeHtml(minified)}</pre>
    `;
  }

  // 同时优化验证结果显示
  showValidationResult(isValid, content, smartParseUsed = false) {
    if (isValid) {
      const smartParseHint = smartParseUsed 
        ? `<div style="font-size: 14px; opacity: 0.9; margin-top: 8px; padding: 8px; background: rgba(255,255,255,0.3); border-radius: 4px;">
             🔧 <strong>智能修复：</strong>已自动修复格式问题（单引号转双引号、补全缺失引号等）
           </div>` 
        : '';
      
      this.jsonVisualizer.container.innerHTML = `
        <div style="color: #155724; padding: 20px; background-color: #d4edda; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #28a745;">
          <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px; display: flex; align-items: center; gap: 8px;">
            ✅ JSON 格式有效
          </div>
          ${smartParseHint}
        </div>
        <div style="background-color: var(--bg-tertiary); padding: 20px; border-radius: 8px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; white-space: pre-line; color: var(--text-primary); line-height: 1.8; border-left: 4px solid var(--accent-primary);">
          <strong style="color: var(--accent-primary);">📊 结构分析：</strong>

${content}
        </div>
      `;
    } else {
      // 错误情况下也使用格式化的错误信息
      const formattedError = this.formatErrorMessage(content);
      
      this.jsonVisualizer.container.innerHTML = `
        <div style="color: var(--text-danger, #721c24); padding: 20px; background-color: var(--bg-danger, #f8d7da); border-radius: 8px; line-height: 1.6; border-left: 4px solid #dc3545;">
          <div style="font-weight: bold; margin-bottom: 12px; font-size: 16px;">❌ JSON 格式无效</div>
          <div style="font-size: 14px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; background: rgba(255,255,255,0.2); padding: 12px; border-radius: 4px; white-space: pre-line; word-break: break-word;">
            ${this.escapeHtml(formattedError)}
          </div>
          <div style="margin-top: 12px; padding: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; font-size: 12px;">
            <strong>🔍 建议检查：</strong><br>
            • 所有字符串是否用双引号包围<br>
            • 对象属性名是否用双引号包围<br>
            • 是否有多余的逗号<br>
            • 括号是否正确配对
          </div>
        </div>
      `;
    }
  }

  // 初始化链接提取器
  initLinkExtractor() {
    const richTextInput = document.getElementById('rich-text-input');
    const plainTextOutput = document.getElementById('plain-text-output');
    const convertBtn = document.getElementById('convert-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');

    if (!richTextInput || !plainTextOutput) {
      console.error('链接提取器初始化失败：缺少必需元素');
      return;
    }

    // 转换按钮
    if (convertBtn) {
      convertBtn.addEventListener('click', () => {
        const result = this.convertRichTextToPlainWithLinks(richTextInput);
        plainTextOutput.innerHTML = result.replace(/\n/g, '<br>');
        if (copyBtn) copyBtn.disabled = !result.trim();
      });
    }

    // 清空按钮
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        richTextInput.innerHTML = '';
        plainTextOutput.innerHTML = '';
        if (copyBtn) copyBtn.disabled = true;
      });
    }

    // 复制按钮
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = plainTextOutput.textContent || plainTextOutput.innerText;
        this.copyToClipboard(text, copyBtn, true);
      });
    }

    // 粘贴事件处理
    richTextInput.addEventListener('paste', (e) => {
      e.preventDefault();
      const clipboardData = e.clipboardData || window.clipboardData;
      const htmlData = clipboardData.getData('text/html');
      const textData = clipboardData.getData('text/plain');
      
      if (htmlData) {
        richTextInput.innerHTML = htmlData;
      } else {
        richTextInput.textContent = textData;
      }
      
      // 自动转换
      setTimeout(() => {
        const result = this.convertRichTextToPlainWithLinks(richTextInput);
        plainTextOutput.innerHTML = result.replace(/\n/g, '<br>');
        if (copyBtn) copyBtn.disabled = !result.trim();
      }, 100);
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
      info += `${indent}数组 (${obj.length} 项)\n`;
      if (obj.length > 0) {
        const firstItem = obj[0];
        info += `${indent}  首项类型: ${this.getDataType(firstItem)}\n`;
        if (obj.length > 1) {
          const types = [...new Set(obj.map(item => this.getDataType(item)))];
          if (types.length > 1) {
            info += `${indent}  包含类型: ${types.join(', ')}\n`;
          }
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj);
      info += `${indent}对象 (${keys.length} 个属性)\n`;
      if (keys.length > 0) {
        info += `${indent}  属性: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}\n`;
        
        if (depth < 2) {
          for (const key of keys.slice(0, 3)) {
            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
              info += `${indent}  ${key}:\n`;
              info += this.analyzeJsonStructure(value, depth + 1);
            } else {
              info += `${indent}  ${key}: ${this.getDataType(value)}\n`;
            }
          }
        }
      }
    } else {
      info += `${indent}${this.getDataType(obj)}: ${obj}\n`;
    }
    
    return info;
  }

  getDataType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
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