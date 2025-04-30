/* https://whitep4nth3r.com/blog/how-to-format-dates-for-rss-feeds-rfc-822/ */
export function asRFC822Date(date: Date) {
  const dayStrings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthStrings = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = dayStrings[date.getDay()];
  const dayNumber = addLeadingZeros(date.getDate());
  const month = monthStrings[date.getMonth()];
  const year = date.getFullYear();
  const time = `${addLeadingZeros(date.getHours())}:${
    addLeadingZeros(date.getMinutes())
  }:00`;
  const timezone = addLeadingZeros(date.getTimezoneOffset(), 4);

  //Wed, 02 Oct 2002 13:00:00 GMT
  return `${day}, ${dayNumber} ${month} ${year} ${time} ${
    timezone.startsWith("-") ? "" : "+"
  }${timezone}`;
}

export function addLeadingZeros(str: string | number, length = 2) {
  return ("0".repeat(length) + str).slice(-1 * length);
}
