import {
  DATE_RANGE_OPTIONS,
  getDateRange,
  getDateRangeLabel,
  isDateWithinRange,
} from './dateRanges';
import type { DateRangeKey as DateRangeKeyType } from './dateRanges';

export type { DateRange, DateRangeKey, DateRangeOption } from './dateRanges';

export const DEFAULT_TIME_RANGE: DateRangeKeyType = 'all';

export const timeRangeOptions = DATE_RANGE_OPTIONS;

export const isWithinTimeRange = isDateWithinRange;

export {
  DATE_RANGE_OPTIONS,
  getDateRange,
  getDateRangeLabel,
  isDateWithinRange,
};
