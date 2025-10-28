import AppDashboard from '@/components/dashboard/AppDashboard';

export default function WorkplacePage() {
  return (
    <div className="page-wrapper py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <header className="mb-8 space-y-4">
          <span className="badge badge-accent badge-outline">สถานประกอบการ</span>
          <h1 className="text-4xl font-bold text-base-content">
            แดชบอร์ดสถานประกอบการพันธมิตร
          </h1>
          <p className="text-lg text-base-content/70">
            บันทึกการเข้าฝึกงานประจำวัน ส่งสรุปรายสัปดาห์ และทำงานร่วมกับครูนิเทศเพื่อสนับสนุนนักศึกษาให้สำเร็จการฝึกงาน
          </p>
        </header>
        <AppDashboard />
      </div>
    </div>
  );
}

