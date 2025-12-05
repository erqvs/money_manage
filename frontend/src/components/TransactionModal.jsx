import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Check, ChevronLeft } from 'lucide-react';
import { getAccountIcon } from './AccountIcons';

export default function TransactionModal({ isOpen, onClose, accounts, onSubmit }) {
  const [step, setStep] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactionType, setTransactionType] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedAccount(null);
      setTransactionType(null);
      setAmount('');
      setNote('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!selectedAccount || !transactionType || !amount) return;
    
    onSubmit({
      account_id: selectedAccount.id,
      transaction_type: transactionType,
      amount: parseFloat(amount),
      note: note
    });
    onClose();
  };

  // 账户排序优先级
  const accountOrder = ['alipay', 'wechat', 'icbc', 'boc', 'huabei', 'jd_baitiao'];
  const sortedAccounts = [...accounts].sort((a, b) => {
    const orderA = accountOrder.indexOf(a.name);
    const orderB = accountOrder.indexOf(b.name);
    return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
  });

  const getAccountStyle = (name) => {
    const styles = {
      'alipay': { color: '#1677FF', bg: '#E6F4FF' },
      'wechat': { color: '#07C160', bg: '#E8FAEA' },
      'icbc': { color: '#C41230', bg: '#FEEFEF' },
      'boc': { color: '#E60012', bg: '#FEEFEF' },
      'huabei': { color: '#FF6B35', bg: '#FFF2E8' },
      'jd_baitiao': { color: '#E4393C', bg: '#FEEFEF' }
    };
    return styles[name] || { color: '#3B82F6', bg: '#EFF6FF' };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 - 移除blur提升性能 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/30 z-[60]"
            onClick={onClose}
          />
          
          {/* 弹窗主体 - 使用简单动画 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-[32px] p-6 pb-safe max-h-[85vh] overflow-hidden shadow-2xl"
            style={{ willChange: 'transform' }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} className="p-1 -ml-1 text-slate-400 hover:text-slate-900">
                    <ChevronLeft size={24} />
                  </button>
                )}
                <h2 className="text-xl font-bold text-slate-900">
                  {step === 1 && '选择账户'}
                  {step === 2 && '收支类型'}
                  {step === 3 && '金额明细'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* 内容区域 */}
            <div className="overflow-y-auto max-h-[60vh] pb-8">
              {/* 步骤1: 选择账户 */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {sortedAccounts.map((account) => {
                    const style = getAccountStyle(account.name);
                    return (
                      <button
                        key={account.id}
                        onClick={() => {
                          setSelectedAccount(account);
                          setStep(2);
                        }}
                        className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform text-left group"
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 overflow-hidden"
                          style={{ backgroundColor: style.bg }}
                        >
                          {getAccountIcon(account.name, 28)}
                        </div>
                        <p className="font-bold text-slate-900">{account.name_cn}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {account.is_debt ? '欠款' : '余额'}: 
                          <span className="ml-1 font-number">
                            ¥{Math.abs(account.balance).toLocaleString('zh-CN')}
                          </span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 步骤2: 选择增加/减少 */}
              {step === 2 && selectedAccount && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: getAccountStyle(selectedAccount.name).bg }}
                    >
                      {getAccountIcon(selectedAccount.name, 28)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{selectedAccount.name_cn}</p>
                      <p className="text-xs text-slate-500">
                        当前{selectedAccount.is_debt ? '欠款' : '余额'}: ¥{Math.abs(selectedAccount.balance).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setTransactionType('increase');
                        setStep(3);
                      }}
                      className="p-6 rounded-3xl bg-emerald-50 border-2 border-transparent active:scale-[0.98] transition-transform text-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                        <Plus size={24} strokeWidth={3} />
                      </div>
                      <p className="text-emerald-900 font-bold text-lg">
                        {selectedAccount.is_debt ? '增加欠款' : '收入'}
                      </p>
                    </button>
                    
                    <button
                      onClick={() => {
                        setTransactionType('decrease');
                        setStep(3);
                      }}
                      className="p-6 rounded-3xl bg-red-50 border-2 border-transparent active:scale-[0.98] transition-transform text-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                        <Minus size={24} strokeWidth={3} />
                      </div>
                      <p className="text-red-900 font-bold text-lg">
                        {selectedAccount.is_debt ? '还款' : '支出'}
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* 步骤3: 填写金额和备注 */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      transactionType === 'increase' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {transactionType === 'increase' ? '+' : '-'} 
                      {transactionType === 'increase' 
                        ? (selectedAccount?.is_debt ? '增加欠款' : '收入') 
                        : (selectedAccount?.is_debt ? '还款' : '支出')
                      }
                    </span>
                    <span className="text-sm font-bold text-slate-400">•</span>
                    <span className="text-sm font-bold text-slate-900">{selectedAccount?.name_cn}</span>
                  </div>

                  <div>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-300">¥</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        autoFocus
                        className="w-full py-2 pl-8 pr-0 text-5xl font-bold font-number text-slate-900 bg-transparent border-none focus:ring-0 placeholder:text-slate-200 p-0"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="写点什么备注..."
                      rows={3}
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-700 placeholder:text-slate-400 text-base resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!amount}
                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-transform ${
                      amount 
                        ? 'bg-blue-600 text-white active:scale-[0.98] shadow-lg shadow-blue-500/20' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Check size={20} strokeWidth={3} />
                    确认记一笔
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
