import StudentInternshipView from "@/components/student/StudentInternshipView";

export default function StudentPage() {
  return (
    <div className="page-wrapper py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 lg:px-10">
        <header className="space-y-4 text-center">
          <span className="badge badge-info badge-outline">STUDENT</span>
          <h1 className="text-4xl font-bold text-base-content">
            แดชบอร์ดนักศึกษาฝึกงาน
          </h1>
          <p className="text-lg text-base-content/70">
            ตรวจสอบรายละเอียดสถานประกอบการ ตารางฝึกงาน และผลการประเมินล่าสุด
            ได้จากหน้านี้
          </p>
        </header>

        <section className="grid gap-6">
          <h2 className="text-2xl font-semibold text-base-content">
            รายละเอียดการฝึกงานของคุณ
          </h2>
          <StudentInternshipView />
        </section>

        <section className="grid gap-4 rounded-2xl border border-base-200 bg-base-100 p-8 text-base-content/70">
          <h3 className="text-xl font-semibold text-base-content">
            ข้อแนะนำสำหรับนักศึกษาฝึกงาน
          </h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>ติดตามสถานะและคะแนนประเมินอย่างสม่ำเสมอ</li>
            <li>ให้ข้อมูลเพิ่มเติมแก่ครูนิเทศหรือผู้ควบคุมเมื่อถูกขอ</li>
            <li>ใช้คำแนะนำจากการประเมินเพื่อปรับปรุงทักษะและการทำงาน</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
