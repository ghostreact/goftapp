'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INITIAL_FORM = {
  username: '',
  password: '',
};

export default function LoginForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'ไม่สามารถเข้าสู่ระบบได้');
      }

      const roleRedirect = getRedirectPath(result.user?.role);
      router.push(roleRedirect);
      router.refresh();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="card border border-base-200 bg-base-100 shadow-lg" onSubmit={handleSubmit}>
      <div className="card-body space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-base-content">เข้าสู่ระบบ</h1>
          <p className="text-base text-base-content/70">
            กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบบริหารจัดการการฝึกงาน
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <label className="form-control">
          <div className="label">
            <span className="label-text font-medium">ชื่อผู้ใช้ / รหัสนักศึกษา</span>
          </div>
          <input
            type="text"
            name="username"
            required
            autoComplete="username"
            className="input input-bordered"
            value={form.username}
            onChange={handleChange}
          />
        </label>

        <label className="form-control">
          <div className="label">
            <span className="label-text font-medium">รหัสผ่าน</span>
          </div>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="input input-bordered"
            value={form.password}
            onChange={handleChange}
          />
        </label>

        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </div>
    </form>
  );
}

function getRedirectPath(role) {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'teacher':
      return '/teacher';
    case 'workplace':
      return '/workplace';
    case 'student':
      return '/student';
    default:
      return '/';
  }
}
