/* https://whitep4nth3r.com/blog/how-to-format-dates-for-rss-feeds-rfc-822/ */
export function asRFC822Date(date: Temporal.PlainDate) {
  return (
    new Intl.DateTimeFormat("en-NZ", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(date) +
    " " +
    new Intl.DateTimeFormat("en-NZ", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h24",
    }).format(new Temporal.PlainTime(0, 0, 0)) +
    " EST"
  );
}

export function asLocalDate(date: Temporal.PlainDate) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}
