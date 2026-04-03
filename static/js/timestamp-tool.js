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
        nowDisplay.textContent = `${t('ts.currentTimestamp')}${now}`;
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
          `${t('ts.localTime')}: ${date.toLocaleString(getLocale())}`,
          `${t('ts.utcTime')}: ${date.toUTCString()}`,
          `${t('ts.isoFormat')}: ${date.toISOString()}`,
          `${t('ts.secondsTs')}: ${Math.floor(ts / 1000)}`,
          `${t('ts.millisTs')}: ${ts}`,
          `${t('ts.year')}: ${date.getFullYear()}`,
          `${t('ts.month')}: ${date.getMonth() + 1}`,
          `${t('ts.day')}: ${date.getDate()}`,
          `${t('ts.weekday')}: ${t('ts.weekdays')[date.getDay()]}`,
          `${t('ts.hour')}: ${date.getHours()}`,
          `${t('ts.minute')}: ${date.getMinutes()}`,
          `${t('ts.second')}: ${date.getSeconds()}`
        ].join('\n');
        output.value = result;
        if (copyBtn) copyBtn.disabled = false;
      } catch (e) {
        output.value = t('ts.error.invalidTs');
      }
    });

    toTimestampBtn?.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) return;
      try {
        const date = new Date(val);
        if (isNaN(date.getTime())) throw new Error('无效日期');
        const result = [
          `${t('ts.millisTs')}: ${date.getTime()}`,
          `${t('ts.secondsTs')}: ${Math.floor(date.getTime() / 1000)}`,
          `${t('ts.localTime')}: ${date.toLocaleString(getLocale())}`,
          `${t('ts.utcTime')}: ${date.toUTCString()}`
        ].join('\n');
        output.value = result;
        if (copyBtn) copyBtn.disabled = false;
      } catch {
        output.value = t('ts.error.invalidDate');
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

window.TimestampTool = TimestampTool;
