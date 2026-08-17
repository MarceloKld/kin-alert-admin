"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import {
    Search, UserPlus, Shield, Users, Loader2,
    Mail, Phone, Ban, CheckCircle, Trash2, ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';

import { UserService } from '@/services/user.service';
import { User, ApiErrorResponse, ToastType } from '@/types';
import { Toast } from '@/components/ui/Toast';
import { UserStatusBadge } from '@/components/ui/UserStatusBadge';
import { CreateManagerModal } from '@/components/features/modals/CreateManagerModal';
// Remplacez la ligne 15 par des accolades {} :
import { DeleteConfirmModal } from '@/components/features/modals/DeleteConfirmModal';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ lastPage: 1, total: 0 });
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [toast, setToast] = useState<{ show: boolean, msg: string, type: ToastType }>({
        show: false, msg: '', type: 'loading'
    });

    const loadUsers = useCallback(async (isInitial: boolean = false) => {
        if (isInitial) setLoading(true);
        try {
            const data = await UserService.getAll(currentPage, searchTerm);
            setUsers(data.data);
            setPagination({ lastPage: data.last_page, total: data.total });
        } catch (err) {
            setToast({ show: true, msg: "Erreur synchronisation", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm]);
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
        if (action === 'delete') {
            const user = users.find(u => u.id === id);
            if (user) setUserToDelete(user);
            return;
        }

        setToast({ show: true, msg: "Mise à jour...", type: 'loading' });
        try {
            if (action === 'suspend') await UserService.suspend(id);
            else await UserService.activate(id);
            setToast({ show: true, msg: "Réussite", type: 'success' });
            loadUsers(false);
        } catch (error) {
            setToast({ show: true, msg: "Action refusée", type: 'error' });
        }
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await UserService.delete(userToDelete.id);
            setToast({ show: true, msg: "Compte supprimé", type: 'success' });
            loadUsers(false);
            setUserToDelete(null);
        } catch {
            setToast({ show: true, msg: "Erreur suppression", type: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-10 animate-in fade-in duration-700">
            {toast.show && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />}

            <DeleteConfirmModal
                isOpen={!!userToDelete}
                userName={userToDelete?.nom || ""}
                loading={isDeleting}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmDelete}
            />

            {showCreateModal && <CreateManagerModal onClose={() => setShowCreateModal(false)} onSuccess={() => loadUsers(false)} />}

            {/* HEADER & BOUTON ROUGE */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic">Utilisateurs</h1>
                    <p className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase italic">Gestion de la communauté</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-red-900/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    <UserPlus size={16} /> Nouveau Staff
                </button>
            </div>

            {/* KPI STATS RESPONSIVE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div className="bg-[#0b0c10]/60 p-6 md:p-10 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-xl">
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Citoyens</p>
                        <h3 className="text-3xl md:text-5xl font-black text-white italic">{pagination.total}</h3>
                    </div>
                    <Users size={32} className="text-red-600 opacity-50" />
                </div>
                <div className="bg-[#0b0c10]/60 p-6 md:p-10 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-xl">
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Gestionnaires</p>
                        <h3 className="text-3xl md:text-5xl font-black text-white italic">{users.filter(u => u.role === 'gestionnaire').length}</h3>
                    </div>
                    <Shield size={32} className="text-emerald-500 opacity-50" />
                </div>
            </div>

            {/* BARRE DE RECHERCHE */}
            <div className="relative group w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-red-500 transition-colors" />
                <input
                    type="text" placeholder="Rechercher un profil par nom ou email..."
                    className="w-full bg-[#0b0c10] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-xs text-white focus:border-red-500 outline-none transition-all placeholder:text-gray-700"
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>

            {/* LISTE RESPONSIVE : TABLEAU (Desktop) vs CARTES (Mobile) */}
            <div className="overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto opacity-20" /></div>
                ) : (
                    <>
                        {/* VERSION DESKTOP : TABLEAU */}
                        <div className="hidden md:block bg-[#0b0c10]/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">
                                        <th className="p-8">Profil</th>
                                        <th className="p-8">Contact</th>
                                        <th className="p-8">Rôle</th>
                                        <th className="p-8 text-center">Statut</th>
                                        <th className="p-8 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user) => (
                                        <tr key={user.id} className="group hover:bg-white/[0.02] transition-all">
                                            <td className="p-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#1a1c23] border border-white/10 flex items-center justify-center text-red-500 font-black text-xs uppercase italic">{user.nom.substring(0, 2)}</div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-white uppercase italic tracking-tighter">{user.nom}</span>
                                                        <span className="text-[9px] text-gray-600 font-bold uppercase mt-1 italic tracking-widest">ID #{user.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8 text-[11px] text-gray-400 font-medium">
                                                <div className="flex flex-col gap-1">
                                                    <span>{user.email}</span>
                                                    <span className="text-gray-600">{user.telephone}</span>
                                                </div>
                                            </td>
                                            <td className="p-8 text-[10px] font-black uppercase text-gray-500 tracking-widest">{user.role}</td>
                                            <td className="p-8 text-center"><UserStatusBadge statut={user.statut} role={user.role} /></td>
                                            <td className="p-8 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    {user.statut === 'actif' ? (
                                                        <button onClick={() => handleUserAction(user.id, 'suspend')} className="p-3 bg-white/5 hover:bg-red-500/20 rounded-xl text-red-500 border border-white/5 transition-all"><Ban size={16} /></button>
                                                    ) : (
                                                        <button onClick={() => handleUserAction(user.id, 'activate')} className="p-3 bg-white/5 hover:bg-emerald-500/20 rounded-xl text-emerald-500 border border-white/5 transition-all"><CheckCircle size={16} /></button>
                                                    )}
                                                    <button onClick={() => handleUserAction(user.id, 'delete')} className="p-3 bg-white/5 hover:bg-red-600 rounded-xl text-gray-500 hover:text-white border border-white/5 transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* VERSION MOBILE : CARTES */}
                        <div className="md:hidden space-y-4">
                            {users.map((user) => (
                                <div key={user.id} className="bg-[#0b0c10]/60 border border-white/5 rounded-[2rem] p-6 space-y-4 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 font-black uppercase">{user.nom.charAt(0)}</div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white uppercase italic">{user.nom}</span>
                                                <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">{user.role}</span>
                                            </div>
                                        </div>
                                        <UserStatusBadge statut={user.statut} role={user.role} />
                                    </div>
                                    <div className="space-y-2 text-xs text-gray-400 font-medium border-t border-white/5 pt-4">
                                        <div className="flex items-center gap-2"><Mail size={14} className="text-red-500 opacity-50" /> {user.email}</div>
                                        <div className="flex items-center gap-2"><Phone size={14} className="text-red-500 opacity-50" /> {user.telephone}</div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        {user.statut === 'actif' ? (
                                            <button onClick={() => handleUserAction(user.id, 'suspend')} className="flex-1 py-3 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"><Ban size={14} /> Suspendre</button>
                                        ) : (
                                            <button onClick={() => handleUserAction(user.id, 'activate')} className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"><CheckCircle size={14} /> Activer</button>
                                        )}
                                        <button onClick={() => handleUserAction(user.id, 'delete')} className="py-3 px-4 bg-white/5 border border-white/5 rounded-xl text-gray-500 transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* PAGINATION RESPONSIVE */}
            <div className="flex items-center justify-between p-6 bg-[#0b0c10]/60 rounded-[2rem] border border-white/5 shadow-2xl">
                <button
                    disabled={currentPage === 1 || loading}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 text-white disabled:opacity-10 hover:bg-red-600 transition-all shadow-lg active:scale-90"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Page</span>
                    <span className="text-lg font-black text-white italic tracking-tighter">{currentPage} <span className="text-red-600 not-italic opacity-30">/</span> {pagination.lastPage}</span>
                </div>
                <button
                    disabled={currentPage === pagination.lastPage || loading}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 text-white disabled:opacity-10 hover:bg-red-600 transition-all shadow-lg active:scale-90"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}