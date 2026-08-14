"use client";
import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { UserAdminService } from '@/services/user.service';

export const CreateManagerModal = ({ isOpen, onClose, onSuccess }: any) => {
    // PROF : On utilise 'password' pour correspondre à ton test Postman qui marche
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<any>(null); // Pour stocker les erreurs 422

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors(null);

        try {
            // Envoi des données vers Laravel
            await UserAdminService.createManager(formData);
            onSuccess("Gestionnaire créé avec succès");
            onClose();
        } catch (err: any) {
            // PROF : Si c'est une erreur 422, Laravel renvoie un objet 'errors'
            if (err.response?.status === 422) {
                setValidationErrors(err.response.data.errors);
            } else {
                alert("Une erreur inattendue est survenue");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">

                <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <UserPlus className="text-blue-500" size={20} />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Nouveau Gestionnaire</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* CHAMP NOM */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom Complet</label>
                        <input
                            required
                            type="text"
                            className={`w-full bg-[#151c2c] border ${validationErrors?.nom ? 'border-red-500' : 'border-slate-800'} rounded-xl py-3 px-4 text-xs text-white outline-none`}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        />
                        {validationErrors?.nom && <p className="text-[9px] text-red-500 font-bold ml-1">{validationErrors.nom[0]}</p>}
                    </div>

                    {/* CHAMP EMAIL */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                        <input
                            required
                            type="email"
                            className={`w-full bg-[#151c2c] border ${validationErrors?.email ? 'border-red-500' : 'border-slate-800'} rounded-xl py-3 px-4 text-xs text-white outline-none`}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        {validationErrors?.email && <p className="text-[9px] text-red-500 font-bold ml-1">{validationErrors.email[0]}</p>}
                    </div>

                    {/* CHAMP TELEPHONE */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Téléphone</label>
                        <input
                            required
                            type="text"
                            className={`w-full bg-[#151c2c] border ${validationErrors?.telephone ? 'border-red-500' : 'border-slate-800'} rounded-xl py-3 px-4 text-xs text-white outline-none`}
                            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        />
                    </div>

                    {/* CHAMP PASSWORD */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mot de passe</label>
                        <input
                            required
                            type="password"
                            className={`w-full bg-[#151c2c] border ${validationErrors?.password ? 'border-red-500' : 'border-slate-800'} rounded-xl py-3 px-4 text-xs text-white outline-none`}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                        CRÉER LE COMPTE
                    </button>
                </form>
            </div>
        </div>
    );
};