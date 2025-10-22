'use client';

import { useEffect, useState } from "react";
import InternshipSnapshot from "@/components/dashboard/InternshipSnapshot";

export default function StudentInternshipView() {
  const [internship, setInternship] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/internships", {
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "ไม่สามารถโหลดข้อมูลได้");
        }
        if (isMounted) {
          setInternship(result.data?.[0] || null);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "เกิดข้อผิดพลาด");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body space-y-4">
          <div className="skeleton h-6 w-64" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="alert alert-info">
        <span>ยังไม่มีข้อมูลการฝึกงานที่เชื่อมกับบัญชีนี้</span>
      </div>
    );
  }

  return <InternshipSnapshot data={internship} />;
}
