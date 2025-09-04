import sys
# import io
# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import json
import os
import jmcomic

def download_comic(comic_id, download_path=None, config_file=None):
    """
    下载JM漫画
    """
    try:
        # 获取脚本所在目录的绝对路径
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 如果传入了下载路径，使用传入的路径；否则使用脚本目录下的downloads
        if download_path is None:
            download_path = os.path.join(script_dir, "downloads")
        
        # 配置文件路径始终使用脚本同级目录
        if config_file is None:
            config_file = os.path.join(script_dir, "download_jm_config.yml")
        
        # 检查配置文件是否存在
        if not os.path.exists(config_file):
            return {
                "success": False,
                "comic_id": comic_id,
                "error": f"配置文件不存在: {config_file}",
                "message": "下载失败"
            }
        
        # # 确保下载目录存在
        # Path(download_path).mkdir(parents=True, exist_ok=True)
        
        # 配置下载选项
        option = jmcomic.create_option_by_file(config_file)
        
        # 开始下载
        jmcomic.download_album(comic_id, option)
        
        result = {
            "success": True,
            "comic_id": comic_id,
            "message": "Successfully downloaded !"
        }
        
        return result
        
    except Exception as e:
        result = {
            "success": False,
            "comic_id": comic_id,
            "error": str(e),
            "message": "下载失败"
        }
        return result

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "message": "缺少漫画ID参数"}, ensure_ascii=False))
        sys.exit(1)
    
    comic_id = sys.argv[1]
    # 使用传入的下载路径，如果没有则为None（会使用默认路径）
    download_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    result = download_comic(comic_id, download_path)
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
