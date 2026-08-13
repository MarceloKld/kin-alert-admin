"use client";

import { useEffect, useState } from "react";
import { Users, AlertCircle, CheckCircle, MapPin, BarChart3, ShieldAlert, TrendingUp } from "lucide-react";
import { DashboardService } from "@/services/dashboard.service";
import { DashboardData } from "@/types";
import { DashboardSkeleton } from "@/components/features/DashboardSkeleton";
// Au lieu de @/components/features/IncidentChart
import { motion, Variants } from "framer-motion";
import dynamic from "next/dynamic";
import {
    AlertTriangle,
    Car,
    Zap,
    Mountain,
    Trash2,
    Droplet,
    TrafficCone,
    Lightbulb,
    Volume2,
    FileText,
    Flame
} from "lucide-react";
import {
    Home,
    ChevronRight,
    ArrowUp,
    RefreshCw
} from "lucide-react";

// 2. Import dynamique de ton graphique pour éviter les erreurs SSR
// J'ai utilisé .then((mod) => mod.IncidentChart) car dans ton code d'origine tu l'importes avec des { }
const IncidentChart = dynamic(
    () => import("@/components/features/IncidentChart").then((mod) => mod.IncidentChart),
    { ssr: false }
);

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        DashboardService.getStats()
            .then(setData)
            .finally(() => setTimeout(() => setLoading(false), 1200));
    }, []);

    if (loading) return <DashboardSkeleton />;





    // ========================================
    // COMPOSANT ITEM DU TICKER
    // - Icônes SVG Lucide React
    // - Animations avancées
    // ========================================
    interface TickerItemProps {
        text: string;
        Icon: React.ElementType; // Type pour composant Lucide
        priority: 'critical' | 'high' | 'medium' | 'low';
    }

    const TickerItem = ({ text, Icon, priority }: TickerItemProps) => {
        // Mapping couleurs selon priorité
        const priorityStyles = {
            critical: {
                dot: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]",
                text: "text-red-400",
                icon: "text-red-500",
                bg: "bg-red-500/5 hover:bg-red-500/10",
                border: "border-red-500/30 hover:border-red-500/50",
                glow: "group-hover:shadow-red-500/30"
            },
            high: {
                dot: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)]",
                text: "text-orange-400",
                icon: "text-orange-500",
                bg: "bg-orange-500/5 hover:bg-orange-500/10",
                border: "border-orange-500/30 hover:border-orange-500/50",
                glow: "group-hover:shadow-orange-500/30"
            },
            medium: {
                dot: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]",
                text: "text-yellow-400",
                icon: "text-yellow-500",
                bg: "bg-yellow-500/5 hover:bg-yellow-500/10",
                border: "border-yellow-500/30 hover:border-yellow-500/50",
                glow: "group-hover:shadow-yellow-500/30"
            },
            low: {
                dot: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
                text: "text-blue-400",
                icon: "text-blue-500",
                bg: "bg-blue-500/5 hover:bg-blue-500/10",
                border: "border-blue-500/30 hover:border-blue-500/50",
                glow: "group-hover:shadow-blue-500/30"
            }
        };

        const style = priorityStyles[priority];

        return (
            <motion.div
                whileHover={{ scale: 3.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`
                group relative
                flex items-center gap-3 
                px-4 py-2
                rounded-xl 
                ${style.bg}
                backdrop-blur-sm 
                border ${style.border}
                transition-all duration-300
                ${style.glow}
                shadow-lg
            `}
            >
                {/* Glow background au hover */}
                <div className={`
                absolute inset-0 
                bg-linear-to-r from-transparent via-white/5 to-transparent 
                opacity-0 group-hover:opacity-100 
                rounded-xl 
                transition-opacity duration-500
            `} />

                {/* Icône SVG avec animation */}
                <motion.div
                    animate={{
                        rotate: priority === 'critical' ? [0, -9, 9, 0] : 0,
                    }}
                    transition={{
                        duration: 3.5,
                        repeat: priority === 'critical' ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                    className="relative z-10"
                >
                    <Icon
                        size={18}
                        className={`${style.icon} drop-shadow-lg`}
                        strokeWidth={2.5}
                    />
                </motion.div>

                {/* Point indicateur avec glow pulsant */}
                <div className="relative z-10">
                    <div className={`w-2 h-2 rounded-full ${style.dot}`}>
                        <div className={`absolute inset-0 w-2 h-2 rounded-full ${style.dot.split(' ')[0]} animate-ping opacity-75`} />
                    </div>
                </div>

                {/* Texte */}
                <span className={`
                relative z-10
                text-sm font-bold uppercase tracking-wider 
                ${style.text} 
                transition-colors
            `}>
                    {text}
                </span>

                {/* Badge priorité critique */}
                {priority === 'critical' && (
                    <motion.span
                        animate={{
                            opacity: [1, 0.5, 1],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity
                        }}
                        className="
                        relative z-10
                        ml-2 px-2 py-0.5 
                        bg-red-500/20 
                        text-red-400 
                        text-[10px] font-bold uppercase 
                        rounded-md 
                        border border-red-500/40
                        shadow-lg shadow-red-500/20
                    "
                    >
                        <Flame size={10} className="inline mr-1" />
                        Critique
                    </motion.span>
                )}
            </motion.div>
        );
    };

    // Déclare cette fonction dans ton composant DashboardPage
    const handleRefresh = () => {
        setLoading(true);

        // Si tu utilises router.refresh() de Next.js ou une fonction fetch :
        // router.refresh();

        // Simule le temps de rechargement si nécessaire
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };



    

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-4 md:p-8 space-y-8"
        >{/* ========================================
    LIVE TICKER - Défilement incidents
    - Double rangée pour continuité
    - Glow effects
    - Icons dynamiques par type
======================================== */}
            <div className="relative bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 border-y border-slate-800/50 overflow-hidden">
                {/* Gradient overlay gauche */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-slate-900 to-transparent z-10 pointer-events-none" />

                {/* Gradient overlay droite */}
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

                {/* Ligne décorative top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent" />

                {/* Container du ticker */}
                <div className="relative py-3.5 flex">
                    {/* Premier défilement */}
                    <motion.div
                        initial={{ x: "0%" }}
                        animate={{ x: "-100%" }}
                        transition={{
                            repeat: Infinity,
                            duration: 60, // Ajustez la vitesse
                            ease: "linear"
                        }}
                        className="flex whitespace-nowrap gap-8 items-center pr-8"
                    >
                        {[
                            {
                                text: "URGENCE : DANGER IMMÉDIAT",
                                icon: AlertTriangle,
                                priority: "critical" as const
                            },
                            {
                                text: "Embouteillage critique",
                                icon: Car,
                                priority: "high" as const
                            },
                            {
                                text: "Panne d'électricité",
                                icon: Zap,
                                priority: "high" as const
                            },
                            {
                                text: "Érosion / Ravin",
                                icon: Mountain,
                                priority: "medium" as const
                            },
                            {
                                text: "Tas d'immondices",
                                icon: Trash2,
                                priority: "medium" as const
                            },
                            {
                                text: "Tuyau REGIDESO cassé",
                                icon: Droplet,
                                priority: "high" as const
                            },
                            {
                                text: "Feu de signalisation en panne",
                                icon: TrafficCone,
                                priority: "medium" as const
                            },
                            {
                                text: "Éclairage public défectueux",
                                icon: Lightbulb,
                                priority: "low" as const
                            },
                            {
                                text: "Nuisance sonore",
                                icon: Volume2,
                                priority: "low" as const
                            },
                            {
                                text: "Autres signalements",
                                icon: FileText,
                                priority: "low" as const
                            }
                        ].map((item, i) => (
                            <TickerItem
                                key={`first-${i}`}
                                text={item.text}
                                Icon={item.icon}
                                priority={item.priority}
                            />
                        ))}
                    </motion.div>

                    {/* Second défilement (pour continuité sans gap) */}
                    <motion.div
                        initial={{ x: "0%" }}
                        animate={{ x: "-100%" }}
                        transition={{
                            repeat: Infinity,
                            duration: 40,
                            ease: "linear"
                        }}
                        className="flex whitespace-nowrap gap-8 items-center pr-8"
                    >
                        {[
                            {
                                text: "URGENCE : DANGER IMMÉDIAT",
                                icon: AlertTriangle,
                                priority: "critical" as const
                            },
                            {
                                text: "Embouteillage critique",
                                icon: Car,
                                priority: "high" as const
                            },
                            {
                                text: "Panne d'électricité",
                                icon: Zap,
                                priority: "high" as const
                            },
                            {
                                text: "Érosion / Ravin",
                                icon: Mountain,
                                priority: "medium" as const
                            },
                            {
                                text: "Tas d'immondices",
                                icon: Trash2,
                                priority: "medium" as const
                            },
                            {
                                text: "Tuyau REGIDESO cassé",
                                icon: Droplet,
                                priority: "high" as const
                            },
                            {
                                text: "Feu de signalisation en panne",
                                icon: TrafficCone,
                                priority: "medium" as const
                            },
                            {
                                text: "Éclairage public défectueux",
                                icon: Lightbulb,
                                priority: "low" as const
                            },
                            {
                                text: "Nuisance sonore",
                                icon: Volume2,
                                priority: "low" as const
                            },
                            {
                                text: "Autres signalements",
                                icon: FileText,
                                priority: "low" as const
                            }
                        ].map((item, i) => (
                            <TickerItem
                                key={`first-${i}`}
                                text={item.text}
                                Icon={item.icon}
                                priority={item.priority}
                            />
                        ))}
                    </motion.div>
                </div>

                {/* Ligne décorative bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent" />
            </div>

            {/* ========================================
    HEADER DASHBOARD
    - Titre avec gradient
    - Badge stats animé
    - Breadcrumb (optionnel)
======================================== */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-6 border-b border-slate-800/50"
            >
                {/* ===== SECTION GAUCHE - Titre ===== */}
                <div className="space-y-2">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Home size={14} />
                        <ChevronRight size={12} />
                        <span className="text-slate-400 font-medium">Dashboard</span>
                    </div>

                    {/* Titre principal avec gradient */}
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-bold tracking-tight"
                    >
                        <span className="bg-linear-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                            KIN-ALERT
                        </span>
                        {" "}
                        <span className="bg-linear-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                            Live
                        </span>
                    </motion.h1>

                    {/* Sous-titre avec point live */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex items-center">
                            {/* Point pulsant */}
                            <span className="flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-lg shadow-green-500/50"></span>
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 font-medium">
                            Données en temps réel de la ville
                        </p>
                    </div>
                </div>

                {/* ===== SECTION DROITE - Stats ===== */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="hidden md:flex items-center gap-3"
                >
                    {/* Badge Stats Principal */}
                    <div className="relative group">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-green-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />

                        {/* Container */}
                        <div className="
                relative
                flex items-center gap-3
                bg-linear-to-r from-emerald-500/10 to-green-500/10
                hover:from-emerald-500/20 hover:to-green-500/20
                backdrop-blur-sm
                px-5 py-3
                rounded-2xl
                border border-emerald-500/30
                shadow-lg shadow-emerald-500/10
                transition-all duration-300
            ">
                            {/* Icône avec animation */}
                            <motion.div
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                    y: [0, -2, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="p-2 bg-emerald-500/20 rounded-xl"
                            >
                                <TrendingUp size={20} className="text-emerald-400" strokeWidth={2.5} />
                            </motion.div>

                            {/* Texte stats */}
                            <div className="flex flex-col">
                                <span className="text-xs text-emerald-400/80 font-medium uppercase tracking-wider">
                                    Activité
                                </span>
                                <motion.span
                                    key={24} // Change si valeur dynamique
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-lg font-bold text-emerald-400"
                                >
                                    +24%
                                </motion.span>
                            </div>

                            {/* Indicateur variation */}
                            <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-lg">
                                <ArrowUp size={14} className="text-emerald-400" />
                                <span className="text-xs font-bold text-emerald-400">12</span>
                            </div>
                        </div>
                    </div>

                    {/* Badge secondaire (Bouton de rafraîchissement) */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefresh}
                        disabled={loading}
                        className="
        p-3
        bg-slate-800/50
        hover:bg-slate-800/80
        backdrop-blur-sm
        rounded-xl
        border border-slate-700/50
        hover:border-slate-600
        transition-all duration-300
        cursor-pointer
        group
        disabled:opacity-50
    "
                    >
                        <RefreshCw
                            size={18}
                            className={`text-slate-400 group-hover:text-white transition-colors ${loading
                                    ? "animate-spin text-white"
                                    : "group-hover:rotate-180 duration-500"
                                }`}
                        />
                    </motion.button>
                </motion.div>
            </motion.div>


            {/* 2. STATS CARDS GRID (Maintenant 7 cartes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Ligne 1 */}
                <StatCard title="Total Incidents" value={data?.stats.incidents_total} icon={<AlertCircle className="text-amber-500" />} color="border-amber-500" />
                <StatCard title="En Attente" value={data?.stats.incidents_pending} icon={<ShieldAlert className="text-red-500" />} color="border-red-500" />
                <StatCard title="Validés" value={data?.stats.incidents_validated} icon={<CheckCircle className="text-emerald-500" />} color="border-emerald-500" />
                <StatCard title="Gestionnaires" value={data?.stats.gestionnaires_total} icon={<Users className="text-indigo-500" />} color="border-indigo-500" />

                {/* Ligne 2 */}
                <StatCard title="Rejetés" value={data?.stats.incidents_rejected} icon={<AlertCircle className="text-rose-500" />} color="border-rose-500" />
                <StatCard title="Supprimés" value={data?.stats.incidents_deleted} icon={<BarChart3 className="text-slate-500" />} color="border-slate-500" />
                <StatCard title="Citoyens" value={data?.stats.users_total} icon={<Users className="text-blue-500" />} color="border-blue-500" />

                {/* Case vide ou Carte de bienvenue pour équilibrer la grille sur PC */}
                <div className="hidden lg:flex p-6 rounded-4xl bg-linear-to-br from-red-600 to-red-800 text-white items-center justify-center text-center">
                    <p className="font-bold">KIN-ALERT<br />Admin Panel v1.0</p>
                </div>
            </div>

            {/* 3. GRAPHIQUE PRINCIPAL */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Évolution des Incidents</h3>
                    <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm p-2 outline-none">
                        <option>6 derniers mois</option>
                    </select>
                </div>
                <IncidentChart data={data?.charts.incidents_by_month ?? []} />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 4. TOP COMMUNES */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-2"><MapPin className="text-red-500" /> Communes les plus actives</h3>
                    <div className="space-y-6">
                        {(data?.charts.top_communes ?? []).map((commune: { nom: string, total: number }, index: number) => (
                            <div key={index} className="group">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-semibold group-hover:text-red-500 transition-colors">{commune.nom}</span>
                                    <span className="text-slate-500 font-mono">{commune.total}</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(commune.total / (data?.charts.top_communes[0]?.total || 1)) * 100}%` }}
                                        transition={{ duration: 1, ease: "circOut" }}
                                        className="h-full bg-linear-to-r from-red-600 to-orange-500 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 5. RÉPARTITION PAR TYPE */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-2"><BarChart3 className="text-blue-500" /> Nature des Incidents</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {(data?.charts.incidents_by_type ?? []).slice(0, 6).map((type: { titre: string, total: number }, index: number) => (
                            <div key={index} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform">
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{type.titre}</p>
                                <p className="text-2xl font-black">{type.total}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

// COMPOSANT INTERNE (Toujours après la fonction principale ou dans un autre fichier)
interface StatCardProps {
    title: string;
    value?: number;
    icon: React.ReactNode;
    color: string;
}

// Modifie le composant StatCard en bas de ton fichier page.tsx

function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <motion.div
            variants={itemVariants}
            // --- EFFETS DE SURVOL PREMIUM ---
            whileHover={{
                y: -8, // La carte monte de 8 pixels
                scale: 1.02, // La carte grandit très légèrement
                transition: { duration: 0.2, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.98 }} // Effet d'enfoncement quand on clique
            className={`
                relative overflow-hidden group
                bg-white dark:bg-slate-900 
                p-6 rounded-4xl border-2 border-transparent
                hover:border-${color.split('-')[1]}-500/50 
                shadow-sm hover:shadow-xl hover:shadow-${color.split('-')[1]}-500/10
                transition-all duration-300 flex items-center justify-between
                cursor-pointer
            `}
        >
            {/* Petit effet de reflet brillant en arrière-plan au survol */}
            <div className="absolute -inset-x-full inset-y-0 z-0 w-1/2 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-shine" />

            <div className="relative z-10">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">{title}</p>
                <motion.p
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="text-4xl font-black mt-1 dark:text-white"
                >
                    {value ?? 0}
                </motion.p>
            </div>

            <motion.div
                // L'icône tourne légèrement au survol
                whileHover={{ rotate: 15, scale: 1.2 }}
                className={`relative z-10 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-colors group-hover:bg-${color.split('-')[1]}-500/10`}
            >
                {icon}
            </motion.div>
        </motion.div>
    );
}