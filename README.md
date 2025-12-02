# 金融管家 - 智能资产管理系统

一个现代化的个人财务管理应用，帮助您追踪和管理多个账户的资产与负债。

## ✨ 功能特性

- 📊 **资产总览** - 实时查看净资产、总资产和总负债
- 💳 **多账户支持** - 支付宝、微信、银行卡、花呗、京东白条等
- 📝 **交易记录** - 完整的收支历史，按日期分组展示
- 📈 **统计分析** - 日/周/月花费统计及环比分析
- 🎨 **精美界面** - 现代化玻璃态设计，流畅动画效果

## 🏗️ 技术栈

### 后端
- Python 3.9+
- Flask
- SQLAlchemy
- MySQL

### 前端
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons

## 🚀 快速开始

### 1. 克隆项目

```bash
cd /Users/king-lin/Documents/GitHub/money_manage
```

### 2. 启动后端

```bash
cd backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动服务
python app.py
```

后端服务将在 http://localhost:5001 运行

### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 http://localhost:3000 运行

## 📱 页面说明

### 首页
- 显示净资产总额
- 资产账户列表（支付宝、微信、工行卡、中国银行卡）
- 负债账户列表（花呗、京东白条）
- 右下角添加交易按钮

### 历史记录
- 按日期分组的交易记录
- 显示交易时间、账户、金额和备注
- 增加用绿色标识，支出用红色标识

### 统计分析
- 日花费及与昨日对比
- 周花费及与上周对比
- 月花费及与上月对比
- 百分比变化趋势

## 🔐 数据库配置

数据库连接信息在 `backend/config.py` 中配置：

```python
MYSQL_HOST = '112.124.97.21'
MYSQL_PORT = 3306
MYSQL_USER = 'money_manager'
MYSQL_DATABASE = 'money_manage'
```

## 📁 项目结构

```
money_manage/
├── backend/
│   ├── app.py          # Flask 主应用
│   ├── config.py       # 配置文件
│   ├── models.py       # 数据库模型
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.jsx
│   │   │   └── TransactionModal.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   └── Statistics.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 📝 License

MIT License

