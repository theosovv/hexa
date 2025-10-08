import { createSignal, Show, type Component } from "solid-js";

import { Vertical } from "./Stack";

import { css } from "@/styled-system/css";
import { token } from "@/styled-system/tokens";

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export const FileUpload: Component<FileUploadProps> = (props) => {
  let fileInputRef: HTMLInputElement | undefined;

  const [isUploading, setIsUploading] = createSignal(false);
  const [uploadProgress, setUploadProgress] = createSignal(0);
  const [error, setError] = createSignal<string | null>(null);

  const accept = () => props.accept || "audio/*";
  const maxSize = () => props.maxSize || 10 * 1024 * 1024;

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    setError(null);

    if (file.size > maxSize()) {
      setError(`File too large (max ${(maxSize() / 1024 / 1024).toFixed(0)}MB)`);
      return;
    }

    if (!file.type.startsWith("audio/")) {
      setError("Invalid file type. Please upload an audio file.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      await props.onUpload(file);
      setUploadProgress(100);

      if (fileInputRef) {
        fileInputRef.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const openFilePicker = () => {
    fileInputRef?.click();
  };

  return (
    <Vertical gap="sm" fullWidth>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept()}
        onChange={handleFileSelect}
        style={{ "display":"none" }}
      />

      <div class={dropzoneStyle} onClick={openFilePicker}>
        <div class={dropzoneIconStyle}>📁</div>
        <div class={dropzoneTextStyle}>
          Click to upload audio file
        </div>
        <div class={dropzoneHintStyle}>
          MP3, WAV, OGG, WebM (max {(maxSize() / 1024 / 1024).toFixed(0)}MB)
        </div>
      </div>

      <Show when={isUploading()}>
        <div class={progressContainerStyle}>
          <div class={progressBarStyle} style={{ width: `${uploadProgress()}%` }} />
        </div>
        <div class={progressTextStyle}>
          Uploading... {uploadProgress().toFixed(0)}%
        </div>
      </Show>

      <Show when={error()}>
        <div class={errorStyle}>
          ⚠️ {error()}
        </div>
      </Show>
    </Vertical>
  );
};

const dropzoneStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: token("spacing.sm"),
  padding: token("spacing.xl"),
  background: token("colors.surface.secondary"),
  border: `2px dashed ${token("colors.border.primary")}`,
  borderRadius: token("radii.lg"),
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    borderColor: token("colors.border.accent"),
    background: token("colors.surface.hover"),
  },
});

const dropzoneIconStyle = css({
  fontSize: token("fontSizes.4xl"),
  opacity: 0.5,
});

const dropzoneTextStyle = css({
  fontSize: token("fontSizes.sm"),
  fontWeight: "600",
  color: token("colors.text.primary"),
});

const dropzoneHintStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.tertiary"),
});

const progressContainerStyle = css({
  width: "100%",
  height: "4px",
  background: token("colors.surface.tertiary"),
  borderRadius: token("radii.full"),
  overflow: "hidden",
});

const progressBarStyle = css({
  height: "100%",
  background: "linear-gradient(90deg, #8b5cf6 0%, #667eea 100%)",
  transition: "width 0.3s ease",
});

const progressTextStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.secondary"),
  textAlign: "center",
});

const errorStyle = css({
  padding: token("spacing.sm"),
  background: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: token("radii.md"),
  fontSize: token("fontSizes.xs"),
  color: "#fca5a5",
});
