import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { getSummary, createTransaction } from '../api';
import TransactionModal from '../components/TransactionModal';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await getSummary();
      setSummary(res.data.data);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleTransaction = async (data) => {
    try {
      await createTransaction(data);
      fetchSummary();
    } catch (error) {
      console.error('交易失败:', error);
    }
  };

  // 获取账户对应的品牌色和图标
  const getAccountStyle = (name) => {
    const styles = {
      'alipay': { color: '#1677FF', bg: '#E6F4FF', icon: '💙', label: '支付宝' },
      'wechat': { color: '#07C160', bg: '#E8FAEA', icon: '💚', label: '微信' },
      'icbc': { color: '#C41230', bg: '#FEEFEF', icon: '🏦', label: '工行' },
      'boc': { color: '#E60012', bg: '#FEEFEF', icon: '🏛️', label: '中行' },
      'huabei': { color: '#FF6B35', bg: '#FFF2E8', icon: '🐱', label: '花呗' },
      'jd_baitiao': { color: '#E4393C', bg: '#FEEFEF', icon: '🐶', label: '白条' }
    };
    return styles[name] || { color: '#3B82F6', bg: '#EFF6FF', icon: '💰', label: '账户' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const assetAccounts = summary?.accounts?.filter(a => !a.is_debt) || [];
  const debtAccounts = summary?.accounts?.filter(a => a.is_debt) || [];

  return (
    <div className="px-5 pt-8 pb-4">
      {/* 顶部欢迎语 & 总资产 */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-slate-500 text-sm font-medium">我的净资产</p>
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
             {/* 头像占位 */}
             <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-purple-400"></div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 font-number tracking-tight">
          ¥{(summary?.net_worth || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </h1>
        
        <div className="flex gap-4 mt-6">
          <div className="flex-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                <ArrowUpRight size={14} strokeWidth={3} />
              </div>
              <span className="text-slate-500 text-xs font-medium">总资产</span>
            </div>
            <p className="text-lg font-bold text-slate-800 font-number">
              ¥{(summary?.total_assets || 0).toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="flex-1 bg-red-50/50 p-4 rounded-2xl border border-red-100/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                <ArrowDownRight size={14} strokeWidth={3} />
              </div>
              <span className="text-slate-500 text-xs font-medium">总负债</span>
            </div>
            <p className="text-lg font-bold text-slate-800 font-number">
              ¥{(summary?.total_debt || 0).toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </motion.header>

      {/* 资产账户列表 */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-base font-bold text-slate-900 mb-4 px-1">资产账户</h2>
        <div className="grid grid-cols-2 gap-3">
          {assetAccounts.map((account, index) => {
            const style = getAccountStyle(account.name);
            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="modern-card p-4 flex flex-col justify-between h-32"
              >
                <div className="flex justify-between items-start">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: style.bg }}
                  >
                    {style.icon}
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-1">{account.name_cn}</p>
                  <p className="text-xl font-bold text-slate-900 font-number">
                    {Math.abs(account.balance) >= 10000 
                      ? `${(account.balance/10000).toFixed(2)}w` 
                      : account.balance.toLocaleString('zh-CN')
                    }
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 负债账户列表 */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-24"
      >
        <h2 className="text-base font-bold text-slate-900 mb-4 px-1">信用账户</h2>
        <div className="space-y-3">
          {debtAccounts.map((account, index) => {
            const style = getAccountStyle(account.name);
            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="modern-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: style.bg }}
                  >
                    {style.icon}
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold">{account.name_cn}</p>
                    <p className="text-slate-400 text-xs mt-0.5">本月应还</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 font-number">
                    -¥{Math.abs(account.balance).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 悬浮添加按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed right-6 bottom-24 w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl shadow-slate-900/20 flex items-center justify-center z-30"
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accounts={summary?.accounts || []}
        onSubmit={handleTransaction}
      />
    </div>
  );
}
