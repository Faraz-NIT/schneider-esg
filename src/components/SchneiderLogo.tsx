import { Leaf } from "lucide-react";
import schneiderLogo from "@/assets/schneider-logo.png";

export const SchneiderLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary shadow-glow">
        <Leaf className="h-6 w-6" strokeWidth={2.5} />
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary-glow animate-pulse-glow" />
    </div>
    <div className="flex items-center gap-3">
      <img
        src={schneiderLogo}
        alt="Schneider Electric"
        className="h-8 w-auto object-contain"
      />
      <div className="hidden sm:block h-8 w-px bg-border" />
      <div className="hidden sm:block text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
        ESG Signal Console
      </div>
    </div>
  </div>
);
