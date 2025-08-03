import { Rocket } from 'lucide-react';

export function AstrydeLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <Rocket className="h-6 w-6 text-primary icon-glow" />
      <span className="text-xl font-bold tracking-wider">ASTRYDE</span>
    </div>
  );
}
