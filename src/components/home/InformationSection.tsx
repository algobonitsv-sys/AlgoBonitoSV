import { CreditCard, Truck, Landmark, HandCoins, HelpCircle } from "lucide-react";
import Faq from "./Faq";

export default function InformationSection() {
  return (
    <section className="pt-0 pb-12 sm:pb-16 bg-background">
      <div className="container py-12 sm:py-16">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="space-y-12">
            <div>
              <h3 className="font-headline flex items-center text-2xl font-semibold mb-4">
                <Truck className="mr-3 h-6 w-6 text-primary-foreground/80" />
                Detalles de Envío
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <p><strong>Envíos Nacionales:</strong> Entregas en todo El Salvador en 2-3 días hábiles. Costo de envío estándar de $3.50.</p>
                <p><strong>Envíos Internacionales:</strong> Contáctanos para cotizar tu envío a cualquier parte del mundo. Los tiempos y costos varían según el destino.</p>
                <p><strong>Empaque Seguro:</strong> Todas tus joyas se envían en un empaque seguro y elegante para garantizar que lleguen en perfectas condiciones.</p>
              </div>
            </div>

            <div>
              <h3 className="font-headline flex items-center text-2xl font-semibold mb-4">
                <CreditCard className="mr-3 h-6 w-6 text-primary-foreground/80" />
                Métodos de Pago
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center"><CreditCard className="mr-3 h-5 w-5 text-accent-foreground/60" /> Tarjetas de crédito/débito (pago en línea seguro).</li>
                <li className="flex items-center"><Landmark className="mr-3 h-5 w-5 text-accent-foreground/60" /> Transferencia bancaria (Banco Agrícola, BAC).</li>
                <li className="flex items-center"><HandCoins className="mr-3 h-5 w-5 text-accent-foreground/60" /> Pago contra entrega (disponible en San Salvador).</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="font-headline flex items-center text-2xl font-semibold mb-4">
              <HelpCircle className="mr-3 h-6 w-6 text-primary-foreground/80" />
              Preguntas Frecuentes
            </h3>
            <Faq />
          </div>
        </div>
      </div>
    </section>
  );
}
