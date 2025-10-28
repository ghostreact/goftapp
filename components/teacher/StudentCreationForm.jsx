"use client";

import { useMemo, useState } from "react";

const PROGRAM_OPTIONS = [
  {
    value: "vocational_certificate",
    label: "ประกาศนียบัตรวิชาชีพ (ปวช.)",
    years: ["1", "2", "3"],
  },
  {
    value: "higher_vocational_certificate",
    label: "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)",
    years: ["1", "2"],
  },
];

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  birthDate: "",
  email: "",
  studentId: "",
  password: "",
  phone: "",
  programType: PROGRAM_OPTIONS[0].value,
  yearLevel: PROGRAM_OPTIONS[0].years[0],
  department: "",
  classroom: "",
};

export default function StudentCreationForm({ onSuccess }) {
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM }));
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableYears = useMemo(() => {
    const option = PROGRAM_OPTIONS.find((item) => item.value === form.programType);
    return option?.years ?? [];
  }, [form.programType]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "programType") {
      const option = PROGRAM_OPTIONS.find((item) => item.value === value);
      setForm((prev) => ({
        ...prev,
        programType: value,
        yearLevel: option?.years.includes(prev.yearLevel)
          ? prev.yearLevel
          : option?.years[0] ?? "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/teacher/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถสร้างบัญชีนักศึกษาได้");
      }

      setFeedback({
        type: "success",
        message: result.message || "สร้างบัญชีนักศึกษาเรียบร้อย",
      });
      setForm(() => ({ ...INITIAL_FORM }));
      onSuccess?.(result.user);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "เกิดข้อผิดพลาดในการสร้างบัญชีนักศึกษา",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="card border border-base-200 bg-base-100 shadow-sm" onSubmit={handleSubmit}>
      <div className="card-body space-y-6">
        <div className="space-y-2">
          <h2 className="card-title text-2xl font-semibold text-base-content">
            ลงทะเบียนนักศึกษาใหม่
          </h2>
          <p className="text-base text-base-content/70">
            กรุณากรอกข้อมูลพื้นฐานของนักศึกษาและข้อมูลหลักสูตร ระบบจะสร้างบัญชีผู้ใช้ให้อัตโนมัติสำหรับการเข้าสู่ระบบติดตามการฝึกงาน
          </p>
        </div>

        {feedback && (
          <div className={lert }>
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="ชื่อ"
            name="firstName"
            required
            value={form.firstName}
            onChange={handleChange}
          />
          <Input
            label="นามสกุล"
            name="lastName"
            required
            value={form.lastName}
            onChange={handleChange}
          />
          <Input
            label="วันเดือนปีเกิด"
            name="birthDate"
            type="date"
            required
            value={form.birthDate}
            onChange={handleChange}
          />
          <Input
            label="อีเมล"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="student@example.com"
          />
          <Input
            label="รหัสนักศึกษา"
            name="studentId"
            required
            value={form.studentId}
            onChange={handleChange}
          />
          <Input
            label="รหัสผ่านเข้าสู่ระบบ"
            name="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={handleChange}
            placeholder="อย่างน้อย 8 ตัวอักษร"
          />
          <Input
            label="เบอร์โทรศัพท์"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <Select
            label="ประเภทหลักสูตร"
            name="programType"
            required
            value={form.programType}
            onChange={handleChange}
          >
            {PROGRAM_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            label="ชั้นปี"
            name="yearLevel"
            required
            value={form.yearLevel}
            onChange={handleChange}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
          <Input
            label="แผนก / สาขาวิชา"
            name="department"
            required
            value={form.department}
            onChange={handleChange}
          />
          <Input
            label="ห้อง / กลุ่มเรียน"
            name="classroom"
            required
            value={form.classroom}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setForm(() => ({ ...INITIAL_FORM }));
              setFeedback(null);
            }}
            disabled={isSubmitting}
          >
            ล้างข้อมูล
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูลนักศึกษา"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <label className="form-control">
      <div className="label">
        <span className="label-text font-medium">{label}</span>
      </div>
      <input className={`input input-bordered ${className}`} {...props} />
    </label>
  );
}

function Select({ label, className = "", children, ...props }) {
  return (
    <label className="form-control">
      <div className="label">
        <span className="label-text font-medium">{label}</span>
      </div>
      <select className={`select select-bordered ${className}`} {...props}>
        {children}
      </select>
    </label>
  );
}

