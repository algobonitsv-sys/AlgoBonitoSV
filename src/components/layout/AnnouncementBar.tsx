"use client";
import React from 'react';
import { Gem } from 'lucide-react';

const announcements = [
  'Tarjetas de Crédito / Débito',
  'Transferencia Bancaria',
  'Pago en Efectivo',
  'ENVÍO GRATIS desde $70.00',
  'Hecho con amor en El Salvador',
];

export default function AnnouncementBar() {
  const duplicatedAnnouncements = [...announcements, ...announcements];
  // Ref para obtener la altura real
  const barRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateHeight = (visible: boolean) => {
      if (barRef.current && visible) {
        const height = barRef.current.offsetHeight;
        document.body.style.setProperty('--announcement-bar-height', `${height}px`);
      } else {
        document.body.style.setProperty('--announcement-bar-height', '0px');
      }
    };
    let lastVisible = true;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        updateHeight(entry.isIntersecting);
        lastVisible = entry.isIntersecting;
      },
      { threshold: 0.01 }
    );
    if (barRef.current) {
      observer.observe(barRef.current);
      // Inicializa el valor
      updateHeight(true);
    }
    window.addEventListener('resize', () => updateHeight(lastVisible));
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', () => updateHeight(lastVisible));
      document.body.style.setProperty('--announcement-bar-height', '0px');
    };
  }, []);

  return (
    <div ref={barRef} className="bg-muted text-muted-foreground">
      <div className="relative flex overflow-x-hidden">
        <div className="py-2 animate-marquee whitespace-nowrap flex">
          {duplicatedAnnouncements.map((text, index) => (
            <span key={index} className="flex items-center mx-8 text-sm font-semibold">
              <Gem className="mr-2 h-4 w-4" style={{ color: '#E9DCC8' }} />
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
