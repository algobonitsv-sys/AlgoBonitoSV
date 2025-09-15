import Image from "next/image";
import { CreditCard, Landmark, HandCoins } from "lucide-react";

const paymentMethods = [
    {
        icon: CreditCard,
        text: "Tarjetas de Crédito / Débito",
    },
    {
        icon: Landmark,
        text: "Transferencia Bancaria",
    },
    {
        icon: HandCoins,
        text: "Pago Contra Entrega",
    }
]

export default function PaymentMethods() {
  return (
    <section className="relative py-12 sm:py-16">
        <Image 
            src="https://picsum.photos/1200/400?v=63"
            alt="Fondo de métodos de pago"
            fill
            className="object-cover"
            data-ai-hint="jewelry background"
        />
        <div className="absolute inset-0 bg-black/50" />
      <div className="container relative">
        <div className="text-center mb-12 text-white">
          <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight">
            Métodos de Pago
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg">
            Paga de forma rápida y segura.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {paymentMethods.map((method, index) => (
                <div key={index} className="flex flex-col items-center gap-4 p-8 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <method.icon className="h-16 w-16 text-primary mb-2" />
                    <p className="text-lg font-medium text-white">{method.text}</p>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
