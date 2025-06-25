import sys
import json
import os
from pathlib import Path
import jmcomic

def find_downloaded_comic_dir(base_path, comic_id):
    """查找实际的下载目录"""
    base_dir = Path(base_path)
    if not base_dir.exists():
        return None
    
    # 查找包含漫画ID的目录
    for item in base_dir.iterdir():
        if item.is_dir() and comic_id in item.name:
            return str(item)
    
    return None

def download_comic(comic_id, download_path="./downloads", config_file="./download_jm_config.yml"):
    """
    下载JM漫画
    """
    try:
        # 确保下载目录存在
        Path(download_path).mkdir(parents=True, exist_ok=True)
        
        # 配置下载选项
        option = jmcomic.create_option_by_file(config_file)
        
        # 开始下载
        jmcomic.download_album(comic_id, option)
        
        # 获取下载的文件路径
        comic_dir = find_downloaded_comic_dir(download_path, comic_id)

        if not comic_dir:
            # 下载可能失败了
            return {"success": False, "message": "未找到下载的文件"}

        # 检查目录是否有内容
        if not any(Path(comic_dir).iterdir()):
            return {"success": False, "message": "下载目录为空"}
        
        result = {
            "success": True,
            "comic_id": comic_id,
            "download_path": comic_dir,
            "message": "下载成功"
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
        print(json.dumps({"success": False, "message": "缺少漫画ID参数"}))
        sys.exit(1)
    
    comic_id = sys.argv[1]
    download_path = sys.argv[2] if len(sys.argv) > 2 else "./downloads"
    
    result = download_comic(comic_id, download_path)
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
