"use client";

import { useRef, useState } from "react";

import { Button } from "@/shared/ui/Button";

type FileUploadFormProps = {
  onUpload: (file: File) => Promise<void>;
};

export function FileUploadForm({ onUpload }: FileUploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const file = inputRef.current?.files?.[0];

    if (!file) {
      setError("กรุณาเลือกไฟล์ CSV หรือ Excel");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "csv" && extension !== "xlsx") {
      setError("รองรับเฉพาะไฟล์ .csv และ .xlsx");
      return;
    }

    setIsUploading(true);

    try {
      await onUpload(file);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "อัปโหลดไม่สำเร็จ";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="import-file"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          ไฟล์นำเข้าสินทรัพย์ (CSV / XLSX)
        </label>
        <input
          id="import-file"
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-zinc-300"
        />
        <p className="mt-2 text-xs text-zinc-500">
          หัวคอลัมน์ที่จำเป็น: assetCode, assetName, category,
          acquisitionDate, cost, location, department
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={isUploading}>
        {isUploading ? "กำลังอัปโหลด..." : "เริ่มนำเข้า"}
      </Button>
    </form>
  );
}
