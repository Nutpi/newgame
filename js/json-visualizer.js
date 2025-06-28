// JSON 可视化类
class JsonVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pathFormat = 'python-data';
    this.searchResults = [];
    this.currentSearchIndex = -1;
    this.searchTerm = '';
    this.jsonData = null;
    
    if (!this.container) {
      console.error(`Container with ID '${containerId}' not found`);
    }
    
    // 立即创建工具栏
    this.createHeaderBar();
  }

  // 路径格式转换方法
  convertPath(jsonPath, format) {
    if (!jsonPath || jsonPath === '$') return '';
    
    let path = jsonPath.replace(/^\$\.?/, '');
    
    switch (format) {
      case 'jsonpath':
        return jsonPath;
        
      case 'python-dict':
        return this.toPythonDictPath(path);
        
      case 'python-data':
        return 'data' + this.toPythonDictPath(path);
        
      case 'javascript':
        return this.toJavaScriptPath(path);
        
      case 'javascript-data':
        return 'data' + this.toJavaScriptPath(path);
        
      case 'dot-notation':
        return this.toDotNotation(path);
        
      default:
        return jsonPath;
    }
  }

  toPythonDictPath(path) {
    if (!path) return '';
    
    return path.replace(/\.([a-zA-Z_][a-zA-Z0-9_]*)/g, '["$1"]')
               .replace(/\[(\d+)\]/g, '[$1]')
               .replace(/^\[/, '[')
               .replace(/^([a-zA-Z_][a-zA-Z0-9_]*)/, '["$1"]');
  }

  toJavaScriptPath(path) {
    if (!path) return '';
    return '.' + path;
  }

  toDotNotation(path) {
    if (!path) return '';
    return path.replace(/\[(\d+)\]/g, '.$1');
  }

  render(data, isRoot = true) {
    console.log('JsonVisualizer render 开始...');
    console.log('- container 存在:', !!this.container);
    console.log('- container ID:', this.container?.id);
    console.log('- data:', data);
    
    if (!this.container) {
      console.error('JsonVisualizer container 不存在！');
      return;
    }
    
    this.jsonData = data;
    this.container.innerHTML = '';
    console.log('已清空容器内容');
    
    if (data === null) {
      this.container.innerHTML += '<span class="json-null">null</span>';
      console.log('渲染 null 值');
      return;
    }
    
    if (typeof data !== 'object') {
      const primitiveHtml = this.renderPrimitive(data);
      this.container.innerHTML += primitiveHtml;
      console.log('渲染原始值:', primitiveHtml);
      return;
    }
    
    console.log('开始创建节点...');
    const node = this.createNode(data, '', isRoot, 0, '');
    console.log('节点创建完成:', node);
    
    this.container.appendChild(node);
    console.log('节点已添加到容器，最终内容长度:', this.container.innerHTML.length);
    
    // 有数据时启用搜索功能
    this.enableSearchFeatures();
    console.log('JsonVisualizer render 完成');
  }

  createHeaderBar() {
    // 查找固定工具栏容器
    const toolbarContainer = document.getElementById('json-toolbar-container');
    if (!toolbarContainer) {
      console.error('未找到工具栏容器');
      return;
    }
    
    // 清空容器
    toolbarContainer.innerHTML = '';
    
    const headerBar = document.createElement('div');
    headerBar.className = 'json-output-header';
    headerBar.id = 'json-output-header';
    
    // 标题
    const title = document.createElement('h3');
    title.textContent = '可视化输出';
    title.className = 'json-output-title';
    headerBar.appendChild(title);
    
    // 路径格式选择器
    const pathFormatGroup = document.createElement('div');
    pathFormatGroup.className = 'path-format-group';
    
    const pathLabel = document.createElement('label');
    pathLabel.textContent = '路径格式:';
    pathLabel.className = 'path-format-label';
    
    const pathSelect = document.createElement('select');
    pathSelect.id = 'path-format-select';
    pathSelect.className = 'path-format-select';
    
    const formats = [
      { value: 'jsonpath', text: 'JSONPath' },
      { value: 'python-dict', text: 'Python字典' },
      { value: 'python-data', text: 'Python数据' },
      { value: 'javascript', text: 'JavaScript' },
      { value: 'javascript-data', text: 'JavaScript数据' },
      { value: 'dot-notation', text: '点分路径' }
    ];
    
    formats.forEach(format => {
      const option = document.createElement('option');
      option.value = format.value;
      option.textContent = format.text;
      if (format.value === this.pathFormat) {
        option.selected = true;
      }
      pathSelect.appendChild(option);
    });
    
    pathSelect.addEventListener('change', (e) => {
      this.pathFormat = e.target.value;
      this.updateAllCopyButtons();
    });
    
    pathFormatGroup.appendChild(pathLabel);
    pathFormatGroup.appendChild(pathSelect);
    headerBar.appendChild(pathFormatGroup);
    
    // 搜索区域
    const searchGroup = document.createElement('div');
    searchGroup.className = 'search-group';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'json-search-input';
    searchInput.className = 'json-search-input';
    searchInput.placeholder = '搜索键名或值...';
    searchInput.disabled = true;
    
    const searchBtn = document.createElement('button');
    searchBtn.className = 'json-search-btn';
    searchBtn.innerHTML = '🔍';
    searchBtn.title = '搜索';
    searchBtn.disabled = true;
    
    searchGroup.appendChild(searchInput);
    searchGroup.appendChild(searchBtn);
    headerBar.appendChild(searchGroup);
    
    // 导航区域
    const navGroup = document.createElement('div');
    navGroup.className = 'search-nav-group';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'search-nav-btn';
    prevBtn.id = 'search-prev-btn';
    prevBtn.innerHTML = '⬆';
    prevBtn.title = '上一个';
    prevBtn.disabled = true;
    
    const searchCounter = document.createElement('span');
    searchCounter.className = 'search-counter';
    searchCounter.id = 'search-counter';
    searchCounter.textContent = '0/0';
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'search-nav-btn';
    nextBtn.id = 'search-next-btn';
    nextBtn.innerHTML = '⬇';
    nextBtn.title = '下一个';
    nextBtn.disabled = true;
    
    navGroup.appendChild(prevBtn);
    navGroup.appendChild(searchCounter);
    navGroup.appendChild(nextBtn);
    headerBar.appendChild(navGroup);
    
    // 绑定搜索事件
    this.bindSearchEvents(searchInput, searchBtn, prevBtn, nextBtn, searchCounter);
    
    // 将工具栏添加到固定容器
    toolbarContainer.appendChild(headerBar);
  }

  // 启用搜索功能
  enableSearchFeatures() {
    const searchInput = document.getElementById('json-search-input');
    const searchBtn = document.querySelector('.json-search-btn');
    
    if (searchInput && searchBtn) {
      searchInput.disabled = false;
      searchBtn.disabled = false;
      searchInput.placeholder = '搜索键名或值...';
    }
  }

  // 禁用搜索功能
  disableSearchFeatures() {
    const searchInput = document.getElementById('json-search-input');
    const searchBtn = document.querySelector('.json-search-btn');
    const searchCounter = document.getElementById('search-counter');
    
    if (searchInput && searchBtn) {
      searchInput.disabled = true;
      searchBtn.disabled = true;
      searchInput.placeholder = '请先输入JSON数据...';
      searchInput.value = '';
    }
    
    if (searchCounter) {
      searchCounter.textContent = '0/0';
    }
    
    this.clearSearch();
  }

  // 重新实现搜索事件绑定，添加自动搜索
  bindSearchEvents(searchInput, searchBtn, prevBtn, nextBtn, searchCounter) {
    let searchTimeout;

    // 自动搜索（输入时延迟搜索）
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const term = searchInput.value.trim();
        if (term) {
          this.performSearch(term);
        } else {
          this.clearSearch();
        }
      }, 300); // 300ms 延迟
    });

    // 搜索按钮点击
    searchBtn.addEventListener('click', () => {
      const term = searchInput.value.trim();
      if (term) {
        this.performSearch(term);
      } else {
        this.clearSearch();
      }
    });
    
    // 回车搜索
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const term = searchInput.value.trim();
        if (term) {
          this.performSearch(term);
        } else {
          this.clearSearch();
        }
      } else if (e.key === 'Escape') {
        this.clearSearch();
        searchInput.value = '';
      }
    });
    
    // 导航按钮
    nextBtn.addEventListener('click', () => this.navigateToNext());
    prevBtn.addEventListener('click', () => this.navigateToPrevious());
  }

  // 重新实现搜索功能
  performSearch(term) {
    console.log('开始搜索:', term);
    this.clearHighlights();
    this.searchTerm = term.toLowerCase();
    this.searchResults = [];
    this.currentSearchIndex = -1;
    
    if (this.jsonData && term) {
      this.searchInContainer(term.toLowerCase());
    }
    
    this.highlightSearchResults();
    this.updateSearchUI();
    
    if (this.searchResults.length > 0) {
      this.currentSearchIndex = 0;
      this.scrollToCurrentResult();
    }
    
    console.log('搜索完成，找到结果:', this.searchResults.length);
  }

  // 简化的搜索实现 - 直接在DOM中搜索
  searchInContainer(term) {
    const allTextElements = this.container.querySelectorAll(
      '.json-key, .json-string, .json-number, .json-boolean, .json-null'
    );
    
    allTextElements.forEach((element, index) => {
      const text = element.textContent || element.innerText;
      const cleanText = text.replace(/[":]/g, '').trim();
      
      if (cleanText.toLowerCase().includes(term)) {
        this.searchResults.push({
          element: element,
          text: cleanText,
          index: index,
          originalHtml: element.innerHTML
        });
      }
    });
  }

  // 简化的高亮实现
  highlightSearchResults() {
    if (!this.searchTerm || this.searchResults.length === 0) {
      return;
    }

    console.log('开始高亮', this.searchResults.length, '个结果');

    this.searchResults.forEach((result, index) => {
      const element = result.element;
      const text = result.text;
      
      // 创建高亮版本
      const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
      const highlightedText = text.replace(regex, 
        `<span class="search-highlight" data-search-index="${index}">$1</span>`
      );
      
      // 保持原有的引号等格式
      if (element.classList.contains('json-key')) {
        element.innerHTML = `"${highlightedText}":`;
      } else if (element.classList.contains('json-string')) {
        element.innerHTML = `"${highlightedText}"`;
      } else {
        element.innerHTML = highlightedText;
      }
    });

    console.log('高亮完成');
  }

  // 转义正则表达式特殊字符
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 滚动到当前结果
  scrollToCurrentResult() {
    if (this.currentSearchIndex >= 0 && this.currentSearchIndex < this.searchResults.length) {
      console.log('滚动到结果', this.currentSearchIndex + 1);
      
      // 移除之前的当前高亮
      const currentHighlights = this.container.querySelectorAll('.search-current');
      currentHighlights.forEach(el => el.classList.remove('search-current'));

      // 添加当前高亮
      const currentHighlight = this.container.querySelector(
        `.search-highlight[data-search-index="${this.currentSearchIndex}"]`
      );
      
      if (currentHighlight) {
        currentHighlight.classList.add('search-current');
        
        // 展开到该元素
        this.expandPathToElement(currentHighlight);
        
        // 滚动到视图
        currentHighlight.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        console.log('已滚动到当前结果');
      }
    }
  }

  // 展开路径到元素
  expandPathToElement(element) {
    let current = element;
    while (current && current !== this.container) {
      // 查找父级的折叠容器
      const content = current.closest('.json-content');
      if (content && content.style.display === 'none') {
        content.style.display = 'block';
        
        // 更新对应的展开按钮
        const toggle = content.parentElement?.querySelector('.json-toggle');
        if (toggle) {
          toggle.textContent = '▼';
        }
        
        console.log('展开了一个折叠的节点');
      }
      current = current.parentElement;
    }
  }

  // 清除高亮
  clearHighlights() {
    // 恢复所有搜索结果的原始HTML
    this.searchResults.forEach(result => {
      if (result.element && result.originalHtml) {
        result.element.innerHTML = result.originalHtml;
      }
    });

    // 清除搜索结果
    this.searchResults = [];
    this.currentSearchIndex = -1;
    
    console.log('已清除所有高亮');
  }

  // 导航到下一个结果
  navigateToNext() {
    if (this.searchResults.length === 0) return;
    
    this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
    this.scrollToCurrentResult();
    this.updateSearchUI();
  }

  // 导航到上一个结果
  navigateToPrevious() {
    if (this.searchResults.length === 0) return;
    
    this.currentSearchIndex = this.currentSearchIndex <= 0 
      ? this.searchResults.length - 1 
      : this.currentSearchIndex - 1;
    this.scrollToCurrentResult();
    this.updateSearchUI();
  }

  // 更新搜索UI
  updateSearchUI() {
    const searchCounter = document.getElementById('search-counter');
    const prevBtn = document.getElementById('search-prev-btn');
    const nextBtn = document.getElementById('search-next-btn');
    
    if (searchCounter) {
      const current = this.searchResults.length > 0 ? this.currentSearchIndex + 1 : 0;
      searchCounter.textContent = `${current}/${this.searchResults.length}`;
    }
    
    if (prevBtn && nextBtn) {
      const hasResults = this.searchResults.length > 0;
      prevBtn.disabled = !hasResults;
      nextBtn.disabled = !hasResults;
    }
  }

  // 清除搜索
  clearSearch() {
    this.clearHighlights();
    this.searchTerm = '';
    this.updateSearchUI();
    console.log('搜索已清除');
  }

  // 修复：完整实现 createNode 方法
  createNode(data, key, isRoot = false, level = 0, path = '') {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'json-node';
    nodeDiv.dataset.level = level;
    
    // 生成层级颜色
    const colors = ['#0066cc', '#cc0066', '#00cc66', '#cc6600', '#6600cc', '#cc0066', '#00cccc', '#99cc00'];
    const levelColor = colors[level % colors.length];
    
    // 设置左边框颜色指示层级
    nodeDiv.style.borderLeft = `3px solid ${levelColor}`;
    nodeDiv.style.paddingLeft = '10px';
    nodeDiv.style.marginLeft = `${level * 20}px`;
    
    if (Array.isArray(data)) {
      this.createArrayNode(nodeDiv, data, key, isRoot, level, path, levelColor);
    } else if (typeof data === 'object' && data !== null) {
      this.createObjectNode(nodeDiv, data, key, isRoot, level, path, levelColor);
    } else {
      this.createPrimitiveNode(nodeDiv, data, key, level, path, levelColor);
    }
    
    return nodeDiv;
  }

  // 创建数组节点
  createArrayNode(nodeDiv, data, key, isRoot, level, path, levelColor) {
    const header = document.createElement('div');
    header.className = 'json-array-header';
    
    // 展开/折叠按钮
    const toggle = document.createElement('span');
    toggle.className = 'json-toggle';
    toggle.textContent = '▼';
    toggle.style.color = levelColor;
    
    // 键名（如果不是根节点）
    if (!isRoot && key !== '') {
      const keySpan = document.createElement('span');
      keySpan.className = 'json-key';
      keySpan.textContent = `"${key}": `;
      keySpan.style.color = levelColor;
      header.appendChild(keySpan);
    }
    
    // 数组标识和长度
    const arrayLabel = document.createElement('span');
    arrayLabel.className = 'json-array-label';
    arrayLabel.innerHTML = `<span class="json-bracket">[</span> <span class="json-count">${data.length} items</span>`;
    header.appendChild(arrayLabel);
    
    // 路径复制按钮
    if (path) {
      const copyBtn = this.createCopyButton(path);
      header.appendChild(copyBtn);
    }
    
    header.appendChild(toggle);
    nodeDiv.appendChild(header);
    
    // 内容容器
    const content = document.createElement('div');
    content.className = 'json-content';
    
    // 创建数组项
    data.forEach((item, index) => {
      const itemPath = path ? `${path}[${index}]` : `$[${index}]`;
      const itemNode = this.createNode(item, index.toString(), false, level + 1, itemPath);
      content.appendChild(itemNode);
    });
    
    // 结束括号
    const closeBracket = document.createElement('div');
    closeBracket.className = 'json-close-bracket';
    closeBracket.textContent = ']';
    closeBracket.style.color = levelColor;
    closeBracket.style.marginLeft = `${(level + 1) * 20}px`;
    content.appendChild(closeBracket);
    
    nodeDiv.appendChild(content);
    
    // 绑定展开/折叠事件
    toggle.addEventListener('click', () => {
      this.toggleNode(nodeDiv, toggle);
    });
  }

  // 创建对象节点
  createObjectNode(nodeDiv, data, key, isRoot, level, path, levelColor) {
    const header = document.createElement('div');
    header.className = 'json-object-header';
    
    // 展开/折叠按钮
    const toggle = document.createElement('span');
    toggle.className = 'json-toggle';
    toggle.textContent = '▼';
    toggle.style.color = levelColor;
    
    // 键名（如果不是根节点）
    if (!isRoot && key !== '') {
      const keySpan = document.createElement('span');
      keySpan.className = 'json-key';
      keySpan.textContent = `"${key}": `;
      keySpan.style.color = levelColor;
      header.appendChild(keySpan);
    }
    
    // 对象标识和属性数量
    const objectLabel = document.createElement('span');
    objectLabel.className = 'json-object-label';
    const keys = Object.keys(data);
    objectLabel.innerHTML = `<span class="json-bracket">{</span> <span class="json-count">${keys.length} properties</span>`;
    header.appendChild(objectLabel);
    
    // 路径复制按钮
    if (path) {
      const copyBtn = this.createCopyButton(path);
      header.appendChild(copyBtn);
    }
    
    header.appendChild(toggle);
    nodeDiv.appendChild(header);
    
    // 内容容器
    const content = document.createElement('div');
    content.className = 'json-content';
    
    // 创建对象属性
    keys.forEach(objKey => {
      const value = data[objKey];
      const itemPath = path ? `${path}.${objKey}` : `$.${objKey}`;
      const itemNode = this.createNode(value, objKey, false, level + 1, itemPath);
      content.appendChild(itemNode);
    });
    
    // 结束括号
    const closeBrace = document.createElement('div');
    closeBrace.className = 'json-close-bracket';
    closeBrace.textContent = '}';
    closeBrace.style.color = levelColor;
    closeBrace.style.marginLeft = `${(level + 1) * 20}px`;
    content.appendChild(closeBrace);
    
    nodeDiv.appendChild(content);
    
    // 绑定展开/折叠事件
    toggle.addEventListener('click', () => {
      this.toggleNode(nodeDiv, toggle);
    });
  }

  // 创建原始值节点
  createPrimitiveNode(nodeDiv, data, key, level, path, levelColor) {
    const wrapper = document.createElement('div');
    wrapper.className = 'json-primitive';
    
    // 键名
    if (key !== '') {
      const keySpan = document.createElement('span');
      keySpan.className = 'json-key';
      keySpan.textContent = `"${key}": `;
      keySpan.style.color = levelColor;
      wrapper.appendChild(keySpan);
    }
    
    // 值
    const valueSpan = document.createElement('span');
    valueSpan.innerHTML = this.renderPrimitive(data, levelColor);
    wrapper.appendChild(valueSpan);
    
    // 路径复制按钮
    if (path) {
      const copyBtn = this.createCopyButton(path);
      wrapper.appendChild(copyBtn);
    }
    
    nodeDiv.appendChild(wrapper);
  }

  // 创建复制按钮（多种图标选择）
  createCopyButton(path) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-path-btn';
    
    // 可以选择不同的图标风格：
    // copyBtn.innerHTML = '⋯';     // 省略号（简约）
    // copyBtn.innerHTML = '⌘';     // 命令符号（Mac风格）
    // copyBtn.innerHTML = '◦';     // 小圆点（极简）
    // copyBtn.innerHTML = '⊕';     // 圆加号（现代）
    copyBtn.innerHTML = '◈';     // 菱形（优雅）
    
    copyBtn.title = `复制路径: ${path}`;
    copyBtn.dataset.path = path;
    
    copyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await this.copyPathToClipboard(path, copyBtn);
    });
    
    return copyBtn;
  }

  // 渲染原始值
  renderPrimitive(value, levelColor = '#666') {
    if (value === null) {
      return '<span class="json-null">null</span>';
    }
    
    if (typeof value === 'string') {
      return `<span class="json-string">"${this.escapeHtml(value)}"</span>`;
    }
    
    if (typeof value === 'number') {
      return `<span class="json-number">${value}</span>`;
    }
    
    if (typeof value === 'boolean') {
      return `<span class="json-boolean">${value}</span>`;
    }
    
    return `<span class="json-undefined">${value}</span>`;
  }

  // HTML转义
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 展开/折叠节点
  toggleNode(nodeDiv, toggle) {
    const content = nodeDiv.querySelector('.json-content');
    if (!content) return;
    
    const isExpanded = content.style.display !== 'none';
    
    if (isExpanded) {
      content.style.display = 'none';
      toggle.textContent = '▶';
    } else {
      content.style.display = 'block';
      toggle.textContent = '▼';
    }
  }

  // 复制路径到剪贴板（优化版）
  async copyPathToClipboard(path, button) {
    try {
      const convertedPath = this.convertPath(path, this.pathFormat);
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(convertedPath);
      } else {
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = convertedPath;
        tempTextarea.style.position = 'absolute';
        tempTextarea.style.left = '-9999px';
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
      }
      
      // 优雅的成功反馈
      const originalIcon = button.innerHTML;
      button.innerHTML = '✓';
      button.className = 'copy-path-btn success';
      
      setTimeout(() => {
        button.innerHTML = originalIcon;
        button.className = 'copy-path-btn';
      }, 1200);
      
    } catch (error) {
      console.error('复制路径失败:', error);
      
      // 优雅的失败反馈
      const originalIcon = button.innerHTML;
      button.innerHTML = '✕';
      button.className = 'copy-path-btn error';
      
      setTimeout(() => {
        button.innerHTML = originalIcon;
        button.className = 'copy-path-btn';
      }, 1200);
    }
  }

  // 获取纯文本内容
  getPlainText(data) {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data, null, 2);
  }

  // 更新所有复制按钮
  updateAllCopyButtons() {
    const copyButtons = this.container.querySelectorAll('.copy-path-btn');
    copyButtons.forEach(button => {
      const originalPath = button.dataset.path;
      if (originalPath) {
        const convertedPath = this.convertPath(originalPath, this.pathFormat);
        button.title = `复制路径: ${convertedPath}`;
      }
    });
  }
}

// 导出到全局
window.JsonVisualizer = JsonVisualizer; 