import { test, expect, type Page } from "@playwright/test";

// Requer o banco populado pelo `npm run db:seed` (usuários de teste e a
// disciplina "Matemática"). Cada execução usa um sufixo único para não
// colidir com dados de execuções anteriores.
const sufixo = Date.now();

async function login(page: Page, email: string, senha: string) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="senha"]', senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/painel");
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Sair" }).click();
  await page.waitForURL("**/login");
}

test.describe.configure({ mode: "serial" });

test("professor cria questão e prova; aluno responde e recebe nota automática", async ({
  page,
}) => {
  const enunciado = `Quanto é 2 + 2? (${sufixo})`;
  const tituloProva = `Prova e2e ${sufixo}`;

  await login(page, "professor@provas.local", "123456");

  // criar questão de múltipla escolha
  await page.goto("/painel/questoes");
  await page.selectOption('select[name="disciplinaId"]', { label: "Matemática" });
  await page.fill("#enunciado", enunciado);
  const opcoes = page.locator('input[name="opcaoTexto"]');
  await opcoes.nth(0).fill("3");
  await opcoes.nth(1).fill("4");
  await page.locator('input[name="opcaoCorreta"][value="1"]').check();
  await page.getByRole("button", { name: "Salvar questão" }).click();
  await expect(page.getByText(enunciado)).toBeVisible();

  // criar prova
  await page.goto("/painel/provas");
  await page.fill("#titulo", tituloProva);
  await page.selectOption("#disciplinaId", { label: "Matemática" });
  await page.getByRole("button", { name: "Criar prova" }).click();
  const linkProva = page.getByRole("link", { name: tituloProva });
  await expect(linkProva).toBeVisible();

  // montar e publicar
  await linkProva.click();
  await page.waitForURL(/\/painel\/provas\/.+/);
  await page
    .locator("li", { hasText: enunciado })
    .getByRole("button", { name: "Adicionar" })
    .click();
  await expect(page.getByText("Questões na prova (1)")).toBeVisible();
  await page.getByRole("button", { name: "Publicar prova" }).click();
  await expect(page.getByRole("button", { name: "Despublicar" })).toBeVisible();

  await logout(page);

  // aluno responde corretamente
  await login(page, "aluno@provas.local", "123456");
  await page.goto("/painel/provas");
  await page
    .locator("li", { hasText: tituloProva })
    .getByRole("button", { name: "Iniciar prova" })
    .click();
  await page.waitForURL(/\/painel\/tentativas\/.+/);
  await page.getByText("4", { exact: true }).click();
  await page.getByRole("button", { name: "Enviar prova" }).click();

  await expect(page.getByText("Nota: 1")).toBeVisible();

  // não deve permitir uma segunda tentativa (padrão é 1 tentativa por prova)
  await page.goto("/painel/provas");
  await expect(
    page.locator("li", { hasText: tituloProva }).getByRole("link", { name: "Ver resultado" }),
  ).toBeVisible();
});
