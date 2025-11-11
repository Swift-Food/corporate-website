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

/**
 * Calculates the cutoff date/time for a given delivery date
 * The cutoff is always the day before the delivery date at the specified cutoff time
 *
 * @param cutoffTime - Time in format "HH:MM:SS" or "HH:MM"
 * @param deliveryDate - The delivery date
 * @returns Date object representing the cutoff date/time
 */
export function getCutoffDateTime(cutoffTime: string, deliveryDate: Date): Date {
  const cutoffDate = new Date(deliveryDate);
  // Set to the day before delivery
  cutoffDate.setDate(cutoffDate.getDate() - 1);

  // Parse cutoff time (format: "HH:MM:SS" or "HH:MM")
  const timeParts = cutoffTime.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  cutoffDate.setHours(hours, minutes, 0, 0);

  return cutoffDate;
}

/**
 * Formats a cutoff time string (24-hour format) to 12-hour format with AM/PM
 *
 * @param cutoffTime - Time in format "HH:MM:SS" or "HH:MM"
 * @returns Formatted time string like "4:00 PM"
 */
export function formatCutoffTime(cutoffTime: string): string {
  const timeParts = cutoffTime.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Determines if orders can be placed and what delivery date applies
 * based on the current time and cutoff time
 *
 * @param cutoffTime - Time in format "HH:MM:SS" or "HH:MM" (default: "11:00:00")
 * @param now - Current date/time (defaults to now, useful for testing)
 * @returns Object with canOrder flag, delivery date, and cutoff info
 */
export function getDeliveryInfo(
  cutoffTime: string = "11:00:00",
  now: Date = new Date()
) {
  const nextWorkingDay = getNextWorkingDay();
  const cutoffDateTime = getCutoffDateTime(cutoffTime, nextWorkingDay);

  if (now <= cutoffDateTime) {
    // Within cutoff - can order for next working day
    return {
      canOrder: true,
      deliveryDate: nextWorkingDay,
      cutoffDateTime,
      formattedCutoffTime: formatCutoffTime(cutoffTime),
    };
  } else {
    // Past cutoff - cannot order until tomorrow
    return {
      canOrder: false,
      deliveryDate: nextWorkingDay,
      cutoffDateTime,
      formattedCutoffTime: formatCutoffTime(cutoffTime),
    };
  }
}

/**
 * Gets a formatted display string for the delivery date or cutoff message
 *
 * @param cutoffTime - Time in format "HH:MM:SS" or "HH:MM"
 * @param format - 'short' for "Mon, Nov 11" or 'long' for full format
 * @param now - Current date/time (defaults to now)
 * @returns Either the formatted delivery date or a "Past order cut-off time" message
 */
export function getDeliveryDisplayText(
  cutoffTime: string = "11:00:00",
  format: "short" | "long" = "short",
  now: Date = new Date()
): string {
  const deliveryInfo = getDeliveryInfo(cutoffTime, now);

  if (deliveryInfo.canOrder) {
    // Show the delivery date
    if (format === "long") {
      return deliveryInfo.deliveryDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return deliveryInfo.deliveryDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } else {
    // Show past cutoff message
    return `Past order cut-off time (${deliveryInfo.formattedCutoffTime})`;
  }
}
