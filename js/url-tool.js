// URL 编解码工具
class UrlTool {
  constructor() {
    this.init();
  }

  init() {
    const input = document.getElementById('url-input');
    const output = document.getElementById('url-output');
    const encodeBtn = document.getElementById('url-encode-btn');
    const decodeBtn = document.getElementById('url-decode-btn');
    const encodeComponentBtn = document.getElementById('url-encode-component-btn');
    const decodeComponentBtn = document.getElementById('url-decode-component-btn');
    const copyBtn = document.getElementById('url-copy-btn');
    const clearBtn = document.getElementById('url-clear-btn');

    if (!input || !output) return;

    const doAction = (fn) => {
      const text = input.value.trim();
      if (!text) return;
      try {
        output.value = fn(text);
        if (copyBtn) copyBtn.disabled = false;
      } catch (e) {
        output.value = '错误: ' + e.message;
      }
    };

    encodeBtn?.addEventListener('click', () => doAction(t => encodeURIComponent(t)));
    decodeBtn?.addEventListener('click', () => doAction(t => decodeURIComponent(t)));
    encodeComponentBtn?.addEventListener('click', () => doAction(t => encodeURI(t)));
    decodeComponentBtn?.addEventListener('click', () => doAction(t => decodeURI(t)));

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
        copyBtn.textContent = '已复制！';
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

window.UrlTool = UrlTool;
