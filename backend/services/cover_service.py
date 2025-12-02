"""
封面服务
"""
from datetime import datetime
from models import Cover
from config.database import db


class CoverService:
    """封面服务类"""
    
    @staticmethod
    def get_covers(name=None, start_time=None, end_time=None, status=None, page=1, page_size=10):
        """获取封面列表（支持分页和查询）"""
        query = Cover.query
        
        # 名称模糊查询
        if name:
            query = query.filter(Cover.name.like(f'%{name}%'))
        
        # 时间范围查询
        if start_time:
            try:
                start_date = datetime.strptime(start_time, '%Y-%m-%d')
                query = query.filter(Cover.created_at >= start_date)
            except:
                pass
        
        if end_time:
            try:
                end_date = datetime.strptime(end_time, '%Y-%m-%d')
                end_date = end_date.replace(hour=23, minute=59, second=59)
                query = query.filter(Cover.created_at <= end_date)
            except:
                pass
        
        # 状态查询
        if status is not None:
            query = query.filter(Cover.status == status)
        
        # 排序和分页
        query = query.order_by(Cover.created_at.desc())
        pagination = query.paginate(page=page, per_page=page_size, error_out=False)
        
        return {
            'list': [cover.to_dict() for cover in pagination.items],
            'total': pagination.total,
            'page': page,
            'page_size': page_size,
            'total_pages': pagination.pages
        }
    
    @staticmethod
    def get_cover_by_id(cover_id):
        """根据ID获取封面"""
        cover = Cover.query.get_or_404(cover_id)
        return cover.to_dict()
    
    @staticmethod
    def create_cover(data):
        """创建封面"""
        if not data.get('name'):
            raise ValueError('封面名称不能为空')
        
        if not data.get('cropped_image_path'):
            raise ValueError('裁剪后图片路径不能为空')
        
        cover = Cover(
            name=data.get('name'),
            original_image_path=data.get('original_image_path'),
            cropped_image_path=data.get('cropped_image_path'),
            video_path=data.get('video_path'),
            title_text=data.get('title_text'),
            title_font=data.get('title_font', 'Arial'),
            title_font_size=data.get('title_font_size', 24),
            title_color=data.get('title_color', '#FFFFFF'),
            title_position_x=data.get('title_position_x', 0),
            title_position_y=data.get('title_position_y', 0),
            title_bold=data.get('title_bold', False),
            title_italic=data.get('title_italic', False),
            status=data.get('status', 1),
            description=data.get('description', '')
        )
        
        db.session.add(cover)
        db.session.commit()
        
        return cover.to_dict()
    
    @staticmethod
    def update_cover(cover_id, data):
        """更新封面"""
        cover = Cover.query.get_or_404(cover_id)
        
        if data.get('name'):
            cover.name = data.get('name')
        if 'original_image_path' in data:
            cover.original_image_path = data.get('original_image_path')
        if data.get('cropped_image_path'):
            cover.cropped_image_path = data.get('cropped_image_path')
        if 'video_path' in data:
            cover.video_path = data.get('video_path')
        if 'title_text' in data:
            cover.title_text = data.get('title_text')
        if 'title_font' in data:
            cover.title_font = data.get('title_font')
        if 'title_font_size' in data:
            cover.title_font_size = data.get('title_font_size')
        if 'title_color' in data:
            cover.title_color = data.get('title_color')
        if 'title_position_x' in data:
            cover.title_position_x = data.get('title_position_x')
        if 'title_position_y' in data:
            cover.title_position_y = data.get('title_position_y')
        if 'title_bold' in data:
            cover.title_bold = data.get('title_bold')
        if 'title_italic' in data:
            cover.title_italic = data.get('title_italic')
        if 'status' in data:
            cover.status = data.get('status')
        if 'description' in data:
            cover.description = data.get('description')
        
        cover.updated_at = datetime.utcnow()
        db.session.commit()
        
        return cover.to_dict()
    
    @staticmethod
    def delete_cover(cover_id):
        """删除封面"""
        cover = Cover.query.get_or_404(cover_id)
        db.session.delete(cover)
        db.session.commit()
        return True

