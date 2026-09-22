type PontoNota = {
  id: string;
  titulo: string;
  percentual: number; // 0-100
  nota: number;
  notaMaxima: number;
  parcial: boolean;
};

const LARGURA_BARRA = 24;
const ESPACO_ENTRE_BARRAS = 24;
const ALTURA_AREA_BARRAS = 160;
const ALTURA_TOTAL = 210;

function truncar(texto: string, max = 12) {
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;
}

export function GraficoNotas({ dados }: { dados: PontoNota[] }) {
  if (dados.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma prova corrigida ainda para gerar o gráfico de notas.
      </p>
    );
  }

  const largura = dados.length * (LARGURA_BARRA + ESPACO_ENTRE_BARRAS) + ESPACO_ENTRE_BARRAS;
  const linhasGuia = [0, 50, 100];

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${largura} ${ALTURA_TOTAL}`}
        width={largura}
        height={ALTURA_TOTAL}
        role="img"
        aria-label="Gráfico de notas (score percentual) por prova corrigida"
        className="min-w-full"
      >
        {linhasGuia.map((valor) => {
          const y = ALTURA_AREA_BARRAS - (valor / 100) * ALTURA_AREA_BARRAS + 20;
          return (
            <g key={valor}>
              <line
                x1={0}
                x2={largura}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text
                x={0}
                y={y - 4}
                fontSize={9}
                fill="var(--muted-foreground)"
              >
                {valor}%
              </text>
            </g>
          );
        })}

        {dados.map((ponto, i) => {
          const x = ESPACO_ENTRE_BARRAS + i * (LARGURA_BARRA + ESPACO_ENTRE_BARRAS);
          const alturaBarra = (Math.max(0, Math.min(100, ponto.percentual)) / 100) * ALTURA_AREA_BARRAS;
          const yTopo = ALTURA_AREA_BARRAS - alturaBarra + 20;

          return (
            <g key={ponto.id}>
              <title>{`${ponto.titulo}: ${ponto.nota.toFixed(1)}/${ponto.notaMaxima.toFixed(1)} (${ponto.percentual.toFixed(0)}%)${ponto.parcial ? " · nota parcial" : ""}`}</title>
              <rect
                x={x}
                y={yTopo}
                width={LARGURA_BARRA}
                height={Math.max(alturaBarra, 2)}
                rx={4}
                fill="var(--primary)"
                opacity={ponto.parcial ? 0.55 : 1}
              />
              <text
                x={x + LARGURA_BARRA / 2}
                y={yTopo - 6}
                fontSize={10}
                textAnchor="middle"
                fill="var(--foreground)"
                fontWeight={600}
              >
                {ponto.percentual.toFixed(0)}%
              </text>
              <text
                x={x + LARGURA_BARRA / 2}
                y={ALTURA_AREA_BARRAS + 34}
                fontSize={9}
                textAnchor="middle"
                fill="var(--muted-foreground)"
              >
                {truncar(ponto.titulo)}
              </text>
            </g>
          );
        })}

        <line
          x1={0}
          x2={largura}
          y1={ALTURA_AREA_BARRAS + 20}
          y2={ALTURA_AREA_BARRAS + 20}
          stroke="var(--muted-foreground)"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}
