export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-base-200 px-6 py-16">
      <div className="card border border-error/40 bg-base-100 shadow-lg">
        <div className="card-body items-center space-y-4 text-center">
          <span className="badge badge-error badge-outline">ACCESS DENIED</span>
          <h1 className="text-3xl font-semibold text-error">
            ไม่มีสิทธิ์เข้าถึงหน้านี้
          </h1>
          <p className="max-w-md text-base text-base-content/70">
            กรุณาตรวจสอบสิทธิ์การใช้งานกับผู้ดูแลระบบ หากคิดว่าคุณควรเข้าถึงเนื้อหานี้ได้
          </p>
          <a className="btn btn-outline" href="/">
            กลับสู่หน้าหลัก
          </a>
        </div>
      </div>
    </div>
  );
}
