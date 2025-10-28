'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const roleLinks = {
  admin: [
    { href: '/admin', label: 'แดชบอร์ดผู้ดูแล' },
    { href: '/admin/internships', label: 'รายการฝึกงาน' },
  ],
  teacher: [{ href: '/teacher', label: 'แดชบอร์ดครู' }],
  workplace: [{ href: '/workplace', label: 'แดชบอร์ดสถานประกอบการ' }],
  student: [{ href: '/student', label: 'แดชบอร์ดนักศึกษา' }],
};

export default function MainNav({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const links = user ? roleLinks[user.role] || [] : [];

  const handleLogout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setIsSubmitting(false);
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="bg-base-100 shadow-sm border-b border-base-200">
      <nav className="navbar mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex-1 items-center gap-3">
          <Link href="/" className="text-lg font-bold text-primary">
            GOFT ระบบฝึกงาน
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`btn btn-ghost btn-sm ${
                  pathname.startsWith(link.href)
                    ? 'btn-active text-primary'
                    : 'text-base-content/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-sm text-base-content/70 sm:flex sm:flex-col sm:items-end">
                <span className="font-medium text-base-content">{user.name}</span>
                <span className="uppercase tracking-wide text-xs">
                  {roleLabel(user.role)}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

function roleLabel(role) {
  switch (role) {
    case 'admin':
      return 'ผู้ดูแลระบบ';
    case 'teacher':
      return 'ครูที่ปรึกษา';
    case 'workplace':
      return 'สถานประกอบการ';
    case 'student':
      return 'นักศึกษา';
    default:
      return role?.toUpperCase() || '';
  }
}
