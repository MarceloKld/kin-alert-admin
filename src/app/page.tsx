import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirection automatique vers le login
  redirect('/login');
}