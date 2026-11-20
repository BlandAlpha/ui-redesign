"use client";

// Modified for TRACEFOLIO (2026): shared preparation form typography and surfaces.

import { useId, useRef } from "react";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { Settings, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

import { ResumeSourcePicker } from "@/components/resume/resume-source-picker";
import { SpeechTextarea } from "@/components/shared/speech-textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ResumePickerProps = Omit<ComponentProps<typeof ResumeSourcePicker>, "className">;

export const RESUME_IMPORT_AI_SETUP_MESSAGE =
  "可以继续使用本地规则导入带文字的简历。图片或扫描 PDF 请在设置中选择支持图片输入的模型。";

export function ResumeJdPreparation({
  resumePicker,
  title,
  jdLabel,
  jdValue,
  onJdChange,
  jdPlaceholder,
  settingsTitle,
  settings,
  footer,
  notice,
  onJdImportStatus,
}: {
  resumePicker: ResumePickerProps;
  title: string;
  jdLabel: string;
  jdValue: string;
  onJdChange: (value: string) => void;
  jdPlaceholder: string;
  settingsTitle: string;
  settings: ReactNode;
  footer: ReactNode;
  notice?: ReactNode;
  onJdImportStatus?: (message: string) => void;
}) {
  const t = useTranslations("jdPreparation");
  const jdFileInput = useRef<HTMLInputElement>(null);

  async function importJdFile(file?: File) {
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) {
      onJdImportStatus?.(t("uploadUnsupported"));
      return;
    }
    const text = (await file.text()).trim();
    if (!text) {
      onJdImportStatus?.(t("uploadEmpty"));
      return;
    }
    onJdChange(text);
    onJdImportStatus?.(t("uploadImported", { fileName: file.name, count: text.length }));
  }

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="grid xl:grid-cols-[320px_minmax(0,1fr)]">
        <ResumeSourcePicker
          {...resumePicker}
          className="border-b border-line xl:border-r xl:border-b-0"
        />

        <section className="flex min-w-0 flex-col">
          <div className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <h2 className="text-ui-section font-semibold">{title}</h2>
              <Button type="button" variant="outline" className="self-start" onClick={() => jdFileInput.current?.click()}>
                <Upload aria-hidden />
                {t("uploadJd")}
              </Button>
              <input
                ref={jdFileInput}
                type="file"
                className="hidden"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={(event) => {
                  void importJdFile(event.currentTarget.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </div>
          </div>

          <div className="space-y-5 p-5 lg:p-6">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">{jdLabel}</span>
              <SpeechTextarea
                required
                maxLength={8000}
                value={jdValue}
                onValueChange={onJdChange}
                placeholder={jdPlaceholder}
                wrapperClassName="mt-2"
                className="resume-library-scroll h-[210px] min-h-[210px] field-sizing-fixed resize-y overflow-y-auto bg-surface-low px-4 py-4 text-sm leading-7"
              />
              {jdValue.length >= 7600 ? <span className="mt-1 block text-right text-ui-meta text-muted-foreground">{jdValue.length} / 8000</span> : null}
            </label>

            <div className="-mx-5 px-5 pt-6 lg:-mx-6 lg:px-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">{settingsTitle}</h3>
              </div>
              {settings}
            </div>
          </div>

          <div className="shrink-0 border-t border-line px-5 py-4 lg:px-6">{footer}</div>
        </section>
      </div>
      {notice ? <div className="border-t border-line px-5 py-4 lg:px-6">{notice}</div> : null}
    </section>
  );
}

export function AiSetupRequiredDialog({
  open,
  message,
  title,
  secondaryLabel,
  onOpenChange,
  onOpenSettings,
  onSecondary,
}: {
  open: boolean;
  message: string;
  title?: string;
  secondaryLabel?: string;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
  onSecondary?: () => void;
}) {
  const t = useTranslations("jdPreparation.aiDialog");

  function handleOpenSettings() {
    onOpenChange(false);
    onOpenSettings();
  }

  function handleSecondary() {
    onOpenChange(false);
    onSecondary?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0" showCloseButton={false}>
        <DialogHeader className="border-b border-line p-5">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            {title ?? t("title")}
          </DialogTitle>
          <DialogDescription className="mt-2 leading-6">
            {message || t("message")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mx-0 mb-0 flex-row justify-end gap-2 rounded-none border-0 bg-transparent px-5 pt-1 pb-4">
          {onSecondary ? (
            <Button type="button" variant="outline" onClick={handleSecondary}>{secondaryLabel ?? t("later")}</Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{secondaryLabel ?? t("later")}</Button>
          )}
          <Button type="button" onClick={handleOpenSettings}>{t("settings")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PreparationOptionCard({
  checked,
  icon: Icon,
  label,
  description,
  onChange,
  radio,
}: {
  checked: boolean;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  description?: string;
  onChange: () => void;
  radio?: { name: string; value: string };
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <label
      htmlFor={id}
      className={cn(
        "grid min-h-[72px] w-full min-w-0 cursor-pointer grid-cols-[16px_minmax(0,1fr)_36px] items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring motion-reduce:transition-none",
        checked ? "border-primary/40 bg-primary-soft/50" : "border-line bg-surface hover:bg-surface-low",
      )}
    >
      <Icon aria-hidden className="size-4 text-brand" />
      <span className="min-w-0">
        <span id={labelId} className="block text-ui-body font-semibold [overflow-wrap:anywhere]">{label}</span>
        {description ? <span id={descriptionId} className="block text-ui-meta text-muted-foreground">{description}</span> : null}
      </span>
      {radio ? (
        <input
          id={id}
          type="radio"
          name={radio.name}
          value={radio.value}
          checked={checked}
          onChange={onChange}
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
          className="size-[18px] justify-self-end accent-primary"
        />
      ) : (
        <Switch id={id} checked={checked} onCheckedChange={onChange} aria-labelledby={labelId} aria-describedby={descriptionId} />
      )}
    </label>
  );
}
