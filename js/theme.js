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

// 导出到全局
window.ThemeManager = ThemeManager; 