"use client";
import React, { useState } from "react";
import axios from "axios";

const PersonalInfo = ({ formData, setFormData, incompleteFields = [] }) => {
  const courses = [
    "B.Tech Computer Science Engineering (CSE)",
    "B.Tech Information Technology Engineering (IT)",
    "B.Tech Electronics and Communication Engineering (ECE)",
    "B.Tech Electrical and Electronics Engineering (EEE)",
    "B.Tech Artificial Intelligence and Data Science Engineering (AI-DS)",
    "B.Tech Computer Science Engineering with specialization in Data Science (CSE-DS)",
    "LE-B.Tech Computer Science Engineering (CSE)",
    "LE-B.Tech Information Technology Engineering (IT)",
    "LE-B.Tech Electronics and Communication Engineering (ECE)",
    "LE-B.Tech Electrical and Electronics Engineering (EEE)",
    "BBA",
    "MBA",
  ];

  const countryCodes = [
    { code: "+91", label: "India(+91)" },
    { code: "+1", label: "USA (+1)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+61", label: "Australia (+61)" },
    { code: "+971", label: "UAE (+971)" },
    // Add more as needed
  ];

  const [mobileCountry, setMobileCountry] = useState(
    formData.personal.mobileCountry || "+91"
  );
  const [emailUser, setEmailUser] = useState(
    formData.personal.email
      ? formData.personal.email.replace(/@gmail\.com$/, "")
      : ""
  );
  const [emailError, setEmailError] = useState("");
  const [abcIdError, setAbcIdError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [name]: value,
      },
    }));
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        mobile: value,
        mobileCountry,
      },
    }));
  };
  const handleMobileCountryChange = (e) => {
    setMobileCountry(e.target.value);
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        mobileCountry: e.target.value,
      },
    }));
  };
  const handleEmailUserChange = (e) => {
    const value = e.target.value.replace(/@.*/, "");
    setEmailUser(value);
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        email: value ? value + "@gmail.com" : "",
      },
    }));
  };

  const checkEmailUnique = async (email) => {
    if (!email) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/student/check-email?email=${encodeURIComponent(email)}`);
      if (res.data.exists) {
        setEmailError("A user with this email already exists. Please enter a valid email.");
      } else {
        setEmailError("");
      }
    } catch (error) {
      console.error("Email check error:", error);
      setEmailError("Could not verify email uniqueness.");
    }
  };

  const checkAbcIdUnique = async (abcId) => {
    if (!abcId) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/student/check-abcid?abcId=${encodeURIComponent(abcId)}`);
      if (res.data.exists) {
        setAbcIdError("A user with this ABC ID already exists. Please enter a valid ABC ID.");
      } else {
        setAbcIdError("");
      }
    } catch (error) {
      console.error("ABC ID check error:", error);
      setAbcIdError("Could not verify ABC ID uniqueness.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-4 sm:p-6 lg:p-10 rounded-3xl shadow-2xl border border-gray-200 animate-fade-in">
      {/* Header */}
      <div className="mb-8 sm:mb-10 text-center">
        <div className="flex justify-center items-center gap-2 sm:gap-4 mb-2">
          <span className="inline-block w-1 sm:w-2 h-8 sm:h-10 bg-gray-800 rounded-full"></span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
            Personal Information
          </h2>
          <span className="inline-block w-1 sm:w-2 h-8 sm:h-10 bg-gray-800 rounded-full"></span>
        </div>
        <p className="text-gray-700 text-base sm:text-lg font-medium tracking-wide">
          Please complete all required fields carefully
        </p>
      </div>

      <div className="space-y-12">
        {/* Course Selection */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-xl">🎓</span> Select Course
            <span className="text-red-500 font-bold">*</span>
          </label>
          <select
            name="course"
            value={formData.personal.course || ""}
            onChange={handleChange}
            className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
              incompleteFields.includes("course")
                ? "border-red-500"
                : "border-gray-400"
            }`}
            required
          >
            <option value="" className="text-gray-300">
              -- Select Your Course --
            </option>
            {courses.map((course, index) => (
              <option key={index} value={course} className="text-gray-900">
                {course}
              </option>
            ))}
          </select>
          {incompleteFields.includes("course") && (
            <div className="text-xs text-red-500 mt-1">Course is required</div>
          )}
        </div>

        {/* Personal Details Section */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6 pb-3 border-b-2 border-gray-200/40">
            <div className="bg-gray-200/50 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800/90">
              Personal Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Name Fields */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                First Name<span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                placeholder="First Name"
                value={formData.personal.firstName || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("firstName")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                required
              />
              {incompleteFields.includes("firstName") && (
                <div className="text-xs text-red-500 mt-1">
                  First name is required
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Middle Name
              </label>
              <input
                name="middleName"
                placeholder="Middle Name"
                value={formData.personal.middleName || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("middleName")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              />
              {incompleteFields.includes("middleName") && (
                <div className="text-xs text-red-500 mt-1">
                  Middle name is required
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Last Name<span className="text-red-500">*</span>
              </label>
              <input
                name="lastName"
                placeholder="Last Name"
                value={formData.personal.lastName || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("lastName")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                required
              />
              {incompleteFields.includes("lastName") && (
                <div className="text-xs text-red-500 mt-1">
                  Last name is required
                </div>
              )}
            </div>

            {/* ABC ID */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                ABC ID<span className="text-red-500">*</span>
              </label>
              <input
                name="abcId"
                placeholder="ABC ID"
                value={formData.personal.abcId || ""}
                onChange={handleChange}
                onBlur={e => checkAbcIdUnique(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("abcId") || abcIdError
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                required
              />
              {(incompleteFields.includes("abcId") || abcIdError) && (
                <div className="text-xs text-red-500 mt-1">
                  {abcIdError || "ABC ID is required"}
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Date of Birth<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.personal.dob || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("dob")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                required
              />
              {incompleteFields.includes("dob") && (
                <div className="text-xs text-red-500 mt-1">
                  Date of birth is required
                </div>
              )}
            </div>

            {/* Place of Birth */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Place of Birth
              </label>
              <input
                name="placeOfBirth"
                placeholder="City, Country"
                value={formData.personal.placeOfBirth || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("placeOfBirth")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              />
              {incompleteFields.includes("placeOfBirth") && (
                <div className="text-xs text-red-500 mt-1">
                  Place of birth is required
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6 pb-3 border-b-2 border-gray-200/40">
            <div className="bg-gray-200/50 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800/90">
              Contact Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mobile Number Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Mobile Number<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <select
                  value={mobileCountry}
                  onChange={handleMobileCountryChange}
                  className={`w-full sm:w-auto px-2 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:ring-2 focus:ring-red-400 focus:border-red-400 ${
                    incompleteFields.includes("mobile")
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                  style={{ minWidth: 120 }}
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  name="mobile"
                  placeholder="9876543210"
                  value={formData.personal.mobile || ""}
                  onChange={handleMobileChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                    incompleteFields.includes("mobile")
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                  required
                  maxLength={15}
                  inputMode="numeric"
                />
              </div>
              {incompleteFields.includes("mobile") && (
                <div className="text-xs text-red-500 mt-1">
                  Mobile number is required
                </div>
              )}
            </div>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Email Address<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full">
                <input
                  name="emailUser"
                  placeholder="your.email"
                  value={emailUser}
                  onChange={handleEmailUserChange}
                  onBlur={e => checkEmailUnique(e.target.value + "@gmail.com")}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                    incompleteFields.includes("email") || emailError
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                  required
                />
                <span className="text-gray-700 font-semibold select-none flex items-center px-2 sm:px-0">
                  @gmail.com
                </span>
              </div>
              {(incompleteFields.includes("email") || emailError) && (
                <div className="text-xs text-red-500 mt-1">
                  {emailError || "Email is required"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exam Information Section */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6 pb-3 border-b-2 border-gray-200/40">
            <div className="bg-gray-200/50 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800/90">
              Exam Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Exam Roll Number<span className="text-red-500">*</span>
              </label>
              <input
                name="examRoll"
                placeholder="Roll Number"
                value={formData.personal.examRoll || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("examRoll")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                required
              />
              {incompleteFields.includes("examRoll") && (
                <div className="text-xs text-red-500 mt-1">
                  Exam roll number is required
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Exam Rank<span className="text-red-500">*</span>
              </label>
              <input
                name="examRank"
                placeholder="Rank (if applicable)"
                value={formData.personal.examRank || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("examRank")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              />
              {incompleteFields.includes("examRank") && (
                <div className="text-xs text-red-500 mt-1">
                  Exam rank is required
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Demographic Information Section */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6 pb-3 border-b-2 border-gray-200/40">
            <div className="bg-gray-200/50 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800/90">
              Demographic Information
            </h3>
          </div>

          {/* Gender Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              Gender<span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {["Male", "Female", "Other"].map((gender) => (
                <label
                  key={gender}
                  className="inline-flex items-center cursor-pointer"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={formData.personal.gender === gender}
                      onChange={handleChange}
                      className="sr-only peer"
                      required
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-gray-500 flex items-center justify-center transition-all duration-300">
                      <div
                        className={`w-3 h-3 rounded-full bg-gray-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                          formData.personal.gender === gender ? "scale-100" : ""
                        }`}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-3 text-gray-800/90">{gender}</span>
                </label>
              ))}
            </div>
            {incompleteFields.includes("gender") && (
              <div className="text-xs text-red-500 mt-1">
                Gender is required
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              Category<span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["SC", "ST", "OBC", "GEN", "PwD", "EWS"].map((cat) => (
                <label
                  key={cat}
                  className="inline-flex items-center cursor-pointer"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={formData.personal.category === cat}
                      onChange={handleChange}
                      className="sr-only peer"
                      required
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-gray-500 flex items-center justify-center transition-all duration-300">
                      <div
                        className={`w-3 h-3 rounded-full bg-gray-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                          formData.personal.category === cat ? "scale-100" : ""
                        }`}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-3 text-gray-800/90">{cat}</span>
                </label>
              ))}
            </div>
            {incompleteFields.includes("category") && (
              <div className="text-xs text-red-500 mt-1">
                Category is required
              </div>
            )}
          </div>

          {/* Sub Category Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              Sub Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Kashmiri Migrant", "Defence", "J&K (PMSSS)", "None"].map(
                (subcat) => (
                  <label
                    key={subcat}
                    className="inline-flex items-center cursor-pointer"
                  >
                    <div className="relative">
                      <input
                        type="radio"
                        name="subCategory"
                        value={subcat}
                        checked={formData.personal.subCategory === subcat}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-gray-500 flex items-center justify-center transition-all duration-300">
                        <div
                          className={`w-3 h-3 rounded-full bg-gray-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                            formData.personal.subCategory === subcat
                              ? "scale-100"
                              : ""
                          }`}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-3 text-gray-800/90">{subcat}</span>
                  </label>
                )
              )}
            </div>
            {incompleteFields.includes("subCategory") && (
              <div className="text-xs text-red-500 mt-1">
                Sub category is required
              </div>
            )}
          </div>

          {/* Region Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              Region<span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {["Delhi", "Outside Delhi"].map((region) => (
                <label
                  key={region}
                  className="inline-flex items-center cursor-pointer"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="region"
                      value={region}
                      checked={formData.personal.region === region}
                      onChange={handleChange}
                      className="sr-only peer"
                      required
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-gray-500 flex items-center justify-center transition-all duration-300">
                      <div
                        className={`w-3 h-3 rounded-full bg-gray-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                          formData.personal.region === region ? "scale-100" : ""
                        }`}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-3 text-gray-800/90">{region}</span>
                </label>
              ))}
            </div>
            {incompleteFields.includes("region") && (
              <div className="text-xs text-red-500 mt-1">
                Region is required
              </div>
            )}
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6 pb-3 border-b-2 border-gray-200/40">
            <div className="bg-gray-200/50 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800/90">
              Address Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Current Address<span className="text-red-500">*</span>
              </label>
              <textarea
                name="currentAddress"
                placeholder="Your current residential address"
                value={formData.personal.currentAddress || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("currentAddress")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                rows={4}
                required
              />
              {incompleteFields.includes("currentAddress") && (
                <div className="text-xs text-red-500 mt-1">
                  Current address is required
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Permanent Address<span className="text-red-500">*</span>
              </label>
              <textarea
                name="permanentAddress"
                placeholder="Your permanent residential address"
                value={formData.personal.permanentAddress || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("permanentAddress")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                rows={4}
                required
              />
              {incompleteFields.includes("permanentAddress") && (
                <div className="text-xs text-red-500 mt-1">
                  Permanent address is required
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6 pb-3 border-b-2 border-gray-200/40">
            <div className="bg-gray-200/50 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800/90">
              Additional Information
            </h3>
          </div>

          <div className="mb-8 relative">
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              Fee Reimbursement<span className="text-red-500">*</span>
              <div className="group inline-block relative ml-2 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-500 inline-block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>What is Fee Reimbursement?</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z"
                  />
                </svg>
                <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-300 rounded-md shadow-md text-sm p-2 w-64 top-6 left-1/2 transform -translate-x-1/2 text-gray-700">
                  Indicates whether your tuition fee is fully or partially
                  reimbursed by the government or any authority (usually based
                  on income or category).
                </div>
              </div>
            </label>

            <div className="flex flex-wrap gap-4">
              {["Yes", "No"].map((option) => (
                <label
                  key={option}
                  className="inline-flex items-center cursor-pointer"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="feeReimbursement"
                      value={option}
                      checked={formData.personal.feeReimbursement === option}
                      onChange={handleChange}
                      className="sr-only peer"
                      required
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-gray-500 flex items-center justify-center transition-all duration-300">
                      <div
                        className={`w-3 h-3 rounded-full bg-gray-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                          formData.personal.feeReimbursement === option
                            ? "scale-100"
                            : ""
                        }`}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-3 text-gray-800/90">{option}</span>
                </label>
              ))}
            </div>
            {incompleteFields.includes("feeReimbursement") && (
              <div className="text-xs text-red-500 mt-1">
                Fee reimbursement is required
              </div>
            )}
          </div>

          {/* Anti-Ragging Reference */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Anti Ragging Reference Number
              <span className="text-red-500">*</span>
            </label>
            <input
              name="antiRaggingRef"
              placeholder="Enter your reference number"
              value={formData.personal.antiRaggingRef || ""}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                incompleteFields.includes("antiRaggingRef")
                  ? "border-red-500"
                  : "border-gray-400"
              }`}
              required
            />
            {incompleteFields.includes("antiRaggingRef") && (
              <div className="text-xs text-red-500 mt-1">
                Anti-ragging reference number is required
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
