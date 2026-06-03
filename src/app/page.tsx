import Link from "next/link";

import { Card } from "@/shared/ui/Card";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Accounting Asset Maintain
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          แพลตฟอร์มบำรุงรักษาสินทรัพย์ทางบัญชี ออกแบบตาม Clean Architecture
          รองรับการนำเข้าไฟล์ขนาดใหญ่ คิวประมวลผล และการเชื่อมต่อ API ภายนอก
        </p>
      </header>

      <Card title="เริ่มต้นใช้งาน">
        <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
          <li>ตั้งค่า `.env` จาก `.env.example`</li>
          <li>รัน `npm run db:push` เพื่อสร้างฐานข้อมูล</li>
          <li>รัน Redis แล้วสตาร์ท worker ด้วย `npm run worker`</li>
          <li>รัน `npm run dev` แล้วเปิดหน้านำเข้าข้อมูล</li>
        </ul>
        <Link
          href="/import-jobs"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          ไปที่หน้านำเข้าข้อมูล
        </Link>
      </Card>
    </main>
  );
}
