# 文本处理工具集

一个功能强大的在线文本处理工具集，提供富文本链接提取和 JSON 数据可视化功能。

## 🚀 功能特性

### 📎 富文本超链接提取转换工具
- **智能链接提取**：从富文本中提取超链接并转换为纯文本格式
- **格式保持**：保留文本的加粗格式和换行结构
- **一键复制**：转换结果可一键复制到剪贴板
- **实时预览**：即时显示转换结果

### 🔍 JSON 可视化工具
- **语法高亮**：彩色显示 JSON 数据结构
- **树形展示**：层级化展示 JSON 数据
- **展开折叠**：支持节点的展开和折叠操作
- **类型指示**：清晰标识数据类型（字符串、数字、布尔值等）
- **格式化功能**：美化和压缩 JSON 数据
- **数据验证**：检测 JSON 格式错误
- **结构分析**：显示数据统计信息

## 🎨 界面特性

- **响应式设计**：完美适配桌面端和移动端
  - 桌面端：左右布局，提高工作效率
  - 移动端：上下布局，优化触屏体验
- **暗色模式**：支持深色主题，保护视力
- **现代化 UI**：简洁美观的用户界面
- **流畅动画**：丰富的交互动效

## 📱 技术栈

- **前端框架**：原生 JavaScript (ES6+)
- **样式**：CSS3 + Flexbox + Grid
- **响应式**：Media Queries
- **部署**：静态网站托管（支持 Cloudflare Pages、GitHub Pages 等）

## 🛠️ 项目结构

```
newgame/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── app.js          # 核心逻辑
└── README.md           # 项目说明
```

## 🚀 快速开始

### 本地运行

1. 克隆项目
```bash
git clone https://github.com/Nutpi/newgame.git
cd newgame
```

2. 启动本地服务器
```bash
# 使用 Python
python3 -m http.server 8000

# 或使用 Node.js
npx serve .

# 或使用 PHP
php -S localhost:8000
```

3. 打开浏览器访问 `http://localhost:8000`

### 在线部署

#### Cloudflare Pages 部署
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Pages 服务
3. 连接 GitHub 仓库
4. 选择 `newgame` 仓库
5. 设置构建配置：
   - 构建命令：留空
   - 构建输出目录：`/`
6. 点击部署

#### GitHub Pages 部署
1. 进入仓库设置页面
2. 找到 Pages 选项
3. 选择源分支（通常是 `main` 或 `master`）
4. 保存设置，等待部署完成

## 📖 使用说明

### 富文本链接提取器
1. 在输入区粘贴包含超链接的富文本内容
2. 点击「转换」按钮
3. 在输出区查看转换结果
4. 点击「复制」按钮将结果复制到剪贴板

### JSON 可视化工具
1. 在输入框中粘贴或输入 JSON 数据
2. 点击「格式化」查看美化后的 JSON
3. 点击「压缩」获取压缩版本
4. 点击「验证」检查 JSON 格式
5. 在可视化区域查看树形结构
6. 点击节点前的箭头展开/折叠内容

## 🔧 自定义配置

### 修改主题色彩
编辑 `css/style.css` 文件中的 CSS 变量：

```css
:root {
  --primary-color: #3498db;    /* 主色调 */
  --success-color: #27ae60;    /* 成功色 */
  --warning-color: #f39c12;    /* 警告色 */
  --danger-color: #e74c3c;     /* 危险色 */
}
```

### 添加新功能
在 `js/app.js` 中扩展功能模块，参考现有的工具类结构。

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 更新日志

### v2.0.0 (最新)
- ✨ 新增 JSON 可视化工具
- 🎨 重构项目结构，分离 HTML、CSS、JS
- 📱 优化响应式设计
- 🌙 支持暗色模式
- 🔧 改进用户体验

### v1.0.0
- 🎉 初始版本
- 📎 富文本链接提取功能
- 💻 基础 UI 界面

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

如果这个项目对您有帮助，请给个 ⭐️ Star 支持一下！
```


