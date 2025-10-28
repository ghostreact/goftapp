import AdminUserForm from "@/components/admin/AdminUserForm";

export default function AdminPage() {
  return (
    <div className="page-wrapper py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-10">
        <header className="space-y-4">
          <span className="badge badge-primary badge-outline">ผู้ดูแลระบบ</span>
          <h1 className="text-4xl font-bold text-base-content">
            แดชบอร์ดผู้ดูแลระบบ
          </h1>
          <p className="text-lg text-base-content/70">
            เพิ่มผู้ใช้ใหม่ จัดการบทบาท และติดตามสถานะการฝึกงานของนักศึกษาได้จากที่นี่
          </p>
          <div className="flex flex-wrap gap-3">
            <a className="btn btn-secondary btn-sm" href="/admin/internships">
              ดูรายการฝึกงานทั้งหมด
            </a>
            <a className="btn btn-outline btn-sm" href="/teacher">
              ไปยังแดชบอร์ดครูนิเทศ
            </a>
          </div>
        </header>

        <AdminUserForm />

        <section className="grid gap-6 rounded-2xl border border-base-200 bg-base-100 p-8">
          <h2 className="text-2xl font-semibold text-base-content">
            ขั้นตอนแนะนำสำหรับผู้ดูแลระบบ
          </h2>
          <ol className="space-y-3 text-base text-base-content/70">
            <li>1. สร้างบัญชีให้ครูนิเทศและผู้ติดต่อสถานประกอบการ</li>
            <li>2. ส่งข้อมูลการเข้าสู่ระบบให้ผู้ใช้งานใหม่เพื่อเริ่มใช้งาน</li>
            <li>3. ตรวจสอบรายการฝึกงานและสถานะการอนุมัติอย่างสม่ำเสมอ</li>
            <li>4. ติดตามรายงานที่ยังต้องตรวจสอบและส่งต่อให้ครูนิเทศที่เกี่ยวข้อง</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
