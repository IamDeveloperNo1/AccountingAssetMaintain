"use client";

import { useCallback, useEffect, useState } from "react";

import { FileUploadForm } from "@/modules/import-job/components/FileUploadForm";
import { ImportJobList } from "@/modules/import-job/components/ImportJobList";
import type { ImportJobSummary } from "@/modules/import-job/types/import-job.types";
import { Card } from "@/shared/ui/Card";

async function fetchJobs(): Promise<ImportJobSummary[]> {
  const response = await fetch("/api/import-jobs", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("โหลดรายการงานนำเข้าไม่สำเร็จ");
  }

  const data = (await response.json()) as { jobs: ImportJobSummary[] };
  return data.jobs;
}

export function ImportJobDashboard() {
  const [jobs, setJobs] = useState<ImportJobSummary[]>([]);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshJobs = useCallback(async () => {
    try {
      const nextJobs = await fetchJobs();
      setJobs(nextJobs);
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ",
      );
    }
  }, []);

  useEffect(() => {
    void refreshJobs();
    const interval = setInterval(() => {
      void refreshJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshJobs]);

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/import-jobs", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as {
      job?: ImportJobSummary;
      error?: { message: string };
    };

    if (!response.ok) {
      throw new Error(payload.error?.message ?? "เริ่มงานนำเข้าไม่สำเร็จ");
    }

    await refreshJobs();
  }

  async function handleRetry(jobId: string) {
    setRetryingJobId(jobId);

    try {
      const response = await fetch(`/api/import-jobs/${jobId}/retry`, {
        method: "POST",
      });

      const payload = (await response.json()) as {
        error?: { message: string };
      };

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "ลองใหม่ไม่สำเร็จ");
      }

      await refreshJobs();
    } finally {
      setRetryingJobId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          บำรุงรักษาสินทรัพย์ทางบัญชี
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          นำเข้าข้อมูลสินทรัพย์จาก Excel/CSV แบบ batch พร้อมคิวประมวลผลและติดตามความคืบหน้า
        </p>
      </header>

      <Card title="อัปโหลดไฟล์นำเข้า">
        <FileUploadForm onUpload={handleUpload} />
      </Card>

      <Card title="รายการงานนำเข้า">
        {loadError ? (
          <p className="mb-4 text-sm text-red-600">{loadError}</p>
        ) : null}
        <ImportJobList
          jobs={jobs}
          onRetry={handleRetry}
          retryingJobId={retryingJobId}
        />
      </Card>
    </div>
  );
}
