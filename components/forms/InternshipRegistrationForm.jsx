'use client';

import { useState } from "react";

const LEVEL_OPTIONS = ["ปวช.", "ปวส."];
const YEAR_BY_LEVEL = {
  "ปวช.": ["1", "2", "3"],
  "ปวส.": ["1", "2"],
};

const INITIAL_FORM = {
  student: {
    name: "",
    email: "",
    phone: "",
    level: "",
    year: "",
    department: "",
    classroom: "",
  },
  teacher: {
    name: "",
    email: "",
    phone: "",
    department: "",
  },
  supervisor: {
    name: "",
    email: "",
    phone: "",
    position: "",
    companyName: "",
  },
  internship: {
    projectTitle: "",
    objectives: "",
    responsibilities: "",
    startDate: "",
    endDate: "",
    weeklyHours: "",
    status: "pending",
    focusAreas: "",
    deliverables: "",
    notes: "",
  },
};

const createInitialForm = () => ({
  student: { ...INITIAL_FORM.student },
  teacher: { ...INITIAL_FORM.teacher },
  supervisor: { ...INITIAL_FORM.supervisor },
  internship: { ...INITIAL_FORM.internship },
});

export default function InternshipRegistrationForm({ onSuccess }) {
  const [formData, setFormData] = useState(createInitialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const updateSection = (section, field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => {
      if (section === "student" && field === "level") {
        const yearOptions = YEAR_BY_LEVEL[value] || [];
        return {
          ...prev,
          student: {
            ...prev.student,
            level: value,
            year: yearOptions.includes(prev.student.year)
              ? prev.student.year
              : yearOptions[0] ?? "",
          },
        };
      }

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  };

  const resetForm = () => {
    setFormData(createInitialForm());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        student: {
          ...formData.student,
          year:
            formData.student.year === ""
              ? null
              : Number(formData.student.year),
        },
        teacher: { ...formData.teacher },
        supervisor: { ...formData.supervisor },
        internship: {
          ...formData.internship,
          weeklyHours:
            formData.internship.weeklyHours === ""
              ? null
              : Number(formData.internship.weeklyHours),
        },
      };

      const response = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "ไม่สามารถบันทึกข้อมูลการฝึกงานได้ กรุณาตรวจสอบอีกครั้ง"
        );
      }

      setFeedback({
        type: "success",
        message: result.message || "บันทึกข้อมูลการฝึกงานเรียบร้อยแล้ว",
      });

      resetForm();
      onSuccess?.(result.data);
    } catch (error) {
      console.error("Registration error", error);
      setFeedback({
        type: "error",
        message:
          error.message ||
          "เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentYearOptions = YEAR_BY_LEVEL[formData.student.level] || [];

  const feedbackClass =
    feedback?.type === "success"
      ? "alert alert-success"
      : feedback?.type === "error"
        ? "alert alert-error"
        : "";

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body gap-8">
        <div>
          <h2 className="card-title text-2xl font-semibold">
            ลงทะเบียนข้อมูลการฝึกงาน
          </h2>
          <p className="text-base-content/70">
            ฟอร์มเดียวสำหรับเก็บข้อมูลนักศึกษา ครูนิเทศ ผู้ควบคุม และรายละเอียด
            โครงการ เพื่อให้ระบบเริ่มติดตามได้ทันที
          </p>
        </div>

        {feedback && (
          <div className={feedbackClass} role="alert">
            <span>{feedback.message}</span>
          </div>
        )}

        <form className="grid gap-8" onSubmit={handleSubmit}>
          <Section title="ข้อมูลนักศึกษา (อาชีวศึกษา)">
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="ชื่อ - นามสกุล"
                required
                value={formData.student.name}
                onChange={updateSection("student", "name")}
              />
              <Input
                label="อีเมล"
                type="email"
                required
                value={formData.student.email}
                onChange={updateSection("student", "email")}
              />
              <Input
                label="เบอร์โทรศัพท์"
                value={formData.student.phone}
                onChange={updateSection("student", "phone")}
              />
              <Select
                label="ระดับ"
                required
                value={formData.student.level}
                onChange={updateSection("student", "level")}
              >
                <option value="">เลือกระดับ</option>
                {LEVEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select
                label="ชั้นปี"
                required
                value={formData.student.year}
                onChange={updateSection("student", "year")}
                disabled={!formData.student.level}
              >
                <option value="">เลือกชั้นปี</option>
                {studentYearOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Input
                label="แผนก"
                required
                value={formData.student.department}
                onChange={updateSection("student", "department")}
              />
              <Input
                label="ห้อง"
                required
                value={formData.student.classroom}
                onChange={updateSection("student", "classroom")}
              />
            </div>
          </Section>

          <Section title="ข้อมูลครูนิเทศ (สำหรับติดต่อ)">
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="ชื่อ - นามสกุล"
                required
                value={formData.teacher.name}
                onChange={updateSection("teacher", "name")}
              />
              <Input
                label="อีเมล"
                type="email"
                required
                value={formData.teacher.email}
                onChange={updateSection("teacher", "email")}
              />
              <Input
                label="เบอร์โทรศัพท์"
                value={formData.teacher.phone}
                onChange={updateSection("teacher", "phone")}
              />
              <Input
                label="แผนก"
                value={formData.teacher.department}
                onChange={updateSection("teacher", "department")}
              />
            </div>
          </Section>

          <Section title="ข้อมูลผู้ควบคุม (สถานประกอบการ)">
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="ชื่อ - นามสกุล"
                required
                value={formData.supervisor.name}
                onChange={updateSection("supervisor", "name")}
              />
              <Input
                label="อีเมล"
                type="email"
                required
                value={formData.supervisor.email}
                onChange={updateSection("supervisor", "email")}
              />
              <Input
                label="เบอร์โทรศัพท์"
                value={formData.supervisor.phone}
                onChange={updateSection("supervisor", "phone")}
              />
              <Input
                label="ตำแหน่ง"
                value={formData.supervisor.position}
                onChange={updateSection("supervisor", "position")}
              />
              <Input
                label="ชื่อสถานประกอบการ"
                value={formData.supervisor.companyName}
                onChange={updateSection("supervisor", "companyName")}
              />
            </div>
          </Section>

          <Section title="รายละเอียดโครงการฝึกงาน">
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="ชื่อโครงการ"
                value={formData.internship.projectTitle}
                onChange={updateSection("internship", "projectTitle")}
              />
              <Select
                label="สถานะ"
                value={formData.internship.status}
                onChange={updateSection("internship", "status")}
              >
                <option value="pending">รอดำเนินการ</option>
                <option value="active">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
              </Select>
              <Input
                label="วันที่เริ่มฝึกงาน"
                type="date"
                required
                value={formData.internship.startDate}
                onChange={updateSection("internship", "startDate")}
              />
              <Input
                label="วันที่สิ้นสุด"
                type="date"
                value={formData.internship.endDate}
                onChange={updateSection("internship", "endDate")}
              />
              <Input
                label="ชั่วโมงต่อสัปดาห์"
                type="number"
                min="0"
                value={formData.internship.weeklyHours}
                onChange={updateSection("internship", "weeklyHours")}
              />
              <Input
                label="ทักษะ/หัวข้อที่ต้องการเน้น (คั่นด้วย ,)"
                value={formData.internship.focusAreas}
                onChange={updateSection("internship", "focusAreas")}
              />
              <Input
                label="ผลงานหรือ Deliverables (คั่นด้วย ,)"
                value={formData.internship.deliverables}
                onChange={updateSection("internship", "deliverables")}
              />
            </div>
            <Textarea
              label="วัตถุประสงค์"
              rows={3}
              value={formData.internship.objectives}
              onChange={updateSection("internship", "objectives")}
            />
            <Textarea
              label="หน้าที่และความรับผิดชอบ"
              rows={3}
              value={formData.internship.responsibilities}
              onChange={updateSection("internship", "responsibilities")}
            />
            <Textarea
              label="หมายเหตุเพิ่มเติม"
              rows={3}
              value={formData.internship.notes}
              onChange={updateSection("internship", "notes")}
            />
          </Section>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              ล้างข้อมูล
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-base-content">{title}</h3>
      </header>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text font-medium">{label}</span>
      </div>
      <input
        className={`input input-bordered w-full ${className}`}
        {...props}
      />
    </label>
  );
}

function Textarea({ label, className = "", rows = 3, ...props }) {
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text font-medium">{label}</span>
      </div>
      <textarea
        rows={rows}
        className={`textarea textarea-bordered w-full ${className}`}
        {...props}
      />
    </label>
  );
}

function Select({ label, className = "", children, ...props }) {
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text font-medium">{label}</span>
      </div>
      <select
        className={`select select-bordered font-normal ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
