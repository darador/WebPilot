import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Propuesta Conceptual Web • WebPilot AI',
  description: 'Muestra preliminar de diseño web y presencia digital profesional creada por el agente Bruno.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
        />
      </head>
      <div className="demo-public-wrapper min-h-screen bg-[#FAF9F5] text-slate-800 font-sans antialiased selection:bg-[#5E2750] selection:text-white">
        {children}
      </div>
    </>
  );
}
