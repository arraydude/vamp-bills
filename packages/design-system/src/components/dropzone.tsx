import { cn } from "@workspace/ui/lib/utils";
import type { DropzoneOptions } from "react-dropzone";
import { useDropzone } from "react-dropzone";

type DropzoneProps = Omit<DropzoneOptions, "onDrop"> & {
  onDrop: (files: File[]) => void;
  className?: string;
  children?: React.ReactNode;
};

function Dropzone({ onDrop, className, children, ...options }: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    ...options,
    onDrop: (accepted) => onDrop(accepted),
  });

  return (
    <div
      data-slot="dropzone"
      data-drag-active={isDragActive || undefined}
      data-drag-reject={isDragReject || undefined}
      {...getRootProps({
        className: cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          options.disabled && "pointer-events-none opacity-50",
          className,
        ),
      })}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  );
}

export type { DropzoneProps };
export { Dropzone };
