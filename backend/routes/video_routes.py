"""
视频路由
"""
from flask import request, jsonify
from . import video_bp
from ..services import VideoService
from ..middleware import auth_required


@video_bp.route('', methods=['GET'])
@auth_required
def get_videos():
    """获取所有视频"""
    try:
        videos = VideoService.get_videos()
        return jsonify({
            'code': 200,
            'message': 'success',
            'data': videos
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': []
        }), 500


@video_bp.route('/<int:video_id>', methods=['GET'])
@auth_required
def get_video(video_id):
    """获取单个视频"""
    try:
        video = VideoService.get_video_by_id(video_id)
        return jsonify({
            'code': 200,
            'message': 'success',
            'data': video
        })
    except Exception as e:
        return jsonify({
            'code': 404,
            'message': str(e),
            'data': None
        }), 404


@video_bp.route('', methods=['POST'])
@auth_required
def create_video():
    """创建视频"""
    try:
        data = request.get_json()
        video = VideoService.create_video(data)
        
        return jsonify({
            'code': 200,
            'message': '创建成功',
            'data': video
        }), 201
    except ValueError as e:
        return jsonify({
            'code': 400,
            'message': str(e),
            'data': None
        }), 400
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


@video_bp.route('/<int:video_id>', methods=['PUT'])
@auth_required
def update_video(video_id):
    """更新视频"""
    try:
        data = request.get_json()
        video = VideoService.update_video(video_id, data)
        
        return jsonify({
            'code': 200,
            'message': '更新成功',
            'data': video
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


@video_bp.route('/<int:video_id>', methods=['DELETE'])
@auth_required
def delete_video(video_id):
    """删除视频"""
    try:
        VideoService.delete_video(video_id)
        return jsonify({
            'code': 200,
            'message': '删除成功',
            'data': None
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

