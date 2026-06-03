import type { ImportJobSummary } from "@/modules/import-job/types/import-job.types";
import { formatDateTime } from "@/utils/format-date";

const statusLabels: Record<ImportJobSummary["status"], string> = {
  PENDING: "รอดำเนินการ",
  QUEUED: "อยู่ในคิว",
  PROCESSING: "กำลังประมวลผล",
  COMPLETED: "สำเร็จ",
  FAILED: "ล้มเหลว",
  PARTIAL: "สำเร็จบางส่วน",
};

type ImportJobListProps = {
  jobs: ImportJobSummary[];
  onRetry?: (jobId: string) => void;
  retryingJobId?: string | null;
};

export function ImportJobList({
  jobs,
  onRetry,
  retryingJobId,
}: ImportJobListProps) {
  if (jobs.length === 0) {
    return (
      <p className="text-sm text-zinc-500">ยังไม่มีรายการนำเข้าข้อมูล</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
          <tr>
            <th className="px-3 py-2 font-medium">ไฟล์</th>
            <th className="px-3 py-2 font-medium">สถานะ</th>
            <th className="px-3 py-2 font-medium">ความคืบหน้า</th>
            <th className="px-3 py-2 font-medium">สำเร็จ/ล้มเหลว</th>
            <th className="px-3 py-2 font-medium">วันที่</th>
            <th className="px-3 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="border-b border-zinc-100 dark:border-zinc-900"
            >
              <td className="px-3 py-3">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {job.fileName}
                </div>
                <div className="text-xs text-zinc-500">{job.fileType}</div>
              </td>
              <td className="px-3 py-3">{statusLabels[job.status]}</td>
              <td className="px-3 py-3">
                <div className="mb-1 text-xs text-zinc-500">
                  {job.processedRows}/{job.totalRows} แถว (
                  {job.progressPercent}%)
                </div>
                <div className="h-2 w-40 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${job.progressPercent}%` }}
                  />
                </div>
              </td>
              <td className="px-3 py-3">
                {job.successRows} / {job.failedRows}
              </td>
              <td className="px-3 py-3 text-zinc-500">
                {formatDateTime(job.createdAt)}
              </td>
              <td className="px-3 py-3">
                {job.failedRows > 0 && onRetry ? (
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                    disabled={retryingJobId === job.id}
                    onClick={() => onRetry(job.id)}
                  >
                    {retryingJobId === job.id ? "กำลังลองใหม่..." : "ลองแถวที่ล้มเหลว"}
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
