import AdminUserForm from "@/components/admin/AdminUserForm";

export default function AdminPage() {
  return (
    <div className="page-wrapper py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-10">
        <header className="space-y-4">
          <span className="badge badge-primary badge-outline">ADMIN</span>
          <h1 className="text-4xl font-bold text-base-content">
            แดชบอร์ดผู้ดูแลระบบ
          </h1>
          <p className="text-lg text-base-content/70">
            จัดการสิทธิ์ผู้ใช้งาน ดูแลครูนิเทศและสถานประกอบการ
            ก่อนเข้าสู่กระบวนการฝึกงานจริง
          </p>
          <div className="flex flex-wrap gap-3">
            <a className="btn btn-secondary btn-sm" href="/admin/internships">
              จัดการข้อมูลการฝึกงาน
            </a>
            <a className="btn btn-outline btn-sm" href="/teacher">
              ดูหน้าครูนิเทศ
            </a>
          </div>
        </header>

        <AdminUserForm />

        <section className="grid gap-6 rounded-2xl border border-base-200 bg-base-100 p-8">
          <h2 className="text-2xl font-semibold text-base-content">
            ลำดับขั้นตอนแนะนำ
          </h2>
          <ol className="space-y-3 text-base text-base-content/70">
            <li>
              1. สร้างบัญชีครูนิเทศสำหรับสถาบันการศึกษาแต่ละแห่ง
            </li>
            <li>
              2. สร้างบัญชีผู้ควบคุมสำหรับสถานประกอบการที่รับนักศึกษาไปฝึกงาน
            </li>
            <li>
              3. ให้ครูนิเทศเข้าสู่ระบบเพื่อสร้างบัญชีนักศึกษาที่ตนดูแล
            </li>
            <li>
              4. บันทึกความร่วมมือผ่านเมนูการฝึกงาน และติดตามผลการประเมิน
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
