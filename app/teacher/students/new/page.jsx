import Link from "next/link";
import StudentCreationForm from "@/components/teacher/StudentCreationForm";

export const metadata = {
  title: "สร้างนักศึกษาใหม่ | GOFT Internship",
};

export default function TeacherStudentCreatePage() {
  return (
    <div className="page-wrapper py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 lg:px-10">
        <div className="breadcrumbs text-sm text-base-content/60">
          <ul>
            <li>
              <Link href="/teacher">แดชบอร์ดครู</Link>
            </li>
            <li>สร้างนักศึกษา</li>
          </ul>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl font-bold text-base-content">
            เพิ่มบัญชีนักศึกษา
          </h1>
          <p className="text-base leading-6 text-base-content/70">
            กรอกข้อมูลพื้นฐานของนักศึกษาระดับอาชีวศึกษาให้ครบถ้วน
            เพื่อเชื่อมโยงกับครูนิเทศและข้อมูลการฝึกงานในระบบ
          </p>
        </header>

        <StudentCreationForm />
      </div>
    </div>
  );
}
