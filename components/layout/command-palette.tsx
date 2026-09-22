"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, CircleDollarSign, UserRound } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type SearchResults = {
  companies: { id: string; name: string; status: "prospect" | "client" }[];
  contacts: {
    id: string;
    name: string;
    email: string | null;
    companyId: string;
    companyName: string | null;
    companyStatus: "prospect" | "client" | null;
  }[];
  deals: {
    id: string;
    name: string;
    amount: string;
    companyId: string;
    companyName: string | null;
    companyStatus: "prospect" | "client" | null;
  }[];
};

function companyHref(id: string, status: "prospect" | "client") {
  return status === "client" ? `/clients/${id}` : `/prospects/${id}`;
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useQuery<SearchResults>({
    queryKey: ["global-search", debounced],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debounced)}`);
      if (!res.ok) throw new Error("Échec de la recherche");
      return res.json();
    },
    enabled: debounced.trim().length > 0,
  });

  function go(href: string) {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  }

  const hasResults =
    (data?.companies.length ?? 0) + (data?.contacts.length ?? 0) + (data?.deals.length ?? 0) > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder="Rechercher un contact, une entreprise ou un deal…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {debounced.trim().length === 0 && (
          <CommandEmpty>Commencez à taper pour rechercher.</CommandEmpty>
        )}
        {debounced.trim().length > 0 && !isFetching && !hasResults && (
          <CommandEmpty>Aucun résultat pour « {debounced} ».</CommandEmpty>
        )}

        {!!data?.companies.length && (
          <CommandGroup heading="Entreprises">
            {data.companies.map((c) => (
              <CommandItem key={c.id} onSelect={() => go(companyHref(c.id, c.status))}>
                <Building2 />
                {c.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {c.status === "client" ? "Client" : "Prospect"}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!!data?.contacts.length && (
          <CommandGroup heading="Contacts">
            {data.contacts.map((c) => (
              <CommandItem
                key={c.id}
                onSelect={() => go(companyHref(c.companyId, c.companyStatus ?? "prospect"))}
              >
                <UserRound />
                {c.name}
                <span className="ml-auto text-xs text-muted-foreground">{c.companyName}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!!data?.deals.length && (
          <CommandGroup heading="Deals">
            {data.deals.map((d) => (
              <CommandItem
                key={d.id}
                onSelect={() => go(companyHref(d.companyId, d.companyStatus ?? "prospect"))}
              >
                <CircleDollarSign />
                {d.name}
                <span className="ml-auto text-xs text-muted-foreground">{d.companyName}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
