export const formatEventDates = (startDate: string | Date, endDate: string | Date) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const isSameDay = start.toDateString() === end.toDateString();

  if (isSameDay) {
    return `${start.toLocaleDateString(undefined, { dateStyle: 'long' })}, ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return `${start.toLocaleDateString(undefined, { dateStyle: 'medium' })} - ${end.toLocaleDateString(undefined, { dateStyle: 'medium' })}`;
  }
};
