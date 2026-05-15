import { useCallback, useRef, useState } from "react";
import { Upload, ImageIcon, X } from "lucide-react";

interface UploadZoneProps {
  onImageSelect: (base64: string, preview: string) => void;
  preview: string | null;
  onClear: () => void;
  disabled?: boolean;
}

export function UploadZone({ onImageSelect, preview, onClear, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(",")[1] ?? "";
        onImageSelect(base64, result);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  if (preview) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden border border-border group">
        <img src={preview} alt="Selected" className="w-full object-cover" style={{ maxHeight: 288 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {!disabled && (
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 border border-border text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary opacity-70" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary opacity-70" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary opacity-70" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary opacity-70" />
      </div>
    );
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative w-full min-h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
        isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-card/50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} disabled={disabled} />
      <div className={`p-4 rounded-full border border-border/50 ${isDragging ? "border-primary bg-primary/10" : "bg-card"}`}>
        {isDragging ? <ImageIcon className="w-8 h-8 text-primary" /> : <Upload className="w-8 h-8 text-muted-foreground" />}
      </div>
      <div className="text-center px-4">
        <p className="text-sm font-medium text-foreground">{isDragging ? "Drop image to analyze" : "Drag & drop an image"}</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse · PNG, JPG, WEBP</p>
      </div>
      <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-primary/30" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-primary/30" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-primary/30" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-primary/30" />
    </div>
  );
}
