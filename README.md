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
- 💾 **Git版本管理** - 完整的Git仓库支持

## 技术栈

- **前端**: React 18 + Vite + TailwindCSS
- **后端**: Express.js + edge-tts
- **部署**: 支持Docker、Node.js、Termux
- **版本控制**: Git

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

## Git仓库设置

### 第一步：创建远程仓库

在以下平台之一创建一个新的空仓库（不要初始化README、.gitignore或License）：

#### 🏠 GitHub
1. 访问 https://github.com/new
2. 填写仓库名称（例如：`edge-tts-tool`）
3. 选择 Public 或 Private
4. 点击 "Create repository"
5. 复制仓库地址（例如：`https://github.com/你的用户名/edge-tts-tool.git`）

#### 🇨🇳 Gitee（码云）
1. 访问 https://gitee.com/projects/new
2. 填写仓库名称
3. 选择 公开 或 私有
4. 点击 "创建"
5. 复制仓库地址

#### 🦊 GitLab
1. 访问 https://gitlab.com/projects/new
2. 填写仓库名称
3. 选择 Visibility Level
4. 点击 "Create project"
5. 复制仓库地址

### 第二步：关联远程仓库并推送

```bash
# 查看当前仓库状态
git status

# 添加远程仓库（替换为你的实际仓库地址）
git remote add origin https://github.com/你的用户名/edge-tts-tool.git

# 或者使用SSH方式（如果配置了SSH密钥）
# git remote add origin git@github.com:你的用户名/edge-tts-tool.git

# 查看远程仓库配置
git remote -v

# 推送到远程仓库
git push -u origin main
```

### 第三步：后续更新

```bash
# 查看修改
git status

# 添加修改
git add .

# 提交
git commit -m "描述你的修改"

# 推送
git push
```

## Termux移动端部署

### 前置准备

#### 1. 安装Termux
从 F-Droid 下载并安装 Termux（不要从 Google Play 安装，版本过旧）：
- 访问：https://f-droid.org/packages/com.termux/
- 下载并安装最新的 APK

#### 2. 配置Termux
```bash
# 更新包管理器
pkg update && pkg upgrade -y

# 安装基础工具
pkg install git nodejs curl wget -y
```

### 完整部署流程

#### 方式一：从远程仓库克隆（推荐）

```bash
# 1. 克隆项目（替换为你的实际仓库地址）
git clone https://github.com/你的用户名/edge-tts-tool.git
cd edge-tts-tool

# 2. 运行部署脚本
chmod +x deploy-termux.sh
bash deploy-termux.sh

# 3. 安装依赖（如果脚本没有自动完成）
npm install
cd server && npm install && cd ..

# 4. 启动后端服务（终端1）
node server/index.js

# 5. 新开终端（在Termux中从左侧滑出菜单新建会话）启动前端
cd edge-tts-tool
npm run dev

# 6. 在浏览器中访问
# 开发模式：http://localhost:5173
# 或生产模式：npm run build && npm start，访问 http://localhost:3001
```

#### 方式二：本地文件传输（如果无法访问远程仓库）

1. 使用 ADB 或文件管理器将项目文件传输到 Termux
2. Termux 的主目录位于：`/data/data/com.termux/files/home/`
3. 然后按照方式一的步骤2-6执行

### Termux使用技巧

#### 分屏运行
```bash
# 在Termux中按 Ctrl + N 新建会话
# 或从左侧菜单选择 "New session"

# 会话1：运行后端
cd ~/edge-tts-tool
node server/index.js

# 会话2：运行前端
cd ~/edge-tts-tool
npm run dev
```

#### 后台运行
```bash
# 使用 tmux 或 nohup 保持服务后台运行
pkg install tmux -y

# 创建tmux会话
tmux new -s tts

# 在tmux会话中启动服务
cd ~/edge-tts-tool
npm start

# 按 Ctrl + B 然后按 D 分离会话

# 重新连接
tmux attach -t tts
```

#### 访问局域网其他设备
```bash
# 查看Termux的IP地址
ip addr show | grep inet

# 修改 server/index.js 监听 0.0.0.0
# 然后从局域网其他设备访问 http://你的手机IP:3001
```

## 常见问题

### Q: 提示 "fatal: remote origin already exists"
A: 先删除旧的远程仓库再添加
```bash
git remote remove origin
git remote add origin <你的仓库地址>
```

### Q: 推送时提示 "Authentication failed"
A: 
- GitHub：使用 Personal Access Token 替代密码
- Gitee/GitLab：可能需要设置账户信息
```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱"
```

### Q: Termux中下载依赖很慢
A: 配置国内镜像源
```bash
# npm配置淘宝源
npm config set registry https://registry.npmmirror.com
```

### Q: 如何将项目分享给其他人？
A: 将仓库设为 Public，然后分享仓库链接，其他人可以：
```bash
git clone <你的仓库地址>
cd edge-tts-tool
npm install
cd server && npm install && cd ..
npm start
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
- 及时备份代码到远程Git仓库

## License

MIT License

## 贡献

欢迎提交Issue和Pull Request！
