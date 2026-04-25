import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { PROVIDER_HEX, type Provider } from "@/data/esgData";

interface ProviderCardProps {
  provider: Provider;
  rawScore: string;
  normalized: number;
  yoy: number | null;
  confidence: number;
  rank: number;
}

export const ProviderCard = ({
  provider,
  rawScore,
  normalized,
  yoy,
  confidence,
  rank,
}: ProviderCardProps) => {
  const color = PROVIDER_HEX[provider];
  const positive = yoy !== null && yoy > 0;
  const negative = yoy !== null && yoy < 0;
  const DeltaIcon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-card-soft transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ background: color }}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-lg text-sm font-extrabold text-white shadow-sm"
            style={{ background: color }}
          >
            {rank}
          </div>
          <div>
            <div className="text-sm font-extrabold text-foreground">{provider}</div>
            <div className="text-xs text-muted-foreground">Raw: {rawScore}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold tracking-tight" style={{ color }}>
            {normalized.toFixed(1)}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            normalized
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-smooth"
            style={{ width: `${normalized}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${
            positive
              ? "bg-primary/15 text-primary"
              : negative
              ? "bg-destructive/15 text-destructive"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <DeltaIcon className="h-3 w-3" />
          {yoy === null ? "n/a" : `${yoy > 0 ? "+" : ""}${yoy.toFixed(1)} YoY`}
        </div>
        <div className="text-muted-foreground">
          Confidence <span className="font-bold text-foreground">{confidence}%</span>
        </div>
      </div>
    </div>
  );
};
