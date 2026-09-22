import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type Disciplina = { id: string; nome: string };
type Assunto = { id: string; nome: string; disciplinaId: string };

const TIPOS = [
  { value: "", label: "Todos os tipos" },
  { value: "MULTIPLA_ESCOLHA", label: "Múltipla escolha" },
  { value: "VERDADEIRO_FALSO", label: "Verdadeiro/Falso" },
  { value: "DISSERTATIVA", label: "Dissertativa" },
];

const DIFICULDADES = [
  { value: "", label: "Todas as dificuldades" },
  { value: "FACIL", label: "Fácil" },
  { value: "MEDIA", label: "Média" },
  { value: "DIFICIL", label: "Difícil" },
];

export function FiltrosQuestoes({
  disciplinas,
  assuntos,
  filtrosAtuais,
}: {
  disciplinas: Disciplina[];
  assuntos: Assunto[];
  filtrosAtuais: {
    disciplinaId?: string;
    assuntoId?: string;
    tipo?: string;
    dificuldade?: string;
  };
}) {
  return (
    <form className="flex flex-wrap items-end gap-3" action="/painel/questoes">
      <Select
        name="disciplinaId"
        defaultValue={filtrosAtuais.disciplinaId ?? ""}
        className="w-auto"
      >
        <option value="">Todas as disciplinas</option>
        {disciplinas.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nome}
          </option>
        ))}
      </Select>
      <Select
        name="assuntoId"
        defaultValue={filtrosAtuais.assuntoId ?? ""}
        className="w-auto"
      >
        <option value="">Todos os assuntos</option>
        {assuntos.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nome}
          </option>
        ))}
      </Select>
      <Select
        name="tipo"
        defaultValue={filtrosAtuais.tipo ?? ""}
        className="w-auto"
      >
        {TIPOS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>
      <Select
        name="dificuldade"
        defaultValue={filtrosAtuais.dificuldade ?? ""}
        className="w-auto"
      >
        {DIFICULDADES.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="outline">
        Filtrar
      </Button>
    </form>
  );
}
