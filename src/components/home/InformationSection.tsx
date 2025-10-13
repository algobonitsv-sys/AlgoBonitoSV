
"use client";

import { useEffect, useState } from "react";
import { Truck, MapPin, Shield, CreditCard, Landmark, HandCoins, HelpCircle } from "lucide-react";
import Faq from "./Faq";
import { productApi } from "@/lib/api";

type ShippingMethod = {
  id: string;
  title: string;
  description: string;
  icon_name?: string;
  display_order: number;
};

const DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: '1',
    title: 'Envíos a todo el país',
    description: 'Entregas en todo El Salvador en 3-5 días hábiles. Costo de envío estándar de Consultar cotización. Envío gratis a sucursal comprando $70000 o más!.',
    icon_name: 'Truck',
    display_order: 1,
  },
  {
    id: '2',
    title: 'Envíos a la zona',
    description: 'Hacemos envíos a la zona a través de Transporte Morteros, o comisionistas a coordinar. No dudes en consultarme 🦋',
    icon_name: 'MapPin',
    display_order: 2,
  },
  {
    id: '3',
    title: 'Empaque Seguro',
    description: 'Tus joyas viajan seguras. No te preocupes 🫶🏻',
    icon_name: 'Shield',
    display_order: 3,
  },
];

const DEFAULT_PAYMENT_METHODS = [
  "Tarjetas de crédito/débito (pago en línea seguro)",
  "Transferencia bancaria (Banco Agrícola, BAC)",
  "Pago contra entrega (disponible en San Salvador)"
];

export default function InformationSection() {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(DEFAULT_SHIPPING_METHODS);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(DEFAULT_PAYMENT_METHODS);

  useEffect(() => {
    let isMounted = true;
    const fetchShippingAndPayment = async () => {
      try {
        // Fetch shipping methods from the new table
        const shippingRes = await productApi.shippingMethods.getAll();
        if (shippingRes?.data && isMounted) {
          setShippingMethods(shippingRes.data);
        }

        // Fetch payment methods from about_content
        const paymentRes = await productApi.aboutContent.getBySection("payment");
        if (paymentRes?.data?.extra_data?.methods && isMounted) {
          setPaymentMethods(paymentRes.data.extra_data.methods);
        }
      } catch (error) {
        // fallback to defaults
      }
    };
    fetchShippingAndPayment();
    return () => { isMounted = false; };
  }, []);

  // Function to get icon component based on icon_name
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Truck':
        return Truck;
      case 'MapPin':
        return MapPin;
      case 'Shield':
        return Shield;
      default:
        return Truck;
    }
  };

  return (
    <section className="pt-0 pb-10 sm:pb-16 bg-background">
      <div className="container py-10 sm:py-16">
        <div className="grid md:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-start">
          <div className="space-y-10 sm:space-y-12">
            <div>
              <h3 className="font-headline flex items-center text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                <Truck className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground/80" />
                Detalles de Envío
              </h3>
              <div className="space-y-4 sm:space-y-5 text-muted-foreground text-sm sm:text-base leading-relaxed">
                {shippingMethods.map((method) => {
                  const IconComponent = getIcon(method.icon_name);
                  return (
                    <div key={method.id} className="flex items-start">
                      <IconComponent className="mr-3 mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground/60 flex-shrink-0" />
                      <div>
                        <p><strong>{method.title}:</strong> {method.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-headline flex items-center text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                <CreditCard className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground/80" />
                Métodos de Pago
              </h3>
              <ul className="space-y-2.5 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
                {paymentMethods.map((method, idx) => (
                  <li key={method} className="flex items-start">
                    {idx === 0 && <CreditCard className="mr-3 mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground/60" />}
                    {idx === 1 && <Landmark className="mr-3 mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground/60" />}
                    {idx === 2 && <HandCoins className="mr-3 mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground/60" />}
                    {method}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <h3 className="font-headline flex items-center text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              <HelpCircle className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground/80" />
              Preguntas Frecuentes
            </h3>
            <Faq />
          </div>
        </div>
      </div>
    </section>
  );
}
