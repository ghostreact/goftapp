'use client';

import dayjs from "dayjs";

const STATUS_STYLES = {
  pending: "badge badge-warning",
  active: "badge badge-info",
  completed: "badge badge-success",
};

function formatDate(value) {
  if (!value) return "-";
  return dayjs(value).format("DD MMM YYYY");
}

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
              รายการนักศึกษาฝึกงาน
            </h2>
            <p className="text-base-content/70">
              ตรวจสอบสถานะการฝึก งานที่มอบหมาย และสรุปผลการประเมินล่าสุด
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
                <th>สรุปการประเมิน</th>
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

              {internships.map((item) => {
                const summary = item.evaluationSummary;
                const statusClass =
                  STATUS_STYLES[item.status] || "badge badge-neutral";
                return (
                  <tr key={item._id} className="align-top">
                    <td>
                      <div className="font-semibold">
                        {item.student?.name || "-"}
                      </div>
                      <div className="text-sm text-base-content/60">
                        {item.student?.major
                          ? `${item.student.major} ${
                              item.student.year
                                ? `• ปี ${item.student.year}`
                                : ""
                            }`
                          : item.student?.email}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">
                        {item.supervisor?.companyName || "-"}
                      </div>
                      <div className="text-sm text-base-content/60">
                        {item.supervisor?.name || "-"}
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
                        {item.teacher?.name || "-"}
                      </div>
                      <div className="text-sm text-base-content/60">
                        {item.teacher?.department || item.teacher?.email || "-"}
                      </div>
                    </td>
                    <td>
                      <span className={statusClass}>
                        {translateStatus(item.status)}
                      </span>
                    </td>
                    <td>
                      {summary ? (
                        <EvaluationSummary summary={summary} />
                      ) : (
                        <span className="text-sm text-base-content/50">
                          ยังไม่มีผลการประเมิน
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          selectedId === item._id
                            ? "btn-primary"
                            : "btn-outline"
                        }`}
                        onClick={() => onSelect?.(item)}
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EvaluationSummary({ summary }) {
  const items = [
    {
      label: "เทคนิค",
      value:
        summary.averageTechnical !== undefined
          ? summary.averageTechnical
          : "-",
    },
    {
      label: "มืออาชีพ",
      value:
        summary.averageProfessionalism !== undefined
          ? summary.averageProfessionalism
          : "-",
    },
    {
      label: "สื่อสาร",
      value:
        summary.averageCommunication !== undefined
          ? summary.averageCommunication
          : "-",
    },
    {
      label: "แก้ปัญหา",
      value:
        summary.averageProblemSolving !== undefined
          ? summary.averageProblemSolving
          : "-",
    },
  ];

  return (
    <div className="grid gap-1">
      <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/60">
        <span>ครู:</span>
        <span className="badge badge-outline">
          {summary.teacherCount || 0} ฉบับ
        </span>
        <span>ผู้ควบคุม:</span>
        <span className="badge badge-outline">
          {summary.supervisorCount || 0} ฉบับ
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="font-medium text-base-content/70">
              {item.label}
            </span>
            <span className="text-base-content">{item.value}</span>
          </div>
        ))}
      </div>
      {summary.lastSubmittedAt && (
        <div className="text-[11px] text-base-content/50">
          อัปเดตล่าสุด {dayjs(summary.lastSubmittedAt).format("DD MMM YYYY")}
        </div>
      )}
    </div>
  );
}

function translateStatus(status) {
  switch (status) {
    case "pending":
      return "รอเริ่ม";
    case "active":
      return "กำลังฝึก";
    case "completed":
      return "เสร็จสิ้น";
    default:
      return status || "-";
  }
}
