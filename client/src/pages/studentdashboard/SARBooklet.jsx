import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SARBooklet() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    course: "",
    rollNumber: "",
    semester: "",
    cgpa: "",
    achievements: "",
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/student/me", { withCredentials: true });
        setStudent(res.data?.student || null);
        const s = res.data?.student || {};
        setForm((prev) => ({
          ...prev,
          name: s?.personal?.name || "",
          email: s?.personal?.email || "",
          course: s?.course || "",
        }));
      } catch (e) {
        setError("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  function updateField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Placeholder
    // eslint-disable-next-line no-console
    console.log("SAR submit", form);
    alert("Saved (placeholder)");
  }

  if (loading) {
    return <div>Loading SAR Booklet…</div>;
  }

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  return (
    <div className="pl-8 pt-8 bg-gradient-to-br from-gray-25 to-gray-50">
      <h1 className="text-3xl font-bold mb-3">SAR Booklet</h1>
      <p className="opacity-80 mb-4">
        Please review and complete the following details. Some fields are pre-filled from your profile.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-3 max-w-2xl">
        <div>
          <label className="block mb-1">Full Name</label>
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-100 border border-slate-700 outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-100 border border-slate-700 outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block mb-1">Course</label>
          <input
            value={form.course}
            onChange={(e) => updateField("course", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-100 border border-slate-700 outline-none focus:border-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1">Roll Number</label>
            <input
              value={form.rollNumber}
              onChange={(e) => updateField("rollNumber", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-100 border border-slate-700 outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block mb-1">Semester</label>
            <input
              value={form.semester}
              onChange={(e) => updateField("semester", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-100 border border-slate-700 outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1">CGPA</label>
          <input
            value={form.cgpa}
            onChange={(e) => updateField("cgpa", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-100 border border-slate-700 outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block mb-1">Achievements / Activities</label>
          <textarea
            rows={5}
            value={form.achievements}
            onChange={(e) => updateField("achievements", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 text-slate-100 border border-slate-700 outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}


