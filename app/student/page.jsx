import StudentInternshipView from "@/components/student/StudentInternshipView";

export default function StudentPage() {
  return (
    <div className="page-wrapper py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 lg:px-10">
        <header className="space-y-4 text-center">
          <span className="badge badge-info badge-outline">นักเรียน</span>
          <h1 className="text-4xl font-bold text-base-content">
            แดชบอร์ดนักศึกษา
          </h1>
          <p className="text-lg text-base-content/70">
            ตรวจสอบข้อมูลการฝึกงานของคุณ ดูผลประเมินและความคิดเห็นจากครูนิเทศและสถานประกอบการได้ทุกเวลา
          </p>
        </header>

        <section className="grid gap-6">
          <h2 className="text-2xl font-semibold text-base-content">
            ข้อมูลการฝึกงานปัจจุบัน
          </h2>
          <StudentInternshipView />
        </section>

        <section className="grid gap-4 rounded-2xl border border-base-200 bg-base-100 p-8 text-base-content/70">
          <h3 className="text-xl font-semibold text-base-content">
            เคล็ดลับสำหรับการฝึกงานให้ประสบความสำเร็จ
          </h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>บันทึกสิ่งที่ได้เรียนรู้ในแต่ละวันและสอบถามเพิ่มเติมเมื่อไม่เข้าใจ</li>
            <li>สื่อสารกับครูนิเทศและผู้ดูแลสถานประกอบการอย่างสม่ำเสมอ</li>
            <li>ทบทวนข้อเสนอแนะและนำไปปรับใช้ในการทำงานวันถัดไป</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
