# 文本处理工具集

免费在线文本处理与开发者工具集，所有数据均在浏览器本地处理，不上传任何服务器，保护隐私安全。

在线访问：[realpine.top](https://realpine.top/)

## 功能概览

### JSON 可视化工具

格式化、压缩、验证 JSON 数据，并以彩色树形结构可视化展示。

- 语法高亮 + 层级颜色系统，不同深度使用不同颜色便于快速识别结构
- 树形展示，支持展开/折叠（带动画过渡）
- 数据类型标识（字符串、数字、布尔值、null、对象、数组）
- 属性计数与结构统计
- 多格式路径复制（JSONPath / Python / JavaScript / 点分路径，共 6 种格式）
- 双按钮复制系统：路径复制 + 内容复制（支持复制任意层级的完整 JSON 片段）
- 全屏查看模式
- 详细的 JSON 错误定位信息

### 富文本超链接提取器

从富文本内容中提取超链接并转换为纯文本格式。

- 智能提取 HTML 中的 `<a>` 标签链接
- 保留加粗格式和换行结构
- 一键复制转换结果

### 二维码生成器

将任意文本内容生成二维码图片。

- 实时预览
- 支持下载二维码图片（PNG 格式）

### 时间戳转换

Unix 时间戳与可读日期之间的双向转换。

- 时间戳转日期 / 日期转时间戳
- 支持秒级和毫秒级时间戳

### URL 编解码

URL 编码与解码工具。

- URL 编码 / URL 解码
- 实时转换

### Base64 编解码

Base64 编码与解码工具。

- 文本转 Base64 / Base64 转文本
- 支持中文内容

### 哈希生成

计算文本的哈希值。

- 支持 MD5、SHA-1、SHA-256、SHA-512
- 一键复制哈希结果

## 界面特性

- **主题切换**：浅色模式 / 深色模式
- **响应式设计**：桌面端左右布局，移动端上下布局，适配各种屏幕尺寸
- **侧边栏导航**：移动端侧滑抽屉式导航，桌面端悬浮 Dock 导航
- **流畅动画**：交互动效与过渡效果
- **教程引导**：每个工具内置使用教程（手风琴折叠式）

## 技术栈

- 纯原生实现：HTML5 + CSS3 + JavaScript (ES6+)
- 零依赖构建，无需 Node.js 或打包工具
- 静态网站部署，支持 Cloudflare Pages / GitHub Pages / Vercel 等

## 项目结构

```
newgame/
├── index.html              # 主页面（所有工具入口）
├── about.html              # 关于页面
├── contact.html            # 联系方式
├── privacy.html            # 隐私政策
├── terms.html              # 服务条款
├── 404.html                # 404 页面
├── css/
│   ├── base.css            # 基础样式与变量
│   ├── components.css      # 组件样式
│   ├── pages.css           # 页面样式
│   └── style.css           # 主题系统
├── js/
│   ├── app.js              # 主应用逻辑
│   ├── json-visualizer.js  # JSON 可视化核心
│   ├── json-parser.js      # JSON 解析器
│   ├── text-tools.js       # 链接提取器
│   ├── qr-generator.js     # 二维码生成器
│   ├── qrcode.min.js       # 二维码库
│   ├── timestamp-tool.js   # 时间戳转换
│   ├── url-tool.js         # URL 编解码
│   ├── base64-tool.js      # Base64 编解码
│   ├── hash-tool.js        # 哈希生成
│   ├── theme.js            # 主题切换
│   ├── navigation.js       # 导航逻辑
│   └── cookie-consent.js   # Cookie 同意
├── images/                 # 图片资源
├── robots.txt
├── sitemap.xml
├── Ads.txt
└── LICENSE                 # MIT 许可证
```

## 快速开始

### 本地运行

```bash
git clone https://github.com/Nutpi/newgame.git
cd newgame

# 任选一种方式启动本地服务
python3 -m http.server 8000
# npx serve .
# php -S localhost:8000
```

浏览器访问 `http://localhost:8000` 即可使用。

### 部署

项目为纯静态网站，无需构建步骤。直接部署到任意静态托管平台：

- **Cloudflare Pages**：连接 GitHub 仓库，构建命令留空，输出目录设为 `/`
- **GitHub Pages**：仓库 Settings → Pages → 选择 `main` 分支
- **Vercel**：导入 GitHub 仓库，保持默认设置

## 许可证

[MIT](LICENSE) &copy; RealPine
