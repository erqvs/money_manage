from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
from sqlalchemy import func, and_
from models import db, Account, Transaction, init_default_accounts
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)

# 初始化数据库
with app.app_context():
    db.create_all()
    init_default_accounts()


# ==================== 账户相关API ====================

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    """获取所有账户信息"""
    accounts = Account.query.all()
    return jsonify({
        'success': True,
        'data': [acc.to_dict() for acc in accounts]
    })


@app.route('/api/accounts/<int:account_id>', methods=['GET'])
def get_account(account_id):
    """获取单个账户信息"""
    account = Account.query.get_or_404(account_id)
    return jsonify({
        'success': True,
        'data': account.to_dict()
    })


@app.route('/api/accounts/<int:account_id>/balance', methods=['PUT'])
def update_balance(account_id):
    """更新账户余额"""
    account = Account.query.get_or_404(account_id)
    data = request.get_json()
    
    if 'balance' in data:
        account.balance = data['balance']
        db.session.commit()
    
    return jsonify({
        'success': True,
        'data': account.to_dict()
    })


@app.route('/api/summary', methods=['GET'])
def get_summary():
    """获取总金额汇总"""
    accounts = Account.query.all()
    
    total_assets = sum(acc.balance for acc in accounts if not acc.is_debt)
    total_debt = sum(acc.balance for acc in accounts if acc.is_debt)
    net_worth = total_assets - total_debt
    
    return jsonify({
        'success': True,
        'data': {
            'total_assets': total_assets,
            'total_debt': total_debt,
            'net_worth': net_worth,
            'accounts': [acc.to_dict() for acc in accounts]
        }
    })


# ==================== 交易相关API ====================

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """获取交易记录"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    transactions = Transaction.query.order_by(
        Transaction.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'success': True,
        'data': [t.to_dict() for t in transactions.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': transactions.total,
            'pages': transactions.pages
        }
    })


@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    """创建新交易"""
    data = request.get_json()
    
    account_id = data.get('account_id')
    amount = float(data.get('amount', 0))
    transaction_type = data.get('transaction_type', 'decrease')
    note = data.get('note', '')
    
    account = Account.query.get_or_404(account_id)
    
    # 计算实际金额变化
    if transaction_type == 'increase':
        if account.is_debt:
            # 欠款增加意味着欠更多钱
            account.balance += amount
        else:
            # 余额增加
            account.balance += amount
        actual_amount = amount
    else:  # decrease
        if account.is_debt:
            # 欠款减少意味着还钱
            account.balance -= amount
        else:
            # 余额减少
            account.balance -= amount
        actual_amount = -amount
    
    # 创建交易记录
    transaction = Transaction(
        account_id=account_id,
        amount=actual_amount,
        transaction_type=transaction_type,
        note=note
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'data': transaction.to_dict()
    })


@app.route('/api/transactions/grouped', methods=['GET'])
def get_transactions_grouped():
    """获取按日期分组的交易记录"""
    transactions = Transaction.query.order_by(
        Transaction.created_at.desc()
    ).all()
    
    # 按日期分组
    grouped = {}
    for t in transactions:
        date_key = t.created_at.strftime('%Y-%m-%d')
        if date_key not in grouped:
            grouped[date_key] = []
        grouped[date_key].append(t.to_dict())
    
    # 转换为列表格式
    result = [
        {'date': date, 'transactions': trans}
        for date, trans in grouped.items()
    ]
    
    return jsonify({
        'success': True,
        'data': result
    })


# ==================== 统计相关API ====================

def get_date_range_spending(start_date, end_date):
    """获取日期范围内的支出"""
    result = db.session.query(
        func.sum(Transaction.amount)
    ).filter(
        and_(
            Transaction.created_at >= start_date,
            Transaction.created_at < end_date,
            Transaction.amount < 0  # 支出是负数
        )
    ).scalar()
    return abs(result) if result else 0


@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """获取统计数据"""
    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # 今日
    today_start = today
    today_end = today + timedelta(days=1)
    
    # 昨日
    yesterday_start = today - timedelta(days=1)
    yesterday_end = today
    
    # 本周（周一开始）
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=7)
    
    # 上周
    last_week_start = week_start - timedelta(days=7)
    last_week_end = week_start
    
    # 本月
    month_start = today.replace(day=1)
    if today.month == 12:
        month_end = today.replace(year=today.year + 1, month=1, day=1)
    else:
        month_end = today.replace(month=today.month + 1, day=1)
    
    # 上月
    if today.month == 1:
        last_month_start = today.replace(year=today.year - 1, month=12, day=1)
    else:
        last_month_start = today.replace(month=today.month - 1, day=1)
    last_month_end = month_start
    
    # 计算各时间段支出
    today_spending = get_date_range_spending(today_start, today_end)
    yesterday_spending = get_date_range_spending(yesterday_start, yesterday_end)
    
    week_spending = get_date_range_spending(week_start, today_end)
    last_week_spending = get_date_range_spending(last_week_start, last_week_end)
    
    month_spending = get_date_range_spending(month_start, today_end)
    last_month_spending = get_date_range_spending(last_month_start, last_month_end)
    
    return jsonify({
        'success': True,
        'data': {
            'daily': {
                'current': today_spending,
                'previous': yesterday_spending,
                'change': today_spending - yesterday_spending
            },
            'weekly': {
                'current': week_spending,
                'previous': last_week_spending,
                'change': week_spending - last_week_spending
            },
            'monthly': {
                'current': month_spending,
                'previous': last_month_spending,
                'change': month_spending - last_month_spending
            }
        }
    })


@app.route('/api/statistics/chart', methods=['GET'])
def get_chart_data():
    """获取图表数据"""
    days = request.args.get('days', 7, type=int)
    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    chart_data = []
    for i in range(days - 1, -1, -1):
        day_start = today - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        spending = get_date_range_spending(day_start, day_end)
        chart_data.append({
            'date': day_start.strftime('%m-%d'),
            'spending': spending
        })
    
    return jsonify({
        'success': True,
        'data': chart_data
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9071)

