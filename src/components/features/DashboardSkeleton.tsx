"use client";

export const DashboardSkeleton = () => {
    return (
        <div className="p-4 md:p-8 space-y-8 animate-pulse">
            {/* Skeleton des 4 cartes du haut */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                ))}
            </div>

            {/* Skeleton de la grande zone graphique */}
            <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />

            {/* Skeleton des deux colonnes du bas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            </div>
        </div>
    );
};