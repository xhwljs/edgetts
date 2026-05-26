#!/bin/bash

# Edge TTS Termux 部署脚本 v2.0
# 更智能、更友好的部署体验

set -e  # 出错时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${PURPLE}=========================================${NC}"
    echo -e "${PURPLE}  Edge TTS 工具 - Termux 部署脚本 v2.0${NC}"
    echo -e "${PURPLE}=========================================${NC}"
    echo ""
}

# 检查是否在Termux环境中
check_termux() {
    if [ -d "/data/data/com.termux" ]; then
        print_success "检测到Termux环境"
        return 0
    else
        print_warning "非Termux环境，可能是在普通Linux上运行"
        read -p "是否继续？(y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 配置npm镜像源（可选）
config_npm_mirror() {
    echo ""
    print_info "npm镜像源配置"
    echo "  1) 官方源 (默认，国外可能慢)"
    echo "  2) 淘宝镜像 (国内推荐)"
    echo "  3) 保持当前配置"
    read -p "请选择 (1-3): " mirror_choice
    
    case $mirror_choice in
        1)
            npm config set registry https://registry.npmjs.org
            print_success "已设置为官方源"
            ;;
        2)
            npm config set registry https://registry.npmmirror.com
            print_success "已设置为淘宝镜像"
            ;;
        3)
            print_info "保持当前配置"
            ;;
        *)
            print_warning "无效选择，保持当前配置"
            ;;
    esac
}

# 更新系统包
update_system() {
    echo ""
    print_info "步骤 1/6: 更新系统包列表..."
    if pkg update -y && pkg upgrade -y; then
        print_success "系统包更新完成"
    else
        print_warning "系统包更新可能有警告，继续执行..."
    fi
}

# 安装依赖
install_dependencies() {
    echo ""
    print_info "步骤 2/6: 安装基础依赖 (Node.js, Git)..."
    
    local packages=("nodejs" "git")
    
    for pkg in "${packages[@]}"; do
        if ! command -v $pkg &> /dev/null; then
            print_info "正在安装 $pkg..."
            pkg install $pkg -y
        else
            print_success "$pkg 已安装"
        fi
    done
    
    print_success "基础依赖安装完成"
}

# 安装tmux（可选）
install_tmux() {
    echo ""
    read -p "是否安装 tmux 用于后台运行服务？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "正在安装 tmux..."
        pkg install tmux -y
        print_success "tmux 安装完成"
    fi
}

# 检查项目目录
check_project() {
    echo ""
    print_info "步骤 3/6: 检查项目目录..."
    
    if [ ! -f "package.json" ]; then
        print_error "未找到 package.json，请确保在项目根目录中运行此脚本"
        print_info "当前目录: $(pwd)"
        exit 1
    fi
    
    print_success "项目目录验证通过"
}

# 安装npm依赖
install_npm_deps() {
    echo ""
    print_info "步骤 4/6: 安装后端依赖..."
    if [ -d "server" ]; then
        cd server
        npm install
        cd ..
        print_success "后端依赖安装完成"
    else
        print_error "server目录不存在"
        exit 1
    fi
    
    echo ""
    print_info "步骤 5/6: 安装前端依赖..."
    npm install
    print_success "前端依赖安装完成"
}

# 初始化Git（可选）
init_git() {
    echo ""
    print_info "步骤 6/6: Git仓库检查..."
    
    if [ ! -d ".git" ]; then
        read -p "Git仓库未初始化，是否初始化？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git init
            git config user.name "Termux User"
            git config user.email "termux@localhost"
            git add .
            git commit -m "feat: 初始化Edge TTS项目"
            print_success "Git仓库初始化完成"
            
            echo ""
            print_info "提示：要推送到远程仓库，请运行："
            echo "  git remote add origin <你的仓库地址>"
            echo "  git push -u origin main"
        fi
    else
        print_success "Git仓库已存在"
    fi
}

# 显示完成信息
show_completion() {
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}  🎉 部署完成！${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo -e "${CYAN}启动方式：${NC}"
    echo ""
    echo -e "📱 ${YELLOW}开发模式：${NC}"
    echo "  终端1: node server/index.js"
    echo "  终端2: npm run dev"
    echo "  访问: http://localhost:5173"
    echo ""
    echo -e "🚀 ${YELLOW}生产模式（推荐）：${NC}"
    echo "  npm run build"
    echo "  npm start"
    echo "  访问: http://localhost:3001"
    echo ""
    echo -e "🔧 ${YELLOW}使用 tmux 后台运行：${NC}"
    echo "  tmux new -s tts"
    echo "  npm start"
    echo "  (按 Ctrl+B 然后按 D 分离)"
    echo ""
    echo -e "${PURPLE}📖 更多帮助请查看：${NC}"
    echo "  - README.md (完整文档)"
    echo "  - TERMUX_QUICKSTART.md (Termux快速指南)"
    echo ""
}

# 主函数
main() {
    print_header
    check_termux
    
    echo ""
    print_info "即将开始部署，这可能需要几分钟时间..."
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "已取消部署"
        exit 0
    fi
    
    config_npm_mirror
    update_system
    install_dependencies
    install_tmux
    check_project
    install_npm_deps
    init_git
    show_completion
}

# 运行主函数
main "$@"
