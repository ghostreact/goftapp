'use client';

import { useMemo, useState } from "react";

const EMPTY_SCORES = {
  technical: "",
  professionalism: "",
  communication: "",
  problemSolving: "",
};

const INITIAL_FORM = {
  internshipId: "",
  evaluatorRole: "supervisor",
  evaluatorName: "",
  evaluatorEmail: "",
  evaluatorPosition: "",
  overallScore: "",
  strengths: "",
  improvements: "",
  comments: "",
  recommendation: "",
  status: "",
  scores: { ...EMPTY_SCORES },
};

const createInitialForm = () => ({
  internshipId: "",
  evaluatorRole: "supervisor",
  evaluatorName: "",
  evaluatorEmail: "",
  evaluatorPosition: "",
  overallScore: "",
  strengths: "",
  improvements: "",
  comments: "",
  recommendation: "",
  status: "",
  scores: { ...EMPTY_SCORES },
});

export default function EvaluationForm({ internships = [], onSuccess }) {
  const [form, setForm] = useState(createInitialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const options = useMemo(
    () =>
      internships.map((internship) => ({
        value: internship._id,
        label: `${internship.student?.name || "ไม่ทราบชื่อ"} • ${
          internship.supervisor?.companyName || "ไม่ระบุสถานประกอบการ"
        }`,
      })),
    [internships]
  );

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateScore = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [field]: value,
      },
    }));
  };

  const resetForm = () => {
    setForm(createInitialForm());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        ...form,
        scores: {
          technical:
            form.scores.technical === ""
              ? undefined
              : Number(form.scores.technical),
          professionalism:
            form.scores.professionalism === ""
              ? undefined
              : Number(form.scores.professionalism),
          communication:
            form.scores.communication === ""
              ? undefined
              : Number(form.scores.communication),
          problemSolving:
            form.scores.problemSolving === ""
              ? undefined
              : Number(form.scores.problemSolving),
        },
        overallScore:
          form.overallScore === "" ? undefined : Number(form.overallScore),
        status: form.status || undefined,
      };

      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถบันทึกการประเมินได้");
      }

      setFeedback({
        type: "success",
        message: result.message || "บันทึกการประเมินสำเร็จ",
      });

      resetForm();
      onSuccess?.(result.data);
    } catch (error) {
      console.error("Evaluation error", error);
      setFeedback({
        type: "error",
        message: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            บันทึกผลการประเมิน
          </h2>
          <p className="text-base-content/70">
            เลือกรายการฝึกงานและกรอกคะแนนจากครูนิเทศหรือผู้ควบคุมในสถานประกอบการ
          </p>
        </div>

        {feedback && (
          <div className={feedbackClass} role="alert">
            <span>{feedback.message}</span>
          </div>
        )}

        <form className="grid gap-7" onSubmit={handleSubmit}>
          <Section title="เลือกรายการฝึกงาน">
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="นักศึกษาฝึกงาน"
                required
                value={form.internshipId}
                onChange={updateField("internshipId")}
              >
                <option value="">-- เลือกรายการ --</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select
                label="สถานะการฝึกงานหลังประเมิน"
                value={form.status}
                onChange={updateField("status")}
              >
                <option value="">-- ไม่เปลี่ยนสถานะ --</option>
                <option value="pending">รอเริ่ม</option>
                <option value="active">กำลังฝึก</option>
                <option value="completed">เสร็จสิ้น</option>
              </Select>
            </div>
          </Section>

          <Section title="ข้อมูลผู้ประเมิน">
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="บทบาทผู้ประเมิน"
                value={form.evaluatorRole}
                onChange={updateField("evaluatorRole")}
              >
                <option value="supervisor">ผู้ควบคุม (สถานประกอบการ)</option>
                <option value="teacher">ครูนิเทศ</option>
              </Select>
              <Input
                label="ชื่อ-นามสกุลผู้ประเมิน"
                required
                value={form.evaluatorName}
                onChange={updateField("evaluatorName")}
              />
              <Input
                label="อีเมล"
                type="email"
                required
                value={form.evaluatorEmail}
                onChange={updateField("evaluatorEmail")}
              />
              <Input
                label="ตำแหน่ง / หน้าที่"
                value={form.evaluatorPosition}
                onChange={updateField("evaluatorPosition")}
              />
            </div>
          </Section>

          <Section title="คะแนนประเมิน (0-5)">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="ทักษะด้านเทคนิค"
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={form.scores.technical}
                onChange={updateScore("technical")}
              />
              <Input
                label="ความเป็นมืออาชีพ / วินัย"
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={form.scores.professionalism}
                onChange={updateScore("professionalism")}
              />
              <Input
                label="การสื่อสารและทีมเวิร์ก"
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={form.scores.communication}
                onChange={updateScore("communication")}
              />
              <Input
                label="การแก้ปัญหา"
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={form.scores.problemSolving}
                onChange={updateScore("problemSolving")}
              />
            </div>
          </Section>

          <Section title="สรุปผลการประเมิน">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="คะแนนรวม (0-100)"
                type="number"
                min="0"
                max="100"
                value={form.overallScore}
                onChange={updateField("overallScore")}
              />
              <Select
                label="ข้อเสนอแนะ"
                value={form.recommendation}
                onChange={updateField("recommendation")}
              >
                <option value="">-- เลือกข้อเสนอแนะ --</option>
                <option value="hire">แนะนำให้รับเข้าทำงาน</option>
                <option value="continue">ดำเนินการฝึกต่อ</option>
                <option value="improve">ต้องปรับปรุง</option>
                <option value="not_recommend">ไม่แนะนำ</option>
              </Select>
            </div>
            <Textarea
              label="จุดแข็ง"
              rows={2}
              value={form.strengths}
              onChange={updateField("strengths")}
            />
            <Textarea
              label="ข้อควรพัฒนา"
              rows={2}
              value={form.improvements}
              onChange={updateField("improvements")}
            />
            <Textarea
              label="หมายเหตุเพิ่มเติม"
              rows={3}
              value={form.comments}
              onChange={updateField("comments")}
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
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกผลประเมิน"}
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
      <header>
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

function Select({ label, children, className = "", ...props }) {
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
