import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const Intro = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array to run only once

  return (
    <div className="fixed inset-0 bg-[#0B0C10] flex flex-col items-center justify-center z-50 overflow-hidden">
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Glowing Circle expanding */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8] }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border-4 border-[#45F3FF] shadow-[0_0_40px_#45F3FF]"
        />
        
        {/* Rotating Gear */}
        <motion.div
          initial={{ rotate: 0, scale: 0 }}
          animate={{ rotate: 360, scale: 1 }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          className="absolute w-32 h-32 border-[8px] border-dashed border-[#FF003C] rounded-full shadow-[0_0_30px_#FF003C]"
        />

        {/* Inner Core */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 1] }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute w-12 h-12 bg-[#45F3FF] rounded-full shadow-[0_0_50px_#45F3FF]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2 }}
        className="mt-12 text-center"
      >
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#45F3FF] to-[#FF003C] tracking-[0.2em] drop-shadow-[0_0_10px_rgba(69,243,255,0.5)]">
          VITAL PRONOSTIC
        </h1>
        <p className="text-[#45F3FF] mt-2 tracking-widest text-sm font-mono opacity-80">
          SYSTEM INITIALIZATION...
        </p>
      </motion.div>
    </div>
  );
};
