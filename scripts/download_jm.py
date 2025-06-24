import sys
import json
import os
from pathlib import Path
import jmcomic

def download_comic(comic_id, download_path="./downloads"):
    """
    下载JM漫画
    """
    try:
        # 确保下载目录存在
        Path(download_path).mkdir(parents=True, exist_ok=True)
        
        # 配置下载选项
        option = jmcomic.create_option(
            dir_rule={
                'rule': 'Bd_Pname',
                'base_dir': download_path,
            }
        )
        
        # 开始下载
        jmcomic.download_album(comic_id, option)
        
        # 获取下载的文件路径
        comic_dir = os.path.join(download_path, f"JM{comic_id}")
        
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
