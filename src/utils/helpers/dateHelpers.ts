import { parseISO } from 'date-fns';

/**
 * Convert a date to Unix timestamp.
 * @param {Date|string} date - The input date.
 * @returns {number|null} - The Unix timestamp or null if the input is invalid.
 */
const toUnixTimestamp = (date: Date | string) => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return Math.floor(parsedDate.getTime() / 1000);
  } catch (error) {
    console.error('Error converting date to Unix timestamp:', error.message);
    return null;
  }
};

export { toUnixTimestamp };
