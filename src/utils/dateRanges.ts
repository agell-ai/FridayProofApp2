export type DateRangeKey =
  | 'all'
  | 'current-week'
  | 'last-week'
  | 'last-30-days'
  | 'last-90-days';

export interface DateRangeOption {
  value: DateRangeKey;
  label: string;
  description?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

const startOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const distanceToMonday = (day + 6) % 7;
  result.setDate(result.getDate() - distanceToMonday);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfWeek = (date: Date) => {
  const start = startOfWeek(date);
  const result = new Date(start);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

const endOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  {
    value: 'all',
    label: 'All Time',
    description: 'Show every project regardless of date',
  },
  {
    value: 'current-week',
    label: 'Current Week',
    description: 'Projects created or updated this week',
  },
  {
    value: 'last-week',
    label: 'Last Week',
    description: 'Projects active during the previous week',
  },
  {
    value: 'last-30-days',
    label: 'Last 30 Days',
    description: 'Work touched in the past 30 days',
  },
  {
    value: 'last-90-days',
    label: 'Last 90 Days',
    description: 'Quarter-to-date activity',
  },
];

export const getDateRange = (key: DateRangeKey): DateRange | null => {
  const today = new Date();

  switch (key) {
    case 'all':
      return null;
    case 'current-week': {
      return {
        start: startOfWeek(today),
        end: endOfWeek(today),
      };
    }
    case 'last-week': {
      const start = startOfWeek(today);
      start.setDate(start.getDate() - 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'last-30-days': {
      const start = startOfDay(new Date(today));
      start.setDate(start.getDate() - 30);
      return {
        start,
        end: endOfDay(today),
      };
    }
    case 'last-90-days': {
      const start = startOfDay(new Date(today));
      start.setDate(start.getDate() - 90);
      return {
        start,
        end: endOfDay(today),
      };
    }
    default:
      return null;
  }
};

export const isDateWithinRange = (
  dateInput: string | Date | null | undefined,
  range: DateRange | null,
) => {
  if (!range) {
    return true;
  }

  if (!dateInput) {
    return false;
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date >= range.start && date <= range.end;
};

export const getDateRangeLabel = (key: DateRangeKey) => {
  const match = DATE_RANGE_OPTIONS.find((option) => option.value === key);
  return match?.label ?? '';
};
