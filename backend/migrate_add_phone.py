#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库迁移脚本：添加phone字段
"""
import os
import sys
import pymysql

# 数据库配置（与app.py保持一致）
MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
MYSQL_PORT = int(os.environ.get('MYSQL_PORT', '3306'))
MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'video_cover_db')

def migrate():
    """添加phone字段到users表"""
    try:
        connection = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD if MYSQL_PASSWORD else None,
            database=MYSQL_DATABASE,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            # 检查phone字段是否存在
            cursor.execute("SHOW COLUMNS FROM users LIKE 'phone'")
            result = cursor.fetchone()
            
            if not result:
                print('正在添加phone字段...')
                cursor.execute('ALTER TABLE users ADD COLUMN phone VARCHAR(20)')
                connection.commit()
                print('✓ phone字段添加成功')
            else:
                print('✓ phone字段已存在')
        
        connection.close()
        return True
    except Exception as e:
        print(f'✗ 错误: {e}')
        return False

if __name__ == '__main__':
    print("=" * 50)
    print("数据库迁移：添加phone字段")
    print("=" * 50)
    if migrate():
        print("迁移完成！")
        sys.exit(0)
    else:
        print("迁移失败！")
        sys.exit(1)


