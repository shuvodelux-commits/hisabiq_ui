import { SettingsTabs } from "./SettingsTabs";
import { SettingsDirectory } from "./SettingsDirectory";
import { settingsSubsections } from "./subsections";
import {
  taskFields,
  fieldDependency,
  fieldHelpBangla,
  settingOption,
  settingsErrorBangla,
} from "./experience";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { AppDatePicker } from "../components/AppDateRangePicker";
import { PageHeader } from "../components/PageHeader";
import { settingsCopy } from "../i18n/settingsCopy";
import { listenSettingsPop } from "./navigationGuard";
import { InterfaceSettings } from "./InterfaceSettings";
import type { ModuleViews } from "./moduleViews";
import { OutputDesignSettings } from "./OutputDesignSettings";
import { matchesSearch as fuzzyMatch } from "../utils/fuzzySearch";
import { AppSelect } from "../components/AppSelect";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useId,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Building2,
  ShoppingCart,
  Package,
  ReceiptText,
  Wallet,
  Printer,
  Users,
  Bell,
  SlidersHorizontal,
  Database,
  Save,
  RotateCcw,
  ChevronDown,
  Search,
  Info,
  BookOpen,
  CheckCircle2,
  ImagePlus,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import {
  canManage,
  defaults,
  personalDefaults,
  type BusinessSection,
  type PersonalSettings,
  type SettingsSection,
  type SettingsSections,
} from "./model";
import { useTenantSettings } from "./TenantSettingsProvider";
import { sectionNames, settingsFields, type SettingField } from "./fields";
import {
  Button,
  Input,
  Switch,
  SettingCard,
  SettingsDialog,
  SettingsField,
} from "./ui";
import { TeamSettings } from "./TeamSettings";
import { DataSettings } from "./DataSettings";
import { FinancialTerminologySettings } from "./FinancialTerminologySettings";
import { DocumentDesignSettings } from "./DocumentDesignSettings";
import type { FinancialDisplay } from "../financial-display/model";
import { AccountSecuritySettings } from "./AccountSecuritySettings";

const icons = {
  interface: SlidersHorizontal,
  financialTerminology: BookOpen,
  business: Building2,
  sales: ShoppingCart,
  products: Package,
  purchases: ReceiptText,
  money: Wallet,
  invoices: Printer,
  team: Users,
  notifications: Bell,
  personal: SlidersHorizontal,
  data: Database,
  security: ShieldCheck,
};
type Draft = SettingsSections[BusinessSection];
function LogoField({
  value,
  disabled,
  id,
  onChange,
  onReading,
  language,
}: {
  value: string;
  disabled: boolean;
  id: string;
  onChange: (v: string) => void;
  onReading: (v: boolean) => void;
  language: string;
}) {
  const text = (en: string, bn: string) => (language === "Bangla" ? bn : en);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState(""),
    [reading, setReading] = useState(false);
  const readerRef = useRef<FileReader | null>(null);
  useEffect(
    () => () => {
      readerRef.current?.abort();
    },
    [],
  );
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          <img
            src={value}
            alt={text("Business logo preview", "দোকানের লোগো")}
            className="size-12 rounded-lg border border-border bg-card object-contain p-1"
          />
        ) : (
          <div className="flex size-12 items-center justify-center rounded-lg border border-dashed border-input bg-ink-50 text-ink-500">
            <ImagePlus className="size-5" aria-hidden="true" />
          </div>
        )}
        <input
          id={id}
          ref={fileInput}
          aria-label={text("Business logo", "দোকানের লোগো")}
          type="file"
          disabled={disabled || reading}
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setError("");
            if (
              !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
              file.size > 250000
            )
              return setError(
                text(
                  "Use a PNG, JPEG or WebP smaller than 250 KB.",
                  "২৫০ KB-এর কম PNG, JPEG বা WebP ছবি দিন।",
                ),
              );
            setReading(true);
            onReading(true);
            const reader = new FileReader();
            readerRef.current = reader;
            reader.onerror = () => {
              setError(
                text(
                  "Could not read that image.",
                  "ছবিটি পড়া যায়নি। আবার বাছুন।",
                ),
              );
              setReading(false);
              onReading(false);
            };
            reader.onload = () => {
              onChange(String(reader.result));
              setReading(false);
              onReading(false);
            };
            reader.readAsDataURL(file);
          }}
        />
        <Button
          variant="outline"
          disabled={disabled || reading}
          onClick={() => fileInput.current?.click()}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          {text("Choose photo", "ছবি দিন")}
        </Button>
      </div>
      {value && (
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onChange("")}
        >
          {text("Remove logo", "লোগো সরান")}
        </Button>
      )}
      {reading && (
        <p role="status" className="text-xs text-ink-500">
          {text("Reading logo…", "ছবি পড়া হচ্ছে…")}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
function Fields({
  section,
  fields,
  value,
  onChange,
  disabled,
  language,
  onReading,
  error,
  errorKey,
  showHelp,
}: {
  section: BusinessSection;
  fields: SettingField[];
  value: Draft;
  onChange: Dispatch<SetStateAction<Draft>>;
  disabled: boolean;
  language: string;
  onReading: (v: boolean) => void;
  error?: string;
  errorKey?: string;
  showHelp?: boolean;
}) {
  const data = value as unknown as Record<string, unknown>;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const v = data[field.key];
        const label = language === "Bangla" ? field.bn : field.label;
        const parent = fieldDependency(section, field.key);
        const blocked = !!parent && data[parent] !== true;
        const fieldDisabled = disabled || blocked;
        const hint = blocked
          ? language === "Bangla"
            ? `আগে ${fields.find((f) => f.key === parent)?.bn ?? parent} চালু করুন।`
            : `Turn on ${fields.find((f) => f.key === parent)?.label ?? parent} first.`
          : language === "Bangla"
            ? (fieldHelpBangla[`${section}.${field.key}`] ?? field.hint)
            : field.hint;
        const update = (next: unknown) =>
          onChange((previous) => ({ ...previous, [field.key]: next }));
        return (
          <div
            key={field.key}
            data-field-key={field.key}
            tabIndex={-1}
            className={field.kind === "logo" ? "sm:col-span-full" : ""}
          >
            <SettingsField
              label={field.label}
              bn={field.bn}
              language={language}
              hint={showHelp || blocked ? hint : undefined}
              error={errorKey === field.key ? error : undefined}
            >
              {(id, descriptionId) => {
                if (field.kind === "switch")
                  return (
                    <Switch
                      id={id}
                      aria-label={label}
                      aria-describedby={descriptionId}
                      checked={v as boolean}
                      onCheckedChange={update}
                      disabled={fieldDisabled}
                    />
                  );
                if (field.kind === "select")
                  return (
                    <AppSelect
                      id={id}
                      describedBy={descriptionId}
                      label={label}
                      value={v as string}
                      onChange={update}
                      disabled={fieldDisabled}
                      options={(field.options ?? []).map((value) => ({
                        value,
                        label: settingOption(value, language),
                      }))}
                    />
                  );
                if (field.kind === "textarea")
                  return (
                    <textarea
                      id={id}
                      aria-label={label}
                      aria-describedby={descriptionId}
                      aria-invalid={errorKey === field.key || undefined}
                      className="min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-ink disabled:opacity-70"
                      value={v as string}
                      onChange={(e) => update(e.target.value)}
                      disabled={fieldDisabled}
                    />
                  );
                if (field.kind === "logo")
                  return (
                    <LogoField
                      id={id}
                      disabled={disabled}
                      value={v as string}
                      onChange={update}
                      onReading={onReading}
                      language={language}
                    />
                  );
                if (field.kind === "date")
                  return (
                    <AppDatePicker
                      id={id}
                      label={label}
                      describedBy={descriptionId}
                      value={v as string}
                      onChange={update}
                      disabled={fieldDisabled}
                    />
                  );
                return (
                  <Input
                    id={id}
                    aria-label={label}
                    aria-describedby={descriptionId}
                    aria-invalid={errorKey === field.key || undefined}
                    type={
                      field.key === "phone"
                        ? "tel"
                        : field.key === "email"
                          ? "email"
                          : field.kind
                    }
                    min={field.min}
                    max={field.max}
                    step={field.kind === "number" ? 1 : undefined}
                    disabled={fieldDisabled}
                    value={
                      typeof v === "number" && !Number.isFinite(v)
                        ? ""
                        : (v as string | number)
                    }
                    onChange={(e) =>
                      update(
                        field.kind === "number"
                          ? e.target.value === ""
                            ? NaN
                            : Number(e.target.value)
                          : e.target.value,
                      )
                    }
                  />
                );
              }}
            </SettingsField>
          </div>
        );
      })}
    </div>
  );
}
export function SettingsPageContent({
  sectionOverride,
  embedded = false,
}: { sectionOverride?: SettingsSection; embedded?: boolean } = {}) {
  const { section: routeSection } = useParams();
  const navigate = useNavigate();
  const routeState = useLocation().state as {
    settingsTabFocus?: string;
    settingsField?: string;
  } | null;
  const section: SettingsSection =
    sectionOverride ??
    (routeSection && routeSection in sectionNames
      ? (routeSection as SettingsSection)
      : "business");
  const { state, personal, actorId, setActorId, save, updatePersonal } =
    useTenantSettings();
  const { theme, setTheme } = useTheme();
  const [readingLogo, setReadingLogo] = useState(false);
  const [draft, setDraft] = useState<Draft>(() =>
    structuredClone(
      state.sections[
        section === "personal" || section === "data" || section === "security"
          ? "business"
          : section
      ],
    ),
  );
  const [baseline, setBaseline] = useState(JSON.stringify(draft)),
    [revision, setRevision] = useState(state.revision);
  const [personalDraft, setPersonalDraft] = useState<PersonalSettings>({
      ...personal,
    }),
    [themeDraft, setThemeDraft] = useState(theme);
  const [query, setQuery] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [resetOpen, setResetOpen] = useState(false),
    [reviewOpen, setReviewOpen] = useState(false),
    [leaveOpen, setLeaveOpen] = useState(false);
  const pending = useRef<(() => void) | null>(null);
  const tabsId = "settings-" + useId().replace(/:/g, "");
  const [activeSubsections, setActiveSubsections] = useState<
    Record<string, string>
  >({});
  const subsections =
    section === "invoices" ? settingsSubsections.invoices : [];
  const desktop = useMediaQuery("(min-width: 1024px)");
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [reviewContinue, setReviewContinue] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const text = (en: string, bn: string) =>
    personal.language === "Bangla" ? bn : en;
  const activeSubsection =
    activeSubsections[section] ?? subsections[0]?.id ?? "";
  const selectSubsection = (id: string) =>
    setActiveSubsections((previous) => ({ ...previous, [section]: id }));
  useLayoutEffect(() => {
    if (routeState?.settingsField) {
      const frame = requestAnimationFrame(() => {
        const field = document.querySelector<HTMLElement>(
          `[data-field-key="${routeState.settingsField}"]`,
        );
        if (!field) return;
        for (
          let parent = field.parentElement;
          parent;
          parent = parent.parentElement
        )
          if (parent instanceof HTMLDetailsElement) parent.open = true;
        const control = field.querySelector<HTMLElement>(
          "input:not([disabled]):not([type=file]),textarea:not([disabled]),button:not([disabled])",
        );
        (control ?? field).focus();
        field.scrollIntoView({ block: "center" });
      });
      return () => cancelAnimationFrame(frame);
    }
    if (!embedded && routeState?.settingsTabFocus === section)
      document
        .getElementById(
          desktop ? `${tabsId}-directory-${section}` : `${tabsId}-choose`,
        )
        ?.focus({ preventScroll: true });
  }, [section, embedded, routeState, tabsId, desktop]);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  const personalDirty =
    JSON.stringify({ ...personalDraft, mode: personal.mode }) !==
      JSON.stringify(personal) || themeDraft !== theme;
  const dirty =
    section === "personal"
      ? personalDirty
      : section === "data" || section === "security"
        ? false
        : JSON.stringify(draft) !== baseline;
  const editable =
    section === "personal" ||
    section === "security" ||
    (section !== "data" && canManage(state, actorId, section));
  const canView =
    section === "personal" ||
    section === "security" ||
    canManage(state, actorId, "view") ||
    (section === "team" &&
      (canManage(state, actorId, "user.account.view") ||
        canManage(state, actorId, "user.role.view")));
  const load = () => {
    const next = structuredClone(
      state.sections[
        section === "personal" || section === "data" || section === "security"
          ? "business"
          : section
      ],
    );
    setDraft(next);
    setBaseline(JSON.stringify(next));
    setRevision(state.revision);
    setPersonalDraft({ ...personal });
    setThemeDraft(theme);
    setError("");
  };
  useEffect(() => {
    load();
    setNotice("");
  }, [section, actorId]);
  function requestChange(action: () => void) {
    if (dirty) {
      pending.current = action;
      setLeaveOpen(true);
    } else action();
  }
  useLayoutEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const click = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest?.("a");
      if (!link || link.hasAttribute("download") || link.target === "_blank")
        return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.hash === location.hash) return;
      event.preventDefault();
      event.stopPropagation();
      pending.current = () => navigate(url.hash.slice(1));
      setLeaveOpen(true);
    };
    const originalUrl = location.href;
    const originalHistoryState = window.history.state;
    let resuming = false;
    const pop = (event: PopStateEvent) => {
      if (resuming) {
        resuming = false;
        return;
      }
      if (location.href === originalUrl) {
        event.stopImmediatePropagation();
        return;
      }
      const target = location.hash.slice(1);
      event.stopImmediatePropagation();
      const fromIndex = originalHistoryState?.idx,
        toIndex = event.state?.idx;
      if (
        Number.isInteger(fromIndex) &&
        Number.isInteger(toIndex) &&
        fromIndex !== toIndex
      ) {
        window.history.go(fromIndex - toIndex);
        pending.current = () => {
          resuming = true;
          window.history.go(toIndex - fromIndex);
        };
      } else {
        // External hash entries may have no router index. Keep the current draft visible.
        window.history.pushState(originalHistoryState, "", originalUrl);
        pending.current = () => navigate(target, { replace: true });
      }
      setLeaveOpen(true);
    };
    const stopPop = listenSettingsPop(pop);
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      stopPop();
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, [dirty, navigate]);
  const commit = (): boolean => {
    setError("");
    if (section === "personal") {
      const persisted = updatePersonal({
        ...personalDraft,
        mode: personal.mode,
      });
      setTheme(themeDraft);
      setNotice(
        persisted
          ? text(
              "Personal preferences saved for this device.",
              "এই ডিভাইসে পছন্দ সংরক্ষিত হয়েছে।",
            )
          : text(
              "Preferences are in memory only. Browser storage is unavailable.",
              "পছন্দ শুধু এই সেশনে আছে। ব্রাউজারে সংরক্ষণ করা যায়নি।",
            ),
      );
      return true;
    }
    if (section === "data" || section === "security") return false;
    const result = save(section, draft as never, revision);
    if (!result.ok) {
      const message = result.error || "Could not save settings.";
      setError(message);
      setReviewOpen(false);
      return false;
    }
    setRevision(result.revision ?? state.revision + 1);
    setBaseline(JSON.stringify(draft));
    setNotice(
      result.persisted === false
        ? text(
            "Changes are in memory only. Download a backup before leaving.",
            "পরিবর্তন শুধু এই সেশনে আছে। বের হওয়ার আগে ব্যাকআপ নামান।",
          )
        : text("Business settings saved.", "দোকানের সেটিংস সংরক্ষিত হয়েছে।"),
    );
    setReviewOpen(false);
    return true;
  };
  const changes =
    section === "personal" || section === "data" || section === "security"
      ? []
      : (settingsFields[section] || []).filter(
          (field) =>
            JSON.stringify(
              (draft as unknown as Record<string, unknown>)[field.key],
            ) !==
            JSON.stringify(
              (state.sections[section] as unknown as Record<string, unknown>)[
                field.key
              ],
            ),
        );
  const needsReview = changes.some((f) =>
    ["rounding", "allocation", "prefix", "lockDate"].includes(f.key),
  );
  const items = (
    [
      "business",
      "sales",
      "products",
      "purchases",
      "money",
      "financialTerminology",
      "invoices",
      "team",
      "notifications",
      "interface",
      "personal",
      "security",
      "data",
    ] as SettingsSection[]
  ).map((id) => ({ id, ...sectionNames[id] }));
  const results = query.trim()
    ? [
        ...Object.entries(settingsFields).flatMap(([key, fields]) =>
          (fields ?? [])
            .filter((field) =>
              fuzzyMatch(query, [
                field.label,
                field.bn,
                field.hint,
                sectionNames[key as SettingsSection].label,
              ]),
            )
            .map((field) => ({
              section: key as SettingsSection,
              field: field.key,
              label: field.label,
              bn: field.bn,
            })),
        ),
        ...items
          .filter((item) =>
            fuzzyMatch(query, [item.label, item.bn, item.description]),
          )
          .map((item) => ({
            section: item.id,
            field: "",
            label: item.label,
            bn: item.bn,
          })),
      ].slice(0, 12)
    : [];
  const info = sectionNames[section],
    Icon = icons[section];
  const selectSection = (next: string) => {
    if (next !== section)
      requestChange(() => {
        setDirectoryOpen(false);
        navigate(`/app/settings/${next}`, {
          state: { settingsTabFocus: next },
        });
      });
    else setDirectoryOpen(false);
  };
  const finishNavigation = () => {
    setLeaveOpen(false);
    pending.current?.();
    pending.current = null;
  };
  const submit = (continuing = false) => {
    if (needsReview) {
      setReviewContinue(continuing);
      setLeaveOpen(false);
      setReviewOpen(true);
    } else if (commit() && continuing) finishNavigation();
  };
  const search = (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setQuery("");
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setQuery("");
          event.currentTarget.querySelector("input")?.focus();
        }
        if (
          event.key === "ArrowDown" &&
          event.target instanceof HTMLInputElement
        ) {
          event.preventDefault();
          event.currentTarget
            .querySelector<HTMLButtonElement>("[data-settings-result]")
            ?.focus();
        }
      }}
    >
      <Search
        className="pointer-events-none absolute left-2.5 top-[10px] size-4 text-helper"
        aria-hidden="true"
      />
      <Input
        type="search"
        aria-label={text("Search settings", "সেটিংস খুঁজুন")}
        placeholder={text("Find a setting…", "সেটিংস খুঁজুন…")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="pl-8"
      />
      {query && (
        <div
          role="region"
          aria-label={text("Settings search results", "সেটিংস খোঁজার ফল")}
          className="absolute left-0 top-full z-30 mt-1 max-h-80 w-80 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-pop"
        >
          {results.length ? (
            results.map((result, index) => (
              <button
                key={`${result.section}-${result.field}`}
                type="button"
                data-settings-result
                className="block w-full rounded-md px-3 py-2 text-left text-[13px] text-ink hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                onKeyDown={(event) => {
                  if (["ArrowDown", "ArrowUp"].includes(event.key)) {
                    event.preventDefault();
                    const buttons =
                      event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>(
                        "[data-settings-result]",
                      );
                    buttons[
                      (index +
                        (event.key === "ArrowDown" ? 1 : -1) +
                        buttons.length) %
                        buttons.length
                    ]?.focus();
                  }
                }}
                onClick={() => {
                  const reveal = () => {
                    setQuery("");
                    setDirectoryOpen(false);
                    if (result.section === "invoices")
                      selectSubsection("invoice");
                    navigate(`/app/settings/${result.section}`, {
                      state: {
                        settingsField: result.field,
                        settingsTabFocus: result.section,
                      },
                    });
                  };
                  if (result.section === section && !embedded) reveal();
                  else requestChange(reveal);
                }}
              >
                {text(result.label, result.bn)}
                {result.field && (
                  <span className="block text-[11px] text-helper">
                    {text(
                      sectionNames[result.section].label,
                      sectionNames[result.section].bn,
                    )}
                  </span>
                )}
              </button>
            ))
          ) : (
            <p role="status" className="p-3 text-xs text-helper">
              {text(
                "No matching settings. Try another word.",
                "মিল পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।",
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
  const feedback = (
    <>
      {error && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="rounded-lg bg-danger-bg p-3 text-[13px] text-danger"
        >
          {text(
            error,
            settingsErrorBangla[error] ??
              settingsCopy(personal.language, error),
          )}
        </div>
      )}
      {notice && (
        <p
          role="status"
          className="flex items-start gap-2 text-xs text-success"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {notice}
        </p>
      )}
    </>
  );
  const saveBar = (
    <div
      data-settings-savebar
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card pt-3"
    >
      <span className="flex items-center gap-2 text-xs text-helper">
        <span
          className={
            "size-1.5 rounded-full " + (dirty ? "bg-warning" : "bg-ink-400")
          }
          aria-hidden="true"
        />
        {dirty
          ? text("Unsaved changes", "সংরক্ষণ হয়নি")
          : section === "personal"
            ? text("Saved on this device", "এই ডিভাইসে সংরক্ষিত")
            : text("For the whole shop", "পুরো দোকানের জন্য")}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={!dirty || readingLogo}
          onClick={() => {
            load();
            setNotice("");
          }}
        >
          {text("Cancel", "বাতিল")}
        </Button>
        <Button type="submit" disabled={!dirty || !editable || readingLogo}>
          <Save className="size-4" aria-hidden="true" />
          {text("Save changes", "সংরক্ষণ")}
        </Button>
      </div>
    </div>
  );
  const renderTasks = (key: BusinessSection) =>
    taskFields(key, settingsFields[key] ?? []).map((task, index) => (
      <fieldset
        key={task.label}
        className={
          index
            ? "min-w-0 space-y-3 border-t border-border pt-4"
            : "min-w-0 space-y-3"
        }
      >
        <legend className="sr-only">{text(task.label, task.bn)}</legend>
        {key !== "business" || index > 0 ? (
          <h3 className="text-[13px] font-medium text-ink">
            {text(task.label, task.bn)}
          </h3>
        ) : null}
        <Fields
          section={key}
          fields={task.fields}
          value={draft}
          onChange={setDraft}
          disabled={!editable}
          language={personal.language}
          onReading={setReadingLogo}
          showHelp={showHelp}
          error={text(
            error,
            settingsErrorBangla[error] ??
              settingsCopy(personal.language, error),
          )}
          errorKey={
            (settingsFields[key] ?? []).find(
              (field) =>
                error.toLowerCase().includes(field.key.toLowerCase()) ||
                error.toLowerCase().includes(field.label.toLowerCase()),
            )?.key
          }
        />
      </fieldset>
    ));
  const personalChoice = (
    label: string,
    bn: string,
    value: string,
    options: { value: string; label: string }[],
    onChange: (next: string) => void,
  ) => (
    <SettingsField label={label} bn={bn} language={personal.language}>
      {(id) => (
        <AppSelect
          id={id}
          label={text(label, bn)}
          value={value}
          options={options}
          onChange={onChange}
        />
      )}
    </SettingsField>
  );
  const choices = (values: string[]) =>
    values.map((value) => ({
      value,
      label: settingOption(value, personal.language),
    }));
  const generic = [
    "business",
    "sales",
    "products",
    "purchases",
    "money",
    "notifications",
    "personal",
  ].includes(section);
  const headingActions = (
    <div className="flex items-center gap-2">
      <span className="text-xs text-helper">
        {section === "personal"
          ? text("This device", "এই ডিভাইস")
          : text("Whole shop", "পুরো দোকান")}
      </span>
      {generic && section !== "personal" && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={text("Explain these settings", "সেটিংস বুঝিয়ে বলুন")}
          aria-pressed={showHelp}
          title={text("Help", "সাহায্য")}
          onClick={() => setShowHelp(!showHelp)}
        >
          <Info className="size-4" aria-hidden="true" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        disabled={!editable}
        aria-label={text("Restore defaults", "আগের নিয়ম ফিরিয়ে আনুন")}
        title={text("Restore defaults", "আগের নিয়ম ফিরিয়ে আনুন")}
        onClick={() => setResetOpen(true)}
      >
        <RotateCcw className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
  const content =
    section === "personal" ? (
      <div className="grid gap-4 sm:grid-cols-2">
        {personalChoice(
          "Appearance",
          "চেহারা",
          themeDraft,
          [
            { value: "light", label: text("Light", "হালকা") },
            { value: "dark", label: text("Dark", "গাঢ়") },
            { value: "system", label: text("System", "ডিভাইস অনুযায়ী") },
          ],
          (next) => setThemeDraft(next as typeof theme),
        )}
        {personalChoice(
          "Language",
          "ভাষা",
          personalDraft.language,
          choices(["English + Bangla", "English", "Bangla"]),
          (next) =>
            setPersonalDraft({
              ...personalDraft,
              language: next as PersonalSettings["language"],
            }),
        )}
        {personalChoice(
          "Table spacing",
          "টেবিলের ফাঁকা জায়গা",
          personalDraft.density,
          choices(["Compact", "Comfortable"]),
          (next) =>
            setPersonalDraft({
              ...personalDraft,
              density: next as PersonalSettings["density"],
            }),
        )}
        {personalChoice(
          "Search matching",
          "খোঁজার ধরন",
          personalDraft.searchMode,
          [
            {
              value: "Default",
              label: text("Match all words", "সব শব্দ মিলিয়ে"),
            },
            {
              value: "Advanced",
              label: text("Find related matches", "কাছাকাছি মিলও দেখান"),
            },
          ],
          (next) =>
            setPersonalDraft({
              ...personalDraft,
              searchMode: next as PersonalSettings["searchMode"],
            }),
        )}
        {personalChoice(
          "Financial words",
          "হিসাবের ভাষা",
          personalDraft.terminology,
          [
            { value: "simple", label: text("Everyday words", "সহজ ভাষা") },
            {
              value: "accounting",
              label: text("Accounting terms", "হিসাবের পরিভাষা"),
            },
          ],
          (next) =>
            setPersonalDraft({
              ...personalDraft,
              terminology: next as PersonalSettings["terminology"],
            }),
        )}
        {personalChoice(
          "Date to show",
          "যে তারিখ দেখাবে",
          personalDraft.dateView,
          [
            {
              value: "transaction",
              label: text("Transaction date", "লেনদেনের তারিখ"),
            },
            { value: "created", label: text("Entry date", "লেখার তারিখ") },
          ],
          (next) =>
            setPersonalDraft({
              ...personalDraft,
              dateView: next as PersonalSettings["dateView"],
            }),
        )}
      </div>
    ) : generic ? (
      <>
        {renderTasks(section as BusinessSection)}
        {section === "products" && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            {[
              ["categories", "Categories", "ধরন"],
              ["units", "Units", "একক"],
              ["brands", "Brands", "ব্র্যান্ড"],
            ].map(([tab, en, bn]) => (
              <Link
                key={tab}
                to={`/app/products?view=settings&tab=${tab}`}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-[13px] text-ink hover:bg-accent"
              >
                <Package className="size-4" aria-hidden="true" />
                {text(en, bn)}
              </Link>
            ))}
          </div>
        )}
        {section === "money" && (
          <Link
            className="inline-flex min-h-9 items-center gap-2 text-[13px] text-primary hover:underline"
            to="/app/accounts"
          >
            <Wallet className="size-4" aria-hidden="true" />
            {text("Manage accounts", "হিসাব দেখুন")}
          </Link>
        )}
        {section === "notifications" && (
          <details className="border-t border-border pt-3 text-[13px]">
            <summary className="cursor-pointer text-primary">
              {text("Message preview", "বার্তার নমুনা")}
            </summary>
            <p className="mt-3 whitespace-pre-wrap text-ink">
              {(draft as SettingsSections["notifications"]).smsTemplate}
            </p>
            <p className="mt-2 text-xs text-helper">
              {text(
                "Preview only. No SMS is sent.",
                "শুধু নমুনা। এসএমএস পাঠানো হবে না।",
              )}
            </p>
            <Link
              to="/app/notifications"
              className="mt-2 inline-flex min-h-9 items-center text-primary hover:underline"
            >
              {text("SMS rules", "এসএমএসের নিয়ম")}
            </Link>
          </details>
        )}
      </>
    ) : section === "team" ? (
      <TeamSettings
        state={state}
        actorId={actorId}
        language={personal.language}
        value={draft as SettingsSections["team"]}
        disabled={!editable}
        onChange={setDraft}
      />
    ) : section === "interface" ? (
      <InterfaceSettings
        value={draft as ModuleViews}
        onChange={setDraft}
        disabled={!editable}
      />
    ) : section === "financialTerminology" ? (
      <FinancialTerminologySettings
        value={draft as FinancialDisplay}
        disabled={!editable}
        language={personal.language}
        onChange={setDraft}
      />
    ) : section === "invoices" ? (
      <>
        <SettingsTabs
          secondary
          inline
          id={`${tabsId}-sub`}
          panelId={`${tabsId}-sub-content`}
          label={text("Print settings", "প্রিন্টের সেটিংস")}
          value={activeSubsection}
          language={personal.language}
          items={subsections}
          onChange={selectSubsection}
        />
        <div
          id={`${tabsId}-sub-content`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-sub-${activeSubsection}`}
        >
          <div hidden={activeSubsection !== "invoice"} className="space-y-4">
            <DocumentDesignSettings
              value={draft as SettingsSections["invoices"]}
              business={state.sections.business}
              disabled={!editable}
              onChange={setDraft}
            />
            <SettingCard title="Numbering & copies" titleBn="বিল নম্বর ও কপি">
              {renderTasks("invoices")}
            </SettingCard>
          </div>
          <div hidden={activeSubsection !== "output"}>
            <OutputDesignSettings
              value={draft as SettingsSections["invoices"]}
              business={state.sections.business}
              disabled={!editable}
              onChange={setDraft}
            />
          </div>
        </div>
      </>
    ) : null;
  return (
    <div
      data-testid="settings-title"
      data-settings-dirty={dirty}
      className="erp-settings min-w-0 flex-1 space-y-4"
    >
      <PageHeader
        title={embedded ? info.label : "Settings"}
        titleBn={embedded ? info.bn : "সেটিংস"}
        compact
        actions={
          <Button
            variant="ghost"
            aria-label={text("About this preview", "এই প্রিভিউ সম্পর্কে")}
            title={text("UI preview", "ডিজাইন প্রিভিউ")}
            onClick={() => setPreviewOpen(true)}
          >
            <Info className="size-4" aria-hidden="true" />
            <span className="text-xs">
              {text("UI preview", "ডিজাইন প্রিভিউ")}
            </span>
          </Button>
        }
      />
      {!desktop && !embedded && (
        <div className="space-y-3">
          {search}
          <Button
            id={`${tabsId}-choose`}
            variant="outline"
            className="w-full justify-between"
            aria-expanded={directoryOpen}
            aria-controls={`${tabsId}-mobile-directory`}
            onClick={() => setDirectoryOpen(!directoryOpen)}
          >
            <span className="flex items-center gap-2">
              <Icon className="size-4" aria-hidden="true" />
              {text(info.label, info.bn)}
            </span>
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>
          {directoryOpen && (
            <div id={`${tabsId}-mobile-directory`}>
              <SettingsDirectory
                mobile
                items={items}
                selected={section}
                language={personal.language}
                id={`${tabsId}-directory`}
                panelId={`${tabsId}-content`}
                onSelect={selectSection}
              />
            </div>
          )}
        </div>
      )}
      <div
        className={
          embedded
            ? "min-w-0"
            : "grid min-w-0 items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)]"
        }
      >
        {!embedded && desktop && (
          <SettingsDirectory
            items={items}
            selected={section}
            language={personal.language}
            id={`${tabsId}-directory`}
            panelId={`${tabsId}-content`}
            onSelect={selectSection}
            search={search}
          />
        )}
        <div
          data-settings-subpanel
          id={`${tabsId}-content`}
          role={desktop && !embedded ? "tabpanel" : "region"}
          aria-label={text(info.label, info.bn)}
          aria-labelledby={
            desktop && !embedded ? `${tabsId}-directory-${section}` : undefined
          }
          className="min-w-0 space-y-4"
        >
          {!canView ? (
            <SettingCard title="No access" titleBn="অনুমতি নেই">
              <p className="text-[13px] text-helper">
                {text(
                  "Ask the shop owner for access.",
                  "দোকানের মালিকের কাছে অনুমতি চান।",
                )}
              </p>
            </SettingCard>
          ) : section === "security" ? (
            <AccountSecuritySettings language={personal.language} />
          ) : section === "data" ? (
            <DataSettings />
          ) : (
            <form
              data-settings-form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (dirty && editable && !readingLogo) submit();
              }}
              className="min-w-0 space-y-4"
            >
              {!editable && (
                <p
                  role="status"
                  className="rounded-lg bg-info-bg p-3 text-xs text-info"
                >
                  {text(
                    "View only. Ask the shop owner to make changes.",
                    "শুধু দেখতে পারবেন। পরিবর্তনের জন্য মালিককে বলুন।",
                  )}
                </p>
              )}
              {generic ? (
                <SettingCard
                  title={section === "business" ? "Shop details" : info.label}
                  titleBn={section === "business" ? "দোকানের তথ্য" : info.bn}
                  actions={headingActions}
                >
                  {content}
                  {feedback}
                  {saveBar}
                </SettingCard>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                    {!embedded && (
                      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <Icon
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        {text(info.label, info.bn)}
                      </h2>
                    )}
                    {headingActions}
                  </div>
                  {content}
                  {feedback}
                  {saveBar}
                </>
              )}
            </form>
          )}
        </div>
      </div>
      <footer className="flex flex-wrap gap-4 text-xs">
        {state.sections.team.employees
          .find((e) => e.id === actorId)
          ?.roleIds.includes("owner") && (
          <Link
            className="inline-flex min-h-9 items-center text-primary hover:underline"
            to="/app/subscription"
          >
            {text("Plan & SMS credits", "প্যাকেজ ও এসএমএস")}
          </Link>
        )}
        <Link
          className="inline-flex min-h-9 items-center text-primary hover:underline"
          to="/app/support"
        >
          {text("Get help", "সাহায্য নিন")}
        </Link>
      </footer>
      <SettingsDialog
        title={text("About this preview", "এই প্রিভিউ সম্পর্কে")}
        description={text(
          "Settings are saved in this browser. Unconnected policies and security actions are previews; no SMS is sent.",
          "সেটিংস এই ব্রাউজারে থাকে। সংযুক্ত হয়নি এমন নিয়ম ও নিরাপত্তার কাজ শুধু নমুনা; এসএমএস যায় না।",
        )}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      >
        <SettingsField label="Demo employee access" bn="নমুনা কর্মীর অনুমতি">
          {(id) => (
            <AppSelect
              id={id}
              label={text("Demo employee access", "নমুনা কর্মীর অনুমতি")}
              value={actorId}
              onChange={(next) => {
                setPreviewOpen(false);
                requestChange(() => setActorId(next));
              }}
              options={state.sections.team.employees.map((e) => ({
                value: e.id,
                label:
                  e.name + (!e.active ? text(" · Disabled", " · বন্ধ") : ""),
              }))}
            />
          )}
        </SettingsField>
      </SettingsDialog>
      <SettingsDialog
        title={text("Save your changes?", "পরিবর্তন সংরক্ষণ করবেন?")}
        description={text(
          "Save before leaving, or keep editing.",
          "বের হওয়ার আগে সংরক্ষণ করুন, অথবা কাজ চালিয়ে যান।",
        )}
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
      >
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => setLeaveOpen(false)}>
            {text("Keep editing", "কাজ চালিয়ে যান")}
          </Button>
          <Button variant="outline" onClick={finishNavigation}>
            {text("Discard and continue", "বাদ দিয়ে এগিয়ে যান")}
          </Button>
          <Button
            disabled={!editable || readingLogo}
            onClick={() => submit(true)}
          >
            {text("Save and continue", "সংরক্ষণ করে এগিয়ে যান")}
          </Button>
        </div>
      </SettingsDialog>
      <SettingsDialog
        title={text(
          "Restore section defaults?",
          "এই বিভাগের আগের নিয়ম ফিরিয়ে আনবেন?",
        )}
        description={text(
          "Loads example defaults into this draft. Save to apply. Existing records stay unchanged.",
          "খসড়ায় নমুনা নিয়ম আসবে। প্রয়োগ করতে সংরক্ষণ করুন। পুরোনো রেকর্ড ঠিক থাকবে।",
        )}
        open={resetOpen}
        onClose={() => setResetOpen(false)}
      >
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => setResetOpen(false)}>
            {text("Cancel", "বাতিল")}
          </Button>
          <Button
            onClick={() => {
              if (section === "personal") {
                setPersonalDraft({ ...personalDefaults, mode: personal.mode });
                setThemeDraft("system");
              } else if (section !== "data" && section !== "security")
                setDraft(
                  structuredClone(defaults(state.tenantId).sections[section]),
                );
              setResetOpen(false);
              setNotice(
                text(
                  "Defaults loaded. Save to apply.",
                  "আগের নিয়ম এসেছে। প্রয়োগ করতে সংরক্ষণ করুন।",
                ),
              );
            }}
          >
            {text("Load defaults", "আগের নিয়ম আনুন")}
          </Button>
        </div>
      </SettingsDialog>
      <SettingsDialog
        title={text("Review changes", "পরিবর্তন দেখে নিন")}
        description={text(
          "These changes affect future entry. Existing invoice numbers and sold warranty records stay unchanged.",
          "নতুন কাজের ক্ষেত্রে এই নিয়ম প্রযোজ্য। পুরোনো বিল নম্বর ও বিক্রির ওয়ারেন্টি ঠিক থাকবে।",
        )}
        open={reviewOpen}
        onClose={() => {
          setReviewOpen(false);
          setReviewContinue(false);
        }}
      >
        <div className="space-y-3">
          {changes.map((field) => (
            <div
              key={field.key}
              className="border-b border-border pb-2 text-[13px]"
            >
              <p className="font-medium">{text(field.label, field.bn)}</p>
              <p className="mt-1 text-xs text-helper">
                {String(
                  (
                    state.sections[
                      section as BusinessSection
                    ] as unknown as Record<string, unknown>
                  )[field.key] ?? text("Not set", "দেওয়া নেই"),
                )}{" "}
                →{" "}
                {String(
                  (draft as unknown as Record<string, unknown>)[field.key] ??
                    text("Not set", "দেওয়া নেই"),
                )}
              </p>
            </div>
          ))}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReviewOpen(false);
                setReviewContinue(false);
              }}
            >
              {text("Keep editing", "কাজ চালিয়ে যান")}
            </Button>
            <Button
              onClick={() => {
                if (commit() && reviewContinue) finishNavigation();
                setReviewContinue(false);
              }}
            >
              {text("Confirm save", "সংরক্ষণ করুন")}
            </Button>
          </div>
        </div>
      </SettingsDialog>
    </div>
  );
}

export function TenantSettingsPage() {
  const { section } = useParams();
  return <SettingsPageContent key={section || "business"} />;
}
