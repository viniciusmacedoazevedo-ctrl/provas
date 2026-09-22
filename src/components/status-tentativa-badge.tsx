export type StatusExibivel = "NAO_INICIADA" | "EM_ANDAMENTO" | "ENVIADA" | "CORRIGIDA";

// Cores fixas de status (não usadas para identidade de série em nenhum gráfico),
// sempre com ícone (bolinha) + texto — nunca só a cor.
const config: Record<
  StatusExibivel,
  { label: string; dot: string; className: string }
> = {
  NAO_INICIADA: {
    label: "Não iniciada",
    dot: "#94a3b8",
    className: "bg-muted text-muted-foreground",
  },
  EM_ANDAMENTO: {
    label: "Em andamento",
    dot: "#2a78d6",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  ENVIADA: {
    label: "Aguardando correção",
    dot: "#fab219",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  CORRIGIDA: {
    label: "Corrigida",
    dot: "#0ca30c",
    className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
};

export function StatusTentativaBadge({ status }: { status: StatusExibivel }) {
  const { label, dot, className } = config[status];
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: dot }}
        aria-hidden
      />
      {label}
    </span>
  );
}
