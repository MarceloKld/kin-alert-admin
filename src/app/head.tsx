export default function Head() {
    return (
        <>
            <link rel="manifest" href="/manifest.webmanifest" />
            <meta name="theme-color" content="#0B0F19" />

            {/* Icône monochrome pour Safari pinned tab (et style “premium” onglet) */}
            <link rel="mask-icon" href="/icons/kin-alert-mark.svg" color="#0B0F19" />
        </>
    );
}