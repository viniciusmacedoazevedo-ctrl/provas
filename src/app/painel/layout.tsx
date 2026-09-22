import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

const itensNav = [
  { href: "/painel", label: "Início" },
  { href: "/painel/disciplinas", label: "Disciplinas" },
  { href: "/painel/assuntos", label: "Assuntos" },
  { href: "/painel/questoes", label: "Banco de Questões" },
  { href: "/painel/provas", label: "Provas" },
  { href: "/painel/usuarios", label: "Usuários" },
];

export default async function LayoutPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-b bg-card/80 px-6 py-3 backdrop-blur">
        <Link href="/painel">
          <Logo tamanhoIcone={18} />
        </Link>
        <nav className="flex flex-1 flex-wrap gap-4 text-sm">
          {itensNav.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            {session.user.name} ·{" "}
            <span className="font-medium text-secondary-foreground">
              {session.user.papel}
            </span>
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              Sair
            </Button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
