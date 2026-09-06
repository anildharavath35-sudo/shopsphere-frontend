import { useState } from 'react';

const Star = ({ filled, half, hover, onClick, onHover, size = 'w-4 h-4' }) => {
  const id = `g${half ? 'half' : 'full'}${filled ? 'on' : 'off'}_${Math.random().toString(36).slice(2, 7)}`;
  return (
    <span
      className="relative inline-flex cursor-pointer"
      onMouseEnter={onHover}
      onClick={onClick}
      aria-hidden="true"
    >
      <svg className={`${size} text-slate-300 dark:text-slate-600`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
      {(filled || half || hover) && (
        <defs>
          <linearGradient id={id}>
            <stop offset={half ? '50%' : '100%'} stopColor="currentColor" />
            <stop offset={half ? '50%' : '100%'} stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      {(filled || half || hover) && (
        <svg
          className={`${size} absolute inset-0 ${hover ? 'text-accent-500' : 'text-accent-500'}`}
          viewBox="0 0 24 24"
          fill={`url(#${id})`}
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      )}
    </span>
  );
};

/** Display-only star rating with optional count. */
export const RatingDisplay = ({ rating = 0, count, size }) => (
  <div className="flex items-center gap-1">
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          filled={rating >= i}
          half={rating < i && rating > i - 1 && rating > 0}
          size={size}
        />
      ))}
    </div>
    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
      {rating ? rating.toFixed(1) : 'No ratings'}
      {count !== undefined && <span className="font-normal text-slate-400"> ({count})</span>}
    </span>
  </div>
);

/** Interactive star picker for writing reviews. */
export const StarInput = ({ value = 0, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          filled={value >= i}
          hover={hover >= i && value < i}
          onClick={() => onChange(i)}
          onHover={() => setHover(i)}
          size="w-7 h-7"
        />
      ))}
      <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        {value ? `${value}/5` : 'Select rating'}
      </span>
    </div>
  );
};