// Base64 编解码工具
class Base64Tool {
  constructor() {
    this.init();
  }

  init() {
    const input = document.getElementById('base64-input');
    const output = document.getElementById('base64-output');
    const encodeBtn = document.getElementById('base64-encode-btn');
    const decodeBtn = document.getElementById('base64-decode-btn');
    const copyBtn = document.getElementById('base64-copy-btn');
    const clearBtn = document.getElementById('base64-clear-btn');

    if (!input || !output) return;

    encodeBtn?.addEventListener('click', () => {
      const text = input.value;
      if (!text) return;
      try {
        // 支持 Unicode
        const encoded = btoa(unescape(encodeURIComponent(text)));
        output.value = encoded;
        if (copyBtn) copyBtn.disabled = false;
      } catch (e) {
        output.value = t('base64.encodeError') + e.message;
      }
    });

    decodeBtn?.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) return;
      try {
        const decoded = decodeURIComponent(escape(atob(text)));
        output.value = decoded;
        if (copyBtn) copyBtn.disabled = false;
      } catch (e) {
        output.value = t('base64.decodeError');
      }
    });

    clearBtn?.addEventListener('click', () => {
      input.value = '';
      output.value = '';
      if (copyBtn) copyBtn.disabled = true;
    });

    copyBtn?.addEventListener('click', async () => {
      const text = output.value;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const orig = copyBtn.textContent;
        copyBtn.textContent = t('common.copied');
        setTimeout(() => { copyBtn.textContent = orig; }, 2000);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    });
  }
}

window.Base64Tool = Base64Tool;
