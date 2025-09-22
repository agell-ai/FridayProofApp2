import type { DateRangeKey as DateRangeKeyType } from './dateRanges';

export {
  DATE_RANGE_OPTIONS,
  getDateRange,
  getDateRangeLabel,
  isDateWithinRange,
} from './dateRanges';

export type { DateRange, DateRangeKey, DateRangeOption } from './dateRanges';

export const DEFAULT_TIME_RANGE: DateRangeKeyType = 'all';
