"use client";

import { useMemo, useState } from "react";

const PROGRAM_OPTIONS = [
  {
    value: "vocational_certificate",
    label: "ประกาศนียบัตรวิชาชีพ (ปวช.)",
    years: ["1", "2", "3"],
  },
  {
    value: "higher_vocational_certificate",
    label: "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)",
    years: ["1", "2"],
  },
];

const INITIAL_FORM = {
  student: {
    studentId: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    phone: "",
    programType: PROGRAM_OPTIONS[0].value,
    yearLevel: PROGRAM_OPTIONS[0].years[0],
    department: "",
    classroom: "",
  },
  teacher: {
    name: "",
    email: "",
    phone: "",
    department: "",
  },
  workplace: {
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactPosition: "",
    branchName: "",
    address: "",
    notes: "",
  },
  internship: {
    projectTitle: "",
    objectives: "",
    responsibilities: "",
    startDate: "",
    endDate: "",
    weeklyHours: "",
    focusAreas: "",
    deliverables: "",
    notes: "",
    status: "awaiting_workplace",
  },
};

const createInitialForm = () => JSON.parse(JSON.stringify(INITIAL_FORM));

export default function InternshipRegistrationForm({ onSuccess }) {
  const [formData, setFormData] = useState(createInitialForm);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableStudentYears = useMemo(() => {
    const option = PROGRAM_OPTIONS.find(
      (item) => item.value === formData.student.programType
    );
    return option?.years ?? [];
  }, [formData.student.programType]);

  const updateField = (section, field) => (event) => {
    const { value } = event.target;

    setFormData((prev) => {
      if (section === "student" && field === "programType") {
        const option = PROGRAM_OPTIONS.find((item) => item.value === value);
        return {
          ...prev,
          student: {
            ...prev.student,
            programType: value,
            yearLevel: option?.years.includes(prev.student.yearLevel)
              ? prev.student.yearLevel
              : option?.years[0] ?? "",
          },
        };
      }

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  };

  const resetForm = () => {
    setFormData(createInitialForm());
    setFeedback(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const workplacePayload = {
        ...formData.workplace,
        contactEmail: formData.workplace.contactEmail || formData.workplace.email,
      };

      const payload = {
        student: {
          ...formData.student,
          yearLevel: Number(formData.student.yearLevel),
        },
        teacher: { ...formData.teacher },
        workplace: workplacePayload,
        internship: {
          ...formData.internship,
          weeklyHours:
            formData.internship.weeklyHours === ""
              ? null
              : Number(formData.internship.weeklyHours),
        },
      };

      const response = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถบันทึกการจับคู่นักศึกษากับสถานประกอบการได้");
      }

      setFeedback({
        type: "success",
        message: result.message || "ลงทะเบียนการฝึกงานเรียบร้อย",
      });
      onSuccess?.(result.data);
      resetForm();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "เกิดข้อผิดพลาดในการลงทะเบียนการฝึกงาน",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body space-y-8">
        <header className="space-y-2">
          <h2 className="card-title text-2xl font-semibold text-base-content">
            ลงทะเบียนสถานที่ฝึกงาน
          </h2>
          <p className="text-base text-base-content/70">
            กรอกข้อมูลนักศึกษา ครูนิเทศ และสถานประกอบการ เพื่อสร้างบันทึกการฝึกงานและเริ่มต้นการติดตามผล
          </p>
        </header>

        {feedback && (
          <div
            className={`alert ${feedback.type === "success" ? "alert-success" : "alert-error"}`}
          >
            <span>{feedback.message}</span>
          </div>
        )}

        <form className="space-y-8" onSubmit={handleSubmit}>
          <Section title="ข้อมูลนักศึกษา">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="รหัสนักศึกษา"
                required
                value={formData.student.studentId}
                onChange={updateField("student", "studentId")}
              />
              <Input
                label="อีเมล"
                type="email"
                value={formData.student.email}
                onChange={updateField("student", "email")}
              />
              <Input
                label="ชื่อ"
                required
                value={formData.student.firstName}
                onChange={updateField("student", "firstName")}
              />
              <Input
                label="นามสกุล"
                required
                value={formData.student.lastName}
                onChange={updateField("student", "lastName")}
              />
              <Input
                label="วันเดือนปีเกิด"
                type="date"
                required
                value={formData.student.birthDate}
                onChange={updateField("student", "birthDate")}
              />
              <Input
                label="เบอร์โทรศัพท์"
                value={formData.student.phone}
                onChange={updateField("student", "phone")}
              />
              <Select
                label="ประเภทหลักสูตร"
                required
                value={formData.student.programType}
                onChange={updateField("student", "programType")}
              >
                {PROGRAM_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Select
                label="ชั้นปี"
                required
                value={formData.student.yearLevel}
                onChange={updateField("student", "yearLevel")}
              >
                {availableStudentYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
              <Input
                label="แผนก / สาขาวิชา"
                required
                value={formData.student.department}
                onChange={updateField("student", "department")}
              />
              <Input
                label="ห้อง / กลุ่มเรียน"
                required
                value={formData.student.classroom}
                onChange={updateField("student", "classroom")}
              />
            </div>
          </Section>

          <Section title="ข้อมูลครูนิเทศ">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="ชื่อ-นามสกุล"
                required
                value={formData.teacher.name}
                onChange={updateField("teacher", "name")}
              />
              <Input
                label="อีเมล"
                type="email"
                required
                value={formData.teacher.email}
                onChange={updateField("teacher", "email")}
              />
              <Input
                label="เบอร์โทรศัพท์"
                value={formData.teacher.phone}
                onChange={updateField("teacher", "phone")}
              />
              <Input
                label="แผนก / สาขาวิชา"
                value={formData.teacher.department}
                onChange={updateField("teacher", "department")}
              />
            </div>
          </Section>

          <Section title="ข้อมูลสถานประกอบการ">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="ชื่อสถานประกอบการ"
                required
                value={formData.workplace.companyName}
                onChange={updateField("workplace", "companyName")}
              />
              <Input
                label="สาขา / หน่วยงาน"
                value={formData.workplace.branchName}
                onChange={updateField("workplace", "branchName")}
              />
              <Input
                label="ชื่อผู้ติดต่อหลัก"
                required
                value={formData.workplace.contactName}
                onChange={updateField("workplace", "contactName")}
              />
              <Input
                label="อีเมลผู้ติดต่อ"
                type="email"
                value={formData.workplace.contactEmail}
                onChange={updateField("workplace", "contactEmail")}
              />
              <Input
                label="เบอร์โทรผู้ติดต่อ"
                value={formData.workplace.contactPhone}
                onChange={updateField("workplace", "contactPhone")}
              />
              <Input
                label="ตำแหน่ง"
                value={formData.workplace.contactPosition}
                onChange={updateField("workplace", "contactPosition")}
              />
            </div>
            <Textarea
              label="ที่อยู่"
              value={formData.workplace.address}
              onChange={updateField("workplace", "address")}
            />
            <Textarea
              label="บันทึกเพิ่มเติม"
              value={formData.workplace.notes}
              onChange={updateField("workplace", "notes")}
            />
          </Section>

          <Section title="รายละเอียดการฝึกงาน">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="หัวข้อ / โครงการ"
                value={formData.internship.projectTitle}
                onChange={updateField("internship", "projectTitle")}
              />
              <Select
                label="สถานะการฝึกงาน"
                value={formData.internship.status}
                onChange={updateField("internship", "status")}
              >
                <option value="awaiting_workplace">รอการยืนยันจากสถานประกอบการ</option>
                <option value="active">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="closed">ยุติการฝึก</option>
              </Select>
              <Input
                label="วันที่เริ่มฝึก"
                type="date"
                required
                value={formData.internship.startDate}
                onChange={updateField("internship", "startDate")}
              />
              <Input
                label="วันที่สิ้นสุด"
                type="date"
                value={formData.internship.endDate}
                onChange={updateField("internship", "endDate")}
              />
              <Input
                label="ชั่วโมงต่อสัปดาห์"
                type="number"
                min="0"
                value={formData.internship.weeklyHours}
                onChange={updateField("internship", "weeklyHours")}
              />
              <Input
                label="หัวข้อที่เน้น (คั่นด้วยเครื่องหมายจุลภาค)"
                value={formData.internship.focusAreas}
                onChange={updateField("internship", "focusAreas")}
              />
              <Input
                label="ผลงานที่คาดหวัง (คั่นด้วยเครื่องหมายจุลภาค)"
                value={formData.internship.deliverables}
                onChange={updateField("internship", "deliverables")}
              />
            </div>
            <Textarea
              label="วัตถุประสงค์"
              rows={3}
              value={formData.internship.objectives}
              onChange={updateField("internship", "objectives")}
            />
            <Textarea
              label="หน้าที่ความรับผิดชอบ"
              rows={3}
              value={formData.internship.responsibilities}
              onChange={updateField("internship", "responsibilities")}
            />
            <Textarea
              label="บันทึกเพิ่มเติม"
              rows={3}
              value={formData.internship.notes}
              onChange={updateField("internship", "notes")}
            />
          </Section>

          <div className="flex items-center justify-end gap-3">
            <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={isSubmitting}>
              ล้างข้อมูล
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการลงทะเบียนฝึกงาน'}
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
      <header className="flex items-center justify-between gap-2">
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
      <input className={`input input-bordered w-full ${className}`} {...props} />
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

function Select({ label, className = "", children, ...props }) {
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

