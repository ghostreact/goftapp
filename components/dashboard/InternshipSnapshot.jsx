'use client';

import dayjs from "dayjs";

export default function InternshipSnapshot({ data }) {
  if (!data) {
    return (
      <div className="card bg-base-100 border border-dashed border-base-200 shadow-sm">
        <div className="card-body items-center justify-center text-center text-base-content/60">
          <p>เลือกนักศึกษาจากรายการเพื่อดูรายละเอียดการฝึกงาน</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body gap-6">
        <header className="space-y-1">
          <h2 className="card-title text-2xl font-semibold">
            {data.student?.name || "ไม่ระบุชื่อ"}
          </h2>
          <p className="text-base-content/70">
            {data.student?.major
              ? `${data.student.major} ${
                  data.student.year ? `ปี ${data.student.year}` : ""
                }`
              : data.student?.email}
          </p>
        </header>

        <dl className="grid gap-4 text-sm">
          <Row
            label="สถานประกอบการ"
            value={
              <>
                <div className="font-semibold">
                  {data.supervisor?.companyName || "-"}
                </div>
                <div className="text-base-content/60">
                  {data.supervisor?.name || "-"}
                </div>
              </>
            }
          />
          <Row
            label="ช่วงเวลาฝึก"
            value={`${formatDate(data.startDate)} ถึง ${formatDate(
              data.endDate
            )}`}
          />
          <Row
            label="ชั่วโมงต่อสัปดาห์"
            value={data.weeklyHours ? `${data.weeklyHours} ชั่วโมง` : "-"}
          />
          <Row
            label="ครูนิเทศ"
            value={
              <>
                <div className="font-semibold">{data.teacher?.name || "-"}</div>
                <div className="text-base-content/60">
                  {data.teacher?.department || data.teacher?.email || "-"}
                </div>
              </>
            }
          />
        </dl>

        {Boolean(data.focusAreas?.length) && (
          <section>
            <h3 className="text-base font-semibold text-base-content">
              ทักษะเป้าหมาย
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.focusAreas.map((item) => (
                <span key={item} className="badge badge-outline">
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}

        {data.objectives && (
          <section>
            <h3 className="text-base font-semibold text-base-content">
              วัตถุประสงค์
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-base-content/80">
              {data.objectives}
            </p>
          </section>
        )}

        {data.responsibilities && (
          <section>
            <h3 className="text-base font-semibold text-base-content">
              หน้าที่รับผิดชอบ
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-base-content/80">
              {data.responsibilities}
            </p>
          </section>
        )}

        {data.evaluationSummary ? (
          <EvaluationOverview summary={data.evaluationSummary} />
        ) : (
          <div className="rounded-box border border-dashed border-primary/50 bg-primary/5 p-4 text-sm text-primary">
            ยังไม่มีผลการประเมินในรายการนี้
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs uppercase tracking-wide text-base-content/60">
        {label}
      </dt>
      <dd className="text-sm text-base-content">{value}</dd>
    </div>
  );
}

function EvaluationOverview({ summary }) {
  const averageScore = average([
    summary.averageTechnical,
    summary.averageProfessionalism,
    summary.averageCommunication,
    summary.averageProblemSolving,
  ]);

  return (
    <section className="rounded-lg border border-base-200 bg-base-200/20 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-base-content">
          สรุปผลการประเมิน
        </h3>
        <div className="badge badge-primary badge-lg font-semibold">
          คะแนนเฉลี่ย {averageScore ?? "-"}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <Field label="เทคนิค" value={summary.averageTechnical ?? "-"} />
        <Field
          label="ความเป็นมืออาชีพ"
          value={summary.averageProfessionalism ?? "-"}
        />
        <Field label="การสื่อสาร" value={summary.averageCommunication ?? "-"} />
        <Field
          label="การแก้ปัญหา"
          value={summary.averageProblemSolving ?? "-"}
        />
      </div>
      <div className="mt-4 text-xs text-base-content/60">
        ล่าสุด {summary.lastSubmittedAt ? formatDate(summary.lastSubmittedAt) : "-"}
      </div>
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-base-content/70">{label}</span>
      <span className="text-base-content">{value}</span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return dayjs(value).format("DD MMM YYYY");
}

function average(values = []) {
  const filtered = values.filter(
    (value) => value !== undefined && value !== null
  );
  if (!filtered.length) {
    return null;
  }
  const total = filtered.reduce((acc, item) => acc + Number(item || 0), 0);
  return Math.round((total / filtered.length) * 10) / 10;
}
