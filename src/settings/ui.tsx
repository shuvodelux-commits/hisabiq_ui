import {
  useId,
  type ComponentType,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import * as buttons from "../components/Button";
import * as inputs from "../components/Input";
import * as switches from "../components/Switch";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../components/Dialog";
import { Panel } from "../components/Panel";
import { useTenantSettings } from "./TenantSettingsProvider";
// Use the existing shadcn design-system exports; declarations are absent in the generated bundle.
const { Button: DesignButton } = buttons as unknown as {
  Button: ComponentType<
    ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: string;
      size?: string;
    }
  >;
};
export function Button({
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
  size?: string;
}) {
  return <DesignButton type={type} {...props} />;
}
export const { Input } = inputs as unknown as {
  Input: ComponentType<InputHTMLAttributes<HTMLInputElement>>;
};
const { Switch: DesignSwitch } = switches as unknown as {
  Switch: ComponentType<{
    checked: boolean;
    onCheckedChange: (value: boolean) => void;
    id?: string;
    disabled?: boolean;
    "aria-label"?: string;
    "aria-describedby"?: string;
    role?: string;
    "aria-checked"?: boolean;
  }>;
};
export function Switch(props: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  id?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  return <DesignSwitch role="switch" aria-checked={props.checked} {...props} />;
}
export function SettingsDialog({
  title,
  description,
  open,
  onClose,
  children,
}: {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const { personal } = useTenantSettings();
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100vw-2rem)] max-w-xl"
      >
        <div className="mb-4 pr-8">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-ink-500">
            {description}
          </DialogDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={personal.language === "Bangla" ? "বন্ধ করুন" : "Close"}
          onClick={onClose}
          className="absolute right-3 top-3"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function SettingsField({
  label,
  bn,
  hint,
  language,
  fieldKey,
  error,
  children,
}: {
  label: string;
  bn: string;
  hint?: string;
  language?: string;
  fieldKey?: string;
  error?: string;
  children: (id: string, descriptionId: string) => ReactNode;
}) {
  const { personal } = useTenantSettings();
  const locale = language ?? personal.language;
  const id = useId(),
    descriptionId = `${id}-description`;
  return (
    <div
      data-slot="field"
      data-field-key={fieldKey}
      tabIndex={fieldKey ? -1 : undefined}
      className="min-w-0 space-y-1.5"
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <label
          data-slot="field-label"
          htmlFor={id}
          className="block text-[13px] font-medium text-ink"
        >
          {locale === "Bangla" ? bn || label : label}
          {locale === "English + Bangla" && bn && bn !== label && (
            <span
              lang="bn"
              className="ml-2 font-bn text-[11px] font-normal text-helper"
            >
              {bn}
            </span>
          )}
        </label>
      </div>
      {children(id, descriptionId)}
      {(error || hint) && (
        <p
          id={descriptionId}
          data-slot="field-description"
          className={
            "text-xs leading-relaxed " +
            (error ? "text-danger" : "text-ink-500")
          }
        >
          {error || hint}
        </p>
      )}
      {!error && !hint && <span id={descriptionId} hidden />}
    </div>
  );
}
export const controlClass =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-70";
export function SettingCard({
  title,
  titleBn,
  actions,
  children,
}: {
  title: string;
  titleBn?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { personal } = useTenantSettings();
  return (
    <Panel
      title={personal.language === "Bangla" && titleBn ? titleBn : title}
      actions={actions}
      bodyClassName="space-y-4 p-4"
    >
      {children}
    </Panel>
  );
}
export function download(
  name: string,
  content: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
