"use client";

import dayjs from "dayjs";

export default function InternshipSnapshot({ data }) {
  if (!data) {
    return (
      <div className="card bg-base-100 border border-dashed border-base-200 shadow-sm">
        <div className="card-body items-center justify-center text-center text-base-content/60">
          <p>ยังไม่ได้เลือกรายการฝึกงาน</p>
        </div>
      </div>
    );
  }

  const logMetrics = data.metrics?.logs || { totalLogs: 0, lastLogDate: null };
  const weeklyMetrics = data.metrics?.weeklyReports || {
    totalReports: 0,
    approved: 0,
    needsRevision: 0,
    pending: 0,
    lastSubmittedAt: null,
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body gap-6">
        <header className="space-y-1">
          <h2 className="card-title text-2xl font-semibold">
            {data.student?.fullName || data.student?.name || 'ไม่พบนักศึกษา'}
          </h2>
          <p className="text-base-content/70">
            {formatStudentProgram(data.student) ||
              data.student?.email ||
              'ไม่มีข้อมูลหลักสูตร'}
          </p>
        </header>

        <dl className="grid gap-4 text-sm">
          <Row
            label="สถานประกอบการ"
            value={
              <>
                <div className="font-semibold">
                  {data.workplace?.companyName || 'ไม่ระบุ'}
                </div>
                <div className="text-base-content/60">
                  {data.workplace?.contactName || 'ไม่มีข้อมูลผู้ติดต่อ'}
                </div>
              </>
            }
          />
          <Row
            label="ช่วงเวลาฝึกงาน"
            value={`${formatDate(data.startDate)} - ${formatDate(data.endDate)}`}
          />
          <Row
            label="ชั่วโมงต่อสัปดาห์"
            value={data.weeklyHours ? `${data.weeklyHours} ชั่วโมง/สัปดาห์` : 'ไม่ระบุ'}
          />
          <Row
            label="ครูนิเทศ"
            value={
              <>
                <div className="font-semibold">
                  {data.teacher?.name || 'ยังไม่ระบุ'}
                </div>
                <div className="text-base-content/60">
                  {data.teacher?.department || data.teacher?.email || ''}
                </div>
              </>
            }
          />
          <Row label="บันทึกประจำวัน" value={formatLogSummary(logMetrics)} />
          <Row label="รายงานประจำสัปดาห์" value={formatWeeklySummary(weeklyMetrics)} />
        </dl>

        {Array.isArray(data.focusAreas) && data.focusAreas.length > 0 && (
          <section>
            <h3 className="text-base font-semibold text-base-content">หัวข้อการฝึก</h3>
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
            <h3 className="text-base font-semibold text-base-content">วัตถุประสงค์</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-base-content/80">
              {data.objectives}
            </p>
          </section>
        )}

        {data.responsibilities && (
          <section>
            <h3 className="text-base font-semibold text-base-content">หน้าที่ความรับผิดชอบ</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-base-content/80">
              {data.responsibilities}
            </p>
          </section>
        )}

        {data.evaluationSummary ? (
          <EvaluationOverview summary={data.evaluationSummary} />
        ) : (
          <div className="rounded-box border border-dashed border-primary/50 bg-primary/5 p-4 text-sm text-primary">
            ยังไม่มีการส่งแบบประเมิน
          </div>
        )}
      </div>
    </div>
  );
}

function formatStudentProgram(student) {
  if (!student) return '';
  const parts = [];
  if (student.programType && student.yearLevel) {
    parts.push(
      `${student.programType.replace(/_/g, ' ')} ชั้นปีที่ ${student.yearLevel}`
    );
  }
  if (student.department) {
    parts.push(student.department);
  }
  if (student.classroom) {
    parts.push(`ห้อง ${student.classroom}`);
  }
  return parts.join(' • ');
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
          ค่าเฉลี่ย {averageScore ?? '-'} / 5
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <Field label="ทักษะทางเทคนิค" value={summary.averageTechnical ?? '-'} />
        <Field
          label="ความเป็นมืออาชีพ"
          value={summary.averageProfessionalism ?? '-'}
        />
        <Field
          label="การสื่อสาร"
          value={summary.averageCommunication ?? '-'}
        />
        <Field
          label="การแก้ปัญหา"
          value={summary.averageProblemSolving ?? '-'}
        />
      </div>
      <div className="mt-4 text-xs text-base-content/60">
        ส่งล่าสุด {summary.lastSubmittedAt ? formatDate(summary.lastSubmittedAt) : '—'}
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

function formatLogSummary(metrics) {
  let text = `${metrics.totalLogs} รายการ`;
  if (metrics.lastLogDate) {
    text += ` • ล่าสุด ${formatDate(metrics.lastLogDate)}`;
  }
  return text;
}

function formatWeeklySummary(metrics) {
  return `${metrics.totalReports} ฉบับ • ผ่าน ${metrics.approved} • ขอปรับปรุง ${metrics.needsRevision}`;
}

function formatDate(value) {
  if (!value) return '—';
  return dayjs(value).format('DD MMM YYYY');
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
