# Edge TTS 在线音频制作工具

基于微软Edge浏览器高质量TTS引擎的在线文本转语音工具，支持多种语言和声音选择，可视化调节语速、音调、音量等功能。

## 功能特点

- 🎙️ **多语言支持** - 支持中文、英文、日文、韩文等多种语言
- 🎯 **多种语音** - 提供多种男女声选择
- ⚙️ **参数调节** - 可调节语速、音调、音量
- 🎵 **实时预览** - 生成后可直接播放预览
- 📥 **一键下载** - 支持MP3格式下载
- 📱 **移动端适配** - 完美支持Termux部署
- 🚀 **轻量快速** - 界面简洁，操作便捷

## 技术栈

- **前端**: React 18 + Vite + TailwindCSS
- **后端**: Express.js + edge-tts
- **部署**: 支持Docker、Node.js、Termux

## 快速开始

### 方式一：本地开发

```bash
# 安装依赖
npm install
cd server && npm install && cd ..

# 启动后端服务（终端1）
node server/index.js

# 启动前端开发服务器（终端2）
npm run dev

# 访问 http://localhost:5173
```

### 方式二：生产环境

```bash
# 构建前端
npm run build

# 启动服务
npm start

# 访问 http://localhost:3001
```

## Termux移动端部署

### 步骤1: 安装Termux

从F-Droid下载并安装Termux（不要从Google Play安装）

### 步骤2: 运行部署脚本

```bash
# 克隆项目（如果没有）
git clone <your-repo-url>
cd edge-tts-tool

# 运行部署脚本
bash deploy-termux.sh
```

### 步骤3: 启动服务

```bash
# 启动后端服务
node server/index.js

# 新开一个终端启动前端
npm run dev

# 在浏览器中访问 http://localhost:5173
```

或者使用生产模式：

```bash
# 构建前端
npm run build

# 启动服务
npm start

# 访问 http://localhost:3001
```

## API接口

### 健康检查

```
GET /api/health
```

### 获取可用语音列表

```
GET /api/voices
```

### 文本转语音

```
POST /api/tts
Content-Type: application/json

{
  "text": "要转换的文本",
  "voice": "zh-CN-XiaoxiaoNeural",
  "rate": "+0%",
  "pitch": "+0Hz",
  "volume": "+0%"
}
```

响应：音频文件（MP3格式）

## 项目结构

```
edge-tts-tool/
├── server/                 # 后端服务
│   ├── index.js           # Express服务器入口
│   ├── tts-service.js     # TTS处理服务
│   └── package.json
├── src/                    # 前端源码
│   ├── components/        # React组件
│   ├── App.jsx            # 主应用
│   ├── main.jsx           # 入口文件
│   └── index.css          # 全局样式
├── public/                 # 静态资源
├── index.html             # HTML模板
├── package.json           # 前端依赖
├── vite.config.js         # Vite配置
├── tailwind.config.js     # Tailwind配置
├── deploy-termux.sh       # Termux部署脚本
└── README.md
```

## 使用说明

1. **输入文本**: 在左侧文本框中输入要转换的内容
2. **选择语音**: 从下拉菜单中选择合适的语音
3. **调整参数**: 根据需要调整语速、音调、音量
4. **生成音频**: 点击"生成音频"按钮
5. **预览下载**: 生成后可以预览播放，确认无误后点击下载

## Git提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建或辅助工具更新
```

## 注意事项

- 文本长度限制：单次最多10000字符
- 确保网络连接正常（访问Edge TTS API）
- Termux环境下建议使用WiFi网络
- 首次使用可能需要等待依赖下载完成

## License

MIT License

## 贡献

欢迎提交Issue和Pull Request！
