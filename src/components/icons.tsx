import { Rocket } from 'lucide-react';

export function AstrydeLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-2 bg-primary/20 rounded-lg">
        <Rocket className="h-6 w-6 text-primary icon-glow" />
      </div>
      <span className="text-xl font-bold font-headline text-foreground">Astryde</span>
    </div>
  );
}
