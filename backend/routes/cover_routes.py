"""
封面路由
"""
from flask import request, jsonify, send_file
import os
import uuid
import sys
from werkzeug.utils import secure_filename
from routes import cover_bp
from services import CoverService
from middleware import auth_required
from models import Cover


@cover_bp.route('/covers', methods=['GET'])
@auth_required
def get_covers():
    """获取封面列表"""
    try:
        name = request.args.get('name', '').strip()
        start_time = request.args.get('start_time', '').strip()
        end_time = request.args.get('end_time', '').strip()
        status = request.args.get('status', type=int)
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        
        result = CoverService.get_covers(name, start_time, end_time, status, page, page_size)
        
        return jsonify({
            'code': 200,
            'message': 'success',
            'data': result
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': {
                'list': [],
                'total': 0,
                'page': 1,
                'page_size': 10,
                'total_pages': 0
            }
        }), 500


@cover_bp.route('/covers/<int:cover_id>', methods=['GET'])
@auth_required
def get_cover(cover_id):
    """获取单个封面"""
    try:
        cover = CoverService.get_cover_by_id(cover_id)
        return jsonify({
            'code': 200,
            'message': 'success',
            'data': cover
        })
    except Exception as e:
        return jsonify({
            'code': 404,
            'message': str(e),
            'data': None
        }), 404


@cover_bp.route('/covers', methods=['POST'])
@auth_required
def create_cover():
    """创建封面"""
    try:
        data = request.get_json()
        cover = CoverService.create_cover(data)
        
        return jsonify({
            'code': 200,
            'message': '创建成功',
            'data': cover
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


@cover_bp.route('/covers/<int:cover_id>', methods=['PUT'])
@auth_required
def update_cover(cover_id):
    """更新封面"""
    try:
        data = request.get_json()
        cover = CoverService.update_cover(cover_id, data)
        
        return jsonify({
            'code': 200,
            'message': '更新成功',
            'data': cover
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


@cover_bp.route('/covers/<int:cover_id>', methods=['DELETE'])
@auth_required
def delete_cover(cover_id):
    """删除封面"""
    try:
        CoverService.delete_cover(cover_id)
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


@cover_bp.route('/covers/upload', methods=['POST'])
@auth_required
def upload_cover_image():
    """上传封面图片"""
    try:
        if 'cover' not in request.files:
            return jsonify({
                'code': 400,
                'message': '请选择封面图片',
                'data': None
            }), 400
        
        file = request.files['cover']
        if file.filename == '':
            return jsonify({
                'code': 400,
                'message': '请选择封面图片',
                'data': None
            }), 400
        
        # 创建目录结构
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        cover_dir = os.path.join(base_dir, '..', 'data', 'covers')
        os.makedirs(cover_dir, exist_ok=True)
        
        # 生成文件名
        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
        new_filename = f'{uuid.uuid4().hex}.{ext}'
        filepath = os.path.join(cover_dir, new_filename)
        
        # 保存文件
        file.save(filepath)
        
        # 返回图片URL（相对路径）
        image_url = f'/data/covers/{new_filename}'
        
        return jsonify({
            'code': 200,
            'message': '上传成功',
            'data': {
                'image_url': image_url
            }
        })
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


@cover_bp.route('/generate/video', methods=['POST'])
@auth_required
def generate_video():
    """生成视频接口"""
    try:
        data = request.get_json()
        cropped_image_path = data.get('cropped_image_path')
        title_config = data.get('title_config', {})
        
        if not cropped_image_path:
            return jsonify({
                'code': 400,
                'message': '裁剪后图片路径不能为空',
                'data': None
            }), 400
        
        # 构建完整路径
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        image_full_path = os.path.join(base_dir, '..', cropped_image_path.lstrip('/'))
        
        if not os.path.exists(image_full_path):
            return jsonify({
                'code': 404,
                'message': '图片文件不存在',
                'data': None
            }), 404
        
        # 生成视频文件名
        video_filename = f'{uuid.uuid4().hex}.mp4'
        video_dir = os.path.join(base_dir, '..', 'data', 'videos')
        os.makedirs(video_dir, exist_ok=True)
        video_full_path = os.path.join(video_dir, video_filename)
        
        # 导入视频生成函数
        from utils.video_generator import generate_video_from_image
        
        # 生成视频
        success = generate_video_from_image(
            image_full_path,
            title_config,
            video_full_path,
            duration=3
        )
        
        if not success:
            return jsonify({
                'code': 500,
                'message': '视频生成失败',
                'data': None
            }), 500
        
        # 返回视频路径
        video_path = f'/data/videos/{video_filename}'
        
        return jsonify({
            'code': 200,
            'message': '视频生成成功',
            'data': {
                'video_path': video_path
            }
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500


@cover_bp.route('/covers/<int:cover_id>/video', methods=['GET'])
@auth_required
def get_cover_video(cover_id):
    """获取封面视频文件流"""
    try:
        cover = Cover.query.get_or_404(cover_id)
        
        if not cover.video_path:
            return jsonify({
                'code': 404,
                'message': '视频不存在',
                'data': None
            }), 404
        
        # 构建完整路径
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        video_full_path = os.path.join(base_dir, '..', cover.video_path.lstrip('/'))
        
        if not os.path.exists(video_full_path):
            return jsonify({
                'code': 404,
                'message': '视频文件不存在',
                'data': None
            }), 404
        
        return send_file(video_full_path, mimetype='video/mp4')
    except Exception as e:
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500

