
"use client";

import { useEffect, useState } from "react";
import { CreditCard, Truck, Landmark, HandCoins, HelpCircle } from "lucide-react";
import Faq from "./Faq";
import { productApi } from "@/lib/api";

type ShippingDetails = {
  national: {
    title: string;
    delivery_time: string;
    cost: string;
    packaging: string;
  };
  international: {
    title: string;
    description: string;
  };
};

const DEFAULT_SHIPPING: ShippingDetails = {
  national: {
    title: "Envíos Nacionales (El Salvador)",
    delivery_time: "2-3 días hábiles",
    cost: "$3.50 tarifa estándar",
    packaging: "Tus joyas viajan seguras en nuestro empaque de regalo"
  },
  international: {
    title: "Envíos Internacionales",
    description: "¿Vives fuera de El Salvador? ¡No hay problema! Contáctanos directamente por WhatsApp para cotizar tu envío a cualquier parte del mundo."
  }
};

const DEFAULT_PAYMENT_METHODS = [
  "Tarjetas de crédito/débito (pago en línea seguro)",
  "Transferencia bancaria (Banco Agrícola, BAC)",
  "Pago contra entrega (disponible en San Salvador)"
];

export default function InformationSection() {
  const [shipping, setShipping] = useState<ShippingDetails>(DEFAULT_SHIPPING);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(DEFAULT_PAYMENT_METHODS);

  useEffect(() => {
    let isMounted = true;
    const fetchShippingAndPayment = async () => {
      try {
        const shippingRes = await productApi.aboutContent.getBySection("shipping");
        if (shippingRes?.data?.extra_data && isMounted) {
          setShipping({
            national: {
              title: shippingRes.data.extra_data.national?.title || DEFAULT_SHIPPING.national.title,
              delivery_time: shippingRes.data.extra_data.national?.delivery_time || DEFAULT_SHIPPING.national.delivery_time,
              cost: shippingRes.data.extra_data.national?.cost || DEFAULT_SHIPPING.national.cost,
              packaging: shippingRes.data.extra_data.national?.packaging || DEFAULT_SHIPPING.national.packaging,
            },
            international: {
              title: shippingRes.data.extra_data.international?.title || DEFAULT_SHIPPING.international.title,
              description: shippingRes.data.extra_data.international?.description || DEFAULT_SHIPPING.international.description,
            }
          });
        }
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
              <div className="space-y-3 sm:space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p><strong>{shipping.national.title}:</strong> Entregas en todo El Salvador en {shipping.national.delivery_time}. Costo de envío estándar de {shipping.national.cost}.</p>
                <p><strong>{shipping.international.title}:</strong> {shipping.international.description}</p>
                <p><strong>Empaque Seguro:</strong> {shipping.national.packaging}</p>
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
