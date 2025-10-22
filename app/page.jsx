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
          ระบบจัดการฝึกงานครบวงจร
        </span>
        <h1 className="text-4xl font-bold leading-tight text-base-content lg:text-5xl">
          จัดการการฝึกงานของนักศึกษาได้ในที่เดียว ตั้งแต่ลงทะเบียนจนถึง
          ประเมินผล
        </h1>
        <p className="text-lg leading-7 text-base-content/70">
          รองรับการใช้งานของผู้ดูแลระบบ ครูนิเทศ สถานประกอบการ และนักศึกษา
          ครอบคลุมการลงทะเบียน บันทึกผลการประเมิน และติดตามความก้าวหน้า
        </p>
        <div className="flex flex-wrap gap-3">
          <a className="btn btn-primary" href="/login">
            เริ่มต้นใช้งาน
          </a>
          <a className="btn btn-outline" href="/admin">
            สำรวจแดชบอร์ด
          </a>
        </div>
      </div>
      <div className="rounded-2xl bg-gradient-to-bl from-primary/15 via-secondary/10 to-accent/20 p-8">
        <dl className="grid gap-6 text-base-content">
          <StatsItem label="บทบาทผู้ใช้งาน" value="4 กลุ่ม" detail="Admin, Teacher, Supervisor, Student" />
          <StatsItem label="บันทึกผลประเมิน" value="Real-time" detail="ติดตามสถานะและคะแนนเฉลี่ย" />
          <StatsItem label="จัดเก็บข้อมูล" value="MongoDB" detail="เชื่อมต่อผ่าน Mongoose" />
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
      <dd className="mt-1 text-2xl font-semibold text-base-content">
        {value}
      </dd>
      <p className="mt-1 text-sm text-base-content/70">{detail}</p>
    </div>
  );
}

function FeatureSection() {
  const features = [
    {
      title: "จัดการข้อมูลครบทั้ง 3 ฝ่าย",
      description:
        "เก็บข้อมูลนักศึกษา ครูนิเทศ และสถานประกอบการ พร้อมความสัมพันธ์ต่อการฝึกงาน",
    },
    {
      title: "บันทึกผลประเมินหลายมุมมอง",
      description:
        "รองรับคะแนนจากครูนิเทศและผู้ควบคุม พร้อมคำนวณค่าเฉลี่ยอัตโนมัติ",
    },
    {
      title: "ปลอดภัยด้วยการแยกสิทธิ์",
      description:
        "ระบบเข้าสู่ระบบด้วยโทเค็นและสิทธิ์ของผู้ใช้แต่ละบทบาทอย่างชัดเจน",
    },
  ];

  return (
    <section className="grid gap-6 rounded-3xl border border-base-200 bg-base-100/80 p-10">
      <header className="flex flex-col gap-3">
        <h2 className="text-3xl font-semibold text-base-content">
          ฟีเจอร์เด่นที่ช่วยให้การฝึกงานเป็นเรื่องง่าย
        </h2>
        <p className="text-base text-base-content/70">
          สร้าง สรุป และติดตามผล ด้วยเครื่องมือที่ออกแบบมาเพื่อการจัดการนักศึกษาฝึกงานโดยเฉพาะ
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((item) => (
          <div
            key={item.title}
            className="card border border-base-200 bg-base-100 shadow-sm"
          >
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold text-base-content">
                {item.title}
              </h3>
              <p className="text-base leading-6 text-base-content/70">
                {item.description}
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
      name: "ผู้ดูแลระบบ",
      description:
        "สร้างบัญชีครูนิเทศและผู้ควบคุม พร้อมตรวจสอบความคืบหน้าการฝึกงานทั้งหมด",
      link: "/admin",
      cta: "จัดการผู้ใช้",
    },
    {
      name: "ครูนิเทศ",
      description:
        "สร้างบัญชีนักศึกษา บันทึกการเข้าพบ และติดตามการประเมินจากผู้ควบคุม",
      link: "/teacher",
      cta: "จัดการนักศึกษา",
    },
    {
      name: "สถานประกอบการ",
      description:
        "บันทึกผลการประเมินนักศึกษาและแจ้งสถานะความก้าวหน้าได้แบบเรียลไทม์",
      link: "/supervisor",
      cta: "เข้าสู่แดชบอร์ด",
    },
    {
      name: "นักศึกษา",
      description:
        "ตรวจสอบสถานะการฝึกงาน คะแนนประเมิน และคำแนะนำเพื่อพัฒนาตนเอง",
      link: "/student",
      cta: "ดูผลประเมิน",
    },
  ];

  return (
    <section className="grid gap-6 rounded-3xl border border-base-200 bg-base-100/80 p-10">
      <header className="flex flex-col gap-3">
        <h2 className="text-3xl font-semibold text-base-content">
          ระบบที่รองรับทุกบทบาทในการฝึกงาน
        </h2>
        <p className="text-base text-base-content/70">
          กำหนดสิทธิ์อย่างชัดเจนให้แต่ละบทบาททำงานได้สะดวก และรักษาความปลอดภัยของข้อมูล
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
