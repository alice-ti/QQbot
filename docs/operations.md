# 操作指南（自用）

## `Nginx` 配置

```nginx
# 安装Nginx
yum install -y nginx

# 启动Nginx
systemctl start nginx

# 设置Nginx开机自启
systemctl enable nginx

# 检查Nginx状态
systemctl status nginx
```

## `pm2` 常用命令

```bash
# 重启指定的应用（通过应用名称）
pm2 restart app-name

# 重启指定的应用（通过进程ID）
pm2 restart 0

# 使用 PM2 启动dist目录下的应用
pm2 start dist/main.js --name "nestjs-app"
```
