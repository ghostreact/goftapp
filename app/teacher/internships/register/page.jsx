import Link from "next/link";
import InternshipRegistrationForm from "@/components/forms/InternshipRegistrationForm";

export const metadata = {
  title: "ลงทะเบียนการฝึกงาน | GOFT Internship",
};

export default function TeacherInternshipRegisterPage() {
  return (
    <div className="page-wrapper py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:px-10">
        <div className="breadcrumbs text-sm text-base-content/60">
          <ul>
            <li>
              <Link href="/teacher">แดชบอร์ดครู</Link>
            </li>
            <li>ลงทะเบียนการฝึกงาน</li>
          </ul>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl font-bold text-base-content">
            ลงทะเบียนข้อมูลการฝึกงานใหม่
          </h1>
          <p className="text-base leading-6 text-base-content/70">
            ฟอร์มนี้ช่วยรวบรวมข้อมูลที่จำเป็นทั้งหมด ตั้งแต่นักศึกษา ครูนิเทศ
            ผู้ควบคุม ไปจนถึงรายละเอียดโครงการและเป้าหมายการเรียนรู้
            เพื่อพร้อมใช้งานในระบบทันที
          </p>
        </header>

        <InternshipRegistrationForm />
      </div>
    </div>
  );
}
