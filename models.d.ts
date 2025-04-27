type Site = {
  host: string;
  title: string;
  author: string;
  description: string;
  projects: [Project];
};

type Post = {
  slug: string;
  title: string;
  date?: Date;
  content: string;
};

type Project = {
  href: string;
  title: string;
  description: string;
};

type Resume = {
  name: string;
  contacts: [{
    href: string;
    text: string;
  }];
  objective: string;
  history: [ResumeItem];
  education: [ResumeItem];
};

type ResumeItem = {
  latest_full_time: boolean;
  title: string;
  organization?: string;
  dates: [string, string];
  location?: string;
  tags?: [string];
  summary: string;
};
