import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, AlertCircle } from 'lucide-react';
import { getStatistics } from '../api';

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getStatistics();
        setStats(res.data.data);
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTrendConfig = (change) => {
    if (change > 0) return { icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-50' };
    if (change < 0) return { icon: TrendingDown, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    return { icon: Minus, color: 'text-slate-400', bg: 'bg-slate-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: '今日支出',
      period: 'Today',
      current: stats?.daily?.current || 0,
      previous: stats?.daily?.previous || 0,
      change: stats?.daily?.change || 0,
      color: 'blue'
    },
    {
      title: '本周支出',
      period: 'This Week',
      current: stats?.weekly?.current || 0,
      previous: stats?.weekly?.previous || 0,
      change: stats?.weekly?.change || 0,
      color: 'violet'
    },
    {
      title: '本月支出',
      period: 'This Month',
      current: stats?.monthly?.current || 0,
      previous: stats?.monthly?.previous || 0,
      change: stats?.monthly?.change || 0,
      color: 'indigo'
    },
  ];

  return (
    <div className="px-5 pt-8 pb-4 min-h-screen">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900">数据分析</h1>
        <p className="text-slate-500 text-sm mt-1">支出趋势概览</p>
      </motion.header>

      <div className="space-y-4 pb-24">
        {statCards.map((card, index) => {
          const trend = getTrendConfig(card.change);
          const Icon = trend.icon;
          const percent = card.previous > 0 
            ? Math.abs((card.change / card.previous) * 100).toFixed(1)
            : '0.0';

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 relative overflow-hidden"
            >
              {/* 背景装饰圆 */}
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-${card.color}-50 opacity-50`}></div>
              
              <div className="relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1 block">
                      {card.period}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 ${trend.bg} ${trend.color}`}>
                    <Icon size={14} strokeWidth={2.5} />
                    <span className="text-xs font-bold">
                      {percent}%
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-sm font-medium text-slate-400">¥</span>
                  <span className="text-3xl font-bold text-slate-900 font-number tracking-tight">
                    {card.current.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 rounded-lg p-2.5">
                  <Calendar size={14} />
                  <span>上期支出:</span>
                  <span className="text-slate-600 font-number">
                    ¥{card.previous.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}

        <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 mt-6">
          <AlertCircle size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-600/80 leading-relaxed">
            比起上期，支出减少通常意味着更好的财务控制。保持记录习惯，让每一笔消费都有迹可循。
          </p>
        </div>
      </div>
    </div>
  );
}
