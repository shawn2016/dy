#!/bin/bash

echo "=========================================="
echo "数据库初始化脚本"
echo "=========================================="

# 提示输入 MySQL root 密码
read -sp "请输入 MySQL root 密码（如果没有设置密码，直接按回车）: " MYSQL_PASS
echo ""

# 构建 MySQL 命令
if [ -z "$MYSQL_PASS" ]; then
    MYSQL_CMD="mysql -u root"
    echo "使用无密码连接..."
else
    MYSQL_CMD="mysql -u root -p$MYSQL_PASS"
    echo "使用密码连接..."
fi

# 先测试连接
echo "测试 MySQL 连接..."
if $MYSQL_CMD -e "SELECT 1" > /dev/null 2>&1; then
    echo "✅ MySQL 连接成功"
else
    echo "❌ MySQL 连接失败"
    echo ""
    echo "可能的原因："
    echo "1. 密码不正确"
    echo "2. MySQL 服务未运行"
    echo "3. 用户权限问题"
    echo ""
    echo "请尝试："
    echo "- 如果 MySQL 没有密码，直接按回车（不要输入任何内容）"
    echo "- 如果 MySQL 有密码，确保密码正确"
    echo "- 检查 MySQL 服务: brew services list | grep mysql"
    exit 1
fi

# 创建数据库
echo ""
echo "创建数据库 video_cover_db..."
if [ -z "$MYSQL_PASS" ]; then
    mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS video_cover_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES LIKE 'video_cover_db';
EOF
else
    mysql -u root -p"$MYSQL_PASS" <<EOF
CREATE DATABASE IF NOT EXISTS video_cover_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES LIKE 'video_cover_db';
EOF
fi

if [ $? -eq 0 ]; then
    echo "✅ 数据库创建成功！"
else
    echo "❌ 数据库创建失败，请检查 MySQL 连接和权限"
    exit 1
fi

# 初始化表结构（可选，后端会自动创建）
echo ""
read -p "是否现在初始化表结构？(y/n，后端启动时也会自动创建) [n]: " INIT_TABLES
if [ "$INIT_TABLES" = "y" ] || [ "$INIT_TABLES" = "Y" ]; then
    echo "初始化表结构..."
    $MYSQL_CMD video_cover_db < init_db.sql
    if [ $? -eq 0 ]; then
        echo "✅ 表结构初始化成功！"
    else
        echo "⚠️  表结构初始化失败，但后端启动时会自动创建"
    fi
fi

echo ""
echo "=========================================="
echo "数据库初始化完成！"
echo "=========================================="
echo ""
echo "接下来可以："
echo "1. 设置环境变量: export MYSQL_PASSWORD=your_password"
echo "2. 启动后端服务: python3 app.py"
echo ""

