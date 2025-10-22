import AppDashboard from "@/components/dashboard/AppDashboard";

export default function SupervisorPage() {
  return (
    <div className="page-wrapper py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <header className="mb-8 space-y-4">
          <span className="badge badge-accent badge-outline">
            SUPERVISOR
          </span>
          <h1 className="text-4xl font-bold text-base-content">
            แดชบอร์ดผู้ควบคุมสถานประกอบการ
          </h1>
          <p className="text-lg text-base-content/70">
            ตรวจสอบนักศึกษาที่ดูแล บันทึกผลการประเมิน และสื่อสารความก้าวหน้ากับครูนิเทศ
          </p>
        </header>
        <AppDashboard />
      </div>
    </div>
  );
}
