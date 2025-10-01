import ContactForm from '@/components/contact/ContactForm';
import { Button } from '@/components/ui/button';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { Instagram, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="bg-background">
      <div className="container py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight">
              Contáctanos
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              ¿Tienes alguna pregunta o un proyecto en mente? Nos encantaría saber de ti.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-24 items-start">
            <div className="space-y-8" style={{ paddingRight: "20px" }}>
              <h2 className="font-headline text-2xl">Envíanos un mensaje</h2>
              <ContactForm />
            </div>
            <div className="space-y-8" style={{ paddingLeft: "20px" }}>
              <h2 className="font-headline text-2xl">O encuéntranos en redes</h2>
              <p className="text-muted-foreground">
                Para una respuesta más rápida o para ver nuestras últimas creaciones, síguenos en nuestras redes sociales.
              </p>
              <p className="text-muted-foreground" style={{ paddingBottom: "20px" }}>
              </p>
              <div className="flex flex-col space-y-4">
                <Button asChild size="lg" variant="outline">
                  <Link href="#">
                    <MessageCircle className="mr-3 h-5 w-5" />
                    Chatea en WhatsApp
                  </Link>
                </Button>
                 <Button asChild size="lg" variant="outline">
                  <Link href="#">
                    <Instagram className="mr-3 h-5 w-5" />
                    Síguenos en Instagram
                  </Link>
                </Button>
                 <Button asChild size="lg" variant="outline">
                  <Link href="#">
                    <TikTokIcon className="mr-3 h-5 w-5" />
                    Mira nuestros videos en TikTok
                  </Link>
                </Button>
              </div>
            </div>
          </div>
            {/* Financial Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-3 mb-3">
              {/* Ingreso por Productos */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="tracking-tight text-sm font-medium">Ingreso por Productos</div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign h-4 w-4 text-muted-foreground"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right h-4 w-4 text-muted-foreground"><path d="m9 18 6-6-6-6"></path></svg>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold text-gray-600">$0</div>
                </div>
              </div>
              {/* Movimientos Monetarios */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="tracking-tight text-sm font-medium">Movimientos Monetarios</div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right h-4 w-4 text-muted-foreground"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right h-4 w-4 text-muted-foreground"><path d="m9 18 6-6-6-6"></path></svg>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold text-gray-600">$0</div>
                </div>
              </div>
              {/* Costos Fijos */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="tracking-tight text-sm font-medium">Costos Fijos</div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building h-4 w-4 text-muted-foreground"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right h-4 w-4 text-muted-foreground"><path d="m9 18 6-6-6-6"></path></svg>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold text-gray-600">$-0</div>
                </div>
              </div>
              {/* Extracción de Sueldos */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="tracking-tight text-sm font-medium">Extracción de Sueldos</div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right h-4 w-4 text-muted-foreground"><path d="m9 18 6-6-6-6"></path></svg>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold text-gray-600">$-0</div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
