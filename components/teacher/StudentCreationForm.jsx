'use client';

import { useState } from "react";

const LEVEL_OPTIONS = ["ปวช.", "ปวส."];
const YEAR_BY_LEVEL = {
  "ปวช.": ["1", "2", "3"],
  "ปวส.": ["1", "2"],
};

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  studentId: "",
  phone: "",
  level: LEVEL_OPTIONS[0],
  year: YEAR_BY_LEVEL["ปวช."][0],
  department: "",
  classroom: "",
};

export default function StudentCreationForm({ onSuccess }) {
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM }));
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "level") {
      const yearOptions = YEAR_BY_LEVEL[value] || [];
      setForm((prev) => ({
        ...prev,
        level: value,
        year: yearOptions.includes(prev.year) ? prev.year : yearOptions[0] ?? "",
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
        throw new Error(
          result.error ||
            "ไม่สามารถสร้างบัญชีนักศึกษาได้ กรุณาตรวจสอบข้อมูลอีกครั้ง"
        );
      }

      setFeedback({
        type: "success",
        message: result.message || "สร้างบัญชีนักศึกษาเรียบร้อยแล้ว",
      });
      setForm(() => ({ ...INITIAL_FORM }));
      onSuccess?.(result.user);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.message ||
          "เกิดข้อผิดพลาดระหว่างสร้างบัญชี กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const yearOptions = YEAR_BY_LEVEL[form.level] || [];

  return (
    <form
      className="card border border-base-200 bg-base-100 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="card-body space-y-6">
        <div className="space-y-2">
          <h2 className="card-title text-2xl font-semibold text-base-content">
            สร้างบัญชีนักศึกษา
          </h2>
          <p className="text-base text-base-content/70">
            เพิ่มนักศึกษาระดับอาชีวศึกษา พร้อมระบุระดับชั้น แผนก และห้องเรียน
            เพื่อเชื่อมโยงกับครูนิเทศในระบบ
          </p>
        </div>

        {feedback && (
          <div
            className={`alert ${
              feedback.type === "success" ? "alert-success" : "alert-error"
            }`}
          >
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="ชื่อ - นามสกุล"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
          />
          <Input
            label="อีเมล"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
          />
          <Input
            label="รหัสนักศึกษา"
            name="studentId"
            required
            value={form.studentId}
            onChange={handleChange}
          />
          <Input
            label="รหัสผ่านชั่วคราว (อย่างน้อย 8 ตัวอักษร)"
            name="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={handleChange}
          />
          <Input
            label="เบอร์โทรศัพท์"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <Select
            label="ระดับ"
            name="level"
            required
            value={form.level}
            onChange={handleChange}
          >
            {LEVEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Select
            label="ชั้นปี"
            name="year"
            required
            value={form.year}
            onChange={handleChange}
          >
            {yearOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Input
            label="แผนก"
            name="department"
            required
            value={form.department}
            onChange={handleChange}
          />
          <Input
            label="ห้อง"
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
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังบันทึก..." : "สร้างบัญชี"}
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
