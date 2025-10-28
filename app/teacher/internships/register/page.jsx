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
              <Link href="/teacher">แดชบอร์ดครูนิเทศ</Link>
            </li>
            <li>ลงทะเบียนการฝึกงาน</li>
          </ul>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl font-bold text-base-content">
            ลงทะเบียนสถานประกอบการสำหรับนักศึกษา
          </h1>
          <p className="text-base leading-6 text-base-content/70">
            กรอกข้อมูลนักศึกษา ครูนิเทศ และสถานประกอบการให้ครบถ้วน ระบบจะบันทึกการจับคู่และพร้อมสำหรับการติดตามผลการฝึกงานทันที
          </p>
        </header>

        <InternshipRegistrationForm />
      </div>
    </div>
  );
}
