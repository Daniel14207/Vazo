import React from 'react';
import { Trophy, PlayCircle, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export const HomeMenu = ({ onSelect }: { onSelect: (nav: string) => void }) => {
  return (
    <div className="flex-1 bg-[#0B0C10] p-6 flex flex-col justify-center items-center gap-6">
      <motion.button
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => onSelect('VIRTUEL_FOOT')}
        className="w-full max-w-sm bg-gradient-to-br from-[#2A3A5B] to-[#1A1B2E] rounded-3xl p-8 shadow-[0_0_30px_rgba(69,243,255,0.1)] border border-[#45F3FF]/20 hover:border-[#45F3FF]/60 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#45F3FF]/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-[#45F3FF]/20"></div>
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-20 h-20 bg-[#0B0C10] rounded-full flex items-center justify-center mb-4 border border-[#45F3FF]/30 shadow-[0_0_15px_rgba(69,243,255,0.2)]">
            <Trophy size={40} className="text-[#45F3FF]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wider mb-2">VIRTUEL FOOT</h2>
          <p className="text-gray-400 text-sm mb-6">Prédictions algorithmiques pour les matchs virtuels.</p>
          <div className="flex items-center gap-2 text-[#45F3FF] font-bold text-sm">
            ENTRER <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onClick={() => onSelect('AVIATOR')}
        className="w-full max-w-sm bg-gradient-to-br from-[#2A3A5B] to-[#1A1B2E] rounded-3xl p-8 shadow-[0_0_30px_rgba(255,0,60,0.1)] border border-[#FF003C]/20 hover:border-[#FF003C]/60 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF003C]/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-[#FF003C]/20"></div>
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-20 h-20 bg-[#0B0C10] rounded-full flex items-center justify-center mb-4 border border-[#FF003C]/30 shadow-[0_0_15px_rgba(255,0,60,0.2)]">
            <PlayCircle size={40} className="text-[#FF003C]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wider mb-2">AVIATOR STUDIO</h2>
          <p className="text-gray-400 text-sm mb-6">Analyse en temps réel des multiplicateurs Aviator.</p>
          <div className="flex items-center gap-2 text-[#FF003C] font-bold text-sm">
            ENTRER <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.button>
    </div>
  );
};
