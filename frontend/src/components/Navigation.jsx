import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, History, PieChart } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/history', icon: History, label: '明细' },
  { path: '/statistics', icon: PieChart, label: '分析' },
];

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-md mx-auto relative">
        {/* 模糊背景层 */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 nav-shadow" />
        
        <div className="relative flex justify-around items-center px-2 py-3 pb-safe">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center w-16 py-1 group"
              >
                <div className={`
                  relative p-2.5 rounded-2xl transition-all duration-300 ease-out
                  ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
                `}>
                  {isActive && (
                    <motion.div
                      layoutId="nav-bg"
                      className="absolute inset-0 bg-blue-50 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    <Icon 
                      size={24} 
                      strokeWidth={isActive ? 2.5 : 2}
                      className="transition-transform duration-300 group-active:scale-90" 
                    />
                  </span>
                </div>
                <span className={`
                  text-[10px] font-medium mt-1 transition-colors duration-300
                  ${isActive ? 'text-blue-600' : 'text-slate-400'}
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
