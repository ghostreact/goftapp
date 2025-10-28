"use client";

import dayjs from "dayjs";

const STATUS_STYLES = {
  awaiting_workplace: "badge badge-warning",
  pending: "badge badge-warning",
  active: "badge badge-info",
  completed: "badge badge-success",
  closed: "badge badge-neutral",
};

export default function InternshipList({
  internships = [],
  selectedId,
  onSelect,
}) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="card-title text-2xl font-semibold">
              รายการสถานที่ฝึกงาน
            </h2>
            <p className="text-base-content/70">
              เลือกรายการเพื่อดูรายละเอียดนักศึกษา สถานประกอบการ บันทึก และแบบประเมินได้จากแผงด้านขวา
            </p>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr className="text-sm uppercase text-base-content/60">
                <th>นักศึกษา</th>
                <th>สถานประกอบการ</th>
                <th>ช่วงเวลา</th>
                <th>ครูนิเทศ</th>
                <th>สถานะ</th>
                <th>แบบประเมิน</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {internships.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-base-content/60">
                    ยังไม่มีข้อมูลการฝึกงาน
                  </td>
                </tr>
              )}

              {internships.map((item) => (
                <tr key={item._id} className="align-top">
                  <td>
                    <div className="font-semibold">
                      {item.student?.fullName || item.student?.name || '-'}
                    </div>
                    <div className="text-sm text-base-content/60">
                      {formatStudentProgram(item.student) ||
                        item.student?.email ||
                        '-'}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">
                      {item.workplace?.companyName || '-'}
                    </div>
                    <div className="text-sm text-base-content/60">
                      {item.workplace?.contactName || '-'}
                    </div>
                  </td>
                  <td>
                    <div>{formatDate(item.startDate)}</div>
                    <div className="text-sm text-base-content/60">
                      ถึง {formatDate(item.endDate)}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">
                      {item.teacher?.name || '-'}
                    </div>
                    <div className="text-sm text-base-content/60">
                      {item.teacher?.department || item.teacher?.email || '-'}
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        STATUS_STYLES[item.status] || 'badge badge-neutral'
                      }
                    >
                      {formatStatus(item.status)}
                    </span>
                  </td>
                  <td>
                    {item.evaluationSummary ? (
                      <EvaluationSummary summary={item.evaluationSummary} />
                    ) : (
                      <span className="text-sm text-base-content/50">
                        ยังไม่มีแบบประเมิน
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        selectedId === item._id
                          ? 'btn-primary'
                          : 'btn-outline'
                      }`}
                      onClick={() => onSelect?.(item)}
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EvaluationSummary({ summary }) {
  const rows = [
    { label: 'ทักษะทางเทคนิค', value: summary.averageTechnical },
    { label: 'ความเป็นมืออาชีพ', value: summary.averageProfessionalism },
    { label: 'การสื่อสาร', value: summary.averageCommunication },
    { label: 'การแก้ปัญหา', value: summary.averageProblemSolving },
  ];

  return (
    <div className="grid gap-1">
      <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/60">
        <span>แบบประเมินจากครู:</span>
        <span className="badge badge-outline">
          {summary.teacherCount || 0}
        </span>
        <span>แบบประเมินจากสถานประกอบการ:</span>
        <span className="badge badge-outline">
          {summary.workplaceCount || 0}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="font-medium text-base-content/70">
              {row.label}
            </span>
            <span className="text-base-content">
              {row.value !== undefined ? row.value : '-'}
            </span>
          </div>
        ))}
      </div>
      {summary.lastSubmittedAt && (
        <div className="text-[11px] text-base-content/50">
          ส่งล่าสุด {formatDate(summary.lastSubmittedAt)}
        </div>
      )}
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

function formatStatus(status) {
  switch (status) {
    case 'awaiting_workplace':
      return 'รอสถานประกอบการยืนยัน';
    case 'pending':
      return 'รอดำเนินการ';
    case 'active':
      return 'กำลังฝึกงาน';
    case 'completed':
      return 'เสร็จสิ้น';
    case 'closed':
      return 'ยุติการฝึก';
    default:
      return status || '-';
  }
}

function formatDate(value) {
  if (!value) return '—';
  return dayjs(value).format('DD MMM YYYY');
}
