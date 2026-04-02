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
    if (!this.container) {
      console.error('JsonVisualizer container 不存在！');
      return;
    }
    
    this.jsonData = data;
    this.container.innerHTML = '';
    
    if (data === null) {
      this.container.innerHTML += '<span class="json-null">null</span>';
      return;
    }
    
    if (typeof data !== 'object') {
      const primitiveHtml = this.renderPrimitive(data);
      this.container.innerHTML += primitiveHtml;
      return;
    }
    
    const node = this.createNode(data, '', isRoot, 0, '$');
    this.container.appendChild(node);
    
    // 有数据时启用搜索功能
    this.enableSearchFeatures();
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

    // 全屏按钮
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'json-fullscreen-btn';
    fullscreenBtn.title = '全屏查看';
    fullscreenBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
    fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    headerBar.appendChild(fullscreenBtn);

    // 绑定搜索事件
    this.bindSearchEvents(searchInput, searchBtn, prevBtn, nextBtn, searchCounter);

    // 将工具栏添加到固定容器
    toolbarContainer.appendChild(headerBar);
  }

  // 纯原生全屏切换支持
  toggleFullscreen() {
    const formatter = document.getElementById('json-formatter');
    if (!formatter) return;

    // 如果已经是全屏状态，则关闭
    if (formatter.classList.contains('is-fullscreen')) {
      this.closeFullscreen();
      return;
    }

    formatter.classList.add('is-fullscreen');
    document.body.style.overflow = 'hidden'; // 防止背部滚动

    // 查找控制按钮区域，追加一个临时的高亮退出全屏按钮（如果不存在）
    const btnGroup = formatter.querySelector('.json-controls-top .button-group');
    if (btnGroup && !btnGroup.querySelector('.json-fs-exit-btn')) {
      const exitBtn = document.createElement('button');
      exitBtn.className = 'btn-outline json-fs-exit-btn';
      exitBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg> 退出全屏';
      
      // 插在最后一个按钮前面
      btnGroup.appendChild(exitBtn);
      
      this._exitBtnClickHandler = () => this.closeFullscreen();
      exitBtn.addEventListener('click', this._exitBtnClickHandler);
    }

    // Esc 关闭
    this._fsEscHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeFullscreen();
      }
    };
    document.addEventListener('keydown', this._fsEscHandler);
  }

  closeFullscreen() {
    const formatter = document.getElementById('json-formatter');
    if (!formatter) return;

    formatter.classList.remove('is-fullscreen');
    document.body.style.overflow = ''; // 恢复滚动

    // 清理退出全屏按钮
    const exitBtn = formatter.querySelector('.json-fs-exit-btn');
    if (exitBtn) {
      exitBtn.removeEventListener('click', this._exitBtnClickHandler);
      exitBtn.remove();
    }

    if (this._fsEscHandler) {
      document.removeEventListener('keydown', this._fsEscHandler);
      this._fsEscHandler = null;
    }
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
  }

  // 转义正则表达式特殊字符
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 滚动到当前结果
  scrollToCurrentResult() {
    if (this.currentSearchIndex >= 0 && this.currentSearchIndex < this.searchResults.length) {
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
  }

  // 修复：完整实现 createNode 方法
  createNode(data, key, isRoot = false, level = 0, path = '$') {
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
    
    // 复制按钮组
    if (path) {
      const copyButtonGroup = this.createCopyButtonGroup(path, data);
      header.appendChild(copyButtonGroup);
    }
    
    header.appendChild(toggle);
    nodeDiv.appendChild(header);
    
    // 内容容器
    const content = document.createElement('div');
    content.className = 'json-content';
    
    // 创建数组项
    data.forEach((item, index) => {
      const itemPath = path === '$' ? `$[${index}]` : `${path}[${index}]`;
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
    
    // 复制按钮组
    if (path) {
      const copyButtonGroup = this.createCopyButtonGroup(path, data);
      header.appendChild(copyButtonGroup);
    }
    
    header.appendChild(toggle);
    nodeDiv.appendChild(header);
    
    // 内容容器
    const content = document.createElement('div');
    content.className = 'json-content';
    
    // 创建对象属性
    keys.forEach(objKey => {
      const value = data[objKey];
      const itemPath = path === '$' ? `$.${objKey}` : `${path}.${objKey}`;
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
    
    // 复制按钮组
    if (path) {
      const copyButtonGroup = this.createCopyButtonGroup(path, data);
      wrapper.appendChild(copyButtonGroup);
    }
    
    nodeDiv.appendChild(wrapper);
  }

  // 创建复制按钮组（包含复制路径和复制内容）
  createCopyButtonGroup(path, data) {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'copy-button-group';
    
    // 复制路径按钮
    const pathBtn = this.createCopyPathButton(path);
    buttonGroup.appendChild(pathBtn);
    
    // 复制内容按钮
    const contentBtn = this.createCopyContentButton(path, data);
    buttonGroup.appendChild(contentBtn);
    
    return buttonGroup;
  }

  // 创建复制路径按钮
  createCopyPathButton(path) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-path-btn';
    copyBtn.innerHTML = '◈';
    copyBtn.title = `复制路径: ${this.convertPath(path, this.pathFormat)}`;
    copyBtn.dataset.path = path;
    
    copyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await this.copyPathToClipboard(path, copyBtn);
    });
    
    return copyBtn;
  }

  // 创建复制内容按钮
  createCopyContentButton(path, data) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-content-btn';
    copyBtn.innerHTML = '📋';
    copyBtn.title = `复制层级内容`;
    copyBtn.dataset.path = path;
    
    copyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await this.copyContentDirectly(path, copyBtn);
    });
    
    return copyBtn;
  }

  // 直接复制内容（不需要下拉菜单）
  async copyContentDirectly(path, button) {
    try {
      // 获取该路径对应的数据
      const pathData = this.getDataByPath(this.jsonData, path);
      
      // 使用美化格式
      const content = JSON.stringify(pathData, null, 2);
      
      // 复制到剪贴板
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = content;
        tempTextarea.style.position = 'absolute';
        tempTextarea.style.left = '-9999px';
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
      }
      
      // 显示成功反馈
      const originalIcon = button.innerHTML;
      button.innerHTML = '✓';
      button.className = 'copy-content-btn success';
      
      setTimeout(() => {
        button.innerHTML = originalIcon;
        button.className = 'copy-content-btn';
      }, 1200);
      
    } catch (error) {
      console.error('复制内容失败:', error);
      
      // 显示失败反馈
      const originalIcon = button.innerHTML;
      button.innerHTML = '✕';
      button.className = 'copy-content-btn error';
      
      setTimeout(() => {
        button.innerHTML = originalIcon;
        button.className = 'copy-content-btn';
      }, 1200);
    }
  }

  // 根据路径获取数据
  getDataByPath(data, path) {
    if (!path || path === '$' || path === '') {
      return data;
    }
    
    try {
      // 移除开头的 $ 和点
      let cleanPath = path.replace(/^\$\.?/, '');
      
      if (!cleanPath) {
        return data;
      }
      
      // 解析路径并获取数据
      let current = data;
      const pathParts = this.parsePath(cleanPath);
      
      for (const part of pathParts) {
        if (current === null || current === undefined) {
          return null;
        }
        current = current[part];
      }
      
      return current;
    } catch (error) {
      console.error('获取路径数据失败:', error, path);
      return null;
    }
  }

  // 解析路径
  parsePath(path) {
    const parts = [];
    let current = '';
    let inBrackets = false;
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < path.length; i++) {
      const char = path[i];
      
      if (char === '"' || char === "'") {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = '';
        }
        continue;
      }
      
      if (!inQuotes) {
        if (char === '[') {
          if (current) {
            parts.push(current);
            current = '';
          }
          inBrackets = true;
          continue;
        } else if (char === ']') {
          if (current) {
            // 尝试转换为数字索引
            const num = parseInt(current);
            parts.push(isNaN(num) ? current : num);
            current = '';
          }
          inBrackets = false;
          continue;
        } else if (char === '.' && !inBrackets) {
          if (current) {
            parts.push(current);
            current = '';
          }
          continue;
        }
      }
      
      current += char;
    }
    
    if (current) {
      if (inBrackets) {
        const num = parseInt(current);
        parts.push(isNaN(num) ? current : num);
      } else {
        parts.push(current);
      }
    }
    
    return parts;
  }

  // 显示复制反馈
  showCopyFeedback(element, message, type, dataSize = null) {
    // 创建反馈提示
    const feedback = document.createElement('div');
    feedback.className = `copy-feedback ${type}`;
    
    let feedbackText = message;
    if (dataSize !== null) {
      const sizeText = this.formatDataSize(dataSize);
      feedbackText += ` (${sizeText})`;
    }
    
    feedback.textContent = feedbackText;
    feedback.style.position = 'absolute';
    feedback.style.top = '-30px';
    feedback.style.left = '50%';
    feedback.style.transform = 'translateX(-50%)';
    feedback.style.whiteSpace = 'nowrap';
    feedback.style.zIndex = '1000';
    
    // 添加到元素
    element.style.position = 'relative';
    element.appendChild(feedback);
    
    // 动画显示
    setTimeout(() => {
      feedback.style.opacity = '1';
      feedback.style.transform = 'translateX(-50%) translateY(-5px)';
    }, 10);
    
    // 自动移除
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, 2500);
  }

  // 格式化数据大小
  formatDataSize(size) {
    if (size < 1024) {
      return `${size} 字符`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)}KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)}MB`;
    }
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