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


            {/* 
  ═══════════════════════════════════════════════════════════════
  📍 HEADER - Titre + Bouton CTA
  ═══════════════════════════════════════════════════════════════
  Améliorations :
  - Icône badge avec glassmorphism
  - Espacement grille 8px cohérent
  - Micro-interactions hover sur le bouton
  - Responsive optimisé
  ═══════════════════════════════════════════════════════════════
*/}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">

                {/* Bloc gauche : Titre + Description */}
                <div className="space-y-2">
                    {/* Titre avec icône badge */}
                    <div className="flex items-center gap-3">
                        {/* Badge icône glassmorphism */}
                        <div className="p-2 bg-linear-to-br from-red-600/20 to-red-800/20 rounded-xl border border-red-600/30 backdrop-blur-sm">
                            <Users className="w-5 h-5 text-red-500" />
                        </div>

                        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase">
                            Utilisateurs
                        </h1>
                    </div>

                    {/* Sous-titre */}
                    <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase pl-11">
                        Gestion de la communauté
                    </p>
                </div>

                {/* Bloc droit : Bouton CTA */}
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="group relative w-full sm:w-auto overflow-hidden bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all duration-300 shadow-lg shadow-red-900/30 hover:shadow-xl hover:shadow-red-900/50 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {/* Effet brillance au survol */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

                    {/* Icône + Texte */}
                    <UserPlus size={16} className="relative z-10" />
                    <span className="relative z-10">Nouveau Staff</span>
                </button>

            </div>



            {/* 
  ═══════════════════════════════════════════════════════════════
  📊 KPI STATS CARDS - Statistiques Clés
  ═══════════════════════════════════════════════════════════════
  Améliorations :
  - Glassmorphism moderne avec backdrop-blur
  - Micro-interactions hover élégantes
  - Indicateurs de tendance (sparkline visuel)
  - Espacement grille 8px cohérent
  - Effet shine au survol
  - Responsive optimisé mobile → desktop
  ═══════════════════════════════════════════════════════════════
*/}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">

                {/* 
    ═══════════════════════════════════════════════════════════
    👥 CARD 1 - Total Citoyens
    ═══════════════════════════════════════════════════════════
  */}
                <div className="group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/[0.08] transition-all duration-300 shadow-lg hover:shadow-xl">
                    {/* Effet shine au hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

                    <div className="relative z-10 flex items-start justify-between">
                        {/* Contenu gauche */}
                        <div className="space-y-2">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                Citoyens
                            </p>
                            <h3 className="text-4xl md:text-5xl font-black text-white tabular-nums leading-none">
                                {pagination.total}
                            </h3>
                            {/* Mini indicateur de tendance */}
                            <div className="flex items-center gap-1.5 text-emerald-400">
                                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-semibold">Actifs</span>
                            </div>
                        </div>

                        {/* Icône avec badge */}
                        <div className="p-3 bg-red-600/20 rounded-xl border border-red-600/30 group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-6 h-6 text-red-500" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* 
    ═══════════════════════════════════════════════════════════
    🛡️ CARD 2 - Gestionnaires
    ═══════════════════════════════════════════════════════════
  */}
                <div className="group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/[0.08] transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

                    <div className="relative z-10 flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                Gestionnaires
                            </p>
                            <h3 className="text-4xl md:text-5xl font-black text-white tabular-nums leading-none">
                                {users.filter(u => u.role === 'gestionnaire').length}
                            </h3>
                            <div className="flex items-center gap-1.5 text-purple-400">
                                <div className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
                                <span className="text-[10px] font-semibold">Staff</span>
                            </div>
                        </div>

                        <div className="p-3 bg-emerald-600/20 rounded-xl border border-emerald-600/30 group-hover:scale-110 transition-transform duration-300">
                            <Shield className="w-6 h-6 text-emerald-500" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
            </div>




            {/* 
  ═══════════════════════════════════════════════════════════════
  🔍 BARRE DE RECHERCHE - Input avec suggestions
  ═══════════════════════════════════════════════════════════════
  Améliorations :
  - Glassmorphism avec backdrop-blur
  - Effet focus élégant avec ring
  - Animation icône au focus
  - Compteur de résultats
  - Bouton clear rapide
  - Raccourci clavier Ctrl+K suggestion
  ═══════════════════════════════════════════════════════════════
*/}

            <div className="relative group w-full">
                {/* Icône recherche (gauche) */}
                <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 
               group-focus-within:text-red-500 group-focus-within:scale-110 
               transition-all duration-300"
                    strokeWidth={2.5}
                />

                {/* Input principal */}
                <input
                    type="text"
                    placeholder="Rechercher par nom, email ou rôle..."
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 
               rounded-xl py-3.5 pl-12 pr-24 text-sm text-white 
               placeholder:text-gray-500 
               focus:bg-white/[0.08] focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20
               outline-none transition-all duration-300
               hover:border-white/20"
                    onChange={e => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    value={searchTerm}
                />

                {/* Bouton Clear (visible si texte présent) */}
                {searchTerm && (
                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setCurrentPage(1);
                        }}
                        className="absolute right-14 top-1/2 -translate-y-1/2 p-1.5 
                 text-gray-500 hover:text-red-500 hover:bg-red-500/10 
                 rounded-lg transition-all duration-200 group/clear"
                        aria-label="Effacer la recherche"
                    >
                        <svg
                            className="w-4 h-4 group-hover/clear:rotate-90 transition-transform duration-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Compteur résultats (droite) */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 
                  flex items-center gap-2">
                    {searchTerm && (
                        <span className="text-xs font-semibold text-gray-400 tabular-nums">
                            {users.length} {users.length > 1 ? 'résult' : 'résult'}
                        </span>
                    )}

                    {/* Badge raccourci clavier (visible si pas de recherche) */}
                    {!searchTerm && (
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 
                     bg-white/5 border border-white/10 rounded-md 
                     text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                            <span>⌘</span>K
                        </kbd>
                    )}
                </div>
            </div>


            {/* 
  ═══════════════════════════════════════════════════════════════
  📋 LISTE UTILISATEURS - Responsive Table/Cards
  ═══════════════════════════════════════════════════════════════
  Améliorations :
  - Skeleton loaders au lieu du spinner
  - Glassmorphism moderne
  - Micro-interactions hover fluides
  - Empty state élégant
  - Badges de rôle colorés
  - Actions contextuelles avec tooltips
  - Espacement grille 8px cohérent
  ═══════════════════════════════════════════════════════════════
*/}

            <div className="overflow-hidden">
                {loading ? (
                    /* 
                      ═══════════════════════════════════════════════════════════
                      ⏳ SKELETON LOADERS - État de chargement
                      ═══════════════════════════════════════════════════════════
                    */
                    <div className="space-y-4">
                        {/* Desktop skeleton */}
                        <div className="hidden md:block bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                            <div className="p-6 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-6 animate-pulse">
                                        <div className="w-12 h-12 bg-white/10 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-white/10 rounded w-1/4" />
                                            <div className="h-3 bg-white/5 rounded w-1/3" />
                                        </div>
                                        <div className="w-24 h-8 bg-white/10 rounded-lg" />
                                        <div className="flex gap-2">
                                            <div className="w-10 h-10 bg-white/10 rounded-xl" />
                                            <div className="w-10 h-10 bg-white/10 rounded-xl" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile skeleton */}
                        <div className="md:hidden space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/10 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-white/10 rounded w-2/3" />
                                            <div className="h-3 bg-white/5 rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : users.length === 0 ? (
                    /* 
                      ═══════════════════════════════════════════════════════════
                      📭 EMPTY STATE - Aucun résultat
                      ═══════════════════════════════════════════════════════════
                    */
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
                        <div className="inline-flex p-4 bg-gray-800/50 rounded-2xl mb-4">
                            <Users className="w-12 h-12 text-gray-600" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Aucun utilisateur trouvé
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">
                            {searchTerm
                                ? `Aucun résultat pour "${searchTerm}"`
                                : "Commencez par créer un nouveau membre du staff"
                            }
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                            >
                                Réinitialiser la recherche
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* 
        ═══════════════════════════════════════════════════════════
        💻 VERSION DESKTOP - Tableau
        ═══════════════════════════════════════════════════════════
      */}
                        <div className="hidden md:block bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">
                                            Profil
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">
                                            Rôle
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider text-center">
                                            Statut
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="group hover:bg-white/[0.03] transition-all duration-200"
                                        >
                                            {/* Colonne Profil */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {/* Avatar avec initiales */}
                                                    <div className="relative flex-shrink-0">
                                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-600/30 flex items-center justify-center">
                                                            <span className="text-sm font-black text-red-500 uppercase">
                                                                {user.nom.substring(0, 2)}
                                                            </span>
                                                        </div>
                                                        {/* Indicateur online (si actif) */}
                                                        {user.statut === 'actif' && (
                                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
                                                        )}
                                                    </div>

                                                    {/* Nom + ID */}
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-white truncate">
                                                            {user.nom}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            ID #{user.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Colonne Contact */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-xs">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <Mail className="w-3.5 h-3.5 text-gray-500" />
                                                        <span className="truncate max-w-[200px]">{user.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                                                        <span>{user.telephone}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Colonne Rôle */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase border
                    ${user.role === 'gestionnaire'
                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}
                                                >
                                                    {user.role === 'gestionnaire' && <Shield className="w-3 h-3" />}
                                                    {user.role}
                                                </span>
                                            </td>

                                            {/* Colonne Statut */}
                                            <td className="px-6 py-4 text-center">
                                                <UserStatusBadge statut={user.statut} role={user.role} />
                                            </td>

                                            {/* Colonne Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                    {/* Bouton Suspendre/Activer */}
                                                    {user.statut === 'actif' ? (
                                                        <button
                                                            onClick={() => handleUserAction(user.id, 'suspend')}
                                                            className="p-2.5 bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/30 rounded-lg text-gray-400 hover:text-orange-500 transition-all duration-200 group/btn"
                                                            title="Suspendre"
                                                        >
                                                            <Ban className="w-4 h-4" strokeWidth={2.5} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUserAction(user.id, 'activate')}
                                                            className="p-2.5 bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-500/30 rounded-lg text-gray-400 hover:text-green-500 transition-all duration-200 group/btn"
                                                            title="Activer"
                                                        >
                                                            <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                                                        </button>
                                                    )}

                                                    {/* Bouton Supprimer */}
                                                    <button
                                                        onClick={() => handleUserAction(user.id, 'delete')}
                                                        className="p-2.5 bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-600 rounded-lg text-gray-400 hover:text-white transition-all duration-200"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 
        ═══════════════════════════════════════════════════════════
        📱 VERSION MOBILE - Cartes
        ═══════════════════════════════════════════════════════════
      */}
                        <div className="md:hidden space-y-4">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg hover:bg-white/[0.07] transition-all duration-200"
                                >
                                    {/* Header carte : Avatar + Nom + Badge */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-600/30 flex items-center justify-center">
                                                    <span className="text-sm font-black text-red-500 uppercase">
                                                        {user.nom.charAt(0)}
                                                    </span>
                                                </div>
                                                {user.statut === 'actif' && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
                                                )}
                                            </div>

                                            {/* Nom + Rôle */}
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="text-sm font-bold text-white truncate">
                                                    {user.nom}
                                                </span>
                                                <span className={`text-xs font-bold uppercase
                    ${user.role === 'gestionnaire' ? 'text-purple-400' : 'text-blue-400'}
                  `}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Badge statut */}
                                        <UserStatusBadge statut={user.statut} role={user.role} />
                                    </div>

                                    {/* Infos contact */}
                                    <div className="space-y-2 text-xs border-t border-white/10 pt-4">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span>{user.telephone}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2">
                                        {user.statut === 'actif' ? (
                                            <button
                                                onClick={() => handleUserAction(user.id, 'suspend')}
                                                className="flex-1 py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/30 rounded-xl text-orange-500 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-200"
                                            >
                                                <Ban className="w-4 h-4" strokeWidth={2.5} />
                                                Suspendre
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUserAction(user.id, 'activate')}
                                                className="flex-1 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/30 rounded-xl text-green-500 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-200"
                                            >
                                                <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                                                Activer
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleUserAction(user.id, 'delete')}
                                            className="p-3 bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-600 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>




            {/* 
  ═══════════════════════════════════════════════════════════════
  📄 PAGINATION - Navigation entre pages
  ═══════════════════════════════════════════════════════════════
  Améliorations :
  - Glassmorphism moderne
  - Pages numérotées cliquables (desktop)
  - Indicateur visuel page active
  - Info résultats affichés
  - Raccourcis première/dernière page
  - Animations micro-interactions
  - Responsive optimisé
  ═══════════════════════════════════════════════════════════════
*/}

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* 
      ═══════════════════════════════════════════════════════════
      📊 INFO RÉSULTATS (gauche)
      ═══════════════════════════════════════════════════════════
    */}
                    <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-medium">
                            Affichage de {((currentPage - 1) * 10) + 1} à {Math.min(currentPage * 10, pagination.total)}
                        </span>
                        <span className="text-gray-600">sur</span>
                        <span className="font-bold text-white">{pagination.total}</span>
                        <span className="text-gray-600">résultats</span>
                    </div>

                    {/* 
      ═══════════════════════════════════════════════════════════
      🎯 CONTRÔLES PAGINATION (centre/mobile full)
      ═══════════════════════════════════════════════════════════
    */}
                    <div className="flex items-center gap-2">

                        {/* Bouton Première page (desktop only) */}
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage(1)}
                            className="hidden sm:flex items-center justify-center p-2.5 rounded-lg 
                   bg-white/5 border border-white/10 
                   text-gray-400 hover:text-white hover:bg-white/10 
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200"
                            title="Première page"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Bouton Précédent */}
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="flex items-center justify-center p-3 rounded-xl 
                   bg-white/5 border border-white/10 
                   text-white hover:bg-red-600 hover:border-red-600
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5
                   transition-all duration-200 active:scale-95
                   shadow-lg hover:shadow-red-900/30"
                        >
                            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                        </button>

                        {/* 
  ═══════════════════════════════════════════════════════════
  🔢 NUMÉROS DE PAGES (desktop only)
  ═══════════════════════════════════════════════════════════
*/}
                        <div className="hidden md:flex items-center gap-1">
                            {(() => {
                                const pages = [];
                                const maxVisible = 5;

                                // Calcul des bornes de pages visibles
                                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                const endPage = Math.min(pagination.lastPage, startPage + maxVisible - 1);

                                // Ajuster startPage si on est proche de la fin
                                if (endPage - startPage < maxVisible - 1) {
                                    startPage = Math.max(1, endPage - maxVisible + 1);
                                }

                                // Première page + ellipsis si nécessaire
                                if (startPage > 1) {
                                    pages.push(
                                        <button
                                            key={1}
                                            onClick={() => setCurrentPage(1)}
                                            className="w-10 h-10 rounded-lg text-sm font-bold
                     bg-white/5 border border-white/10 text-gray-400
                     hover:bg-white/10 hover:text-white
                     transition-all duration-200"
                                        >
                                            1
                                        </button>
                                    );
                                    if (startPage > 2) {
                                        pages.push(
                                            <span key="ellipsis-start" className="px-2 text-gray-600">...</span>
                                        );
                                    }
                                }

                                // Pages visibles
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i)}
                                            disabled={loading}
                                            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all duration-200
            ${i === currentPage
                                                    ? 'bg-red-600 border border-red-600 text-white shadow-lg shadow-red-900/30'
                                                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                                }
            disabled:cursor-not-allowed
          `}
                                        >
                                            {i}
                                        </button>
                                    );
                                }

                                // Dernière page + ellipsis si nécessaire
                                if (endPage < pagination.lastPage) {
                                    if (endPage < pagination.lastPage - 1) {
                                        pages.push(
                                            <span key="ellipsis-end" className="px-2 text-gray-600">...</span>
                                        );
                                    }
                                    pages.push(
                                        <button
                                            key={pagination.lastPage}
                                            onClick={() => setCurrentPage(pagination.lastPage)}
                                            className="w-10 h-10 rounded-lg text-sm font-bold
                     bg-white/5 border border-white/10 text-gray-400
                     hover:bg-white/10 hover:text-white
                     transition-all duration-200"
                                        >
                                            {pagination.lastPage}
                                        </button>
                                    );
                                }

                                return pages;
                            })()}
                        </div>

                        {/* 
        ═══════════════════════════════════════════════════════════
        📱 INFO PAGE (mobile only)
        ═══════════════════════════════════════════════════════════
      */}
                        <div className="md:hidden flex flex-col items-center px-4">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Page
                            </span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-white tabular-nums">
                                    {currentPage}
                                </span>
                                <span className="text-sm text-gray-600 font-medium">/</span>
                                <span className="text-lg font-bold text-gray-400 tabular-nums">
                                    {pagination.lastPage}
                                </span>
                            </div>
                        </div>

                        {/* Bouton Suivant */}
                        <button
                            disabled={currentPage === pagination.lastPage || loading}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="flex items-center justify-center p-3 rounded-xl 
                   bg-white/5 border border-white/10 
                   text-white hover:bg-red-600 hover:border-red-600
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5
                   transition-all duration-200 active:scale-95
                   shadow-lg hover:shadow-red-900/30"
                        >
                            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                        </button>

                        {/* Bouton Dernière page (desktop only) */}
                        <button
                            disabled={currentPage === pagination.lastPage || loading}
                            onClick={() => setCurrentPage(pagination.lastPage)}
                            className="hidden sm:flex items-center justify-center p-2.5 rounded-lg 
                   bg-white/5 border border-white/10 
                   text-gray-400 hover:text-white hover:bg-white/10 
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200"
                            title="Dernière page"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>

                    </div>

                    {/* 
      ═══════════════════════════════════════════════════════════
      ⚡ ACTIONS RAPIDES (droite, desktop only)
      ═══════════════════════════════════════════════════════════
    */}
                    <div className="hidden lg:flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-medium">
                            Aller à :
                        </span>
                        <input
                            type="number"
                            min={1}
                            max={pagination.lastPage}
                            value={currentPage}
                            onChange={(e) => {
                                const page = parseInt(e.target.value);
                                if (page >= 1 && page <= pagination.lastPage) {
                                    setCurrentPage(page);
                                }
                            }}
                            className="w-16 px-3 py-2 bg-white/5 border border-white/10 
                   rounded-lg text-sm text-white text-center
                   focus:bg-white/10 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20
                   outline-none transition-all duration-200
                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                </div>

                {/* 
    ═══════════════════════════════════════════════════════════
    📊 BARRE DE PROGRESSION (mobile only)
    ═══════════════════════════════════════════════════════════
  */}
                <div className="sm:hidden mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span>Progression</span>
                        <span className="font-semibold text-white">
                            {Math.round((currentPage / pagination.lastPage) * 100)}%
                        </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${(currentPage / pagination.lastPage) * 100}%` }}
                        />
                    </div>
                </div>
            </div>


        </div>
    );
}