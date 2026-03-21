import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, ShieldAlert, ChevronRight } from 'lucide-react';

export const Conditions = ({ onAccept }: { onAccept: () => void }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#1A1B2E] rounded-2xl shadow-2xl overflow-hidden border border-gray-800"
      >
        <div className="bg-gradient-to-r from-[#2A3A5B] to-[#1A1B2E] p-6 text-center border-b border-gray-800">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFC107] text-[#1A1B2E] mb-4 shadow-[0_0_20px_rgba(255,193,7,0.4)]">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">CONDITIONS D'UTILISATION</h1>
          <p className="text-gray-400 text-sm mt-2">Veuillez lire attentivement</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4 text-sm text-gray-300">
            <div className="flex gap-3 items-start bg-[#0B0C10] p-4 rounded-xl border border-gray-800">
              <CheckCircle className="text-[#45F3FF] shrink-0 mt-0.5" size={18} />
              <p>
                <strong className="text-white block mb-1">Système de Signaux VIP</strong>
                L'accès aux pronostics avancés (Virtuel Foot & Aviator) nécessite un abonnement actif.
              </p>
            </div>
            
            <div className="flex gap-3 items-start bg-[#0B0C10] p-4 rounded-xl border border-gray-800">
              <CheckCircle className="text-[#45F3FF] shrink-0 mt-0.5" size={18} />
              <p>
                <strong className="text-white block mb-1">Abonnement Requis</strong>
                Les tokens VIP sont nécessaires pour débloquer les fonctionnalités premium de la plateforme.
              </p>
            </div>

            <div className="flex gap-3 items-start bg-[#0B0C10] p-4 rounded-xl border border-gray-800">
              <ShieldAlert className="text-[#FF003C] shrink-0 mt-0.5" size={18} />
              <p>
                <strong className="text-white block mb-1">Avertissement Légal</strong>
                Les paris sportifs comportent des risques. Aucune garantie de gain n'est assurée. Jouez de manière responsable.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 p-4 bg-[#2A3A5B]/30 rounded-xl cursor-pointer border border-[#2A3A5B] hover:bg-[#2A3A5B]/50 transition-colors">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 text-[#FFC107] focus:ring-[#FFC107] bg-[#0B0C10]"
            />
            <span className="text-sm font-medium text-white">J'accepte les conditions d'utilisation</span>
          </label>

          <button
            onClick={onAccept}
            disabled={!accepted}
            className="w-full bg-[#FFC107] hover:bg-[#ffb300] disabled:bg-gray-600 disabled:text-gray-400 text-[#1A1B2E] font-black py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2"
          >
            CONTINUER <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
