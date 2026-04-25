import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  delta?: number;
  icon: LucideIcon;
  tone?: "primary" | "info" | "warning" | "destructive";
}

const toneMap = {
  primary: "from-primary/15 to-primary/0 text-primary",
  info: "from-info/15 to-info/0 text-info",
  warning: "from-warning/15 to-warning/0 text-warning",
  destructive: "from-destructive/15 to-destructive/0 text-destructive",
};

export const KpiCard = ({ label, value, unit, delta, icon: Icon, tone = "primary" }: KpiCardProps) => {
  const showDelta = typeof delta === "number" && !Number.isNaN(delta);
  const positive = showDelta && delta! > 0;
  const negative = showDelta && delta! < 0;
  const DeltaIcon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card p-5 shadow-card-soft transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${toneMap[tone]}`}
      />
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${toneMap[tone]} opacity-60 blur-2xl transition-smooth group-hover:opacity-100`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold tracking-tight text-foreground">{value}</span>
            {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
          </div>
          {showDelta && (
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                positive
                  ? "bg-primary/15 text-primary"
                  : negative
                  ? "bg-destructive/15 text-destructive"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <DeltaIcon className="h-3 w-3" />
              {delta! > 0 ? "+" : ""}{delta!.toFixed(1)} YoY
            </div>
          )}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>
      </div>
    </Card>
  );
};
