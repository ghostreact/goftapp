'use client';

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import EvaluationForm from "@/components/forms/EvaluationForm";
import InternshipList from "@/components/dashboard/InternshipList";
import InternshipSnapshot from "@/components/dashboard/InternshipSnapshot";

export default function AppDashboard() {
  const [internships, setInternships] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const loadInternships = useCallback(
    async (withSpinner = false) => {
      if (withSpinner) {
        setIsLoading(true);
      }
      try {
        const response = await fetch("/api/internships", {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload.error || "ไม่สามารถโหลดข้อมูลการฝึกงานได้"
          );
        }

        setInternships(payload.data || []);
        if (payload.data && payload.data.length > 0) {
          setSelected((current) => {
            if (!current) {
              return payload.data[0];
            }
            const next = payload.data.find(
              (item) => item._id === current._id
            );
            return next || payload.data[0];
          });
        } else {
          setSelected(null);
        }

        setFetchError(null);
      } catch (error) {
        console.error("loadInternships error", error);
        setFetchError(error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    },
    [setInternships]
  );

  useEffect(() => {
    loadInternships(true);
  }, [loadInternships]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        setCurrentUser(payload.user);
      } catch (error) {
        console.error("loadUser error", error);
      }
    };

    loadUser();
  }, []);

  const handleEvaluationSuccess = async () => {
    await loadInternships();
  };

  const summary = useMemo(() => {
    if (!internships.length) {
      return {
        total: 0,
        active: 0,
        pending: 0,
        completed: 0,
        evaluations: 0,
      };
    }

    return internships.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === "active") acc.active += 1;
        if (item.status === "pending") acc.pending += 1;
        if (item.status === "completed") acc.completed += 1;

        const summaryItem = item.evaluationSummary;
        if (summaryItem) {
          acc.evaluations +=
            (summaryItem.teacherCount || 0) +
            (summaryItem.supervisorCount || 0);
        }

        return acc;
      },
      { total: 0, active: 0, pending: 0, completed: 0, evaluations: 0 }
    );
  }, [internships]);

  const role = currentUser?.role;
  const canRegisterInternship = role === "admin" || role === "teacher";
  const canEvaluate =
    role === "admin" || role === "teacher" || role === "supervisor";

  return (
    <div className="grid gap-8">
      <HeroHeader summary={summary} role={role} />

      {fetchError && (
        <div className="alert alert-error" role="alert">
          <span>{fetchError}</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => loadInternships(true)}
          >
            ลองใหม่
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6">
          {isLoading ? (
            <LoadingPlaceholder />
          ) : (
            <InternshipList
              internships={internships}
              selectedId={selected?._id}
              onSelect={setSelected}
            />
          )}

          {canRegisterInternship && (
            <QuickActionCard
              title="ลงทะเบียนการฝึกงานใหม่"
              description="จัดเก็บข้อมูลนักศึกษา ครูนิเทศ และผู้ควบคุมในฟอร์มเดียว พร้อมระบุรายละเอียดโครงการและเป้าหมายที่ต้องการ"
              href="/teacher/internships/register"
              cta="ไปยังฟอร์มลงทะเบียน"
            />
          )}
        </div>

        <div className="grid gap-6">
          {canEvaluate && (
            <EvaluationForm
              internships={internships}
              onSuccess={handleEvaluationSuccess}
            />
          )}
          <InternshipSnapshot data={selected} />
        </div>
      </div>
    </div>
  );
}

function HeroHeader({ summary, role }) {
  const roleLabel = getRoleHeadline(role);
  const description = getRoleDescription(role);

  return (
    <section className="hero border border-base-200 bg-base-100 shadow-sm">
      <div className="hero-content w-full flex-col items-start gap-6 text-left lg:flex-row lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-base-content">
            {roleLabel}
          </h1>
          <p className="mt-2 text-base leading-6 text-base-content/70">
            {description}
          </p>
        </div>
        <div className="stats stats-vertical shadow md:stats-horizontal">
          <div className="stat">
            <div className="stat-title">จำนวนนักศึกษา</div>
            <div className="stat-value text-primary">{summary.total}</div>
            <div className="stat-desc">
              กำลังฝึก {summary.active} • รอเริ่ม {summary.pending}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">ฝึกงานเสร็จสิ้น</div>
            <div className="stat-value text-secondary">{summary.completed}</div>
            <div className="stat-desc">
              ผลประเมินสะสม {summary.evaluations} ฉบับ
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getRoleHeadline(role) {
  switch (role) {
    case "admin":
      return "ระบบจัดการการฝึกงานสำหรับผู้ดูแล";
    case "teacher":
      return "ภาพรวมการฝึกงานในความดูแลของครูนิเทศ";
    case "supervisor":
      return "สถานะการฝึกงานจากมุมของผู้ควบคุม";
    case "student":
      return "ข้อมูลการฝึกงานของนักศึกษา";
    default:
      return "ระบบลงทะเบียนและประเมินนักศึกษาฝึกงาน";
  }
}

function getRoleDescription(role) {
  switch (role) {
    case "admin":
      return "ตรวจสอบการลงทะเบียน บันทึกผลประเมิน และจัดการผู้ใช้งานครบทุกบทบาทในระบบเดียว";
    case "teacher":
      return "ติดตามสถานะการฝึกงานของนักศึกษา พร้อมสรุปคะแนนจากสถานประกอบการแบบเรียลไทม์";
    case "supervisor":
      return "บันทึกและปรับปรุงผลประเมินนักศึกษา เพื่อให้ข้อมูลอัปเดตถึงครูนิเทศ";
    case "student":
      return "ดูความก้าวหน้าการฝึกงานและคำแนะนำจากผู้ควบคุมและครูนิเทศ";
    default:
      return "รวบรวมข้อมูลนักศึกษา ครูนิเทศ และสถานประกอบการ พร้อมติดตามผลได้ในหน้าเดียว";
  }
}

function QuickActionCard({ title, description, href, cta }) {
  return (
    <div className="card border border-dashed border-primary/40 bg-primary/5">
      <div className="card-body gap-4">
        <div>
          <h3 className="text-xl font-semibold text-base-content">{title}</h3>
          <p className="mt-1 text-base text-base-content/70">{description}</p>
        </div>
        <div>
          <Link href={href} className="btn btn-primary btn-sm md:btn-md">
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        <div className="skeleton h-6 w-64" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  );
}

