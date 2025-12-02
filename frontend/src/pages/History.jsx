import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Filter } from 'lucide-react';
import { getTransactionsGrouped } from '../api';

export default function History() {
  const [groupedTransactions, setGroupedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTransactionsGrouped();
        setGroupedTransactions(res.data.data);
      } catch (error) {
        console.error('获取历史记录失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      const options = { month: 'long', day: 'numeric', weekday: 'short' };
      return date.toLocaleDateString('zh-CN', options);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const getAccountInfo = (name) => {
    const info = {
      '支付宝': { icon: '💙', bg: '#E6F4FF' },
      '花呗欠额': { icon: '🐱', bg: '#FFF2E8' },
      '工行卡': { icon: '🏦', bg: '#FEEFEF' },
      '中国银行卡': { icon: '🏛️', bg: '#FEEFEF' },
      '微信': { icon: '💚', bg: '#E8FAEA' },
      '京东白条': { icon: '🐶', bg: '#FEEFEF' }
    };
    return info[name] || { icon: '💰', bg: '#F1F5F9' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-4 min-h-screen">
      {/* 头部 */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex justify-between items-end"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">收支明细</h1>
          <p className="text-slate-500 text-sm mt-1">查看所有的交易记录</p>
        </div>
        <button className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
          <Filter size={20} />
        </button>
      </motion.header>

      {/* 搜索框 */}
      <div className="mb-8 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="搜索交易备注..." 
          className="w-full bg-white pl-11 pr-4 py-3.5 rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 placeholder:text-slate-400 font-medium"
        />
      </div>

      {groupedTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Calendar size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-400">暂无交易记录</p>
        </div>
      ) : (
        <div className="space-y-8 pb-20">
          {groupedTransactions.map((group, groupIndex) => (
            <motion.div
              key={group.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.05 }}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
                  {formatDate(group.date)}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {group.transactions.length} 笔交易
                </span>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {group.transactions.map((transaction, index) => {
                  const accountInfo = getAccountInfo(transaction.account_name);
                  const isLast = index === group.transactions.length - 1;
                  
                  return (
                    <div 
                      key={transaction.id}
                      className={`
                        p-4 flex items-center justify-between transition-colors hover:bg-slate-50
                        ${!isLast ? 'border-b border-slate-50' : ''}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                          style={{ backgroundColor: accountInfo.bg }}
                        >
                          {accountInfo.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-900 font-bold truncate pr-4">
                            {transaction.note || transaction.account_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                            <span>{formatTime(transaction.created_at)}</span>
                            {transaction.note && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{transaction.account_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-base font-bold font-number ${
                          transaction.amount > 0 ? 'text-emerald-500' : 'text-slate-900'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
