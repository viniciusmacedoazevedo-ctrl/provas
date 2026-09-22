"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { exigirPapel } from "@/lib/permissoes";
import { gerarHashSenha } from "@/lib/senha";

const papeis = ["ADMIN", "PROFESSOR", "ALUNO"] as const;

const usuarioSchema = z.object({
  nome: z.string().trim().min(2, "Informe um nome com pelo menos 2 letras."),
  email: z.string().trim().email("Informe um e-mail válido."),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
  papel: z.enum(papeis, { message: "Selecione um papel válido." }),
});

async function contarAdmins() {
  return prisma.usuario.count({ where: { papel: "ADMIN" } });
}

export async function criarUsuario(
  _estadoAnterior: string | undefined,
  formData: FormData,
) {
  await exigirPapel("ADMIN");

  const dados = usuarioSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    papel: formData.get("papel"),
  });
  if (!dados.success) {
    return dados.error.issues[0]?.message ?? "Dados inválidos.";
  }

  try {
    await prisma.usuario.create({
      data: {
        nome: dados.data.nome,
        email: dados.data.email,
        senhaHash: await gerarHashSenha(dados.data.senha),
        papel: dados.data.papel,
      },
    });
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      return "Este e-mail já está cadastrado.";
    }
    throw erro;
  }

  revalidatePath("/painel/usuarios");
}

export async function alterarPapelUsuario(
  id: string,
  novoPapel: (typeof papeis)[number],
): Promise<{ erro?: string }> {
  await exigirPapel("ADMIN");

  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) {
    return { erro: "Usuário não encontrado." };
  }

  if (usuario.papel === "ADMIN" && novoPapel !== "ADMIN") {
    const totalAdmins = await contarAdmins();
    if (totalAdmins <= 1) {
      return {
        erro: "Não é possível remover o único administrador do sistema.",
      };
    }
  }

  await prisma.usuario.update({ where: { id }, data: { papel: novoPapel } });
  revalidatePath("/painel/usuarios");
  return {};
}

export async function excluirUsuario(id: string): Promise<{ erro?: string }> {
  const usuarioLogado = await exigirPapel("ADMIN");

  if (usuarioLogado.id === id) {
    return { erro: "Você não pode excluir a sua própria conta." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) {
    return { erro: "Usuário não encontrado." };
  }

  if (usuario.papel === "ADMIN") {
    const totalAdmins = await contarAdmins();
    if (totalAdmins <= 1) {
      return {
        erro: "Não é possível excluir o único administrador do sistema.",
      };
    }
  }

  try {
    await prisma.usuario.delete({ where: { id } });
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2003"
    ) {
      return {
        erro:
          "Este usuário tem disciplinas, questões, provas ou tentativas vinculadas e não pode ser excluído.",
      };
    }
    throw erro;
  }

  revalidatePath("/painel/usuarios");
  return {};
}
