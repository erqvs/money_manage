from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Account(db.Model):
    """账户模型 - 存储各个账户的余额"""
    __tablename__ = 'accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)  # 账户名称
    name_cn = db.Column(db.String(50), nullable=False)  # 中文名称
    balance = db.Column(db.Float, default=0.0)  # 余额/欠款
    is_debt = db.Column(db.Boolean, default=False)  # 是否是欠款类型
    icon = db.Column(db.String(50), default='wallet')  # 图标
    color = db.Column(db.String(20), default='#3B82F6')  # 颜色
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_cn': self.name_cn,
            'balance': self.balance,
            'is_debt': self.is_debt,
            'icon': self.icon,
            'color': self.color,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Transaction(db.Model):
    """交易记录模型"""
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)  # 金额（正数为增加，负数为减少）
    transaction_type = db.Column(db.String(20), nullable=False)  # 'increase' 或 'decrease'
    note = db.Column(db.String(255), default='')  # 备注
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    account = db.relationship('Account', backref=db.backref('transactions', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'account_id': self.account_id,
            'account_name': self.account.name_cn if self.account else '',
            'account_color': self.account.color if self.account else '#3B82F6',
            'amount': self.amount,
            'transaction_type': self.transaction_type,
            'note': self.note,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


def init_default_accounts():
    """初始化默认账户"""
    default_accounts = [
        {'name': 'alipay', 'name_cn': '支付宝', 'balance': 0, 'is_debt': False, 'icon': 'alipay', 'color': '#1677FF'},
        {'name': 'huabei', 'name_cn': '花呗欠额', 'balance': 0, 'is_debt': True, 'icon': 'huabei', 'color': '#FF6B35'},
        {'name': 'icbc', 'name_cn': '工行卡', 'balance': 0, 'is_debt': False, 'icon': 'bank', 'color': '#C41230'},
        {'name': 'boc', 'name_cn': '中国银行卡', 'balance': 0, 'is_debt': False, 'icon': 'bank', 'color': '#E60012'},
        {'name': 'wechat', 'name_cn': '微信', 'balance': 0, 'is_debt': False, 'icon': 'wechat', 'color': '#07C160'},
        {'name': 'jd_baitiao', 'name_cn': '京东白条', 'balance': 0, 'is_debt': True, 'icon': 'jd', 'color': '#E4393C'},
    ]
    
    for acc_data in default_accounts:
        existing = Account.query.filter_by(name=acc_data['name']).first()
        if not existing:
            account = Account(**acc_data)
            db.session.add(account)
    
    db.session.commit()

