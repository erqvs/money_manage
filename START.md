# 记账系统 - 启动说明

## 端口配置

| 服务 | 端口 |
|------|------|
| 前端 | 9070 |
| 后端 | 9071 |

## 访问地址

- **HTTPS**: https://money.linkmate.site (推荐)
- **HTTP**: http://money.linkmate.site
- **API**: https://money.linkmate.site/api

## PM2 服务管理

**启动命令**：
```bash
# 启动后端
cd /var/www/money/backend && pm2 start "python3 app.py" --name "money-backend"

# 启动前端
cd /var/www/money/frontend && pm2 start npx --name "money-frontend" -- serve dist -l 9070
```

**常用命令**：
```bash
pm2 list                                    # 查看状态
pm2 logs money-backend --lines 50 --nostream   # 查看后端日志
pm2 restart money-backend money-frontend    # 重启服务
```

## SSL 证书

- **证书路径**: /etc/letsencrypt/live/money.linkmate.site/
- **有效期**: 自动续期（Let's Encrypt）

