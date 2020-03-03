export const setDateTimeValue = unixTime => {
  const date = unixTime ? new Date(unixTime * 1000) : new Date(Date.now());

  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const dayMonth = ('0' + date.getDate()).slice(-2);
  const hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
  const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

  return `${date.getFullYear()}-${month}-${dayMonth}T${hours}:${minutes}`;
};
