"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import {
    Search, UserPlus, Shield, Users, Loader2,
    Mail, Phone, Ban, CheckCircle, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';

import { UserService } from '@/services/user.service';
import { User, ApiErrorResponse, ToastType } from '@/types';
import { Toast } from '@/components/ui/Toast';
import { UserStatusBadge } from '@/components/ui/UserStatusBadge';
import { CreateManagerModal } from '@/components/features/modals/CreateManagerModal';

export default function UsersPage() {
    // ÉTATS
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ lastPage: 1, total: 0 });

    const [toast, setToast] = useState<{ show: boolean, msg: string, type: ToastType }>({
        show: false, msg: '', type: 'loading'
    });

    // ✅ CHARGEMENT STABILISÉ
    const loadUsers = useCallback(async () => {
        try {
            const data = await UserService.getAll(currentPage, searchTerm);
            setUsers(data.data);
            setPagination({ lastPage: data.last_page, total: data.total });
        } catch (err) {
            setToast({ show: true, msg: "Erreur de synchronisation", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm]);

    // ✅ EFFET CORRIGÉ (SANS CASCADE)
    // EFFET CORRIGÉ (Exécution différée hors du flux synchrone)
    useEffect(() => {
        let isMounted = true;

        Promise.resolve().then(() => {
            if (isMounted) {
                loadUsers();
            }
        });

        return () => {
            isMounted = false;
        };
    }, [loadUsers]);

    const handleUserAction = async (id: number, action: 'suspend' | 'activate' | 'delete') => {
        setToast({ show: true, msg: "Mise à jour en cours...", type: 'loading' });
        try {
            if (action === 'suspend') await UserService.suspend(id);
            else if (action === 'activate') await UserService.activate(id);
            else await UserService.delete(id);

            setToast({ show: true, msg: "Action effectuée", type: 'success' });
            loadUsers();
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            setToast({ show: true, msg: axiosError.response?.data?.message || "Erreur", type: 'error' });
        }
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            {toast.show && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />}

            {showCreateModal && (
                <CreateManagerModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        loadUsers();
                        setToast({ show: true, msg: "Staff ajouté avec succès", type: 'success' });
                    }}
                />
            )}

            {/* KPI STATS - AFFICHAGE CORRIGÉ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-linear-to-br from-[#0b0c10] to-[#050505] p-10 rounded-[2.5rem] border border-white/5 flex items-center justify-between shadow-2xl">
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">Communauté</p>
                        <h3 className="text-5xl font-black text-white italic">{pagination.total}</h3>
                        <p className="text-[9px] text-red-500 font-bold uppercase italic">Citoyens actifs</p>
                    </div>
                    <div className="w-20 h-20 rounded-4xl bg-red-600/10 flex items-center justify-center text-red-600 border border-red-600/20">
                        <Users size={32} />
                    </div>
                </div>

                <div className="bg-linear-to-br from-[#0b0c10] to-[#050505] p-10 rounded-[2.5rem] border border-white/5 flex items-center justify-between shadow-2xl">
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">Équipe Kin-Alert</p>
                        <h3 className="text-5xl font-black text-white italic">
                            {/* On affiche le nombre de gestionnaires présents dans la liste actuelle */}
                            {users.filter(u => u.role === 'gestionnaire').length}
                        </h3>
                        <p className="text-[9px] text-emerald-500 font-bold uppercase italic">Modérateurs</p>
                    </div>
                    <div className="w-20 h-20 rounded-4xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 border border-emerald-600/20">
                        <Shield size={32} />
                    </div>
                </div>
            </div>

            {/* BARRE D'OUTILS ET RECHERCHE */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-[#0b0c10]/40 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-red-600 transition-colors" />
                    <input
                        type="text" placeholder="Rechercher (Nom, Email, Tel...)"
                        className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-14 text-xs text-white focus:border-red-600 outline-none transition-all italic"
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full lg:w-auto bg-white hover:bg-red-600 text-black hover:text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                >
                    <UserPlus size={18} /> Nouveau Gestionnaire
                </button>
            </div>

            {/* TABLEAU (IDENTIQUE AU PRÉCÉDENT, JUSTE S'ASSURER DU LOADING) */}
            <div className="bg-[#0b0c10]/40 border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-sm min-h-100">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-red-600 opacity-20" />
                        <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em]">Synchronisation...</span>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/2 border-b border-white/5 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                <th className="p-8">Profil</th>
                                <th className="p-8">Contact</th>
                                <th className="p-8 text-center">Rôle</th>
                                <th className="p-8 text-center">État</th>
                                <th className="p-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="group hover:bg-white/2 transition-all duration-300">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-[#1a1c23] border border-white/10 flex items-center justify-center text-red-600 font-black text-xs shadow-inner uppercase">
                                                {user.nom.substring(0, 2)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white uppercase italic tracking-tighter group-hover:text-red-600 transition-colors">{user.nom}</span>
                                                <span className="text-[9px] text-gray-600 font-bold mt-1">MEMBRE #00{user.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="space-y-1.5 text-[11px] text-gray-400">
                                            <div className="flex items-center gap-2 group/item"><Mail size={12} className="text-red-600 opacity-40 group-hover/item:opacity-100" /> {user.email}</div>
                                            <div className="flex items-center gap-2 group/item"><Phone size={12} className="text-red-600 opacity-40 group-hover/item:opacity-100" /> {user.telephone}</div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-center">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg border ${user.role === 'administrateur' ? 'border-red-600/30 text-red-500 bg-red-600/5' : 'border-white/10 text-gray-500'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex justify-center">
                                            <UserStatusBadge statut={user.statut} role={user.role} />
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {user.statut === 'actif' ? (
                                                <button onClick={() => handleUserAction(user.id, 'suspend')} className="p-3 bg-white/5 hover:bg-red-600 rounded-xl text-red-600 hover:text-white border border-white/5 transition-all"><Ban size={16} /></button>
                                            ) : (
                                                <button onClick={() => handleUserAction(user.id, 'activate')} className="p-3 bg-white/5 hover:bg-emerald-600 rounded-xl text-emerald-600 hover:text-white border border-white/5 transition-all"><CheckCircle size={16} /></button>
                                            )}
                                            <button onClick={() => handleUserAction(user.id, 'delete')} className="p-3 bg-white/5 hover:bg-gray-800 rounded-xl text-gray-600 hover:text-white border border-white/5 transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* PAGINATION IDENTIQUE AU PRÉCÉDENT ... */}
        </div>
    );
}