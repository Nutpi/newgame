// Cookie 同意管理
class CookieConsent {
  constructor() {
    this.storageKey = 'cookie_consent';
    this.consent = this.getStoredConsent();
    this.banner = null;
    this.init();
  }

  init() {
    if (!this.consent) {
      this.setDefaultConsent();
      this.createBanner();
    } else if (this.consent === 'accepted') {
      this.grantConsent();
    }
  }

  getStoredConsent() {
    try {
      return localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }

  setDefaultConsent() {
    if (typeof gtag === 'function') {
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  }

  grantConsent() {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    }
  }

  denyConsent() {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  }

  createBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.id = 'cookie-banner';
    banner.innerHTML = `
      <div class="cookie-banner-content">
        <div class="cookie-banner-text">
          <p>我们使用 Cookie 和类似技术来提供、保护和改善我们的服务，以及展示广告。您可以选择接受或拒绝非必要的 Cookie。
          <a href="privacy.html" target="_blank">了解更多</a></p>
        </div>
        <div class="cookie-banner-actions">
          <button class="cookie-btn cookie-accept" id="cookie-accept">全部接受</button>
          <button class="cookie-btn cookie-decline" id="cookie-decline">仅必要</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    this.banner = banner;

    // 绑定事件
    document.getElementById('cookie-accept').addEventListener('click', () => {
      this.accept();
    });
    document.getElementById('cookie-decline').addEventListener('click', () => {
      this.decline();
    });

    // 延迟显示动画
    requestAnimationFrame(() => {
      banner.classList.add('show');
    });
  }

  accept() {
    this.consent = 'accepted';
    try {
      localStorage.setItem(this.storageKey, 'accepted');
    } catch {}
    this.grantConsent();
    this.hideBanner();
  }

  decline() {
    this.consent = 'declined';
    try {
      localStorage.setItem(this.storageKey, 'declined');
    } catch {}
    this.denyConsent();
    this.hideBanner();
  }

  hideBanner() {
    if (this.banner) {
      this.banner.classList.remove('show');
      this.banner.classList.add('hide');
      setTimeout(() => {
        this.banner.remove();
      }, 300);
    }
  }
}

window.CookieConsent = CookieConsent;
