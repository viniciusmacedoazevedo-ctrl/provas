import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <nav className="flex flex-wrap gap-4 text-sm">
          {itensNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            {session.user.name} · {session.user.papel}
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
