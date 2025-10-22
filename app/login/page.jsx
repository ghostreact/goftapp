import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-b from-base-200 to-base-300 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
        <section className="flex-1 space-y-4">
          <h1 className="text-4xl font-bold text-base-content">
            เข้าสู่ระบบจัดการการฝึกงาน
          </h1>
          <p className="text-lg leading-7 text-base-content/70">
            เลือกบทบาทของคุณและใช้ข้อมูลตามนี้:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-base-content/70">
            <li>ผู้ดูแลระบบ / ครูนิเทศ / ผู้ควบคุม ใช้ชื่อผู้ใช้ที่ได้รับจากผู้ดูแล</li>
            <li>นักศึกษาฝึกงาน ใช้รหัสนักศึกษาของตนเองเป็นชื่อผู้ใช้</li>
            <li>ทุกบทบาทใช้รหัสผ่านที่ได้รับ หรือที่ตั้งไว้ล่าสุด</li>
            <li>หากลืมรหัสผ่านให้ติดต่อผู้ดูแลระบบหรือครูนิเทศประจำหลักสูตร</li>
          </ul>
        </section>
        <section className="flex-1">
          <LoginForm />
        </section>
      </div>
    </div>
  );
}
