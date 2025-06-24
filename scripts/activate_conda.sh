#!/bin/bash

# 初始化 conda
source /root/miniconda3/etc/profile.d/conda.sh

# 激活环境
conda activate jm-downloader

# 执行 Python 脚本
python "$@"
EOF

chmod +x scripts/activate_conda.sh