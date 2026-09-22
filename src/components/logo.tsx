import { GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  tamanhoIcone = 20,
  empilhado = false,
}: {
  className?: string;
  tamanhoIcone?: number;
  empilhado?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className="flex shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
        style={{
          padding: Math.round(tamanhoIcone * 0.34),
          background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)",
        }}
      >
        <GraduationCap size={tamanhoIcone} strokeWidth={2.2} />
      </span>
      <span
        className={cn(
          "font-semibold tracking-tight text-foreground",
          empilhado ? "flex flex-col leading-tight" : "flex items-baseline gap-1.5",
        )}
      >
        <span>Vinicius</span>
        <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          Provas
        </span>
      </span>
    </div>
  );
}
