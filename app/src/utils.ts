export const truncateBackwards = (str: string, maxLength: number) => {
  if (str.length > maxLength) {
    return '...' + str.slice(str.length - maxLength);
  }
  return str;
};
