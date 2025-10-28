"use client";

import { useMemo, useState } from "react";

const ROLE_OPTIONS = [
  { value: "teacher", label: "ครูนิเทศ" },
  { value: "workplace", label: "ผู้ดูแลจากสถานประกอบการ" },
];

const INITIAL_FORM = {
  role: "teacher",
  name: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  department: "",
  companyName: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  contactPosition: "",
  branchName: "",
  address: "",
  notes: "",
};

export default function AdminUserForm() {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleConfig = useMemo(
    () => ROLE_OPTIONS.find((item) => item.value === form.role),
    [form.role]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (event) => {
    const role = event.target.value;
    setForm((prev) => ({
      ...prev,
      role,
      department: "",
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      contactPosition: "",
      branchName: "",
      address: "",
      notes: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถสร้างบัญชีผู้ใช้ได้");
      }

      setFeedback({
        type: "success",
        message: result.message || "สร้างบัญชีผู้ใช้เรียบร้อย",
      });
      setForm({ ...INITIAL_FORM, role: form.role });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "เกิดข้อผิดพลาดในการสร้างบัญชีผู้ใช้",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="card border border-base-200 bg-base-100 shadow-sm" onSubmit={handleSubmit}>
      <div className="card-body space-y-6">
        <header className="space-y-2">
          <h2 className="card-title text-2xl font-semibold text-base-content">
            สร้างบัญชีผู้ใช้ใหม่
          </h2>
          <p className="text-base text-base-content/70">
            เลือกบทบาทที่ต้องการและกรอกข้อมูลให้ครบถ้วน เพื่อให้ครูนิเทศหรือผู้ดูแลจากสถานประกอบการเข้าสู่ระบบได้ทันที
          </p>
        </header>

        {feedback && (
          <div
            className={`alert ${
              feedback.type === "success" ? "alert-success" : "alert-error"
            }`}
          >
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-control md:col-span-2">
            <div className="label">
              <span className="label-text font-medium">บทบาทผู้ใช้</span>
            </div>
            <select
              name="role"
              className="select select-bordered"
              value={form.role}
              onChange={handleRoleChange}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Input
            label="ชื่อ-นามสกุล"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
          />
          <Input
            label="ชื่อผู้ใช้"
            name="username"
            required
            value={form.username}
            onChange={handleChange}
            placeholder="ใช้ตัวอักษรเล็ก ไม่มีเว้นวรรค"
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
            label="รหัสผ่าน"
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

          {form.role === "teacher" && (
            <Input
              label="แผนก / สาขาวิชา"
              name="department"
              value={form.department}
              onChange={handleChange}
            />
          )}

          {form.role === "workplace" && (
            <>
              <Input
                label="ชื่อสถานประกอบการ"
                name="companyName"
                required
                value={form.companyName}
                onChange={handleChange}
              />
              <Input
                label="ชื่อผู้ติดต่อหลัก"
                name="contactName"
                required
                value={form.contactName}
                onChange={handleChange}
              />
              <Input
                label="อีเมลผู้ติดต่อ"
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="เว้นว่างได้หากใช้เหมือนกับอีเมลบัญชี"
              />
              <Input
                label="เบอร์โทรผู้ติดต่อ"
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
              />
              <Input
                label="ตำแหน่งงาน"
                name="contactPosition"
                value={form.contactPosition}
                onChange={handleChange}
              />
              <Input
                label="สาขา / หน่วยงาน"
                name="branchName"
                value={form.branchName}
                onChange={handleChange}
              />
              <Textarea
                label="ที่อยู่"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
              <Textarea
                label="บันทึกเพิ่มเติม"
                name="notes"
                value={form.notes}
                onChange={handleChange}
              />
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setForm({ ...INITIAL_FORM, role: form.role });
              setFeedback(null);
            }}
            disabled={isSubmitting}
          >
            ล้างข้อมูล
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'กำลังสร้าง...' : 'สร้างบัญชีผู้ใช้'}
          </button>
        </div>
      </div>
    </form>
  );
}

function Input({ label, className = '', ...props }) {
  return (
    <label className="form-control">
      <div className="label">
        <span className="label-text font-medium">{label}</span>
      </div>
      <input className={`input input-bordered ${className}`} {...props} />
    </label>
  );
}

function Textarea({ label, className = '', ...props }) {
  return (
    <label className="form-control">
      <div className="label">
        <span className="label-text font-medium">{label}</span>
      </div>
      <textarea className={`textarea textarea-bordered ${className}`} rows={3} {...props} />
    </label>
  );
}
