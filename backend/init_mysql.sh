#!/bin/bash

# MySQL 数据库初始化脚本
# 使用方法: ./init_mysql.sh [root_password]

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}开始初始化 MySQL 数据库...${NC}"

# 检查 MySQL 是否运行
if ! brew services list | grep -q "mysql.*started"; then
    echo -e "${YELLOW}MySQL 服务未运行，正在启动...${NC}"
    brew services start mysql
    sleep 3
fi

# 获取 root 密码
if [ -z "$1" ]; then
    echo -e "${YELLOW}请输入 MySQL root 密码（如果未设置密码，直接按回车）:${NC}"
    read -s MYSQL_PASSWORD
else
    MYSQL_PASSWORD=$1
fi

# 数据库配置
DB_NAME="video_cover_db"
DB_USER="root"

# 尝试连接 MySQL
if [ -z "$MYSQL_PASSWORD" ]; then
    MYSQL_CMD="mysql -u $DB_USER"
else
    MYSQL_CMD="mysql -u $DB_USER -p$MYSQL_PASSWORD"
fi

# 检查连接
if ! $MYSQL_CMD -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}无法连接到 MySQL，请检查：${NC}"
    echo "1. MySQL 服务是否运行: brew services list | grep mysql"
    echo "2. root 密码是否正确"
    echo "3. 如果未设置密码，尝试: mysql -u root"
    exit 1
fi

echo -e "${GREEN}MySQL 连接成功！${NC}"

# 创建数据库
echo -e "${YELLOW}创建数据库 $DB_NAME...${NC}"
$MYSQL_CMD <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE $DB_NAME;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}数据库创建成功！${NC}"
else
    echo -e "${RED}数据库创建失败！${NC}"
    exit 1
fi

# 执行初始化 SQL
if [ -f "init_db.sql" ]; then
    echo -e "${YELLOW}执行初始化 SQL...${NC}"
    if [ -z "$MYSQL_PASSWORD" ]; then
        mysql -u $DB_USER $DB_NAME < init_db.sql
    else
        mysql -u $DB_USER -p$MYSQL_PASSWORD $DB_NAME < init_db.sql
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}SQL 初始化成功！${NC}"
    else
        echo -e "${YELLOW}SQL 初始化完成（可能表已存在）${NC}"
    fi
fi

# 验证数据库
echo -e "${YELLOW}验证数据库...${NC}"
TABLE_COUNT=$($MYSQL_CMD $DB_NAME -e "SHOW TABLES;" 2>/dev/null | wc -l | tr -d ' ')

if [ "$TABLE_COUNT" -gt "1" ]; then
    echo -e "${GREEN}数据库初始化完成！找到 $((TABLE_COUNT-1)) 个表${NC}"
else
    echo -e "${YELLOW}数据库已创建，但表结构将由后端自动创建${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}数据库初始化完成！${NC}"
echo -e "${GREEN}数据库名: $DB_NAME${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "下一步："
echo "1. 配置后端数据库连接（设置环境变量或修改 app.py）"
echo "2. 启动后端: cd backend && python app.py"
echo "3. 后端会自动创建表结构和默认管理员账户"

