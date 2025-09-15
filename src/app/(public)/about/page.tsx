import Image from "next/image";
import { CreditCard, Truck, Gem, ShieldCheck, Gift } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight">
            Sobre Nosotros
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Conoce la historia detrás de cada joya.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
                <Image 
                    src="https://picsum.photos/600/800"
                    alt="Fundadora de Algo Bonito SV"
                    width={600}
                    height={800}
                    className="rounded-lg shadow-lg object-cover aspect-[3/4]"
                    data-ai-hint="woman founder"
                />
            </div>
            <div className="space-y-6 text-lg text-muted-foreground order-1 md:order-2">
                <h2 className="font-headline text-3xl text-foreground">Nuestra Misión</h2>
                <p>
                    En Algo Bonito SV, creemos que la joyería es más que un simple accesorio; es una forma de expresión, un recuerdo y una celebración de los momentos especiales de la vida. Nacimos en el corazón de El Salvador con la misión de crear piezas atemporales y de alta calidad que te acompañen en tu día a día.
                </p>
                <p>
                    Cada una de nuestras joyas es diseñada y elaborada con una meticulosa atención al detalle, utilizando materiales nobles como el oro, la plata de ley y piedras preciosas. Nos inspiramos en la belleza de lo simple y en la elegancia de lo minimalista para ofrecerte diseños que perduren en el tiempo.
                </p>
                <p>
                    Somos más que una marca; somos una comunidad de amantes de la belleza y el buen gusto. Gracias por ser parte de nuestra historia.
                </p>
            </div>
        </div>
      </div>

      <div className="space-y-12 py-12 sm:py-16">
        {/* Shipping Section */}
        <section className="relative py-20">
            <Image 
                src="https://picsum.photos/1200/400?v=60"
                alt="Mapa de envíos"
                fill
                className="object-cover"
                data-ai-hint="world map"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="container relative text-white text-center">
                <Truck className="mx-auto h-16 w-16 mb-4" />
                <h2 className="font-headline text-4xl font-bold mb-4">Envíos a todo el país y más allá</h2>
                <p className="max-w-3xl mx-auto text-lg mb-6">Llevamos nuestras joyas hasta la puerta de tu casa. Rápido, seguro y con el cuidado que tus piezas merecen.</p>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                        <h3 className="font-bold text-xl mb-2">Envíos Nacionales (El Salvador)</h3>
                        <p><strong>Tiempo de entrega:</strong> 2-3 días hábiles.</p>
                        <p><strong>Costo:</strong> $3.50 tarifa estándar.</p>
                        <p><strong>Empaque:</strong> Tus joyas viajan seguras en nuestro empaque de regalo.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                        <h3 className="font-bold text-xl mb-2">Envíos Internacionales</h3>
                        <p>¿Vives fuera de El Salvador? ¡No hay problema! Contáctanos directamente por WhatsApp para cotizar tu envío a cualquier parte del mundo. </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Payment Methods Section */}
        <section className="relative py-20">
            <Image 
                src="https://picsum.photos/1200/400?v=61"
                alt="Métodos de pago seguros"
                fill
                className="object-cover"
                data-ai-hint="payment security"
            />
            <div className="absolute inset-0 bg-primary/70" />
            <div className="container relative text-primary-foreground text-center">
                <CreditCard className="mx-auto h-16 w-16 mb-4" />
                <h2 className="font-headline text-4xl font-bold mb-4">Paga con total seguridad y comodidad</h2>
                <p className="max-w-3xl mx-auto text-lg mb-6">Ofrecemos múltiples métodos de pago para que elijas el que mejor se adapte a ti. Todas las transacciones son 100% seguras.</p>
                <div className="flex flex-wrap justify-center gap-4 text-lg">
                    <span className="bg-primary-foreground text-background py-2 px-4 rounded-full">Tarjetas de Crédito/Débito</span>
                    <span className="bg-primary-foreground text-background py-2 px-4 rounded-full">Transferencia Bancaria</span>
                    <span className="bg-primary-foreground text-background py-2 px-4 rounded-full">Pago Contra Entrega (San Salvador)</span>
                </div>
            </div>
        </section>

        {/* Returns Section */}
        <section className="relative py-20">
            <Image 
                src="https://picsum.photos/1200/400?v=62"
                alt="Empaque de regalo"
                fill
                className="object-cover"
                data-ai-hint="gift box"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="container relative text-white text-center">
                <Gift className="mx-auto h-16 w-16 mb-4" />
                <h2 className="font-headline text-4xl font-bold mb-4">Tu satisfacción es nuestra prioridad</h2>
                <p className="max-w-3xl mx-auto text-lg mb-6">Queremos que ames tus joyas. Si por alguna razón no estás completamente satisfecha, te facilitamos el proceso de cambio o devolución.</p>
                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg max-w-2xl mx-auto text-left">
                    <h3 className="font-bold text-xl mb-3">Política de Cambios y Devoluciones</h3>
                    <ul className="space-y-2 list-disc list-inside">
                        <li>Tienes <strong>7 días</strong> desde que recibes tu pedido para solicitar un cambio o devolución.</li>
                        <li>La pieza debe estar en perfectas condiciones, sin uso y en su empaque original.</li>
                        <li>Los costos de envío para devoluciones corren por cuenta del cliente, a menos que se trate de un defecto de fábrica.</li>
                        <li>Para iniciar el proceso, simplemente contáctanos con tu número de orden.</li>
                    </ul>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
