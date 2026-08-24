import SettingsClient from "./SettingsClient";

export const metadata = {
    title: "Paramètres | KIN ALERT ADMIN",
};

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <SettingsClient />
        </div>
    );
}