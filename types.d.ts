type Site = {
  host: string;
  title: string;
  author: string;
  description: string;
  projects: [Project];
  bio: string;
};

type Post = {
  slug: string;
  title: string;
  datePublished?: Temporal.PlainDate;
  content?: string;
};

type Project = {
  href: string;
  title: string;
  description: string;
};

type ResumeItem = {
  title: string;
  organization?: string;
  dates: [string, string];
  location?: string;
  tags?: [string];
  summary: string;
};

type Resume = {
  name: string;
  contacts: [
    {
      href: string;
      text: string;
    },
  ];
  objective: string;
  history: [ResumeItem];
  education: [ResumeItem];
};

type RssItem = { title: string; link: string; guid: string; pubDate: string };

type RSS = {
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
