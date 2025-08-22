export type Site = {
  host: string;
  title: string;
  author: string;
  description: string;
  projects: [Project];
  bio: string;
};

export type Post = {
  slug: string;
  title: string;
  datePublished?: Temporal.PlainDate;
  content?: string;
};

export type Project = {
  href: string;
  title: string;
  description: string;
};

export type ResumeItem = {
  title: string;
  organization?: string;
  dates: [string, string];
  location?: string;
  tags?: [string];
  summary: string;
};

export type Resume = {
  name: string;
  contacts: [
    {
      href: string;
      text: string;
    },
  ];
  objective: string;
  history: Array<ResumeItem>;
  education: Array<ResumeItem>;
};

export type RssItem = {
  title: string;
  link: string;
  guid: string;
  pubDate: string;
};

export type RSS = {
  rss: {
    attributes: { version: string };
    channel: {
      title: string;
      description: string;
      link: string;
      copyright: string;
      item: Array<RssItem>;
    };
  };
};
