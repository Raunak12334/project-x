import Image from "next/image";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Integrations", href: "/signup" },
      { label: "Changelog", href: "/signup" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/#how-it-works" },
      { label: "Tutorials", href: "/#faqs" },
      { label: "Blog", href: "/blog" },
      { label: "Community", href: "/signup" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#features" },
      { label: "Careers", href: "/signup" },
      { label: "Contact", href: "mailto:hello@otogent.com" },
      { label: "Privacy Policy", href: "/signup" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-16">
      <div className="container">
        <div className="grid items-start gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="self-start">
            <div className="mb-3 flex items-center gap-2.5">
              <Image src="/logo.svg" alt="Otogent" width={24} height={24} />
              <span className="font-brand text-xl font-bold">
                oto<span className="text-primary">gent</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Infrastructure for multi-agent systems. Connect, orchestrate, and
              scale AI agents.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="self-start">
              <h4 className="text-sm font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Otogent. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
