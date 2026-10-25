import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import { fileToBase64, validateImageFile } from "../../lib/file-utils";

interface AvatarUploadProps {
  value?: string | null;
  onChange: (base64: string | null) => void;
  className?: string;
}

export function AvatarUpload({ value, onChange, className }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      onChange(null);
      return;
    }
    const base64 = await fileToBase64(file);
    onChange(base64);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <Avatar className="h-20 w-20">
        {value ? <AvatarImage src={value} /> : null}
        <AvatarFallback>IMG</AvatarFallback>
      </Avatar>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          Pilih Gambar
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Hapus
          </Button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
