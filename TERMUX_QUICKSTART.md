# 📱 Termux 快速部署指南

## 🚀 3分钟快速上手

### 第一步：准备（仅需一次）

```bash
# 1. 安装Termux（从F-Droid下载）
# 访问: https://f-droid.org/packages/com.termux/

# 2. 打开Termux，执行
pkg update && pkg upgrade -y
pkg install git nodejs -y
```

### 第二步：获取项目

#### 方式A：从远程仓库克隆（推荐）

```bash
# 先在GitHub/Gitee创建仓库，然后：
git clone https://github.com/你的用户名/edge-tts-tool.git
cd edge-tts-tool
```

#### 方式B：本地已有项目

直接在项目目录下操作即可。

### 第三步：部署运行

```bash
# 运行自动部署脚本
chmod +x deploy-termux.sh
bash deploy-termux.sh

# 或手动安装
npm install
cd server && npm install && cd ..
```

### 第四步：启动服务

```bash
# =====================
# 终端1：运行后端
# =====================
cd ~/edge-tts-tool
node server/index.js

# =====================
# 终端2：运行前端
# =====================
# 按 Ctrl + N 新建会话，或从左侧菜单新建
cd ~/edge-tts-tool
npm run dev
```

### 第五步：打开使用

在Termux浏览器或手机浏览器中访问：
- 开发模式：http://localhost:5173
- 生产模式：http://localhost:3001

---

## 📖 完整Git操作流程

### 创建你的远程仓库

#### GitHub
1. 打开 https://github.com/new
2. 仓库名：`edge-tts-tool`
3. **不要**勾选 "Initialize this repository with..."
4. 点击 "Create repository"
5. 复制你的仓库地址，类似：
   ```
   https://github.com/你的名字/edge-tts-tool.git
   ```

#### Gitee（码云，国内更快）
1. 打开 https://gitee.com/projects/new
2. 仓库名：`edge-tts-tool`
3. **不要**初始化
4. 点击 "创建"
5. 复制地址

### 关联并推送

```bash
# 在你的项目目录下执行
cd /path/to/edge-tts-tool

# 添加远程仓库（替换为你的地址）
git remote add origin https://github.com/你的用户名/edge-tts-tool.git

# 查看远程仓库
git remote -v

# 推送代码
git push -u origin main

# 后续更新
git add .
git commit -m "你的修改描述"
git push
```

---

## 🎯 生产模式部署（推荐）

```bash
# 1. 构建前端
npm run build

# 2. 仅需一个终端运行
cd ~/edge-tts-tool
npm start

# 3. 访问 http://localhost:3001
```

---

## 💡 Termux高级技巧

### 后台运行（使用tmux）

```bash
# 安装tmux
pkg install tmux -y

# 新建会话
tmux new -s tts

# 在tmux中运行
cd ~/edge-tts-tool
npm start

# 按 Ctrl+B，然后按 D 分离（保持后台运行）

# 重新连接
tmux attach -t tts

# 查看所有会话
tmux ls

# 关闭会话
tmux kill-session -t tts
```

### 局域网访问（让电脑也能访问）

```bash
# 1. 修改 server/index.js，将
app.listen(PORT);
# 改为
app.listen(PORT, '0.0.0.0');

# 2. 查看手机IP
ip addr show | grep inet

# 3. 在电脑浏览器访问
# http://手机IP:3001
```

### npm国内镜像（下载更快）

```bash
npm config set registry https://registry.npmmirror.com
```

---

## 🆘 常见问题速查

| 问题 | 解决方法 |
|------|----------|
| `remote origin already exists` | `git remote remove origin` 再重新添加 |
| `Authentication failed` | 使用Personal Access Token，或检查用户名/邮箱配置 |
| 依赖下载慢 | 配置淘宝npm镜像 |
| 端口被占用 | 结束占用进程或修改端口 |
| 无法访问localhost | 检查服务是否正常启动 |

---

## 📋 快速命令速查

```bash
# Git相关
git status                          # 查看状态
git add .                           # 添加所有修改
git commit -m "描述"                 # 提交
git push                            # 推送
git pull                            # 拉取更新
git clone <地址>                    # 克隆仓库

# 项目相关
npm install                         # 安装依赖
npm run dev                         # 开发模式
npm run build                       # 构建
npm start                           # 生产模式
node server/index.js                # 仅启动后端

# Termux相关
pkg install <包名>                  # 安装软件
pkg update && pkg upgrade -y        # 更新系统
```

---

## 🎉 恭喜！

现在你已经拥有了一个完整的Edge TTS音频制作工具，可以随时随地在手机上使用了！

有问题？查看 [README.md](README.md) 获取更详细的文档。
