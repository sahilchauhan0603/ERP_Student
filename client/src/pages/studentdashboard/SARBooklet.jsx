import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SARBooklet() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);
  const [activeSection, setActiveSection] = useState("personal");
  // Add a new tab for viewing all details
  const sectionTabs = [
    { key: "personal", label: "Personal" },
    { key: "family", label: "Family" },
    { key: "academic", label: "Academic" },
    { key: "achievements", label: "Achievements" },
    { key: "internship", label: "Internship" },
    { key: "viewall", label: "View All details" },
  ];
  const [editMode, setEditMode] = useState({
    personal: false,
    family: false,
    academic: false,
    achievements: false,
    internship: false,
  });

  // Form data for each section
  const [form, setForm] = useState({
    // Pre-filled from API
    personal: {
      firstName: "",
      middleName: "",
      lastName: "",
      dob: "",
      gender: "",
      email: "",
      mobile: "",
      currentAddress: "",
      permanentAddress: "",
    },
    family: {
      fatherName: "",
      motherName: "",
      familyIncome: "",
      fatherMobile: "",
      motherMobile: "",
      fatherEmail: "",
      motherEmail: "",
    },
    academic: {
      course: "",
      rollNumber: "",
      semester: "",
      cgpa: "",
      batch: "",
    },
    achievements: {
      achievementsText: "",
    },
    internship: {
      companyName: "",
      position: "",
      duration: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/student/students/me/details`,
          { withCredentials: true }
        );
        const s = res.data.data || {};

        setStudent(s);

        // Personal
        setForm((prev) => ({
          ...prev,
          personal: {
            firstName: s.personal?.firstName || "",
            middleName: s.personal?.middleName || "",
            lastName: s.personal?.lastName || "",
            dob: s.personal?.dob ? s.personal.dob.split("T")[0] : "",
            gender: s.personal?.gender || "",
            email: s.personal?.email || "",
            mobile: s.personal?.mobile || "",
            currentAddress: s.personal?.currentAddress || "",
            permanentAddress: s.personal?.permanentAddress || "",
          },
          family: {
            fatherName: s.parent?.father?.name || "",
            motherName: s.parent?.mother?.name || "",
            familyIncome: s.parent?.familyIncome || "",
            fatherMobile: s.parent?.father?.mobile || "",
            motherMobile: s.parent?.mother?.mobile || "",
            fatherEmail: s.parent?.father?.email || "",
            motherEmail: s.parent?.mother?.email || "",
          },
          academic: {
            // Placeholder for now - user editable, backend integration later
            course: s.personal?.course || "",
            rollNumber: "",
            semester: "",
            cgpa: "",
            batch: s.personal?.batch || "",
          },
          achievements: {
            achievementsText: "",
          },
          internship: {
            companyName: "",
            position: "",
            duration: "",
            description: "",
          },
        }));
      } catch (e) {
        setError("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  function updateField(section, name, value) {
    setForm((f) => ({
      ...f,
      [section]: {
        ...f[section],
        [name]: value,
      },
    }));
  }

  const toggleEdit = (section) => {
    setEditMode((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Placeholder save handlers for each section
  const handleSave = async (section) => {
    // For Personal and Family sections, we can submit updated info to backend
    if (section === "personal" || section === "family") {
      try {
        // API integration needed here - for now just switch off edit mode
        // You can extend these handlers once backend endpoints for update exist
        // Example: await axios PATCH /student/students/me/update-personal or /update-family
        toggleEdit(section);
        alert(
          `${section.charAt(0).toUpperCase() + section.slice(1)} details saved!`
        );
      } catch {
        alert(`Failed to save ${section} details`);
      }
    } else {
      // For other sections, save locally for now
      toggleEdit(section);
      alert(
        `${
          section.charAt(0).toUpperCase() + section.slice(1)
        } details saved (locally)`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-400 p-8 bg-white rounded shadow max-w-4xl mx-auto mt-8">
        {error}
      </div>
    );
  }

  return (
    <div className="pt-8 pb-12 bg-gradient-to-br from-gray-25 to-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SAR Booklet</h1>
          <p className="text-lg text-gray-800 mb-3 font-bold font-serif">
            Showcasing your academic and professional growth.
          </p>
          <p className="text-gray-500 mb-0">
            Please review and complete the following details. Some fields are
            pre-filled from your profile.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto justify-center mb-6 bg-white rounded-lg shadow-sm border border-gray-200 sticky top-2 z-10">
          {sectionTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveSection(tab.key);
                if (tab.key !== "viewall") {
                  document
                    .getElementById(tab.key)
                    ?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className={`px-5 py-3 font-medium whitespace-nowrap transition-colors ${
                activeSection === tab.key
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View All Details Section (Read-only, scrollable) */}
        {activeSection === "viewall" && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-100 max-h-[70vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
              All Student Details
            </h2>
            {/* Personal Details */}
            <div className="mb-8">
              <h3 className="text-lg font-bold font-serif text-gray-800 mb-2">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-700">
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    First Name
                  </div>
                  <div className="font-medium">
                    {form.personal.firstName || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Middle Name
                  </div>
                  <div className="font-medium">
                    {form.personal.middleName || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Last Name
                  </div>
                  <div className="font-medium">
                    {form.personal.lastName || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Date of Birth
                  </div>
                  <div className="font-medium">
                    {form.personal.dob || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Gender
                  </div>
                  <div className="font-medium">
                    {form.personal.gender || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Email
                  </div>
                  <div className="font-medium">
                    {form.personal.email || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Mobile
                  </div>
                  <div className="font-medium">
                    {form.personal.mobile || "N/A"}
                  </div>
                </div>
                <div className="md:col-span-2 py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Current Address
                  </div>
                  <div className="font-medium">
                    {form.personal.currentAddress || "N/A"}
                  </div>
                </div>
                <div className="md:col-span-2 py-2.5">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Permanent Address
                  </div>
                  <div className="font-medium">
                    {form.personal.permanentAddress || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            {/* Family Details */}
            <div className="mb-8">
              <h3 className="text-lg font-bold font-serif text-gray-800 mb-2">
                Family Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-700">
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Father's Name
                  </div>
                  <div className="font-medium">
                    {form.family.fatherName || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Mother's Name
                  </div>
                  <div className="font-medium">
                    {form.family.motherName || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Father's Mobile
                  </div>
                  <div className="font-medium">
                    {form.family.fatherMobile || "N/A"}
                  </div>
                </div>
                <div className="py-2.5">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Mother's Mobile
                  </div>
                  <div className="font-medium">
                    {form.family.motherMobile || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Father's Email
                  </div>
                  <div className="font-medium">
                    {form.family.fatherEmail || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Mother's Email
                  </div>
                  <div className="font-medium">
                    {form.family.motherEmail || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Family Income
                  </div>
                  <div className="font-medium">
                    {form.family.familyIncome || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            {/* Academic Details */}
            <div className="mb-8">
              <h3 className="text-lg font-bold font-serif text-gray-800 mb-2">
                Academic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-700">
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Course
                  </div>
                  <div className="font-medium">
                    {form.academic.course || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Batch
                  </div>
                  <div className="font-medium">
                    {form.academic.batch || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Roll Number
                  </div>
                  <div className="font-medium">
                    {form.academic.rollNumber || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Semester
                  </div>
                  <div className="font-medium">
                    {form.academic.semester || "N/A"}
                  </div>
                </div>
                <div className="py-2.5">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    CGPA
                  </div>
                  <div className="font-medium">
                    {form.academic.cgpa || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            {/* Achievements */}
            <div className="mb-8">
              <h3 className="text-lg font-bold font-serif text-gray-800 mb-2">
                Achievements
              </h3>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Achievements / Activities
                </div>
                <p className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-md min-h-[100px]">
                  {form.achievements.achievementsText ||
                    "No achievements recorded."}
                </p>
              </div>
            </div>
            {/* Internship Details */}
            <div className="mb-2">
              <h3 className="text-lg font-bold font-serif text-gray-800 mb-2">
                Internship Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-700">
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Company Name
                  </div>
                  <div className="font-medium">
                    {form.internship.companyName || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Position
                  </div>
                  <div className="font-medium">
                    {form.internship.position || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Duration
                  </div>
                  <div className="font-medium">
                    {form.internship.duration || "N/A"}
                  </div>
                </div>
                <div className="md:col-span-2 py-2.5">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Description
                  </div>
                  <div className="font-medium whitespace-pre-wrap">
                    {form.internship.description || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Personal Details Section */}
        {activeSection === "personal" && (
          <section
            id="personal"
            className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-100">
              <h2 className="text-xl font-semibold font-serif text-gray-800">
                Personal Details
              </h2>
              <button
                onClick={() => toggleEdit("personal")}
                className="px-4 py-2 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {editMode.personal ? (
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </span>
                )}
              </button>
            </div>
            {editMode.personal ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave("personal");
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    required
                    type="text"
                    value={form.personal.firstName}
                    onChange={(e) =>
                      updateField("personal", "firstName", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={form.personal.middleName}
                    onChange={(e) =>
                      updateField("personal", "middleName", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    required
                    type="text"
                    value={form.personal.lastName}
                    onChange={(e) =>
                      updateField("personal", "lastName", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    required
                    type="date"
                    value={form.personal.dob}
                    onChange={(e) =>
                      updateField("personal", "dob", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    required
                    value={form.personal.gender}
                    onChange={(e) =>
                      updateField("personal", "gender", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={form.personal.email}
                    onChange={(e) =>
                      updateField("personal", "email", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Mobile
                  </label>
                  <input
                    required
                    type="text"
                    value={form.personal.mobile}
                    onChange={(e) =>
                      updateField("personal", "mobile", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Current Address
                  </label>
                  <textarea
                    value={form.personal.currentAddress}
                    onChange={(e) =>
                      updateField("personal", "currentAddress", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Permanent Address
                  </label>
                  <textarea
                    value={form.personal.permanentAddress}
                    onChange={(e) =>
                      updateField(
                        "personal",
                        "permanentAddress",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-700">
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    First Name
                  </div>
                  <div className="font-medium">
                    {form.personal.firstName || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Middle Name
                  </div>
                  <div className="font-medium">
                    {form.personal.middleName || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Last Name
                  </div>
                  <div className="font-medium">
                    {form.personal.lastName || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Date of Birth
                  </div>
                  <div className="font-medium">
                    {form.personal.dob || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Gender
                  </div>
                  <div className="font-medium">
                    {form.personal.gender || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Email
                  </div>
                  <div className="font-medium">
                    {form.personal.email || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Mobile
                  </div>
                  <div className="font-medium">
                    {form.personal.mobile || "N/A"}
                  </div>
                </div>
                <div className="md:col-span-2 py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Current Address
                  </div>
                  <div className="font-medium">
                    {form.personal.currentAddress || "N/A"}
                  </div>
                </div>
                <div className="md:col-span-2 py-2.5">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Permanent Address
                  </div>
                  <div className="font-medium">
                    {form.personal.permanentAddress || "N/A"}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
        {/* Family Details Section */}
        {activeSection === "family" && (
          <section
            id="family"
            className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-100">
              <h2 className="text-xl font-semibold font-serif text-gray-800">
                Family Details
              </h2>
              <button
                onClick={() => toggleEdit("family")}
                className="px-4 py-2 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {editMode.family ? (
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </span>
                )}
              </button>
            </div>
            {editMode.family ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave("family");
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    value={form.family.fatherName}
                    onChange={(e) =>
                      updateField("family", "fatherName", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    value={form.family.motherName}
                    onChange={(e) =>
                      updateField("family", "motherName", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Father's Mobile
                  </label>
                  <input
                    type="text"
                    value={form.family.fatherMobile}
                    onChange={(e) =>
                      updateField("family", "fatherMobile", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Mother's Mobile
                  </label>
                  <input
                    type="text"
                    value={form.family.motherMobile}
                    onChange={(e) =>
                      updateField("family", "motherMobile", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Father's Email
                  </label>
                  <input
                    type="text"
                    value={form.family.fatherEmail}
                    onChange={(e) =>
                      updateField("family", "fatherEmail", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Mother's Email
                  </label>
                  <input
                    type="text"
                    value={form.family.motherEmail}
                    onChange={(e) =>
                      updateField("family", "motherEmail", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Family Income
                  </label>
                  <input
                    type="text"
                    value={form.family.familyIncome}
                    onChange={(e) =>
                      updateField("family", "familyIncome", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-700">
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Father's Name
                  </div>
                  <div className="font-medium">
                    {form.family.fatherName || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Mother's Name
                  </div>
                  <div className="font-medium">
                    {form.family.motherName || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Father's Mobile
                  </div>
                  <div className="font-medium">
                    {form.family.fatherMobile || "N/A"}
                  </div>
                </div>
                <div className="py-2.5">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Mother's Mobile
                  </div>
                  <div className="font-medium">
                    {form.family.motherMobile || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Father's Email
                  </div>
                  <div className="font-medium">
                    {form.family.fatherEmail || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Mother's Email
                  </div>
                  <div className="font-medium">
                    {form.family.motherEmail || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Family Income
                  </div>
                  <div className="font-medium">
                    {form.family.familyIncome + " Lacs" || "N/A"}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
        {/* Academic Details Section */}
        {activeSection === "academic" && (
          <section
            id="academic"
            className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-100">
              <h2 className="text-xl font-semibold font-serif text-gray-800">
                Academic Details
              </h2>
              <button
                onClick={() => toggleEdit("academic")}
                className="px-4 py-2 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {editMode.academic ? (
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </span>
                )}
              </button>
            </div>
            {editMode.academic ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave("academic");
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Course
                  </label>
                  <input
                    type="text"
                    value={form.academic.course}
                    onChange={(e) =>
                      updateField("academic", "course", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-100"
                    disabled // Course prefilled from backend, disable editing
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Batch
                  </label>
                  <input
                    type="text"
                    value={form.academic.batch}
                    onChange={(e) =>
                      updateField("academic", "batch", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-100"
                    disabled // Course prefilled from backend, disable editing
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={form.academic.rollNumber}
                    onChange={(e) =>
                      updateField("academic", "rollNumber", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={form.academic.semester}
                    onChange={(e) =>
                      updateField("academic", "semester", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    CGPA
                  </label>
                  <input
                    type="text"
                    value={form.academic.cgpa}
                    onChange={(e) =>
                      updateField("academic", "cgpa", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-700">
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Course
                  </div>
                  <div className="font-medium">
                    {form.academic.course || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Batch
                  </div>
                  <div className="font-medium">
                    {form.academic.batch || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Roll Number
                  </div>
                  <div className="font-medium">
                    {form.academic.rollNumber || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Semester
                  </div>
                  <div className="font-medium">
                    {form.academic.semester || "N/A"}
                  </div>
                </div>
                <div className="py-2.5">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    CGPA
                  </div>
                  <div className="font-medium">
                    {form.academic.cgpa || "N/A"}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
        {/* Achievements Section */}
        {activeSection === "achievements" && (
          <section
            id="achievements"
            className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-100">
              <h2 className="text-xl font-semibold font-serif text-gray-800">
                Achievements
              </h2>
              <button
                onClick={() => toggleEdit("achievements")}
                className="px-4 py-2 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {editMode.achievements ? (
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </span>
                )}
              </button>
            </div>
            {editMode.achievements ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave("achievements");
                }}
              >
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Achievements / Activities
                </label>
                <textarea
                  rows={5}
                  value={form.achievements.achievementsText}
                  onChange={(e) =>
                    updateField(
                      "achievements",
                      "achievementsText",
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="List your achievements, awards, extracurricular activities, etc."
                />
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Achievements / Activities
                </div>
                <p className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-md min-h-[100px]">
                  {form.achievements.achievementsText ||
                    "No achievements recorded."}
                </p>
              </div>
            )}
          </section>
        )}
        {/* Internship Details Section */}
        {activeSection === "internship" && (
          <section
            id="internship"
            className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-100">
              <h2 className="text-xl font-semibold font-serif text-gray-800">
                Internship Details
              </h2>
              <button
                onClick={() => toggleEdit("internship")}
                className="px-4 py-2 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {editMode.internship ? (
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </span>
                )}
              </button>
            </div>
            {editMode.internship ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave("internship");
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={form.internship.companyName}
                    onChange={(e) =>
                      updateField("internship", "companyName", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <input
                    type="text"
                    value={form.internship.position}
                    onChange={(e) =>
                      updateField("internship", "position", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={form.internship.duration}
                    onChange={(e) =>
                      updateField("internship", "duration", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="e.g., 3 months, June-August 2023"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.internship.description}
                    onChange={(e) =>
                      updateField("internship", "description", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Describe your responsibilities and what you learned"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-700">
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Company Name
                  </div>
                  <div className="font-medium">
                    {form.internship.companyName || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Position
                  </div>
                  <div className="font-medium">
                    {form.internship.position || "N/A"}
                  </div>
                </div>
                <div className="py-2.5 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Duration
                  </div>
                  <div className="font-medium">
                    {form.internship.duration || "N/A"}
                  </div>
                </div>
                <div className="md:col-span-2 py-2.5">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Description
                  </div>
                  <div className="font-medium whitespace-pre-wrap">
                    {form.internship.description || "N/A"}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
