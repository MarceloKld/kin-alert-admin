import { toast } from "sonner";
import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";

/**
 * Pourquoi ce fichier ? 
 * En tant que professeur, je te conseille de centraliser tes appels UI. 
 * Si demain tu changes de couleur d'accent, tu le fais ici une seule fois.
 */

export const showToast = {
    success: (message: string) => {
        toast.success(message, {
            icon: <CheckCircle className="text-emerald-500 w-5 h-5" />,
            // Style spécifique pour le succès
            actionButtonStyle: { background: '#10b981' }
        });
    },

    error: (message: string) => {
        toast.error(message, {
            icon: <XCircle className="text-[#FF2424] w-5 h-5" />,
        });
    },

    warning: (message: string) => {
        toast.warning(message, {
            icon: <AlertCircle className="text-amber-500 w-5 h-5" />,
        });
    },

    info: (message: string) => {
        toast.info(message, {
            icon: <Info className="text-blue-500 w-5 h-5" />,
        });
    }
};