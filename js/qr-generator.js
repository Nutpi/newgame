// 二维码生成器类
class QRCodeGenerator {
  constructor() {
    this.qrTextInput = document.getElementById('qr-text-input');
    this.qrOutput = document.getElementById('qr-output');
    this.generateBtn = document.getElementById('generate-qr-btn');
    this.clearBtn = document.getElementById('clear-qr-btn');
    this.downloadBtn = document.getElementById('download-qr-btn');
    this.qrSizeSelect = document.getElementById('qr-size');
    this.qrErrorLevelSelect = document.getElementById('qr-error-level');
    this.currentQRCode = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadQRCodeLibrary();
  }

  bindEvents() {
    // 生成二维码按钮
    this.generateBtn?.addEventListener('click', () => {
      this.generateQRCode();
    });

    // 清空按钮
    this.clearBtn?.addEventListener('click', () => {
      this.clearQRCode();
    });

    // 下载按钮
    this.downloadBtn?.addEventListener('click', () => {
      this.downloadQRCode();
    });

    // 输入框回车生成
    this.qrTextInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.generateQRCode();
      }
    });

    // 输入框变化时启用/禁用生成按钮
    this.qrTextInput?.addEventListener('input', () => {
      const hasText = this.qrTextInput.value.trim().length > 0;
      if (this.generateBtn) {
        this.generateBtn.disabled = !hasText;
      }
    });
  }

  async generateQRCode() {
    const text = this.qrTextInput?.value.trim();
    if (!text) {
      alert('请输入要生成二维码的文本');
      return;
    }

    const size = parseInt(this.qrSizeSelect?.value || '300');
    const errorCorrectionLevel = this.qrErrorLevelSelect?.value || 'M';

    try {
      // 清空输出区域
      if (this.qrOutput) {
        this.qrOutput.innerHTML = '<div class="qr-loading">生成中...</div>';
      }

      // 等待QR库加载
      await this.ensureQRCodeLibrary();

      // 生成二维码
      const qr = new QRCode(document.createElement('div'), {
        text: text,
        width: size,
        height: size,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel[errorCorrectionLevel]
      });

      // 获取生成的canvas
      const canvas = qr._el.querySelector('canvas');
      if (canvas) {
        this.currentQRCode = canvas;
        
        // 显示二维码
        if (this.qrOutput) {
          this.qrOutput.innerHTML = '';
          this.qrOutput.appendChild(canvas);
        }

        // 启用下载按钮
        if (this.downloadBtn) {
          this.downloadBtn.disabled = false;
        }

        console.log('二维码生成成功');
      } else {
        throw new Error('无法生成二维码图像');
      }

    } catch (error) {
      console.error('生成二维码失败:', error);
      if (this.qrOutput) {
        this.qrOutput.innerHTML = `
          <div class="qr-error">
            <p>生成失败</p>
            <p style="font-size: 12px; color: #666;">${error.message}</p>
          </div>
        `;
      }
      
      // 禁用下载按钮
      if (this.downloadBtn) {
        this.downloadBtn.disabled = true;
      }
    }
  }

  async loadQRCodeLibrary() {
    return new Promise((resolve, reject) => {
      if (window.QRCode) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'js/qrcode.min.js';
      script.onload = () => {
        console.log('QR码库加载成功');
        resolve();
      };
      script.onerror = () => {
        console.error('QR码库加载失败');
        reject(new Error('QR码库加载失败'));
      };
      document.head.appendChild(script);
    });
  }

  async ensureQRCodeLibrary() {
    if (!window.QRCode) {
      await this.loadQRCodeLibrary();
    }
    
    if (!window.QRCode) {
      throw new Error('QR码库未加载');
    }
  }

  clearQRCode() {
    // 清空输入
    if (this.qrTextInput) {
      this.qrTextInput.value = '';
    }

    // 清空输出
    if (this.qrOutput) {
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
    }

    // 禁用相关按钮
    if (this.generateBtn) {
      this.generateBtn.disabled = true;
    }
    if (this.downloadBtn) {
      this.downloadBtn.disabled = true;
    }

    this.currentQRCode = null;
  }

  downloadQRCode() {
    if (!this.currentQRCode) {
      alert('没有可下载的二维码');
      return;
    }

    try {
      // 创建下载链接
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.png`;
      link.href = this.currentQRCode.toDataURL('image/png');
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('二维码下载完成');
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  }
}

// 导出到全局
window.QRCodeGenerator = QRCodeGenerator; 