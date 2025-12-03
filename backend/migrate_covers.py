#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
封面表迁移脚本
添加标题编辑和视频相关字段
"""
import os
import sys

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
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '123456')
MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'video_cover_db')

def migrate():
    """执行数据库迁移"""
    try:
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
            # 检查表是否存在
            cursor.execute("SHOW TABLES LIKE 'covers'")
            if not cursor.fetchone():
                print("❌ covers 表不存在，请先启动后端创建表结构")
                return False
            
            print("✓ covers 表存在，开始迁移...")
            
            # 检查并添加字段
            migrations = [
                ("original_image_path", "VARCHAR(255)"),
                ("cropped_image_path", "VARCHAR(255)"),
                ("video_path", "VARCHAR(255)"),
                ("title_text", "VARCHAR(30)"),
                ("title_font", "VARCHAR(20) DEFAULT 'Arial'"),
                ("title_font_size", "INT DEFAULT 24"),
                ("title_color", "VARCHAR(20) DEFAULT '#FFFFFF'"),
                ("title_position_x", "INT DEFAULT 0"),
                ("title_position_y", "INT DEFAULT 0"),
                ("title_bold", "BOOLEAN DEFAULT FALSE"),
                ("title_italic", "BOOLEAN DEFAULT FALSE"),
                ("status", "INT DEFAULT 1"),
            ]
            
            # 获取现有字段
            cursor.execute("DESCRIBE covers")
            existing_columns = [row['Field'] for row in cursor.fetchall()]
            
            for column_name, column_def in migrations:
                if column_name not in existing_columns:
                    try:
                        sql = f"ALTER TABLE covers ADD COLUMN {column_name} {column_def}"
                        print(f"  添加字段: {column_name}...")
                        cursor.execute(sql)
                        print(f"  ✓ {column_name} 添加成功")
                    except Exception as e:
                        print(f"  ⚠ {column_name} 添加失败: {e}")
                else:
                    print(f"  - {column_name} 已存在，跳过")
            
            # 如果 cropped_image_path 不存在，但 image_url 存在，需要迁移数据
            if 'cropped_image_path' not in existing_columns and 'image_url' in existing_columns:
                try:
                    print("  迁移 image_url 数据到 cropped_image_path...")
                    cursor.execute("UPDATE covers SET cropped_image_path = image_url WHERE cropped_image_path IS NULL AND image_url IS NOT NULL")
                    connection.commit()
                    print("  ✓ 数据迁移成功")
                except Exception as e:
                    print(f"  ⚠ 数据迁移失败: {e}")
            
            connection.commit()
            print("\n✅ 迁移完成！")
            return True
            
    except pymysql.Error as e:
        print(f"❌ 数据库错误: {e}")
        return False
    except Exception as e:
        print(f"❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == '__main__':
    print("=" * 50)
    print("封面表迁移脚本")
    print("=" * 50)
    print()
    
    success = migrate()
    
    if success:
        print("\n✅ 迁移成功完成！")
        sys.exit(0)
    else:
        print("\n❌ 迁移失败，请检查错误信息")
        sys.exit(1)


