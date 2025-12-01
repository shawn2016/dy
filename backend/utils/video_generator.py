"""
视频生成工具模块
使用 moviepy 从图片和标题配置生成3秒抖音风格封面视频
"""
import os
from PIL import Image

def generate_video_from_image(image_path, title_config, output_path, duration=3):
    """
    从图片和标题配置生成3秒视频
    
    Args:
        image_path: 图片路径
        title_config: 标题配置字典
            {
                'text': '标题文本',
                'font': '字体名称',
                'font_size': 24,
                'color': '#FFFFFF',
                'position_x': 0,
                'position_y': 0,
                'bold': False,
                'italic': False
            }
        output_path: 输出视频路径
        duration: 视频时长（秒），默认3秒
    
    Returns:
        bool: 是否成功
    """
    try:
        try:
            from moviepy.editor import ImageClip, TextClip, CompositeVideoClip
        except ImportError:
            print('警告: moviepy未安装，视频生成功能不可用')
            return False
        
        # 打开图片获取尺寸
        img = Image.open(image_path)
        img_width, img_height = img.size
        
        # 创建图片视频（3秒）
        video = ImageClip(image_path, duration=duration)
        
        # 如果有标题，添加文字
        if title_config and title_config.get('text'):
            # 构建字体参数
            font_name = title_config.get('font', 'Arial')
            if title_config.get('bold'):
                font_name = f'{font_name}-Bold'
            
            # 创建文字clip
            txt_clip = TextClip(
                title_config['text'],
                fontsize=title_config.get('font_size', 24),
                color=title_config.get('color', '#FFFFFF'),
                font=font_name,
                method='caption',
                size=(img_width - 40, None),
                align='center'
            ).set_position((
                title_config.get('position_x', img_width // 2),
                title_config.get('position_y', img_height // 2)
            )).set_duration(duration)
            
            # 合成视频
            video = CompositeVideoClip([video, txt_clip])
        
        # 输出视频
        video.write_videofile(
            output_path,
            fps=24,
            codec='libx264',
            audio=False,
            preset='medium',
            threads=4,
            logger=None  # 禁用日志输出
        )
        
        return True
    except Exception as e:
        print(f'视频生成错误: {e}')
        import traceback
        traceback.print_exc()
        return False

