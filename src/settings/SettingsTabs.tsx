import { useLayoutEffect, useRef } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { MotionTabList, MotionTabIndicator } from "../motion/MotionTabList";

export type SettingsTab = { id: string; label: string; bn: string };

/** Party's desktop boundary; CSS md/lg below retains the same phone/tablet bands. */
export function SettingsTabs({
  items,
  value,
  onChange,
  label,
  id,
  panelId,
  secondary = false,
  language = "English + Bangla",
}: {
  items: readonly SettingsTab[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
  panelId: string;
  secondary?: boolean;
  language?: string;
}) {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const vertical = secondary && desktop;
  const list = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const viewport = list.current;
    if (vertical || !viewport) return;
    const revealSelection = () => {
      const selected = viewport.querySelector<HTMLElement>(
        '[aria-selected="true"]',
      );
      if (!selected) return;
      const bounds = viewport.getBoundingClientRect(),
        tab = selected.getBoundingClientRect();
      if (tab.left < bounds.left) viewport.scrollLeft += tab.left - bounds.left;
      else if (tab.right > bounds.right)
        viewport.scrollLeft += tab.right - bounds.right;
    };
    revealSelection();
    const observer = new ResizeObserver(revealSelection);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [value, vertical, language]);
  if (!items.length) return null;
  return (
    <div
      ref={list}
      className="min-w-0 overflow-x-auto scrollbar-thin"
      data-settings-navigation={secondary ? "subsections" : "sections"}
    >
      <MotionTabList
        id={id}
        aria-label={label}
        aria-orientation={vertical ? "vertical" : "horizontal"}
        className={`flex min-w-max border-b border-border ${secondary ? "lg:min-w-0 lg:flex-col lg:gap-1 lg:rounded-xl lg:border lg:bg-card lg:p-2" : ""}`}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${id}-${item.id}`}
            aria-controls={panelId}
            aria-selected={value === item.id}
            tabIndex={value === item.id ? 0 : -1}
            data-settings-section={secondary ? undefined : item.id}
            onKeyDown={(event) => {
              const forward = vertical ? "ArrowDown" : "ArrowRight",
                back = vertical ? "ArrowUp" : "ArrowLeft";
              if (![forward, back, "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? items.length - 1
                    : (index + (event.key === back ? -1 : 1) + items.length) %
                      items.length;
              document.getElementById(`${id}-${items[next].id}`)?.focus();
            }}
            onClick={() => onChange(item.id)}
            className={`relative shrink-0 whitespace-nowrap px-3 py-3 text-left text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${secondary ? "lg:w-full lg:whitespace-normal" : ""} ${value === item.id ? "text-primary" : "text-ink-500 hover:text-ink"}`}
          >
            {language === "Bangla" ? item.bn : item.label}
            {language === "English + Bangla" && (
              <span
                lang="bn"
                className={`ml-1 text-[11px] font-normal text-helper ${secondary ? "hidden lg:block lg:ml-0" : "hidden md:inline"}`}
              >
                {item.bn}
              </span>
            )}
            <MotionTabIndicator active={value === item.id} />
          </button>
        ))}
      </MotionTabList>
    </div>
  );
}
