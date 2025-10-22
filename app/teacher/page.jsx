import AppDashboard from "@/components/dashboard/AppDashboard";
import StudentCreationForm from "@/components/teacher/StudentCreationForm";

export default function TeacherPage() {
  return (
    <div className="page-wrapper py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 lg:px-10">
        <header className="space-y-4">
          <span className="badge badge-secondary badge-outline">
            TEACHER
          </span>
          <h1 className="text-4xl font-bold text-base-content">
            แดชบอร์ดครูนิเทศ
          </h1>
          <p className="text-lg text-base-content/70">
            สร้างบัญชีนักศึกษา ติดตามข้อมูลการฝึกงาน และบันทึกผลการประเมินร่วมกับผู้ควบคุมสถานประกอบการ
          </p>
          <div className="flex flex-wrap gap-3">
            <a className="btn btn-outline btn-sm" href="/admin/internships">
              ข้อมูลการฝึกงานทั้งหมด
            </a>
          </div>
        </header>

        <StudentCreationForm />

        <section className="grid gap-6">
          <h2 className="text-2xl font-semibold text-base-content">
            การติดตามนักศึกษาระหว่างฝึกงาน
          </h2>
          <AppDashboard />
        </section>
      </div>
    </div>
  );
}
