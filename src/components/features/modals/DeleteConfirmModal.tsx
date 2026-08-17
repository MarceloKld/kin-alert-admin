"use client";
import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface Props {
    isOpen: boolean;
    userName: string;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const DeleteConfirmModal = ({ isOpen, userName, loading, onClose, onConfirm }: Props) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[#0b0c10] border border-red-500/20 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)]">

                {/* Header d'alerte */}
                <div className="p-8 pb-4 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Confirmation</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Action Irréversible</p>
                    </div>
                </div>

                {/* Corps du message */}
                <div className="p-8 pt-0 text-center">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Voulez-vous vraiment supprimer le compte de <span className="text-white font-black italic">{userName}</span> ?
                        Toutes ses données seront effacées du système.
                    </p>
                </div>

                {/* Actions */}
                <div className="p-8 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all outline-none"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={14} /> : <><Trash2 size={14} /> Supprimer</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;