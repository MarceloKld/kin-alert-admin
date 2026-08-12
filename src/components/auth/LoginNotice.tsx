"use client";

import { useSearchParams } from "next/navigation";

export default function LoginNotice() {
    const sp = useSearchParams();
    const reason = sp.get("reason");

    if (reason !== "auth") return null;

    return (
        <div
            style={{
                marginBottom: 12,
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(11,15,25,.65)",
            }}
        >
            Veuillez vous connecter pour continuer.
        </div>
    );
}