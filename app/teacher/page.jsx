import Link from "next/link";
import AppDashboard from "@/components/dashboard/AppDashboard";

const ACTIONS = [
  {
    title: "เพิ่มนักศึกษาใหม่",
    description:
      "สร้างบัญชีนักศึกษาระดับอาชีวศึกษา เชื่อมโยงกับครูนิเทศและข้อมูลโปรไฟล์ที่จำเป็น",
    href: "/teacher/students/new",
    cta: "สร้างนักศึกษา",
  },
  {
    title: "ลงทะเบียนการฝึกงาน",
    description:
      "บันทึกข้อมูลการฝึกงานครบทุกมิติ ทั้งนักศึกษา ครูนิเทศ ผู้ควบคุม และรายละเอียดโครงการ",
    href: "/teacher/internships/register",
    cta: "เปิดฟอร์มลงทะเบียน",
  },
];

export default function TeacherPage() {
  return (
    <div className="page-wrapper py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 lg:px-10">
        <header className="space-y-4">
          <span className="badge badge-secondary badge-outline">TEACHER</span>
          <h1 className="text-4xl font-bold text-base-content">
            พื้นที่สำหรับครูนิเทศ
          </h1>
          <p className="text-lg text-base-content/70">
            จัดการนักศึกษาและข้อมูลการฝึกงานได้ครบวงจร
            ตั้งแต่การสร้างบัญชีไปจนถึงติดตามความคืบหน้าและประเมินผลในที่เดียว
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {ACTIONS.map((action) => (
            <article
              key={action.href}
              className="card border border-base-200 bg-base-100 shadow-sm"
            >
              <div className="card-body gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-base-content">
                    {action.title}
                  </h2>
                  <p className="mt-1 text-base text-base-content/70">
                    {action.description}
                  </p>
                </div>
                <div>
                  <Link href={action.href} className="btn btn-primary btn-sm">
                    {action.cta}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6">
          <h2 className="text-2xl font-semibold text-base-content">
            ภาพรวมการฝึกงานในระบบ
          </h2>
          <AppDashboard />
        </section>
      </div>
    </div>
  );
}
