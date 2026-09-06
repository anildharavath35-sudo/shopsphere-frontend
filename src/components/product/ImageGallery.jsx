import { useState } from 'react';

export const ImageGallery = ({ images = [], name }) => {
  const [active, setActive] = useState(0);
  const list = images.length ? images : ['https://picsum.photos/seed/placeholder/720/720'];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
        {list.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
              i === active ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'
            }`}
            aria-label={`View image ${i + 1}`}
          >
            <img src={img} alt={`${name} ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <img
          src={list[active]}
          alt={name}
          className="aspect-square w-full object-cover"
        />
      </div>
    </div>
  );
};