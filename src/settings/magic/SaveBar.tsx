import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "../ui";

type SaveBarProps = {
  dirty: boolean;
  saving: boolean;
  error?: string;
  status: string;
  dirtyLabel?: string;
  onSave: () => void;
  onDiscard: () => void;
  onRestore?: () => void;
  restoreLabel?: string;
  restoreDisabled?: boolean;
  saveLabel?: string;
  saveDisabled?: boolean;
  readOnly?: boolean;
};

/**
 * Live-data adaptation of the Magic Patterns Settings SaveBar.
 * Keep mutations and confirmation in the existing tenant Settings form.
 */
export function SaveBar({
  dirty,
  saving,
  error,
  status,
  dirtyLabel = "Unsaved changes",
  onSave,
  onDiscard,
  onRestore,
  restoreLabel = "Restore defaults",
  restoreDisabled,
  saveLabel = "Save",
  saveDisabled,
  readOnly,
}: SaveBarProps) {
  return (
    <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 bg-card p-3 shadow-pop">
      <p role="status" aria-live="polite" className={`min-w-0 text-xs ${error ? "text-danger" : dirty ? "font-medium text-warning" : "text-ink-500"}`}>
        {error || (dirty ? dirtyLabel : status)}
      </p>
      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          {onRestore && (
            <Button variant="ghost" size="sm" disabled={saving || restoreDisabled} onClick={onRestore}>
              <RotateCcw className="size-4" aria-hidden="true" />
              {restoreLabel}
            </Button>
          )}
          <Button variant="outline" size="sm" disabled={!dirty || saving} onClick={onDiscard}>
            Discard
          </Button>
          <Button size="sm" disabled={!dirty || saving || saveDisabled} onClick={onSave}>
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
            {saving ? "Saving…" : saveLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
