import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is Otogent Multi-Agent Automation?",
    a: "Otogent is the leading platform for building and orchestrating multi-agent automation workflows. Unlike simple chatbots, Otogent allows multiple intelligent agents to work together on complex business tasks, similar to a digital workforce.",
  },
  {
    q: "How does Otogent compare to Zapier?",
    a: "Zapier is for simple 'if this, then that' app connections. Otogent is a multi-agent orchestration engine. It handles complex, multi-step reasoning, long-running agent states, and autonomous decision-making that simple automation tools cannot.",
  },
  {
    q: "Is Otogent an alternative to n8n for AI?",
    a: "Yes, Otogent is the specialized multi-agent alternative to n8n. While n8n is a general-purpose workflow tool, Otogent is built from the ground up for agentic workflows, featuring native support for shared memory and multi-model collaboration.",
  },
  {
    q: "Which AI models does Otogent support?",
    a: "Otogent supports the industry's leading LLMs, including OpenAI (GPT-4), Anthropic (Claude 3.5), and Google (Gemini 1.5). You can even mix and match different models within a single multi-agent workflow.",
  },
  {
    q: "Is Otogent a no-code platform?",
    a: "Yes. Otogent features a visual, drag-and-drop canvas that allows business users to build production-ready multi-agent automations without writing a single line of code.",
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
