import React from 'react';
import './TimeRangeSelector.css';

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

interface TimeRangeSelectorProps {
  selectedTimeRange: TimeRange;
  onChange: (timeRange: TimeRange) => void;
  disabled?: boolean;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedTimeRange,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="time-range-selector">
      <button
        className={selectedTimeRange === 'short_term' ? 'active' : ''}
        onClick={() => onChange('short_term')}
        disabled={disabled}
      >
        Last 4 Weeks
      </button>
      <button
        className={selectedTimeRange === 'medium_term' ? 'active' : ''}
        onClick={() => onChange('medium_term')}
        disabled={disabled}
      >
        Last 6 Months
      </button>
      <button
        className={selectedTimeRange === 'long_term' ? 'active' : ''}
        onClick={() => onChange('long_term')}
        disabled={disabled}
      >
        All Time
      </button>
    </div>
  );
};
