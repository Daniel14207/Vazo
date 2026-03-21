import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PlayCircle, Copy, Lock } from 'lucide-react';

export const AviatorStudio = ({ isVipActive, onShowPayment }: { isVipActive: boolean, onShowPayment: () => void }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Generate mock history for Aviator
    const generateHistory = () => {
      const newHistory = [];
      let time = new Date();
      time.setMinutes(time.getMinutes() - 10);
      
      for (let i = 0; i < 10; i++) {
        newHistory.push({
          id: i,
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          safe: (Math.random() * 2 + 1.1).toFixed(2),
          medium: (Math.random() * 5 + 2.5).toFixed(2),
          risk: (Math.random() * 50 + 10).toFixed(2),
        });
        time.setMinutes(time.getMinutes() + 1);
      }
      return newHistory.reverse();
    };
    
    setHistory(generateHistory());
    
    const interval = setInterval(() => {
      setHistory(prev => {
        const now = new Date();
        const newItem = {
          id: Date.now(),
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          safe: (Math.random() * 2 + 1.1).toFixed(2),
          medium: (Math.random() * 5 + 2.5).toFixed(2),
          risk: (Math.random() * 50 + 10).toFixed(2),
        };
        return [newItem, ...prev].slice(0, 20);
      });
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isVipActive) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <Lock size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">ACCÈS RESTREINT</h2>
        <p className="text-gray-400 mb-8 max-w-xs">Activez votre abonnement VIP pour accéder aux prédictions Aviator en temps réel.</p>
        <button 
          onClick={onShowPayment}
          className="bg-[#FFC107] hover:bg-[#ffb300] text-[#1A1B2E] font-black py-4 px-8 rounded-xl shadow-[0_0_15px_rgba(255,193,7,0.3)] transition-all"
        >
          ACTIVER MON VIP
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0C10] p-4">
      <div className="flex items-center justify-between mb-6 bg-[#1A1B2E] p-4 rounded-xl border border-gray-800">
        <div className="flex items-center gap-3">
          <PlayCircle className="text-[#FF003C]" size={28} />
          <div>
            <h2 className="text-lg font-black text-white">AVIATOR STUDIO</h2>
            <p className="text-xs text-gray-400">Prédictions en temps réel</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-[#45F3FF]">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[10px] text-gray-500 uppercase">Heure du serveur</div>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#1A1B2E] rounded-xl p-4 border border-gray-800 flex flex-col gap-3"
          >
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-[#45F3FF] font-mono font-bold">{item.time}</span>
              <span className="text-xs font-bold bg-[#FF003C]/20 text-[#FF003C] px-2 py-1 rounded">TOUR</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#0B0C10] p-2 rounded-lg text-center border border-green-500/30 relative group">
                <div className="text-[10px] text-gray-500 mb-1">SÉCURISÉ</div>
                <div className="text-green-400 font-black">{item.safe}x</div>
                <button 
                  onClick={() => navigator.clipboard.writeText(item.safe)}
                  className="absolute inset-0 bg-green-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                >
                  <Copy size={16} className="text-green-400" />
                </button>
              </div>
              
              <div className="bg-[#0B0C10] p-2 rounded-lg text-center border border-orange-500/30 relative group">
                <div className="text-[10px] text-gray-500 mb-1">MOYEN</div>
                <div className="text-orange-400 font-black">{item.medium}x</div>
                <button 
                  onClick={() => navigator.clipboard.writeText(item.medium)}
                  className="absolute inset-0 bg-orange-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                >
                  <Copy size={16} className="text-orange-400" />
                </button>
              </div>
              
              <div className="bg-[#0B0C10] p-2 rounded-lg text-center border border-red-500/30 relative group">
                <div className="text-[10px] text-gray-500 mb-1">RISQUE</div>
                <div className="text-red-400 font-black">{item.risk}x</div>
                <button 
                  onClick={() => navigator.clipboard.writeText(item.risk)}
                  className="absolute inset-0 bg-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                >
                  <Copy size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
