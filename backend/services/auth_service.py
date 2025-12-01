"""
认证服务
"""
from flask_jwt_extended import create_access_token
from ..models import User
from ..config.database import db


class AuthService:
    """认证服务类"""
    
    @staticmethod
    def login(username, password):
        """用户登录"""
        if not username or not password:
            raise ValueError('用户名和密码不能为空')
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            raise ValueError('用户名或密码错误')
        
        # 生成token（identity必须是字符串类型）
        access_token = create_access_token(identity=str(user.id))
        
        return {
            'token': access_token,
            'user': user.to_dict()
        }
    
    @staticmethod
    def get_user_by_id(user_id):
        """根据ID获取用户"""
        user = User.query.get(int(user_id))
        if not user:
            raise ValueError('用户不存在')
        return user.to_dict()
    
    @staticmethod
    def register(username, password, email=None, phone=None):
        """用户注册"""
        if not username or not password:
            raise ValueError('用户名和密码不能为空')
        
        # 检查用户名是否已存在
        if User.query.filter_by(username=username).first():
            raise ValueError('用户名已存在')
        
        user = User(username=username, email=email, phone=phone)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return user.to_dict()
    
    @staticmethod
    def change_password(user_id, old_password, new_password):
        """修改密码"""
        user = User.query.get(int(user_id))
        if not user:
            raise ValueError('用户不存在')
        
        if not user.check_password(old_password):
            raise ValueError('旧密码错误')
        
        user.set_password(new_password)
        db.session.commit()
        
        return True
    
    @staticmethod
    def update_avatar(user_id, avatar_path):
        """更新头像"""
        user = User.query.get(int(user_id))
        if not user:
            raise ValueError('用户不存在')
        
        user.avatar = avatar_path
        db.session.commit()
        
        return user.to_dict()

