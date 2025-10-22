'use client';

import { useMemo, useState } from "react";

const INITIAL_FORM = {
  role: "teacher",
  name: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  department: "",
  companyName: "",
  position: "",
};

const roleConfig = {
  teacher: {
    label: "ครูนิเทศ",
    description:
      "สร้างบัญชีสำหรับครูนิเทศในสถาบันการศึกษา เพื่อจัดการนักศึกษาและติดตามฝึกงาน",
    fields: ["department", "phone"],
  },
  supervisor: {
    label: "ผู้ควบคุม (สถานประกอบการ)",
    description:
      "สร้างบัญชีสำหรับผู้ควบคุมในสถานประกอบการ เพื่อติดตามและประเมินนักศึกษา",
    fields: ["companyName", "position", "phone"],
  },
};

export default function AdminUserForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = useMemo(() => roleConfig[form.role], [form.role]);

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
      position: "",
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
        throw new Error(result.error || "ไม่สามารถสร้างบัญชีได้");
      }

      setFeedback({
        type: "success",
        message: result.message || "สร้างบัญชีสำเร็จ",
      });
      setForm({ ...INITIAL_FORM, role: form.role });
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
            สร้างบัญชีผู้ใช้งานใหม่
          </h2>
          <p className="text-base text-base-content/70">
            เลือกบทบาทผู้ใช้ที่ต้องการสร้าง และกรอกข้อมูลพื้นฐานเพื่อสร้างบัญชีเข้าสู่ระบบ
          </p>
        </div>

        {feedback && (
          <div
            className={`alert ${
              feedback.type === "success" ? "alert-success" : "alert-error"
            }`}
            role="alert"
          >
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">ประเภทผู้ใช้</span>
            </div>
            <select
              name="role"
              className="select select-bordered"
              value={form.role}
              onChange={handleRoleChange}
            >
              <option value="teacher">ครูนิเทศ</option>
              <option value="supervisor">ผู้ควบคุม (สถานประกอบการ)</option>
            </select>
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                {config?.description}
              </span>
            </div>
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">ชื่อ-นามสกุล</span>
            </div>
            <input
              name="name"
              required
              className="input input-bordered"
              value={form.name}
              onChange={handleChange}
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">
                ชื่อผู้ใช้สำหรับเข้าระบบ
              </span>
            </div>
            <input
              name="username"
              required
              className="input input-bordered"
              value={form.username}
              onChange={handleChange}
            />
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                ใช้ตัวอักษร/ตัวเลขต่อเนื่อง (ระบบไม่สนใจตัวพิมพ์เล็กใหญ่)
              </span>
            </div>
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">อีเมล</span>
            </div>
            <input
              name="email"
              type="email"
              required
              className="input input-bordered"
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">รหัสผ่านสำหรับบัญชีใหม่</span>
            </div>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="input input-bordered"
              value={form.password}
              onChange={handleChange}
            />
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                ใช้อย่างน้อย 8 ตัวอักษร
              </span>
            </div>
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">เบอร์โทรศัพท์</span>
            </div>
            <input
              name="phone"
              className="input input-bordered"
              value={form.phone}
              onChange={handleChange}
            />
          </label>

          {form.role === "teacher" && (
            <label className="form-control">
              <div className="label">
                <span className="label-text font-medium">ภาควิชา / สังกัด</span>
              </div>
              <input
                name="department"
                className="input input-bordered"
                value={form.department}
                onChange={handleChange}
              />
            </label>
          )}

          {form.role === "supervisor" && (
            <>
              <label className="form-control">
                <div className="label">
                  <span className="label-text font-medium">ชื่อสถานประกอบการ</span>
                </div>
                <input
                  name="companyName"
                  required
                  className="input input-bordered"
                  value={form.companyName}
                  onChange={handleChange}
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text font-medium">ตำแหน่งในองค์กร</span>
                </div>
                <input
                  name="position"
                  className="input input-bordered"
                  value={form.position}
                  onChange={handleChange}
                />
              </label>
            </>
          )}
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
            {isSubmitting ? "กำลังบันทึก..." : "สร้างบัญชี"}
          </button>
        </div>
      </div>
    </form>
  );
}
