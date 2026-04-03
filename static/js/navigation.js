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

// 导出到全局
window.NavigationManager = NavigationManager; 