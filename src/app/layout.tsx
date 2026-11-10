import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebPilot AI — Agency Automation Engine',
  description: 'Plataforma interna para gestión de agencia web automatizada mediante inteligencia artificial.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
