'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { CreditCard, Truck, Gem, ShieldCheck, Gift } from "lucide-react";
import { api } from '@/lib/api/products';
import type { AboutContent } from '@/types/database';

export default function AboutPage() {
  const [aboutSections, setAboutSections] = useState<AboutContent[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos fallback por si no hay contenido en admin
  const fallbackData = {
    hero: {
      title: 'Sobre Nosotros',
      subtitle: 'Conoce la historia detrás de cada joya.',
    },
    mission: {
      title: 'Nuestra Misión',
      content: 'En Algo Bonito SV, creemos que la joyería es más que un simple accesorio; es una forma de expresión, un recuerdo y una celebración de los momentos especiales de la vida. Nacimos en el corazón de El Salvador con la misión de crear piezas atemporales y de alta calidad que te acompañen en tu día a día.\n\nCada una de nuestras joyas es diseñada y elaborada con una meticulosa atención al detalle, utilizando materiales nobles como el oro, la plata de ley y piedras preciosas. Nos inspiramos en la belleza de lo simple y en la elegancia de lo minimalista para ofrecerte diseños que perduren en el tiempo.\n\nSomos más que una marca; somos una comunidad de amantes de la belleza y el buen gusto. Gracias por ser parte de nuestra historia.',
      image_url: 'https://picsum.photos/600/800'
    },
    shipping: {
      title: 'Envíos a todo el país y más allá',
      subtitle: 'Llevamos nuestras joyas hasta la puerta de tu casa. Rápido, seguro y con el cuidado que tus piezas merecen.',
      background_image_url: 'https://picsum.photos/1200/400?v=60',
      extra_data: {
        national: {
          title: 'Envíos Nacionales (El Salvador)',
          delivery_time: '2-3 días hábiles',
          cost: '$3.50 tarifa estándar',
          packaging: 'Tus joyas viajan seguras en nuestro empaque de regalo'
        },
        international: {
          title: 'Envíos Internacionales',
          description: '¿Vives fuera de El Salvador? ¡No hay problema! Contáctanos directamente por WhatsApp para cotizar tu envío a cualquier parte del mundo.'
        }
      }
    },
    payment: {
      title: 'Paga con total seguridad y comodidad',
      subtitle: 'Ofrecemos múltiples métodos de pago para que elijas el que mejor se adapte a ti. Todas las transacciones son 100% seguras.',
      background_image_url: 'https://picsum.photos/1200/400?v=61',
      extra_data: {
        methods: [
          'Tarjetas de Crédito/Débito',
          'Transferencia Bancaria',
          'Pago Contra Entrega (San Salvador)'
        ]
      }
    },
    returns: {
      title: 'Tu satisfacción es nuestra prioridad',
      subtitle: 'Queremos que ames tus joyas. Si por alguna razón no estás completamente satisfecha, te facilitamos el proceso de cambio o devolución.',
      background_image_url: 'https://picsum.photos/1200/400?v=62',
      extra_data: {
        policy: {
          title: 'Política de Cambios y Devoluciones',
          rules: [
            'Tienes 7 días desde que recibes tu pedido para solicitar un cambio o devolución.',
            'La pieza debe estar en perfectas condiciones, sin uso y en su empaque original.',
            'Los costos de envío para devoluciones corren por cuenta del cliente, a menos que se trate de un defecto de fábrica.',
            'Para iniciar el proceso, simplemente contáctanos con tu número de orden.'
          ]
        }
      }
    }
  };

  useEffect(() => {
    const loadAboutContent = async () => {
      try {
        const response = await api.aboutContent.getAll();
        if (response.success && response.data) {
          setAboutSections(response.data);
        }
      } catch (error) {
        console.error('Error loading about content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAboutContent();
  }, []);

  const getSection = (type: string) => {
    const adminSection = aboutSections.find(section => section.section_type === type && section.is_active);
    return adminSection || (fallbackData[type as keyof typeof fallbackData] as any);
  };

  const heroSection = getSection('hero') as AboutContent;
  const missionSection = getSection('mission') as AboutContent;
  const shippingSection = getSection('shipping') as AboutContent;
  const paymentSection = getSection('payment') as AboutContent;
  const returnsSection = getSection('returns') as AboutContent;

  if (loading) {
    return (
      <div className="bg-background">
        <div className="container py-12 sm:py-16">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4 max-w-md mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded max-w-lg mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight">
            {heroSection?.title || 'Sobre Nosotros'}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            {heroSection?.subtitle || 'Conoce la historia detrás de cada joya.'}
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <Image 
              src={missionSection?.image_url || "https://picsum.photos/600/800"}
              alt="Fundadora de Algo Bonito SV"
              width={600}
              height={800}
              className="rounded-lg shadow-lg object-cover aspect-[3/4]"
            />
          </div>
          <div className="space-y-6 text-lg text-muted-foreground order-1 md:order-2">
            <h2 className="font-headline text-3xl text-foreground">
              {missionSection?.title || 'Nuestra Misión'}
            </h2>
            {missionSection?.content ? (
              missionSection.content.split('\n\n').map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <>
                <p>
                  En Algo Bonito SV, creemos que la joyería es más que un simple accesorio; es una forma de expresión, un recuerdo y una celebración de los momentos especiales de la vida. Nacimos en el corazón de El Salvador con la misión de crear piezas atemporales y de alta calidad que te acompañen en tu día a día.
                </p>
                <p>
                  Cada una de nuestras joyas es diseñada y elaborada con una meticulosa atención al detalle, utilizando materiales nobles como el oro, la plata de ley y piedras preciosas. Nos inspiramos en la belleza de lo simple y en la elegancia de lo minimalista para ofrecerte diseños que perduren en el tiempo.
                </p>
                <p>
                  Somos más que una marca; somos una comunidad de amantes de la belleza y el buen gusto. Gracias por ser parte de nuestra historia.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-12 py-12 sm:py-16">
        {/* Shipping Section */}
        <section className="relative py-20">
          <Image 
            src={shippingSection?.background_image_url || "https://picsum.photos/1200/400?v=60"}
            alt="Mapa de envíos"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="container relative text-white text-center">
            <Truck className="mx-auto h-16 w-16 mb-4" />
            <h2 className="font-headline text-4xl font-bold mb-4">
              {shippingSection?.title || 'Envíos a todo el país y más allá'}
            </h2>
            <p className="max-w-3xl mx-auto text-lg mb-6">
              {shippingSection?.subtitle || 'Llevamos nuestras joyas hasta la puerta de tu casa. Rápido, seguro y con el cuidado que tus piezas merecen.'}
            </p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-2">
                  {shippingSection?.extra_data?.national?.title || 'Envíos Nacionales (El Salvador)'}
                </h3>
                <p><strong>Tiempo de entrega:</strong> {shippingSection?.extra_data?.national?.delivery_time || '2-3 días hábiles'}</p>
                <p><strong>Costo:</strong> {shippingSection?.extra_data?.national?.cost || '$3.50 tarifa estándar'}</p>
                <p><strong>Empaque:</strong> {shippingSection?.extra_data?.national?.packaging || 'Tus joyas viajan seguras en nuestro empaque de regalo'}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-2">
                  {shippingSection?.extra_data?.international?.title || 'Envíos Internacionales'}
                </h3>
                <p>
                  {shippingSection?.extra_data?.international?.description || '¿Vives fuera de El Salvador? ¡No hay problema! Contáctanos directamente por WhatsApp para cotizar tu envío a cualquier parte del mundo.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Methods Section */}
        <section className="relative py-20">
          <Image 
            src={paymentSection?.background_image_url || "https://picsum.photos/1200/400?v=61"}
            alt="Métodos de pago seguros"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/70" />
          <div className="container relative text-primary-foreground text-center">
            <CreditCard className="mx-auto h-16 w-16 mb-4" />
            <h2 className="font-headline text-4xl font-bold mb-4">
              {paymentSection?.title || 'Paga con total seguridad y comodidad'}
            </h2>
            <p className="max-w-3xl mx-auto text-lg mb-6">
              {paymentSection?.subtitle || 'Ofrecemos múltiples métodos de pago para que elijas el que mejor se adapte a ti. Todas las transacciones son 100% seguras.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              {(paymentSection?.extra_data?.methods || ['Tarjetas de Crédito/Débito', 'Transferencia Bancaria', 'Pago Contra Entrega (San Salvador)']).map((method: string, index: number) => (
                <span key={index} className="bg-primary-foreground text-background py-2 px-4 rounded-full">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Returns Section */}
        <section className="relative py-20">
          <Image 
            src={returnsSection?.background_image_url || "https://picsum.photos/1200/400?v=62"}
            alt="Empaque de regalo"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="container relative text-white text-center">
            <Gift className="mx-auto h-16 w-16 mb-4" />
            <h2 className="font-headline text-4xl font-bold mb-4">
              {returnsSection?.title || 'Tu satisfacción es nuestra prioridad'}
            </h2>
            <p className="max-w-3xl mx-auto text-lg mb-6">
              {returnsSection?.subtitle || 'Queremos que ames tus joyas. Si por alguna razón no estás completamente satisfecha, te facilitamos el proceso de cambio o devolución.'}
            </p>
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg max-w-2xl mx-auto text-left">
              <h3 className="font-bold text-xl mb-3">
                {returnsSection?.extra_data?.policy?.title || 'Política de Cambios y Devoluciones'}
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                {(returnsSection?.extra_data?.policy?.rules || [
                  'Tienes 7 días desde que recibes tu pedido para solicitar un cambio o devolución.',
                  'La pieza debe estar en perfectas condiciones, sin uso y en su empaque original.',
                  'Los costos de envío para devoluciones corren por cuenta del cliente, a menos que se trate de un defecto de fábrica.',
                  'Para iniciar el proceso, simplemente contáctanos con tu número de orden.'
                ]).map((rule: string, index: number) => (
                  <li key={index}><strong>{rule}</strong></li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
