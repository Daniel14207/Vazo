import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { Users, CreditCard, CheckCircle, ShieldAlert, LogOut } from 'lucide-react';

export const Admin = ({ onLogout }: { onLogout: () => void }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'payments'>('payments');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, paymentId?: number, userId?: string, amount?: number, customDays?: string }>({ isOpen: false });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [usersData, paymentsData] = await Promise.all([
        fetchApi('/admin/users'),
        fetchApi('/admin/payments')
      ]);
      setUsers(usersData);
      setPayments(paymentsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleValidateClick = (paymentId: number, userId: string, amount: number) => {
    setConfirmModal({ isOpen: true, paymentId, userId, amount, customDays: amount < 10000 ? '3' : undefined });
  };

  const executeValidation = async () => {
    const { paymentId, userId, amount, customDays } = confirmModal;
    if (!paymentId || !userId || amount === undefined) return;

    let days = 7;
    if (amount >= 100000) days = 365;
    else if (amount >= 40000) days = 30;
    else if (amount >= 10000) days = 7;
    else {
      days = parseInt(customDays || '3', 10);
      if (isNaN(days) || days <= 0) {
        setAlertMessage('Nombre de jours invalide.');
        return;
      }
    }

    try {
      await fetchApi('/admin/validate-payment', {
        method: 'POST',
        body: JSON.stringify({ paymentId, userId, days })
      });
      setConfirmModal({ isOpen: false });
      loadData();
    } catch (err) {
      setAlertMessage('Erreur lors de la validation');
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">ADMIN DASHBOARD</h1>
              <p className="text-sm text-gray-500 font-medium">Gestion des accès VIP</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-colors"
          >
            <LogOut size={16} /> Quitter
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'payments' ? 'bg-[#2A3A5B] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
          >
            <CreditCard size={18} /> Paiements en attente
            {payments.filter(p => p.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                {payments.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-[#2A3A5B] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
          >
            <Users size={18} /> Utilisateurs
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {activeTab === 'payments' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Référence</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-600">{new Date(payment.created_at).toLocaleString()}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{payment.phone}</div>
                        <div className="text-xs text-gray-500 font-mono">{payment.user_id}</div>
                      </td>
                      <td className="p-4 font-mono text-sm font-bold text-[#2A3A5B]">{payment.reference}</td>
                      <td className="p-4 font-black text-green-600">{payment.amount} Ar</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${payment.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {payment.status === 'pending' ? 'EN ATTENTE' : 'VALIDÉ'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => handleValidateClick(payment.id, payment.user_id, payment.amount)}
                            className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                          >
                            <CheckCircle size={14} /> VALIDER
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">Aucun paiement trouvé</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID Utilisateur</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Téléphone</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiration</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Jetons</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono text-sm font-bold text-[#2A3A5B]">{user.id}</td>
                      <td className="p-4 font-bold text-gray-900">{user.phone}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : user.status === 'EXPIRED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {user.expire_date ? new Date(user.expire_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4 font-bold text-gray-900">{user.token_balance || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-black text-gray-900 mb-2">Valider le paiement</h3>
              <p className="text-gray-600 mb-4">
                Voulez-vous vraiment valider ce paiement de <span className="font-bold">{confirmModal.amount} Ar</span> ?
              </p>
              
              {confirmModal.amount && confirmModal.amount < 10000 && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de jours</label>
                  <input 
                    type="number" 
                    value={confirmModal.customDays || ''} 
                    onChange={e => setConfirmModal({...confirmModal, customDays: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#2A3A5B]"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal({ isOpen: false })}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={executeValidation}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-500/30"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {alertMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Erreur</h3>
              <p className="text-gray-600 mb-6">{alertMessage}</p>
              <button 
                onClick={() => setAlertMessage(null)}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
