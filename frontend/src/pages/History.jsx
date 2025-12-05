import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { getTransactionsGrouped } from '../api';
import { getAccountIcon, AlipayIcon, WechatIcon, ICBCIcon, BOCIcon, HuabeiIcon, JDIcon, WalletIcon } from '../components/AccountIcons';

export default function History() {
  const [groupedTransactions, setGroupedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, income, expense
  const [showFilter, setShowFilter] = useState(false);
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTransactionsGrouped();
        setGroupedTransactions(res.data.data);
        // 默认全部展开
        const expanded = {};
        res.data.data.forEach(group => {
          expanded[group.date] = true;
        });
        setExpandedDates(expanded);
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
      '支付宝': { icon: <AlipayIcon size={24} />, bg: '#E6F4FF' },
      '花呗欠额': { icon: <HuabeiIcon size={24} />, bg: '#FFF2E8' },
      '工行卡': { icon: <ICBCIcon size={24} />, bg: '#FEEFEF' },
      '中国银行卡': { icon: <BOCIcon size={24} />, bg: '#FEEFEF' },
      '微信': { icon: <WechatIcon size={24} />, bg: '#E8FAEA' },
      '京东白条': { icon: <JDIcon size={24} />, bg: '#FEEFEF' }
    };
    return info[name] || { icon: <WalletIcon size={24} />, bg: '#F1F5F9' };
  };

  // 切换日期展开/收起
  const toggleDate = (date) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  // 过滤和搜索交易
  const getFilteredTransactions = () => {
    return groupedTransactions.map(group => {
      const filteredTrans = group.transactions.filter(t => {
        // 搜索过滤
        const matchSearch = searchQuery === '' || 
          (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
          t.account_name.toLowerCase().includes(searchQuery.toLowerCase());
        
        // 类型过滤
        let matchType = true;
        if (filterType === 'income') {
          matchType = t.amount > 0;
        } else if (filterType === 'expense') {
          matchType = t.amount < 0;
        }
        
        return matchSearch && matchType;
      });

      return {
        ...group,
        transactions: filteredTrans
      };
    }).filter(group => group.transactions.length > 0);
  };

  // 计算日期的收支汇总
  const getDaySummary = (transactions) => {
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { income, expense };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredGroups = getFilteredTransactions();

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
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2.5 rounded-xl shadow-sm border transition-colors ${
            showFilter || filterType !== 'all' 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : 'bg-white border-slate-100 text-slate-500 hover:text-slate-900'
          }`}
        >
          <Filter size={20} />
        </button>
      </motion.header>

      {/* 筛选面板 */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-700">交易类型</span>
                {filterType !== 'all' && (
                  <button 
                    onClick={() => setFilterType('all')}
                    className="text-xs text-blue-500 font-medium"
                  >
                    清除筛选
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'income', label: '收入' },
                  { value: 'expense', label: '支出' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      filterType === option.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 搜索框 */}
      <div className="mb-6 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索交易备注..." 
          className="w-full bg-white pl-11 pr-10 py-3.5 rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 placeholder:text-slate-400 font-medium"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Calendar size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-400">
            {searchQuery || filterType !== 'all' ? '没有找到匹配的记录' : '暂无交易记录'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 pb-24">
          {filteredGroups.map((group, groupIndex) => {
            const isExpanded = expandedDates[group.date] !== false;
            const summary = getDaySummary(group.transactions);
            
            return (
              <motion.div
                key={group.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
              >
                {/* 日期标题 - 可点击展开/收起 */}
                <button 
                  onClick={() => toggleDate(group.date)}
                  className="w-full flex items-center justify-between mb-3 px-1 group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full group-hover:bg-slate-200 transition-colors">
                      {formatDate(group.date)}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {group.transactions.length} 笔
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* 日汇总 */}
                    <div className="flex items-center gap-2 text-xs font-medium">
                      {summary.income > 0 && (
                        <span className="text-emerald-500">+{summary.income.toLocaleString()}</span>
                      )}
                      {summary.expense > 0 && (
                        <span className="text-slate-500">-{summary.expense.toLocaleString()}</span>
                      )}
                    </div>
                    {/* 展开/收起图标 */}
                    <div className={`text-slate-400 transition-transform ${isExpanded ? '' : '-rotate-180'}`}>
                      <ChevronUp size={18} />
                    </div>
                  </div>
                </button>

                {/* 交易列表 - 可展开/收起 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
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
                                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
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
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
