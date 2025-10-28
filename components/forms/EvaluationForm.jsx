"use client";

import { useMemo, useState } from "react";

const EMPTY_SCORES = {
  technical: "",
  professionalism: "",
  communication: "",
  problemSolving: "",
};

const INITIAL_FORM = {
  internshipId: "",
  evaluatorRole: "workplace",
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
  evaluatorRole: "workplace",
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
        label: `${
          internship.student?.fullName || internship.student?.name || 'ไม่พบนักศึกษา'
        } • ${internship.workplace?.companyName || 'ไม่พบสถานประกอบการ'}`,
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
            form.scores.technical === ''
              ? undefined
              : Number(form.scores.technical),
          professionalism:
            form.scores.professionalism === ''
              ? undefined
              : Number(form.scores.professionalism),
          communication:
            form.scores.communication === ''
              ? undefined
              : Number(form.scores.communication),
          problemSolving:
            form.scores.problemSolving === ''
              ? undefined
              : Number(form.scores.problemSolving),
        },
        overallScore:
          form.overallScore === '' ? undefined : Number(form.overallScore),
        status: form.status || undefined,
      };

      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'ไม่สามารถส่งแบบประเมินได้');
      }

      setFeedback({
        type: 'success',
        message: result.message || 'บันทึกแบบประเมินเรียบร้อย',
      });

      resetForm();
      onSuccess?.(result.data);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'เกิดข้อผิดพลาดในการส่งแบบประเมิน',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body space-y-6">
        <header className="space-y-2">
          <h2 className="card-title text-2xl font-semibold text-base-content">
            ส่งแบบประเมินผลการฝึกงาน
          </h2>
          <p className="text-base text-base-content/70">
            กรุณาเลือกสถานที่ฝึกงานและให้คะแนนในหัวข้อความสามารถต่าง ๆ พร้อมทั้งบันทึกข้อเสนอแนะเพิ่มเติม
          </p>
        </header>

        {feedback && (
          <div
            className={`alert ${
              feedback.type === 'success' ? 'alert-success' : 'alert-error'
            }`}
          >
            <span>{feedback.message}</span>
          </div>
        )}

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <Section title="เลือกสถานที่ฝึกงาน">
            <Select
              label="รายการฝึกงาน"
              required
              value={form.internshipId}
              onChange={updateField('internshipId')}
            >
              <option value="">-- เลือกสถานที่ฝึกงาน --</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              label="ส่งแบบประเมินในบทบาท"
              required
              value={form.evaluatorRole}
              onChange={updateField('evaluatorRole')}
            >
              <option value="teacher">ครูนิเทศ</option>
              <option value="workplace">ผู้ดูแลจากสถานประกอบการ</option>
            </Select>
          </Section>

          <Section title="ข้อมูลผู้ประเมิน">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="ชื่อ-นามสกุล"
                name="evaluatorName"
                required
                value={form.evaluatorName}
                onChange={updateField('evaluatorName')}
              />
              <Input
                label="อีเมล"
                name="evaluatorEmail"
                type="email"
                required
                value={form.evaluatorEmail}
                onChange={updateField('evaluatorEmail')}
              />
              <Input
                label="ตำแหน่งงาน"
                name="evaluatorPosition"
                value={form.evaluatorPosition}
                onChange={updateField('evaluatorPosition')}
              />
              <Select
                label="ข้อเสนอแนะโดยรวม"
                name="recommendation"
                value={form.recommendation}
                onChange={updateField('recommendation')}
              >
                <option value="">-- เลือกข้อเสนอแนะ --</option>
                <option value="hire">แนะนำให้รับเข้าทำงาน</option>
                <option value="continue">ควรให้ฝึก/ทำงานต่อ</option>
                <option value="improve">ควรปรับปรุงเพิ่มเติม</option>
                <option value="not_recommend">ไม่แนะนำ</option>
              </Select>
            </div>
          </Section>

          <Section title="ให้คะแนนความสามารถ (0-5)">
            <div className="grid gap-4 md:grid-cols-2">
              <ScoreInput
                label="ทักษะทางเทคนิค"
                value={form.scores.technical}
                onChange={updateScore('technical')}
              />
              <ScoreInput
                label="ความเป็นมืออาชีพ"
                value={form.scores.professionalism}
                onChange={updateScore('professionalism')}
              />
              <ScoreInput
                label="การสื่อสาร"
                value={form.scores.communication}
                onChange={updateScore('communication')}
              />
              <ScoreInput
                label="การแก้ปัญหา"
                value={form.scores.problemSolving}
                onChange={updateScore('problemSolving')}
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
                onChange={updateField('overallScore')}
              />
              <Select
                label="อัปเดตสถานะการฝึกงาน"
                value={form.status}
                onChange={updateField('status')}
              >
                <option value="">-- ไม่เปลี่ยนสถานะ --</option>
                <option value="active">ยังดำเนินการต่อ</option>
                <option value="completed">ผ่านการฝึกงาน</option>
                <option value="closed">ยุติการฝึกงาน</option>
              </Select>
            </div>
            <Textarea
              label="จุดเด่น"
              rows={2}
              value={form.strengths}
              onChange={updateField('strengths')}
            />
            <Textarea
              label="ข้อควรปรับปรุง"
              rows={2}
              value={form.improvements}
              onChange={updateField('improvements')}
            />
            <Textarea
              label="ความคิดเห็นเพิ่มเติม"
              rows={3}
              value={form.comments}
              onChange={updateField('comments')}
            />
          </Section>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              ล้างแบบฟอร์ม
            </button>
            <button type="submit" className="btn btn-secondary" disabled={isSubmitting}>
              {isSubmitting ? 'กำลังส่ง...' : 'ส่งแบบประเมิน'}
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

function Input({ label, className = '', ...props }) {
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text font-medium">{label}</span>
      </div>
      <input className={`input input-bordered w-full ${className}`} {...props} />
    </label>
  );
}

function Textarea({ label, className = '', rows = 3, ...props }) {
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text font-medium">{label}</span>
      </div>
      <textarea rows={rows} className={`textarea textarea-bordered w-full ${className}`} {...props} />
    </label>
  );
}

function Select({ label, children, className = '', ...props }) {
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text font-medium">{label}</span>
      </div>
      <select className={`select select-bordered font-normal ${className}`} {...props}>
        {children}
      </select>
    </label>
  );
}

function ScoreInput({ label, value, onChange }) {
  return (
    <Input
      label={label}
      type="number"
      min="0"
      max="5"
      step="0.5"
      value={value}
      onChange={onChange}
    />
  );
}
