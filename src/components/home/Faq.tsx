import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "¿Cuál es el tiempo de entrega de los pedidos?",
    answer:
      "Para envíos nacionales, el tiempo de entrega es de 2 a 3 días hábiles. Para envíos internacionales, el tiempo varía según el destino. Te proporcionaremos un número de seguimiento para que puedas rastrear tu pedido.",
  },
  {
    question: "¿Tienen política de devoluciones?",
    answer:
      "Sí, aceptamos devoluciones dentro de los 7 días posteriores a la recepción del pedido, siempre que el producto no haya sido usado y se encuentre en su empaque original. Contáctanos para iniciar el proceso de devolución.",
  },
  {
    question: "¿Cómo cuido mis joyas?",
    answer:
      "Recomendamos guardar tus joyas en un lugar seco, evitar el contacto con productos químicos como perfumes y limpiarlas regularmente con un paño suave. Consulta nuestra sección de 'Materiales' para cuidados específicos.",
  },
  {
    question: "¿Ofrecen garantía?",
    answer:
      "Ofrecemos una garantía de 30 días por defectos de fabricación. La garantía no cubre el desgaste normal, la pérdida o el daño por mal uso.",
  },
  {
    question: "¿Puedo personalizar una pieza?",
    answer:
      "¡Claro! Nos encanta crear piezas únicas. Contáctanos a través de WhatsApp o Instagram para discutir tus ideas y te haremos una cotización.",
  },
];

export default function Faq() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqItems.map((item, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
