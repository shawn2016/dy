#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
初始化用户脚本
用于创建或更新管理员用户
"""
import os
import sys
from werkzeug.security import generate_password_hash

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import pymysql
except ImportError:
    print("错误: 请先安装 pymysql: pip install pymysql")
    sys.exit(1)

# 数据库配置
MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
MYSQL_PORT = int(os.environ.get('MYSQL_PORT', '3306'))
MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'video_cover_db')

def init_user():
    """初始化管理员用户"""
    try:
        # 如果密码为空，尝试无密码连接
        print(f"正在连接数据库: {MYSQL_USER}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}")
        
        # 连接数据库
        connection = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD if MYSQL_PASSWORD else None,
            database=MYSQL_DATABASE,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        print(f"✓ 成功连接到数据库: {MYSQL_DATABASE}")
        
        with connection.cursor() as cursor:
            # 检查用户是否存在
            cursor.execute("SELECT * FROM users WHERE username = %s", ('admin',))
            user = cursor.fetchone()
            
            # 生成密码哈希
            password_hash = generate_password_hash('123456')
            
            if user:
                # 更新现有用户密码
                cursor.execute(
                    "UPDATE users SET password_hash = %s, updated_at = NOW() WHERE username = %s",
                    (password_hash, 'admin')
                )
                print("✓ 管理员用户密码已更新: admin / 123456")
            else:
                # 创建新用户
                cursor.execute(
                    """INSERT INTO users (username, password_hash, email, created_at, updated_at) 
                       VALUES (%s, %s, %s, NOW(), NOW())""",
                    ('admin', password_hash, 'admin@example.com')
                )
                print("✓ 管理员用户已创建: admin / 123456")
            
            connection.commit()
            print("✓ 操作完成！")
            
    except pymysql.Error as e:
        print(f"✗ 数据库错误: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"✗ 发生错误: {e}")
        sys.exit(1)
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == '__main__':
    print("=" * 50)
    print("初始化管理员用户")
    print("=" * 50)
    init_user()

