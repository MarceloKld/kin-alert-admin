"use client";
import React, { useEffect, useState } from 'react';
import {
    Users, UserCheck, UserX, Search, Shield,
    UserCog, Trash2, MoreVertical, Loader2, Mail, Phone
} from 'lucide-react';
import { UserAdminService } from '@/services/user.service';
import { DashboardService } from '@/services/dashboard.service';
import { useAuth } from '@/hooks/useAuth';
import { Toast, ToastType } from '@/components/ui/Toast';
import { IncidentSkeleton } from '@/components/ui/IncidentSkeleton';
import { UserPlus } from 'lucide-react';
import { CreateManagerModal } from "@/components/features/modals/CreateManagerModal";

export default function UsersAdminPage() {
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [navigating, setNavigating] = useState(false);
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Protection Front-end : Si pas admin, on n'affiche rien
    if (!isAdmin) return <div className="p-20 text-center text-red-500 font-black uppercase tracking-widest">Accès Refusé - Réservé Admin</div>;

    // PROF : Un seul useEffect pour gérer la pagination ET la recherche
    useEffect(() => {
        // Si on tape une recherche, on attend un peu (Debounce)
        const delayDebounceFn = setTimeout(() => {
            loadData();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, search]); // Recharger si la page OU la recherche change

    
    const loadData = async () => {
        // 1. Déclencher le chargement visuel
        if (!users) setLoading(true); // Premier chargement (Skeleton complet)
        else setNavigating(true);    // Navigation/Recherche (Overlay discret)

        try {
            // 2. Lancer les deux appels en parallèle (Vitesse max)
            const [uRes, sRes] = await Promise.all([
                UserAdminService.getUsers(currentPage, search),
                DashboardService.getStats()
            ]);

            // 3. Gérer les statistiques (Le "Cœur" du problème)
            // On vérifie si sRes contient la clé 'stats' comme vu précédemment
            const cleanStats = sRes.stats ? sRes.stats : sRes;
            setStats(cleanStats);

            // 4. Gérer les utilisateurs
            // On s'assure que 'users' a toujours une propriété 'data' qui est un tableau
            const userData = uRes.data ? uRes : { data: uRes };
            setUsers(userData);

        } catch (e) {
            console.error("Erreur de chargement des données:", e);
            setToast({ message: "Erreur de synchronisation", type: "error" });
        } finally {
            setLoading(false);
            setNavigating(false);
        }
    };

    const handleToggleStatus = async (user: any) => {
        const action = user.statut === 'actif' ? 'suspendre' : 'activer';
        setToast({ message: `Opération : ${action}...`, type: 'loading' });

        try {
            if (user.statut === 'actif') await UserAdminService.suspendUser(user.id);
            else await UserAdminService.activateUser(user.id);

            setToast({ message: `Utilisateur ${action === 'activer' ? 'réactivé' : 'suspendu'}`, type: 'success' });
            loadData();
        } catch (e) {
            setToast({ message: "Erreur lors du changement de statut", type: 'error' });
        }
    };
    // À placer juste avant le return du composant
    console.log("ÉTAT ACTUEL USERS:", users);
    console.log("RECHERCHE ENVOYÉE:", search);
    return (
        
        <div className="p-4 md:p-8 bg-[#0b101a] min-h-screen text-slate-300">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* HEADER & STATS RAPIDES */}
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Users className="text-blue-500" /> Gestion des Comptes
                    </h2>
                    <div className="h-1 w-12 bg-blue-500 mt-2 rounded-full"></div>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                >
                    <UserPlus size={16} /> Ajouter un Gestionnaire
                </button>

                <div className="flex gap-4">
                    <div className="bg-[#151c2c] border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Users size={20} /></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Citoyens</p>
                            <p className="text-xl font-black text-white">{stats?.users_total ?? 0}</p>
                        </div>
                    </div>
                    <div className="bg-[#151c2c] border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><UserCog size={20} /></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Équipe</p>
                            <p className="text-xl font-black text-white">{stats?.gestionnaires_total ?? 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RECHERCHE */}
            <div className="mb-6 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher par nom, email ou téléphone..."
                    className="w-full bg-[#151c2c] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-blue-500/50 outline-none transition-all"
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* LISTE DES UTILISATEURS */}
            <div className="bg-[#151c2c] border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl relative">
                {navigating && (
                    <div className="absolute inset-0 z-10 bg-[#0b101a]/40 backdrop-blur-[2px] flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                )}

                {loading ? (
                    <IncidentSkeleton />
                ) : (
                    <>
                        {/* VUE TABLEAU PC */}
                        <table className="hidden md:table w-full text-left">
                            <thead className="bg-[#0f172a] border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identité</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rôle</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Statut</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {Array.isArray(users?.data) && users.data.length > 0 ? (
                                        users.data.map((user: any) => (
                                            <tr key={user.id} className="group hover:bg-white/1 transition-colors">
                                                {/* Identité */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                                            {user.nom?.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-200 uppercase tracking-tighter">
                                                                {user.nom}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 flex items-center gap-2">
                                                                <Mail size={10} />
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Rôle */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${user.role === 'administrateur'
                                                                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                                                : user.role === 'gestionnaire'
                                                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                                            }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>

                                                {/* Statut */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`w-2 h-2 rounded-full ${user.statut === 'actif'
                                                                    ? 'bg-emerald-500 animate-pulse'
                                                                    : 'bg-rose-500'
                                                                }`}
                                                        ></div>
                                                        <span className="text-[10px] font-bold uppercase">
                                                            {user.statut}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleToggleStatus(user)}
                                                            title={user.statut === 'actif' ? 'Suspendre' : 'Activer'}
                                                            className={`p-2 rounded-xl transition-all ${user.statut === 'actif'
                                                                    ? 'hover:bg-rose-500/10 text-rose-500'
                                                                    : 'hover:bg-emerald-500/10 text-emerald-500'
                                                                }`}
                                                        >
                                                            {user.statut === 'actif' ? (
                                                                <UserX size={18} />
                                                            ) : (
                                                                <UserCheck size={18} />
                                                            )}
                                                        </button>
                                                        <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-500">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        /* Message d'attente ou tableau vide */
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="py-20 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                {loading ? "Chargement des dossiers..." : "Aucun utilisateur trouvé"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                        </table>

                        {/* VUE CARTES MOBILE */}
                            {/* VUE CARTES MOBILE */}
                            <div className="md:hidden divide-y divide-slate-800/40">
                                {(users?.data || []).map((user: any) => (
                                    <div key={user.id} className="p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold">
                                                    {user.nom?.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white uppercase">{user.nom}</span>
                                                    <span className="text-[9px] text-slate-500">{user.role}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className={user.statut === 'actif' ? 'text-rose-500' : 'text-emerald-500'}
                                            >
                                                {user.statut === 'actif' ? <UserX size={20} /> : <UserCheck size={20} />}
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                            <span>{user.email}</span>
                                            <span className={`px-2 py-0.5 rounded font-black uppercase ${user.statut === 'actif' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {user.statut}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <CreateManagerModal
                                isOpen={isCreateModalOpen}
                                onClose={() => setIsCreateModalOpen(false)}
                                onSuccess={(msg: string) => {
                                    setToast({ message: msg, type: 'success' });
                                    loadData(); // Rafraîchir la liste
                                }}
                            />
                    </>
                )}
            </div>
        </div>
    );
}