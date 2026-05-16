import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is Otogent?",
    a: "Otogent is an AI workflow automation platform that helps teams build multi-agent systems where AI agents handle tasks, decisions, and execution across business workflows.",
  },
  {
    q: "How can I use Otogent?",
    a: "Otogent is an infrastructure platform for multi-agent systems. It provides connectors, orchestration, and shared state so your AI agents can work together — similar to how Zapier connects apps, but designed for autonomous agents.",
  },
  {
    q: "What can I automate with Otogent?",
    a: "You can automate lead management, follow-ups, reporting, internal approvals, data processing, customer operations, and other repeatable business workflows.",
  },
  {
    q: "Is Otogent a no-code automation platform?",
    a: "Yes. Otogent provides a visual workflow builder so users can create AI automation workflows without writing code.",
  },
  {
    q: "How is Otogent different from basic automation tools?",
    a: "Otogent is designed for multi-agent automation, where AI agents can work together to process information, make decisions, and execute workflows instead of only triggering simple app-to-app actions.",
  },
];

export function FAQSection() {
  return (
    <section id="faqs" className="bg-muted/50 py-24">
      <div className="container">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-[0.3em] text-primary uppercase">
            FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Frequently asked questions
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          className="mx-auto max-w-3xl space-y-3"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.q}
              value={`faq-${index}`}
              className="card-3d rounded-lg border border-border bg-card px-6"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
