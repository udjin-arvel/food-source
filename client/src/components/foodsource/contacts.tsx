import { Globe, Mail, Phone, User } from "lucide-react";
import type { Supplier } from "@/lib/api/types";
import { NoData } from "./no-data";

export function ContactList({ supplier: s }: { supplier: Supplier }) {
  const rows = [
    { icon: User, label: "Контакт", value: s.contact_name, href: null },
    {
      icon: Phone,
      label: "Телефон",
      value: s.contact_phone,
      href: s.contact_phone ? `tel:${s.contact_phone.replace(/[^\d+]/g, "")}` : null,
    },
    {
      icon: Mail,
      label: "Email",
      value: s.contact_email,
      href: s.contact_email ? `mailto:${s.contact_email}` : null,
    },
    {
      icon: Globe,
      label: "Сайт",
      value: s.website,
      href: s.website ? `https://${s.website.replace(/^https?:\/\//, "")}` : null,
    },
  ];
  return (
    <ul className="space-y-2.5">
      {rows.map(({ icon: Icon, label, value, href }) => (
        <li key={label} className="flex items-center gap-3 text-sm">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-secondary">
            <Icon className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">{label}</span>
            {value ? (
              href ? (
                <a
                  href={href}
                  target={label === "Сайт" ? "_blank" : undefined}
                  rel="noreferrer"
                  className="block truncate font-medium underline decoration-primary decoration-2 underline-offset-4 hover:decoration-foreground"
                >
                  {value}
                </a>
              ) : (
                <span className="block truncate font-medium">{value}</span>
              )
            ) : (
              <NoData />
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
