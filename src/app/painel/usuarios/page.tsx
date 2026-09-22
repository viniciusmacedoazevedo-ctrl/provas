import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormularioNovoUsuario } from "./formulario-novo-usuario";
import { SeletorPapelUsuario } from "./seletor-papel-usuario";
import { BotaoExcluirUsuario } from "./botao-excluir-usuario";

export default async function PaginaUsuarios() {
  const session = await auth();

  if (session?.user.papel !== "ADMIN") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usuários e Permissões</CardTitle>
          <CardDescription>
            Acesso restrito a administradores.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const usuarios = await prisma.usuario.findMany({
    orderBy: { criadoEm: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <FormularioNovoUsuario />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y">
            {usuarios.map((usuario) => (
              <li
                key={usuario.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium">
                    {usuario.nome}
                    {usuario.id === session.user.id && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (você)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {usuario.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SeletorPapelUsuario
                    id={usuario.id}
                    papelAtual={usuario.papel}
                  />
                  <BotaoExcluirUsuario
                    id={usuario.id}
                    desabilitado={usuario.id === session.user.id}
                  />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
