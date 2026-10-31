import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

type PhotoUploaderProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
  label?: string;
  hint?: string;
  compact?: boolean;
};

export function PhotoUploader({ photos, onChange, max = 4, label = 'Add photo', hint, compact = false }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).
    filter((f) => f.type.startsWith('image/')).
    slice(0, max - photos.length).
    map((f) => URL.createObjectURL(f));
    onChange([...photos, ...urls]);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {photos.map((src, i) =>
        <div key={src} className={'group relative overflow-hidden rounded-lg border border-border ' + (compact ? 'size-9' : 'size-20')}>
            <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && !compact &&
          <span className="absolute bottom-1 left-1 rounded bg-inverse/80 px-1 text-[10px] font-medium text-white">Cover</span>
          }
            <button
            type="button"
            onClick={() => onChange(photos.filter((p) => p !== src))}
            aria-label={`Remove photo ${i + 1}`}
            className={'absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-card/90 text-ink shadow transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ' + (compact ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100')}>
            
              <X className="size-3" />
            </button>
          </div>
        )}
        {photos.length < max &&
        <button
          type="button"
          aria-label={label}
          title={label}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFiles(e.dataTransfer.files);
          }}
          className={'flex shrink-0 items-center justify-center rounded-lg border border-dashed border-ink-200 bg-ink-50/60 text-ink-500 transition-colors hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ' + (compact ? 'size-9' : 'size-20 flex-col gap-1 text-[11px]')}>
          
            <ImagePlus className={compact ? 'size-4' : 'size-5'} />
            {!compact && label}
          </button>
        }
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
    </div>);

}
