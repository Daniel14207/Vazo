import React, { useState } from 'react';
import { fetchApi } from '../lib/api';
import { CheckCircle, Flame, Copy, ChevronRight, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export const Auth = ({ onLogin, onAdminLogin }: { onLogin: (user: any) => void, onAdminLogin: (code: string) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [countryCode, setCountryCode] = useState('+261');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone === '@9729') {
      onAdminLogin(phone);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const fullPhone = isLogin ? phone : `${countryCode} ${phone}`;
      
      const data = await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify({ phone: fullPhone, password }),
      });

      localStorage.setItem('token', data.token);
      
      if (!isLogin) {
        setRegisteredUser(data.user);
      } else {
        onLogin(data.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (registeredUser) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex flex-col justify-center items-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-[#1A1B2E] rounded-2xl shadow-2xl overflow-hidden border border-gray-800 p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Inscription Réussie !</h2>
          <p className="text-gray-400 text-sm mb-6">Voici votre identifiant unique. Conservez-le précieusement.</p>
          
          <div className="bg-[#0B0C10] border border-gray-800 rounded-xl p-4 flex items-center justify-between mb-8">
            <span className="text-[#45F3FF] font-mono text-xl font-bold tracking-wider">{registeredUser.id}</span>
            <button 
              onClick={() => navigator.clipboard.writeText(registeredUser.id)}
              className="p-2 bg-[#2A3A5B] rounded-lg text-white hover:bg-[#FFC107] hover:text-black transition-colors"
            >
              <Copy size={20} />
            </button>
          </div>

          <button
            onClick={() => onLogin(registeredUser)}
            className="w-full bg-[#FFC107] hover:bg-[#ffb300] text-[#1A1B2E] font-black py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2"
          >
            ACCÉDER À L'APPLICATION <ChevronRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#1A1B2E] rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
        <div className="bg-gradient-to-r from-[#2A3A5B] to-[#1A1B2E] p-6 text-center border-b border-gray-800">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFC107] text-[#1A1B2E] mb-4 shadow-[0_0_20px_rgba(255,193,7,0.4)]">
            <Flame size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">VITAL PRONOSTIC</h1>
          <p className="text-[#45F3FF] text-sm mt-1 font-mono">Accès Sécurisé VIP</p>
        </div>

        <div className="p-8">
          <div className="flex mb-6 bg-[#0B0C10] p-1 rounded-xl border border-gray-800">
            <button
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${isLogin ? 'bg-[#2A3A5B] shadow text-white' : 'text-gray-500 hover:text-gray-300'}`}
              onClick={() => setIsLogin(true)}
            >
              CONNEXION
            </button>
            <button
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${!isLogin ? 'bg-[#2A3A5B] shadow text-white' : 'text-gray-500 hover:text-gray-300'}`}
              onClick={() => setIsLogin(false)}
            >
              INSCRIPTION
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-xl font-medium flex items-center gap-2">
              <ShieldAlert size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Numéro de Téléphone</label>
              <div className="flex gap-2">
                {!isLogin && (
                  <select 
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-24 px-3 py-3 rounded-xl border border-gray-700 bg-[#0B0C10] text-white focus:border-[#45F3FF] focus:ring-1 focus:ring-[#45F3FF] outline-none transition-all font-medium appearance-none"
                  >
                    <option value="+261">🇲🇬 +261</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+225">🇨🇮 +225</option>
                    <option value="+221">🇸🇳 +221</option>
                    <option value="+237">🇨🇲 +237</option>
                    <option value="+243">🇨🇩 +243</option>
                  </select>
                )}
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-700 bg-[#0B0C10] text-white focus:border-[#45F3FF] focus:ring-1 focus:ring-[#45F3FF] outline-none transition-all font-medium placeholder-gray-600"
                  placeholder={isLogin ? "Ex: +261 34... ou code secret" : "34 XXXXXXX"}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#0B0C10] text-white focus:border-[#45F3FF] focus:ring-1 focus:ring-[#45F3FF] outline-none transition-all font-medium placeholder-gray-600"
                placeholder="••••••••"
                required
              />
            </div>

            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-5">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#0B0C10] text-white focus:border-[#45F3FF] focus:ring-1 focus:ring-[#45F3FF] outline-none transition-all font-medium placeholder-gray-600"
                  placeholder="••••••••"
                  required
                />
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFC107] hover:bg-[#ffb300] text-[#1A1B2E] font-black py-4 rounded-xl shadow-[0_0_15px_rgba(255,193,7,0.3)] transition-all flex justify-center items-center gap-2 mt-8 disabled:opacity-70"
            >
              {loading ? 'CHARGEMENT...' : (isLogin ? 'SE CONNECTER' : 'CRÉER MON COMPTE')}
              {!loading && <ChevronRight size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
