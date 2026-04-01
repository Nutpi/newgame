// 时间戳转换工具
class TimestampTool {
  constructor() {
    this.init();
  }

  init() {
    const input = document.getElementById('timestamp-input');
    const output = document.getElementById('timestamp-output');
    const nowBtn = document.getElementById('timestamp-now-btn');
    const toReadableBtn = document.getElementById('timestamp-to-readable-btn');
    const toTimestampBtn = document.getElementById('timestamp-to-timestamp-btn');
    const copyBtn = document.getElementById('timestamp-copy-btn');
    const clearBtn = document.getElementById('timestamp-clear-btn');

    if (!input || !output) return;

    // 显示当前时间戳
    const updateNow = () => {
      const now = Date.now();
      const nowDisplay = document.getElementById('timestamp-current');
      if (nowDisplay) {
        nowDisplay.textContent = `当前时间戳: ${now}`;
      }
    };
    updateNow();
    setInterval(updateNow, 1000);

    nowBtn?.addEventListener('click', () => {
      input.value = Date.now();
    });

    toReadableBtn?.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) return;
      try {
        let ts = parseInt(val, 10);
        // 自动处理秒级时间戳
        if (ts < 1e12) ts *= 1000;
        const date = new Date(ts);
        if (isNaN(date.getTime())) throw new Error('无效时间戳');

        const result = [
          `本地时间: ${date.toLocaleString('zh-CN')}`,
          `UTC 时间: ${date.toUTCString()}`,
          `ISO 格式: ${date.toISOString()}`,
          `秒级时间戳: ${Math.floor(ts / 1000)}`,
          `毫秒时间戳: ${ts}`,
          `年份: ${date.getFullYear()}`,
          `月份: ${date.getMonth() + 1}`,
          `日期: ${date.getDate()}`,
          `星期: ${['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}`,
          `时: ${date.getHours()}`,
          `分: ${date.getMinutes()}`,
          `秒: ${date.getSeconds()}`
        ].join('\n');
        output.value = result;
        if (copyBtn) copyBtn.disabled = false;
      } catch (e) {
        output.value = '错误: 请输入有效的数字时间戳';
      }
    });

    toTimestampBtn?.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) return;
      try {
        const date = new Date(val);
        if (isNaN(date.getTime())) throw new Error('无效日期');
        const result = [
          `毫秒时间戳: ${date.getTime()}`,
          `秒级时间戳: ${Math.floor(date.getTime() / 1000)}`,
          `本地时间: ${date.toLocaleString('zh-CN')}`,
          `UTC 时间: ${date.toUTCString()}`
        ].join('\n');
        output.value = result;
        if (copyBtn) copyBtn.disabled = false;
      } catch {
        output.value = '错误: 请输入有效的日期格式\n示例: 2026-01-15 或 2026-01-15T10:30:00';
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

window.TimestampTool = TimestampTool;
