/**
 * Calculates the next working day (Monday-Friday)
 * If today is Friday, returns the following Monday
 * If today is Saturday, returns the following Monday
 * If today is Sunday, returns the following Monday
 * If today is Monday-Thursday, returns the next day
 *
 * @returns Date object representing the next working day
 */
export function getNextWorkingDay(): Date {
  const today = new Date();
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);

  const dayOfWeek = nextDay.getDay(); // 0 = Sunday, 6 = Saturday

  // If next day is Saturday (6), add 2 days to get to Monday
  if (dayOfWeek === 6) {
    nextDay.setDate(nextDay.getDate() + 2);
  }
  // If next day is Sunday (0), add 1 day to get to Monday
  else if (dayOfWeek === 0) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
}

/**
 * Formats the next working day as a readable string
 * @param format - 'short' for "Mon, Nov 11" or 'long' for "Monday, November 11, 2025"
 * @returns Formatted date string
 */
export function getNextWorkingDayFormatted(
  format: "short" | "long" = "short"
): string {
  const nextWorkingDay = getNextWorkingDay();

  if (format === "long") {
    return nextWorkingDay.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return nextWorkingDay.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Returns the next working day in ISO format (YYYY-MM-DD)
 * Useful for date input fields
 * @returns ISO formatted date string
 */
export function getNextWorkingDayISO(): string {
  const nextWorkingDay = getNextWorkingDay();
  return nextWorkingDay.toISOString().split("T")[0];
}
