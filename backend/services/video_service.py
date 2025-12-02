"""
视频服务
"""
from models import Video
from config.database import db


class VideoService:
    """视频服务类"""
    
    @staticmethod
    def get_videos():
        """获取所有视频"""
        videos = Video.query.order_by(Video.created_at.desc()).all()
        return [video.to_dict() for video in videos]
    
    @staticmethod
    def get_video_by_id(video_id):
        """根据ID获取视频"""
        video = Video.query.get_or_404(video_id)
        return video.to_dict()
    
    @staticmethod
    def create_video(data):
        """创建视频"""
        if not data.get('name'):
            raise ValueError('视频名称不能为空')
        
        if not data.get('video_url'):
            raise ValueError('视频URL不能为空')
        
        video = Video(
            name=data.get('name'),
            video_url=data.get('video_url'),
            thumbnail_url=data.get('thumbnail_url'),
            duration=data.get('duration', 0),
            description=data.get('description', '')
        )
        
        db.session.add(video)
        db.session.commit()
        
        return video.to_dict()
    
    @staticmethod
    def update_video(video_id, data):
        """更新视频"""
        video = Video.query.get_or_404(video_id)
        
        if data.get('name'):
            video.name = data.get('name')
        if data.get('video_url'):
            video.video_url = data.get('video_url')
        if 'thumbnail_url' in data:
            video.thumbnail_url = data.get('thumbnail_url')
        if 'duration' in data:
            video.duration = data.get('duration')
        if 'description' in data:
            video.description = data.get('description')
        
        db.session.commit()
        
        return video.to_dict()
    
    @staticmethod
    def delete_video(video_id):
        """删除视频"""
        video = Video.query.get_or_404(video_id)
        db.session.delete(video)
        db.session.commit()
        return True

