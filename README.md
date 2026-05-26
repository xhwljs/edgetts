
# EdgeTTS 在线音频制作工具

一个简单易用的在线语音合成工具，基于 EdgeTTS 技术，支持多种发音人和参数调节。

## 功能特性

- 支持多种语言和发音人
- 可调节语速、音量、音调
- 在线播放和音频下载
- 响应式设计，支持移动端
- 简单易用的界面

## 快速开始

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器（前端 + 后端）
npm run dev
```

前端将在 http://localhost:5173 运行，后端 API 在 http://localhost:3000 运行。

### 生产构建

```bash
# 构建前端
npm run build

# 启动生产服务器
npm start
```

## Termux 部署指南

### 1. 安装 Termux

从 [F-Droid](https://f-droid.org/packages/com.termux/) 或 GitHub 下载安装 Termux。

### 2. 安装必要的软件包

在 Termux 中执行以下命令：

```bash
# 更新包列表
pkg update && pkg upgrade -y

# 安装 Node.js 和 Git
pkg install -y nodejs git
```

### 3. 克隆项目

```bash
# 克隆仓库
git clone &lt;你的仓库地址&gt;
cd &lt;项目目录&gt;
```

### 4. 安装依赖和构建

```bash
# 安装依赖
npm install

# 构建前端
npm run build
```

### 5. 启动服务

```bash
# 启动服务器
npm start
```

服务将在 http://localhost:3000 启动。

### 6. 访问应用

在手机浏览器中打开 http://localhost:3000 即可使用。

### 7.（可选）后台运行

使用 tmux 或 nohup 让服务在后台运行：

```bash
# 安装 tmux
pkg install -y tmux

# 创建新会话
tmux new -s edgetts

# 在会话中启动服务
npm start

# 按 Ctrl+B 然后 D 分离会话
# 重新连接：tmux attach -t edgetts
```

## API 接口

### 获取发音人列表

```
GET /api/voices
```

响应：
```json
[
  {
    "Name": "Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)",
    "ShortName": "zh-CN-XiaoxiaoNeural",
    "Gender": "Female",
    "Locale": "zh-CN"
  }
]
```

### 生成音频

```
POST /api/generate
Content-Type: application/json

{
  "text": "要转换的文本",
  "voice": "zh-CN-XiaoxiaoNeural",
  "rate": "+0%",
  "volume": "+0%",
  "pitch": "+0Hz"
}
```

响应：音频流（audio/mpeg）

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Vite
- **后端**: Express.js + TypeScript
- **语音合成**: EdgeTTS

## 项目结构

```
.
├── api/              # 后端代码
│   ├── routes/       # API 路由
│   ├── app.ts        # Express 应用
│   └── index.ts      # 入口文件
├── src/              # 前端代码
│   ├── pages/        # 页面组件
│   ├── components/   # 通用组件
│   └── main.tsx      # 前端入口
├── dist/             # 构建输出
└── package.json
```
