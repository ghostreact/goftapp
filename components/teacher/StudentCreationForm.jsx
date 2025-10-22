'use client';

import { useState } from "react";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  studentId: "",
  phone: "",
  university: "",
  faculty: "",
  major: "",
  year: "",
};

export default function StudentCreationForm({ onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
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
        throw new Error(result.error || "ไม่สามารถสร้างนักศึกษาได้");
      }

      setFeedback({
        type: "success",
        message: result.message || "สร้างนักศึกษาเรียบร้อยแล้ว",
      });
      setForm(INITIAL_FORM);
      onSuccess?.(result.user);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
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
            สร้างบัญชีนักศึกษา
          </h2>
          <p className="text-base text-base-content/70">
            กรอกข้อมูลพื้นฐานของนักศึกษาเพื่อออกบัญชีเข้าสู่ระบบและเชื่อมโยงกับครูนิเทศ
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
            label="ชื่อ-นามสกุล"
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
            label="รหัสนักศึกษา (สำหรับเข้าสู่ระบบ)"
            name="studentId"
            required
            value={form.studentId}
            onChange={handleChange}
          />
          <Input
            label="รหัสผ่านเริ่มต้น"
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
          <Input
            label="มหาวิทยาลัย"
            name="university"
            value={form.university}
            onChange={handleChange}
          />
          <Input
            label="คณะ"
            name="faculty"
            value={form.faculty}
            onChange={handleChange}
          />
          <Input
            label="สาขาวิชา"
            name="major"
            value={form.major}
            onChange={handleChange}
          />
          <Input
            label="ชั้นปี"
            name="year"
            type="number"
            min="1"
            max="8"
            value={form.year}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setForm(INITIAL_FORM);
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
            {isSubmitting ? "กำลังบันทึก..." : "สร้างนักศึกษา"}
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
      <input
        className={`input input-bordered ${className}`}
        {...props}
      />
    </label>
  );
}
