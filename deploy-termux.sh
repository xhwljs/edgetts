#!/bin/bash

echo "========================================="
echo "Edge TTS 工具 - Termux 部署脚本"
echo "========================================="
echo ""

echo "步骤1: 更新包列表..."
pkg update && pkg upgrade -y

echo ""
echo "步骤2: 安装Node.js和Git..."
pkg install nodejs git -y

echo ""
echo "步骤3: 初始化Git仓库（如果尚未初始化）..."
if [ ! -d ".git" ]; then
    git init
    echo "Git仓库已初始化"
else
    echo "Git仓库已存在，跳过初始化"
fi

echo ""
echo "步骤4: 安装后端依赖..."
cd server
npm install
cd ..

echo ""
echo "步骤5: 安装前端依赖..."
npm install

echo ""
echo "========================================="
echo "部署完成！"
echo "========================================="
echo ""
echo "启动服务："
echo "1. 启动后端服务（终端1）："
echo "   node server/index.js"
echo ""
echo "2. 启动前端开发服务器（终端2）："
echo "   npm run dev"
echo ""
echo "3. 在浏览器中访问："
echo "   http://localhost:5173"
echo ""
echo "生产环境部署："
echo "1. npm run build"
echo "2. node server/index.js"
echo "3. 访问 http://localhost:3001"
echo ""
