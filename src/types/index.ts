export type Video = {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
};

export type Creator = {
  id: string;
  name: string;
  avatar: string;
  videos: Video[];
};

export type Technology = {
  id: string;
  name: string;
  description: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  creators: Creator[];
};
