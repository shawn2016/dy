"""
封面模型
"""
from datetime import datetime
from ..config.database import db


class Cover(db.Model):
    """封面模型"""
    __tablename__ = 'covers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    original_image_path = db.Column(db.String(255))
    cropped_image_path = db.Column(db.String(255), nullable=False)
    video_path = db.Column(db.String(255))
    title_text = db.Column(db.String(30))
    title_font = db.Column(db.String(20), default='Arial')
    title_font_size = db.Column(db.Integer, default=24)
    title_color = db.Column(db.String(20), default='#FFFFFF')
    title_position_x = db.Column(db.Integer, default=0)
    title_position_y = db.Column(db.Integer, default=0)
    title_bold = db.Column(db.Boolean, default=False)
    title_italic = db.Column(db.Boolean, default=False)
    status = db.Column(db.Integer, default=1)  # 0=禁用，1=启用
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'name': self.name,
            'original_image_path': self.original_image_path,
            'cropped_image_path': self.cropped_image_path,
            'video_path': self.video_path,
            'title_text': self.title_text,
            'title_font': self.title_font,
            'title_font_size': self.title_font_size,
            'title_color': self.title_color,
            'title_position_x': self.title_position_x,
            'title_position_y': self.title_position_y,
            'title_bold': self.title_bold,
            'title_italic': self.title_italic,
            'status': self.status,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            # 兼容旧字段
            'image_url': self.cropped_image_path
        }

