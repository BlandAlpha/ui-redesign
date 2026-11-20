"use client";

// Modified for TRACEFOLIO (2026): source tabs and compact resume selection.

import { Tabs } from "@base-ui/react/tabs";
import type { DragEvent } from "react";
import { useRef } from "react";
import { FileText, LoaderCircle, Pencil, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { RESUME_UPLOAD_ACCEPT, type UploadedResumeDraft } from "@/lib/resume-upload";
import { cn } from "@/lib/utils";

export type ResumePickerOption = {
  id: string;
  name: string;
  detail: string;
};

export function ResumeSourcePicker({
  title,
  source,
  selectedId,
  options,
  uploadedResume,
  uploadError,
  isUploading = false,
  onSourceChange,
  onSelect,
  onUploadFile,
  onUploadRequest,
  onOpenResume,
  className,
}: {
  title?: string;
  source: "library" | "upload";
  selectedId?: string;
  options: ResumePickerOption[];
  uploadedResume: UploadedResumeDraft | null;
  uploadError: string;
  isUploading?: boolean;
  onSourceChange: (source: "library" | "upload") => void;
  onSelect: (id: string) => void;
  onUploadFile: (file: File) => void;
  onUploadRequest?: (openFileDialog: () => void) => void;
  onOpenResume?: (id: string) => void;
  className?: string;
}) {
  const t = useTranslations("resumeSourcePicker");
  const uploadInputRef = useRef<HTMLInputElement>(null);

  function openFileDialog() {
    if (!isUploading) uploadInputRef.current?.click();
  }

  function requestUpload() {
    if (isUploading) return;
    if (onUploadRequest) {
      onUploadRequest(openFileDialog);
      return;
    }
    openFileDialog();
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (isUploading) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onUploadFile(file);
  }

  return (
    <section className={cn("min-h-0 min-w-0 p-ui-block sm:p-ui-section", className)}>
      <h2 className="mb-ui-block flex min-h-9 items-center text-ui-section font-semibold">{title ?? t("title")}</h2>
      <Tabs.Root
        value={source}
        onValueChange={(next) => {
          if (next === "library" || next === "upload") onSourceChange(next);
        }}
      >
        <Tabs.List aria-label={t("title")} className="segment-group mb-ui-block">
          {(["library", "upload"] as const).map((key) => {
            const Icon = key === "library" ? FileText : Upload;
            return (
              <Tabs.Tab
                key={key}
                value={key}
                className="segment-item px-3"
              >
                <Icon aria-hidden className="size-4 shrink-0" />
                {t(key)}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>

        <Tabs.Panel value="library">
          {options.length ? (
            <fieldset aria-label={t("title")} className="resume-library-scroll min-w-0 divide-y divide-line overflow-y-auto xl:max-h-[540px]">
              {options.map((option) => (
                <div key={option.id} className={cn("flex min-w-0 items-center gap-1 rounded-lg pr-1", selectedId === option.id && "bg-brand-muted")}>
                  <label className="flex min-h-[64px] min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-brand-muted/50 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-ring">
                    <input type="radio" name="resume-source-record" checked={selectedId === option.id} onChange={() => onSelect(option.id)} className="size-4 shrink-0 accent-primary" />
                    <span className="min-w-0">
                      <span className="block truncate text-ui-body font-semibold" title={option.name}>{option.name}</span>
                      <span className="block truncate text-ui-meta text-muted-foreground" title={option.detail}>{option.detail}</span>
                    </span>
                  </label>
                  {onOpenResume ? (
                    <Button type="button" size="icon" variant="ghost" aria-label={t("editResume", { name: option.name })} title={t("editResume", { name: option.name })} onClick={() => onOpenResume(option.id)}>
                      <Pencil aria-hidden />
                    </Button>
                  ) : null}
                </div>
              ))}
            </fieldset>
          ) : <p className="rounded-lg bg-surface-low p-4 text-ui-meta text-muted-foreground">{t("empty")}</p>}
        </Tabs.Panel>

        <Tabs.Panel value="upload">
          <input
            ref={uploadInputRef}
            type="file"
            className="hidden"
            disabled={isUploading}
            accept={RESUME_UPLOAD_ACCEPT}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file && !isUploading) onUploadFile(file);
              event.currentTarget.value = "";
            }}
          />
          <button
            type="button"
            disabled={isUploading}
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            onClick={requestUpload}
            className="flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-surface-low p-4 text-center transition-colors duration-150 hover:border-primary hover:bg-primary-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-80"
          >
            {isUploading ? <LoaderCircle aria-hidden className="size-5 animate-spin text-brand motion-reduce:animate-none" /> : <Upload aria-hidden className="size-5 text-brand" />}
            <span className="text-ui-body font-semibold">{isUploading ? t("parsing") : t("import")}</span>
            <span className="text-ui-meta text-muted-foreground">{t("supported")}</span>
          </button>
          {uploadedResume ? <p role="status" className="mt-3 break-words text-ui-meta text-brand">{t("selected", { fileName: uploadedResume.fileName, count: uploadedResume.characterCount })}</p> : null}
          {uploadError ? <p role="alert" className="mt-3 text-ui-meta text-destructive">{uploadError}</p> : null}
          <p className="mt-2 text-ui-meta text-muted-foreground">{t("snapshotOnly")}</p>
        </Tabs.Panel>
      </Tabs.Root>
    </section>
  );
}
