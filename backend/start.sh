#!/bin/bash

echo "=========================================="
echo "启动后端服务"
echo "=========================================="

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate

# 检查依赖
if ! python -c "import flask" 2>/dev/null; then
    echo "安装依赖..."
    pip install -r requirements.txt
fi

# 设置环境变量（如果 MySQL 有密码）
if [ -z "$MYSQL_PASSWORD" ]; then
    echo "提示: MySQL 无密码连接"
else
    export MYSQL_PASSWORD
    echo "已设置 MYSQL_PASSWORD 环境变量"
fi

# 启动服务
echo ""
echo "启动后端服务..."
echo "服务地址: http://localhost:5000"
echo "按 Ctrl+C 停止服务"
echo ""

python app.py

