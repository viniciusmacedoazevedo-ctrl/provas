import { ClipboardCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  tamanhoIcone = 20,
}: {
  className?: string;
  tamanhoIcone?: number;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className="flex items-center justify-center rounded-lg bg-primary text-primary-foreground"
        style={{ padding: Math.round(tamanhoIcone * 0.32) }}
      >
        <ClipboardCheck size={tamanhoIcone} strokeWidth={2.25} />
      </span>
      <span className="font-semibold tracking-tight text-foreground">
        Vinicius <span className="text-primary">Provas</span>
      </span>
    </div>
  );
}
