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
    this.initMobileMenu();
  }

  bindEvents() {
    // 移动端菜单按钮
    this.mobileMenuToggle?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleSidebar();
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

  toggleSidebar() {
    const isOpen = this.sidebar?.classList.contains('open');
    if (isOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar() {
    this.sidebar?.classList.add('open');
    this.overlay?.classList.add('show');
    this.mobileMenuToggle?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeSidebar() {
    this.sidebar?.classList.remove('open');
    this.overlay?.classList.remove('show');
    this.mobileMenuToggle?.classList.remove('active');
    document.body.style.overflow = '';
  }

  initMobileMenu() {
    // 添加触摸滑动支持
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      const diffX = currentX - startX;
      
      // 向右滑动超过50px且起始位置在屏幕左侧20px内，打开侧边栏
      if (diffX > 50 && startX < 20) {
        this.openSidebar();
      }
      
      // 向左滑动超过50px且侧边栏已打开，关闭侧边栏
      if (diffX < -50 && this.sidebar?.classList.contains('open')) {
        this.closeSidebar();
      }
    }, { passive: true });
  }
}

// JsonVisualizer 类
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
    
    // 在构造函数中立即创建工具栏
    this.createHeaderBar();
  }

  // 路径格式转换方法
  convertPath(jsonPath, format) {
    if (!jsonPath || jsonPath === '$') return '';
    
    // 移除开头的 $.
    let path = jsonPath.replace(/^\$\.?/, '');
    
    switch (format) {
      case 'jsonpath':
        return jsonPath; // 保持原格式
        
      case 'python-dict':
        // 转换为 Python 字典格式: ['key'][0]['subkey']
        return this.toPythonDictPath(path);
        
      case 'python-data':
        // 转换为 Python 数据访问格式: data['key'][0]['subkey']
        return 'data' + this.toPythonDictPath(path);
        
      case 'javascript':
        // 转换为 JavaScript 对象格式: .key[0].subkey
        return this.toJavaScriptPath(path);
        
      case 'javascript-data':
        // 转换为 JavaScript 数据访问格式: data.key[0].subkey
        return 'data' + this.toJavaScriptPath(path);
        
      case 'dot-notation':
        // 转换为点分路径: key.0.subkey
        return this.toDotNotation(path);
        
      default:
        return jsonPath;
    }
  }
  
  toPythonDictPath(path) {
    if (!path) return '';
    
    // 将路径按点分割，但保留数组索引
    let result = '';
    let parts = [];
    let currentPart = '';
    let inBracket = false;
    
    for (let i = 0; i < path.length; i++) {
      const char = path[i];
      
      if (char === '[') {
        if (currentPart) {
          parts.push(currentPart);
          currentPart = '';
        }
        inBracket = true;
        currentPart += char;
      } else if (char === ']') {
        currentPart += char;
        parts.push(currentPart);
        currentPart = '';
        inBracket = false;
      } else if (char === '.' && !inBracket) {
        if (currentPart) {
          parts.push(currentPart);
          currentPart = '';
        }
      } else {
        currentPart += char;
      }
    }
    
    if (currentPart) {
      parts.push(currentPart);
    }
    
    // 转换每个部分
    for (const part of parts) {
      if (part.startsWith('[') && part.endsWith(']')) {
        // 数组索引，直接添加
        result += part;
      } else {
        // 对象键，添加引号
        result += `['${part}']`;
      }
    }
    
    return result;
  }
  
  toJavaScriptPath(path) {
    if (!path) return '';
    
    // 确保以点开头（除非是数组索引）
    if (!path.startsWith('[')) {
      path = '.' + path;
    }
    return path;
  }
  
  toDotNotation(path) {
    if (!path) return '';
    
    // 将数组索引转换为点分格式
    return path.replace(/\[(\d+)\]/g, '.$1');
  }

  render(data, isRoot = true) {
    if (!this.container) return;
    
    this.jsonData = data;
    this.container.innerHTML = '';
    
    // 移除这里的工具栏创建，因为已经在构造函数中创建了
    // if (isRoot) {
    //   this.createHeaderBar();
    // }
    
    if (data === null) {
      this.container.innerHTML += '<span class="json-null">null</span>';
      return;
    }
    
    if (typeof data !== 'object') {
      this.container.innerHTML += this.renderPrimitive(data);
      return;
    }
    
    const node = this.createNode(data, '', isRoot, 0, '');
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
    searchInput.disabled = true; // 初始状态禁用
    
    const searchBtn = document.createElement('button');
    searchBtn.className = 'json-search-btn';
    searchBtn.innerHTML = '🔍';
    searchBtn.title = '搜索';
    searchBtn.disabled = true; // 初始状态禁用
    
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
  
  // 新增方法：启用搜索功能
  enableSearchFeatures() {
    const searchInput = document.getElementById('json-search-input');
    const searchBtn = document.querySelector('.json-search-btn');
    
    if (searchInput && searchBtn) {
      searchInput.disabled = false;
      searchBtn.disabled = false;
      searchInput.placeholder = '搜索键名或值...';
    }
  }
  
  // 新增方法：禁用搜索功能
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
    
    // 清除搜索结果
    this.clearSearch();
  }
  
  bindSearchEvents(searchInput, searchBtn, prevBtn, nextBtn, searchCounter) {
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
    prevBtn.addEventListener('click', () => {
      this.navigateToPrevious();
    });
    
    nextBtn.addEventListener('click', () => {
      this.navigateToNext();
    });
    
    // 实时搜索（可选）
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.trim();
      if (term.length >= 2) {
        this.performSearch(term);
      } else if (term.length === 0) {
        this.clearSearch();
      }
    });
  }
  
  performSearch(term) {
    this.searchTerm = term;
    this.searchResults = [];
    this.currentSearchIndex = -1;
    
    // 清除之前的高亮
    this.clearHighlights();
    
    // 搜索JSON数据
    this.searchInData(this.jsonData, '', term);
    
    // 更新UI
    this.updateSearchUI();
    
    // 跳转到第一个结果
    if (this.searchResults.length > 0) {
      this.navigateToNext();
    }
  }
  
  searchInData(data, path, term) {
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          const currentPath = path ? `${path}[${index}]` : `$[${index}]`;
          this.searchInData(item, currentPath, term);
        });
      } else {
        Object.keys(data).forEach(key => {
          const currentPath = path ? `${path}.${key}` : `$.${key}`;
          
          // 搜索键名
          if (key.toLowerCase().includes(term.toLowerCase())) {
            this.searchResults.push({
              path: currentPath,
              type: 'key',
              value: key,
              element: null // 稍后设置
            });
          }
          
          // 搜索值
          const value = data[key];
          if (typeof value === 'string' || typeof value === 'number') {
            if (String(value).toLowerCase().includes(term.toLowerCase())) {
              this.searchResults.push({
                path: currentPath,
                type: 'value',
                value: value,
                element: null
              });
            }
          }
          
          // 递归搜索
          this.searchInData(value, currentPath, term);
        });
      }
    }
  }
  
  updateSearchUI() {
    const counter = document.getElementById('search-counter');
    const prevBtn = document.getElementById('search-prev-btn');
    const nextBtn = document.getElementById('search-next-btn');
    
    if (counter) {
      counter.textContent = `${this.currentSearchIndex + 1}/${this.searchResults.length}`;
    }
    
    if (prevBtn && nextBtn) {
      const hasResults = this.searchResults.length > 0;
      prevBtn.disabled = !hasResults;
      nextBtn.disabled = !hasResults;
    }
    
    // 高亮搜索结果
    this.highlightSearchResults();
  }
  
  navigateToNext() {
    if (this.searchResults.length === 0) return;
    
    this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
    this.updateSearchUI();
    this.scrollToCurrentResult();
  }
  
  navigateToPrevious() {
    if (this.searchResults.length === 0) return;
    
    this.currentSearchIndex = this.currentSearchIndex <= 0 
      ? this.searchResults.length - 1 
      : this.currentSearchIndex - 1;
    this.updateSearchUI();
    this.scrollToCurrentResult();
  }
  
  highlightSearchResults() {
    // 清除之前的高亮
    this.clearHighlights();
    
    // 为每个搜索结果添加高亮
    this.searchResults.forEach((result, index) => {
      const element = this.findElementByPath(result.path, result.type);
      if (element) {
        result.element = element;
        element.classList.add('search-highlight');
        
        if (index === this.currentSearchIndex) {
          element.classList.add('search-current');
        }
        
        // 展开到该节点的路径
        this.expandPathToElement(element);
      }
    });
  }
  
  findElementByPath(path, type) {
    // 根据路径查找对应的DOM元素
    const copyButtons = this.container.querySelectorAll('.json-copy-path');
    for (const button of copyButtons) {
      const buttonPath = button.getAttribute('data-original-path');
      if (buttonPath === path) {
        const header = button.closest('.json-header');
        if (type === 'key') {
          return header.querySelector('.json-key');
        } else {
          return header.querySelector('.json-string, .json-number, .json-boolean');
        }
      }
    }
    return null;
  }
  
  expandPathToElement(element) {
    let current = element;
    while (current) {
      const node = current.closest('.json-node');
      if (node && node.classList.contains('collapsed')) {
        const toggle = node.querySelector('.json-toggle');
        if (toggle) {
          this.toggleNode(node, toggle);
        }
      }
      current = current.parentElement;
    }
  }
  
  scrollToCurrentResult() {
    if (this.currentSearchIndex >= 0 && this.currentSearchIndex < this.searchResults.length) {
      const result = this.searchResults[this.currentSearchIndex];
      if (result.element) {
        result.element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }
  
  clearSearch() {
    this.searchResults = [];
    this.currentSearchIndex = -1;
    this.searchTerm = '';
    this.clearHighlights();
    this.updateSearchUI();
  }
  
  clearHighlights() {
    const highlights = this.container.querySelectorAll('.search-highlight, .search-current');
    highlights.forEach(element => {
      element.classList.remove('search-highlight', 'search-current');
    });
  }
  
  updateAllCopyButtons() {
    const copyButtons = this.container.querySelectorAll('.json-copy-path');
    copyButtons.forEach(button => {
      const originalPath = button.getAttribute('data-original-path');
      if (originalPath) {
        const convertedPath = this.convertPath(originalPath, this.pathFormat);
        button.title = `复制路径: ${convertedPath}`;
        button.setAttribute('data-current-path', convertedPath);
      }
    });
  }

  createNode(data, key, isRoot = false, level = 0, path = '') {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'json-node';
    
    // 添加层级颜色样式
    const levelColors = [
      '#2563eb', // 蓝色 - 第0层
      '#dc2626', // 红色 - 第1层
      '#059669', // 绿色 - 第2层
      '#d97706', // 橙色 - 第3层
      '#7c3aed', // 紫色 - 第4层
      '#db2777', // 粉色 - 第5层
      '#0891b2', // 青色 - 第6层
      '#65a30d'  // 黄绿色 - 第7层及以上
    ];
    
    const colorIndex = Math.min(level, levelColors.length - 1);
    const levelColor = levelColors[colorIndex];
    
    // 修复：直接使用传入的路径，如果没有路径则构建
    const currentPath = isRoot ? '$' : (path || key);
    
    const isArray = Array.isArray(data);
    const isObject = typeof data === 'object' && data !== null && !isArray;
    const hasChildren = (isArray && data.length > 0) || (isObject && Object.keys(data).length > 0);
    
    // 创建节点头部
    const headerDiv = document.createElement('div');
    headerDiv.className = 'json-header';
    
    // 为头部添加层级颜色
    headerDiv.style.borderLeft = `3px solid ${levelColor}`;
    headerDiv.style.paddingLeft = '8px';
    headerDiv.style.marginLeft = `${level * 20}px`;
    
    // 展开/折叠按钮
    if (hasChildren) {
      const toggle = document.createElement('span');
      toggle.className = 'json-toggle expanded';
      toggle.style.color = levelColor;
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
      keySpan.style.color = levelColor;
      keySpan.style.fontWeight = 'bold';
      headerDiv.appendChild(keySpan);
      
      const colon = document.createElement('span');
      colon.textContent = ': ';
      colon.className = 'json-bracket';
      colon.style.color = levelColor;
      headerDiv.appendChild(colon);
    }
    
    // 添加复制路径按钮
    if (!isRoot) {
      const copyPathBtn = document.createElement('button');
      copyPathBtn.className = 'json-copy-path';
      copyPathBtn.innerHTML = '📋';
      copyPathBtn.style.borderColor = levelColor;
      
      // 存储原始JSONPath和当前转换后的路径
      copyPathBtn.setAttribute('data-original-path', currentPath);
      const convertedPath = this.convertPath(currentPath, this.pathFormat);
      copyPathBtn.setAttribute('data-current-path', convertedPath);
      copyPathBtn.title = `复制路径: ${convertedPath}`;
      
      copyPathBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pathToCopy = copyPathBtn.getAttribute('data-current-path');
        this.copyPathToClipboard(pathToCopy, copyPathBtn);
      });
      headerDiv.appendChild(copyPathBtn);
    }
    
    // 值类型和括号
    if (isArray) {
      const bracket = document.createElement('span');
      bracket.className = 'json-bracket';
      bracket.textContent = '[';
      bracket.style.color = levelColor;
      bracket.style.fontWeight = 'bold';
      headerDiv.appendChild(bracket);
      
      if (hasChildren) {
        const length = document.createElement('span');
        length.className = 'json-array-length';
        length.textContent = `${data.length} items`;
        length.style.color = levelColor;
        length.style.opacity = '0.7';
        headerDiv.appendChild(length);
      }
    } else if (isObject) {
      const bracket = document.createElement('span');
      bracket.className = 'json-bracket';
      bracket.textContent = '{';
      bracket.style.color = levelColor;
      bracket.style.fontWeight = 'bold';
      headerDiv.appendChild(bracket);
      
      if (hasChildren) {
        const length = document.createElement('span');
        length.className = 'json-object-length';
        length.textContent = `${Object.keys(data).length} properties`;
        length.style.color = levelColor;
        length.style.opacity = '0.7';
        headerDiv.appendChild(length);
      }
    } else {
      // 原始值
      const valueSpan = document.createElement('span');
      valueSpan.innerHTML = this.renderPrimitive(data, levelColor);
      headerDiv.appendChild(valueSpan);
    }
    
    nodeDiv.appendChild(headerDiv);
    
    // 创建子节点容器
    if (hasChildren) {
      const childrenDiv = document.createElement('div');
      childrenDiv.className = 'json-children';
      
      if (isArray) {
        data.forEach((item, index) => {
          // 修复：直接使用当前路径加上数组索引
          const childPath = `${currentPath}[${index}]`;
          const childNode = this.createNode(item, index.toString(), false, level + 1, childPath);
          childrenDiv.appendChild(childNode);
          
          // 添加逗号（除了最后一个元素）
          if (index < data.length - 1) {
            const comma = document.createElement('span');
            comma.className = 'json-comma';
            comma.textContent = ',';
            comma.style.color = levelColor;
            childNode.appendChild(comma);
          }
        });
      }
      else {
        const keys = Object.keys(data);
        keys.forEach((objKey, index) => {
          const childPath = isRoot ? `$.${objKey}` : `${currentPath}.${objKey}`;
          const childNode = this.createNode(data[objKey], objKey, false, level + 1, childPath);
          childrenDiv.appendChild(childNode);
          
          // 添加逗号（除了最后一个属性）
          if (index < keys.length - 1) {
            const comma = document.createElement('span');
            comma.className = 'json-comma';
            comma.textContent = ',';
            comma.style.color = levelColor;
            childNode.appendChild(comma);
          }
        });
      }
      
      nodeDiv.appendChild(childrenDiv);
      
      // 结束括号
      const closingBracket = document.createElement('div');
      closingBracket.innerHTML = `<span style="margin-left: ${17 + level * 20}px;"></span><span class="json-bracket" style="color: ${levelColor}; font-weight: bold;">${isArray ? ']' : '}'}</span>`;
      nodeDiv.appendChild(closingBracket);
    } else if (isArray || isObject) {
      // 空数组或对象的结束括号
      const closingBracket = document.createElement('span');
      closingBracket.className = 'json-bracket';
      closingBracket.textContent = isArray ? ']' : '}';
      closingBracket.style.color = levelColor;
      closingBracket.style.fontWeight = 'bold';
      headerDiv.appendChild(closingBracket);
    }
    
    return nodeDiv;
  }

  renderPrimitive(value, levelColor = '#666') {
    if (typeof value === 'string') {
      return `<span class="json-string" style="color: ${levelColor};">"${this.escapeHtml(value)}"</span>`;
    } else if (typeof value === 'number') {
      return `<span class="json-number" style="color: ${levelColor};">${value}</span>`;
    } else if (typeof value === 'boolean') {
      return `<span class="json-boolean" style="color: ${levelColor};">${value}</span>`;
    } else if (value === null) {
      return `<span class="json-null" style="color: ${levelColor};">null</span>`;
    } else {
      return `<span class="json-string" style="color: ${levelColor};">"${this.escapeHtml(String(value))}"</span>`;
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
  // 复制路径到剪贴板
  async copyPathToClipboard(path, button) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(path);
      } else {
        // 降级方案：使用传统的复制方法
        const textArea = document.createElement('textarea');
        textArea.value = path;
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      // 显示复制成功的反馈
      const originalText = button.innerHTML;
      button.innerHTML = '✅';
      button.style.backgroundColor = '#28a745';
      button.style.color = 'white';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = '';
        button.style.color = '';
      }, 1000);
    } catch (error) {
      console.error('复制失败:', error);
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = path;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // 显示复制成功的反馈
      const originalText = button.innerHTML;
      button.innerHTML = '✅';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 1000);
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

    // 自动格式化功能 - 在输入时自动格式化
    let formatTimeout;
    jsonInput.addEventListener('input', () => {
      // 清除之前的定时器，避免频繁格式化
      clearTimeout(formatTimeout);
      
      // 设置延迟格式化，用户停止输入500ms后自动格式化
      formatTimeout = setTimeout(() => {
        const input = jsonInput.value.trim();
        if (!input) {
          this.updateJsonStatus('等待输入', 'waiting');
          this.jsonVisualizer.container.innerHTML = '';
          this.updateJsonSize(0);
          copyJsonBtn.disabled = true;
          currentJsonData = null;
          // 禁用搜索功能
          this.jsonVisualizer.disableSearchFeatures();
          return;
        }

        try {
          const parsed = JSON.parse(input);
          currentJsonData = parsed;
          this.jsonVisualizer.render(parsed);
          this.updateJsonStatus('自动格式化成功', 'valid');
          this.updateJsonSize(JSON.stringify(parsed, null, 2).length);
          copyJsonBtn.disabled = false;
        } catch (error) {
          // 如果JSON格式不完整，不显示错误，等待用户继续输入
          // 只有在输入看起来完整但格式错误时才显示错误
          if (input.includes('{') && input.includes('}') || input.includes('[') && input.includes(']')) {
            this.updateJsonStatus('JSON格式检查中...', 'waiting');
          }
        }
      }, 500); // 500ms延迟
    });

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
          <div style="background-color: var(--bg-tertiary); padding: 15px; border-radius: 4px; font-family: monospace; white-space: pre-line; color: var(--text-primary);">
            <strong>结构分析：</strong>\n${analysis}
          </div>
        `;
        this.updateJsonStatus('验证通过', 'valid');
        this.updateJsonSize(input.length);
      } catch (error) {
        this.jsonVisualizer.container.innerHTML = `<div style="color: var(--text-danger, #721c24); padding: 10px; background-color: var(--bg-danger, #f8d7da); border-radius: 4px;">❌ JSON 格式无效：${error.message}</div>`;
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
      // 禁用搜索功能
      this.jsonVisualizer.disableSearchFeatures();
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

  // 在 JsonVisualizer 类中添加 copyPathToClipboard 方法
  // 找到 escapeHtml 方法后，在其后添加：
  
  // 复制路径到剪贴板
  async copyPathToClipboard(path, button) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(path);
      } else {
        // 降级方案：使用传统的复制方法
        const textArea = document.createElement('textarea');
        textArea.value = path;
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      // 显示复制成功的反馈
      const originalText = button.innerHTML;
      button.innerHTML = '✅';
      button.style.backgroundColor = '#28a745';
      button.style.color = 'white';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = '';
        button.style.color = '';
      }, 1000);
    } catch (error) {
      console.error('复制失败:', error);
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = path;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // 显示复制成功的反馈
      const originalText = button.innerHTML;
      button.innerHTML = '✅';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 1000);
    }
  }
}

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
  new TextToolsApp();
});