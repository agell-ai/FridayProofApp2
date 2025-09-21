export type TimeRangeKey = '7d' | '30d' | '90d' | 'ytd' | 'all';

export interface TimeRangeOption {
  value: TimeRangeKey;
  label: string;
  shortLabel: string;
  getStartDate: () => Date | null;
}

const createRelativeStartDate = (days: number): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  // Include the current day in the range by subtracting days - 1
  date.setDate(date.getDate() - (days - 1));
  return date;
};

const createYearToDateStart = (): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(0, 1);
  return date;
};

export const timeRangeOptions: TimeRangeOption[] = [
  {
    value: '7d',
    label: 'Last 7 days',
    shortLabel: '7 days',
    getStartDate: () => createRelativeStartDate(7)
  },
  {
    value: '30d',
    label: 'Last 30 days',
    shortLabel: '30 days',
    getStartDate: () => createRelativeStartDate(30)
  },
  {
    value: '90d',
    label: 'Last 90 days',
    shortLabel: '90 days',
    getStartDate: () => createRelativeStartDate(90)
  },
  {
    value: 'ytd',
    label: 'Year to date',
    shortLabel: 'YTD',
    getStartDate: createYearToDateStart
  },
  {
    value: 'all',
    label: 'All time',
    shortLabel: 'All time',
    getStartDate: () => null
  }
];

export const DEFAULT_TIME_RANGE: TimeRangeKey = '30d';

export const getTimeRangeStart = (value: TimeRangeKey): Date | null => {
  const option = timeRangeOptions.find((item) => item.value === value);
  return option ? option.getStartDate() : null;
};

export const isWithinTimeRange = (
  input: string | number | Date,
  start: Date | null
): boolean => {
  if (!start) {
    return true;
  }

  const value = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(value.getTime())) {
    return false;
  }

  return value >= start;
};
