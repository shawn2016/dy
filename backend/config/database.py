"""
数据库配置和初始化
"""
from flask_sqlalchemy import SQLAlchemy
from . import Config

db = SQLAlchemy()

def init_db(app):
    """初始化数据库"""
    db.init_app(app)
    with app.app_context():
        # 导入所有模型，确保它们被注册
        from models import User, Cover, Video
        
        # 创建所有表
        db.create_all()
        
        # 初始化默认用户
        init_default_user()
        
        # 检查并添加phone字段（兼容旧数据库）
        check_and_add_phone_column()

def init_default_user():
    """初始化默认管理员用户"""
    from models import User
    
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(username='admin')
        admin.set_password('123456')
        db.session.add(admin)
        db.session.commit()
        print('✓ 默认管理员用户已创建: admin / 123456')

def check_and_add_phone_column():
    """检查并添加phone字段（兼容旧数据库）"""
    from sqlalchemy import inspect, text
    from models import User
    
    inspector = inspect(db.engine)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'phone' not in columns:
        try:
            db.session.execute(text('ALTER TABLE users ADD COLUMN phone VARCHAR(20)'))
            db.session.commit()
            print('✓ phone字段已添加')
        except Exception as e:
            print(f'⚠ phone字段添加失败: {e}')
            db.session.rollback()

