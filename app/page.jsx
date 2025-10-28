export default function Home() {
  return (
    <div className="page-wrapper py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:px-10">
        <HeroSection />
        <FeatureSection />
        <RoleSection />
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="grid gap-8 rounded-3xl border border-base-200 bg-base-100/80 p-10 shadow-lg lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-6">
        <span className="badge badge-primary badge-outline w-fit">
          จัดการการฝึกงานให้ง่ายในที่เดียว
        </span>
        <h1 className="text-4xl font-bold leading-tight text-base-content lg:text-5xl">
          ประสานงานนักศึกษา ครูนิเทศ และสถานประกอบการอย่างเป็นระบบ
        </h1>
        <p className="text-lg leading-7 text-base-content/70">
          GOFT ช่วยให้ทุกฝ่ายติดตามการฝึกงานได้ครบถ้วน ตั้งแต่การอนุมัติสถานประกอบการ บันทึกประจำวัน รายงานประจำสัปดาห์ จนถึงการประเมินผลสุดท้าย
        </p>
        <div className="flex flex-wrap gap-3">
          <a className="btn btn-primary" href="/login">
            เข้าสู่ระบบ
          </a>
          <a className="btn btn-outline" href="/admin">
            ดูแดชบอร์ดตัวอย่าง
          </a>
        </div>
      </div>
      <div className="rounded-2xl bg-gradient-to-bl from-primary/15 via-secondary/10 to-accent/20 p-8">
        <dl className="grid gap-6 text-base-content">
          <StatsItem
            label="บทบาทที่รองรับ"
            value="4 บทบาท"
            detail="ผู้ดูแล, ครูนิเทศ, สถานประกอบการ, นักศึกษา"
          />
          <StatsItem
            label="อัปเดตแบบเรียลไทม์"
            value="เรียลไทม์"
            detail="บันทึกประจำวัน รายงานสัปดาห์ และแบบประเมินครบถ้วน"
          />
          <StatsItem
            label="จัดเก็บข้อมูลปลอดภัย"
            value="MongoDB"
            detail="ทำงานร่วมกับ Mongoose และระบบยืนยันตัวตนสมัยใหม่"
          />
        </dl>
      </div>
    </section>
  );
}

function StatsItem({ label, value, detail }) {
  return (
    <div className="rounded-xl border border-base-200 bg-base-100 p-4 shadow-sm">
      <dt className="text-sm uppercase tracking-wide text-base-content/60">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold text-base-content">{value}</dd>
      <p className="mt-1 text-sm text-base-content/70">{detail}</p>
    </div>
  );
}

function FeatureSection() {
  const features = [
    {
      title: 'ติดตามการฝึกงานครบวงจร',
      description:
        'ตรวจสอบความก้าวหน้ารายวัน รายสัปดาห์ และผลสรุปปลายทางได้อย่างชัดเจน',
    },
    {
      title: 'ทำงานร่วมกันได้ทุกบทบาท',
      description:
        'ครูนิเทศและสถานประกอบการสามารถบันทึกข้อมูล แสดงความคิดเห็น และประเมินผลในระบบเดียว',
    },
    {
      title: 'ดูภาพรวมได้ทันที',
      description:
        'แผงสรุปช่วยให้ผู้ประสานงานเห็นว่าการฝึกงานใดต้องการการติดตามเป็นพิเศษ',
    },
    {
      title: 'ตรวจสอบย้อนหลังได้',
      description:
        'ทุกการส่งมีเวลาและผู้ดำเนินการกำกับ ช่วยให้ติดตามการเปลี่ยนแปลงและการอนุมัติได้ง่าย',
    },
  ];

  return (
    <section className="grid gap-6 rounded-3xl border border-base-200 bg-base-100/80 p-10">
      <header className="flex flex-col gap-3">
        <h2 className="text-3xl font-semibold text-base-content">
          เหตุผลที่สถานศึกษาวางใจ GOFT
        </h2>
        <p className="text-base text-base-content/70">
          ระบบออกแบบมาสำหรับการฝึกงานสายอาชีพที่ต้องการความครบถ้วนและติดตามได้จริง
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="card border border-base-200 bg-base-100 shadow-sm"
          >
            <div className="card-body">
              <h3 className="card-title text-2xl font-semibold text-base-content">
                {feature.title}
              </h3>
              <p className="text-base leading-6 text-base-content/70">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoleSection() {
  const roles = [
    {
      name: 'ผู้ดูแลระบบ',
      description:
        'สร้างบัญชีผู้ใช้ จัดการสถานที่ฝึกงาน และตรวจสอบกิจกรรมทั้งหมด',
      link: '/admin',
      cta: 'เข้าสู่ระบบผู้ดูแล',
    },
    {
      name: 'ครูนิเทศ',
      description:
        'ลงทะเบียนสถานประกอบการ ตรวจรายงานรายสัปดาห์ และสรุปผลการฝึกงาน',
      link: '/teacher',
      cta: 'แดชบอร์ดครูนิเทศ',
    },
    {
      name: 'สถานประกอบการ',
      description:
        'บันทึกการเข้าฝึก ส่งสรุปรายสัปดาห์ และยืนยันผลการประเมินนักศึกษา',
      link: '/workplace',
      cta: 'แดชบอร์ดสถานประกอบการ',
    },
    {
      name: 'นักศึกษา',
      description:
        'ติดตามชั่วโมงฝึกงาน ตรวจสอบข้อเสนอแนะ และเตรียมตัวสำหรับการประเมิน',
      link: '/student',
      cta: 'แดชบอร์ดนักศึกษา',
    },
  ];

  return (
    <section className="grid gap-6 rounded-3xl border border-base-200 bg-base-100/80 p-10">
      <header className="flex flex-col gap-3">
        <h2 className="text-3xl font-semibold text-base-content">
          ครบทุกบทบาทในการฝึกงาน
        </h2>
        <p className="text-base text-base-content/70">
          ประสบการณ์การใช้งานออกแบบให้เข้าใจง่ายสำหรับแต่ละบทบาท ลดการทำงานซ้ำซ้อน
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => (
          <div
            key={role.name}
            className="card border border-base-200 bg-base-100 shadow-sm"
          >
            <div className="card-body">
              <h3 className="card-title text-2xl font-semibold text-base-content">
                {role.name}
              </h3>
              <p className="text-base leading-6 text-base-content/70">
                {role.description}
              </p>
              <div className="card-actions pt-4">
                <a className="btn btn-outline btn-sm" href={role.link}>
                  {role.cta}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

