import { Metadata } from 'next';
import CarteClient from '@/components/features/carte/CarteClient';

/* 
  ═══════════════════════════════════════════════════════════════
  🗺️ PAGE CARTE - Server Component (SEO + Metadata)
  ═══════════════════════════════════════════════════════════════
*/

export const metadata: Metadata = {
    title: 'Carte Interactive | KIN-ALERT',
    description: 'Visualisation géographique des incidents signalés à Kinshasa en temps réel'
};

export default function CartePage() {
    return <CarteClient />;
}