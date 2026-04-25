import { Leaf } from "lucide-react";

export const SchneiderLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground shadow-glow">
        <Leaf className="h-6 w-6" strokeWidth={2.5} />
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary-glow animate-pulse-glow" />
    </div>
    <div className="leading-tight">
      <div className="text-[15px] font-extrabold tracking-tight">Schneider Electric</div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
        ESG Signal Console
      </div>
    </div>
  </div>
);
