"use client";
import React from "react";

const PersonalInfo = ({ formData, setFormData }) => {
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

  return (
    <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-8 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/20">
      {/* Header */}
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
          Personal Information
        </h2>
        <p className="text-blue-600/80 text-lg">
          Please complete all required fields carefully
        </p>
      </div>

      <div className="space-y-8">
        {/* Course Selection */}
        <div className="bg-white/90 p-6 rounded-2xl shadow-md border border-white/30">
          <label className="block text-sm font-medium text-blue-700/90 mb-3">
            <span className="text-lg">🎓</span> Select Course
            <span className="text-red-500">*</span>
          </label>
          <select
            name="course"
            value={formData.personal.course || ""}
            onChange={handleChange}
            className="w-full px-5 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
            required
          >
            <option value="" className="text-blue-300">
              -- Select Your Course --
            </option>
            {courses.map((course, index) => (
              <option key={index} value={course} className="text-blue-900">
                {course}
              </option>
            ))}
          </select>
        </div>

        {/* Personal Details Section */}
        <div className="bg-white/90 p-6 rounded-2xl shadow-md border border-white/30">
          <div className="flex items-center mb-6 pb-3 border-b border-blue-100/50">
            <div className="bg-blue-100/50 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-blue-600"
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
            <h3 className="text-xl font-semibold text-blue-800/90">
              Personal Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Name Fields */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90">
                First Name<span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                placeholder="First Name"
                value={formData.personal.firstName || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90">
                Middle Name
              </label>
              <input
                name="middleName"
                placeholder="Middle Name"
                value={formData.personal.middleName || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90">
                Last Name<span className="text-red-500">*</span>
              </label>
              <input
                name="lastName"
                placeholder="Last Name"
                value={formData.personal.lastName || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                required
              />
            </div>

            {/* ABC ID */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90">
                ABC ID<span className="text-red-500">*</span>
              </label>
              <input
                name="abcId"
                placeholder="ABC ID"
                value={formData.personal.abcId || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90">
                Date of Birth<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.personal.dob || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                required
              />
            </div>

            {/* Place of Birth */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90">
                Place of Birth
              </label>
              <input
                name="placeOfBirth"
                placeholder="City, Country"
                value={formData.personal.placeOfBirth || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white/90 p-6 rounded-2xl shadow-md border border-white/30">
          <div className="flex items-center mb-6 pb-3 border-b border-blue-100/50">
            <div className="bg-blue-100/50 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-blue-600"
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
            <h3 className="text-xl font-semibold text-blue-800/90">
              Contact Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90">
                Mobile Number<span className="text-red-500">*</span>
              </label>
              <input
                name="mobile"
                placeholder="+91 98765 43210"
                value={formData.personal.mobile || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90">
                Email Address<span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.personal.email || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                required
              />
            </div>
          </div>
        </div>

        {/* Exam Information Section */}
        <div className="bg-white/90 p-6 rounded-2xl shadow-md border border-white/30">
          <div className="flex items-center mb-6 pb-3 border-b border-blue-100/50">
            <div className="bg-blue-100/50 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-blue-600"
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
            <h3 className="text-xl font-semibold text-blue-800/90">
              Exam Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90">
                Exam Roll Number<span className="text-red-500">*</span>
              </label>
              <input
                name="examRoll"
                placeholder="Roll Number"
                value={formData.personal.examRoll || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90">
                Exam Rank
              </label>
              <input
                name="examRank"
                placeholder="Rank (if applicable)"
                value={formData.personal.examRank || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Demographic Information Section */}
        <div className="bg-white/90 p-6 rounded-2xl shadow-md border border-white/30">
          <div className="flex items-center mb-6 pb-3 border-b border-blue-100/50">
            <div className="bg-blue-100/50 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-blue-600"
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
            <h3 className="text-xl font-semibold text-blue-800/90">
              Demographic Information
            </h3>
          </div>

          {/* Gender Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-blue-700/90 mb-4">
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
                    <div className="w-5 h-5 border-2 border-blue-300 rounded-full peer-checked:border-blue-500 flex items-center justify-center transition-all duration-300">
                      <div
                        className={`w-3 h-3 rounded-full bg-blue-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                          formData.personal.gender === gender ? "scale-100" : ""
                        }`}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-3 text-blue-800/90">{gender}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-blue-700/90 mb-4">
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
                    <div className="w-5 h-5 border-2 border-blue-300 rounded-full peer-checked:border-blue-500 flex items-center justify-center transition-all duration-300">
                      <div
                        className={`w-3 h-3 rounded-full bg-blue-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                          formData.personal.category === cat ? "scale-100" : ""
                        }`}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-3 text-blue-800/90">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sub Category Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-blue-700/90 mb-4">
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
                      <div className="w-5 h-5 border-2 border-blue-300 rounded-full peer-checked:border-blue-500 flex items-center justify-center transition-all duration-300">
                        <div
                          className={`w-3 h-3 rounded-full bg-blue-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                            formData.personal.subCategory === subcat
                              ? "scale-100"
                              : ""
                          }`}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-3 text-blue-800/90">{subcat}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Region Selection */}
          <div>
            <label className="block text-sm font-medium text-blue-700/90 mb-4">
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
                    <div className="w-5 h-5 border-2 border-blue-300 rounded-full peer-checked:border-blue-500 flex items-center justify-center transition-all duration-300">
                      <div
                        className={`w-3 h-3 rounded-full bg-blue-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                          formData.personal.region === region ? "scale-100" : ""
                        }`}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-3 text-blue-800/90">{region}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white/90 p-6 rounded-2xl shadow-md border border-white/30">
          <div className="flex items-center mb-6 pb-3 border-b border-blue-100/50">
            <div className="bg-blue-100/50 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-blue-600"
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
            <h3 className="text-xl font-semibold text-blue-800/90">
              Address Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90">
                Current Address<span className="text-red-500">*</span>
              </label>
              <textarea
                name="currentAddress"
                placeholder="Your current residential address"
                value={formData.personal.currentAddress || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90">
                Permanent Address<span className="text-red-500">*</span>
              </label>
              <textarea
                name="permanentAddress"
                placeholder="Your permanent residential address"
                value={formData.personal.permanentAddress || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                rows={4}
                required
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-white/90 p-6 rounded-2xl shadow-md border border-white/30">
          <div className="flex items-center mb-6 pb-3 border-b border-blue-100/50">
            <div className="bg-blue-100/50 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-blue-600"
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
            <h3 className="text-xl font-semibold text-blue-800/90">
              Additional Information
            </h3>
          </div>

          <div className="mb-8 relative">
            <label className="block text-sm font-medium text-blue-700/90 mb-4">
              Fee Reimbursement<span className="text-red-500">*</span>
              <div className="group inline-block relative ml-2 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-500 inline-block"
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
                    <div className="w-5 h-5 border-2 border-blue-300 rounded-full peer-checked:border-blue-500 flex items-center justify-center transition-all duration-300">
                      <div
                        className={`w-3 h-3 rounded-full bg-blue-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                          formData.personal.feeReimbursement === option
                            ? "scale-100"
                            : ""
                        }`}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-3 text-blue-800/90">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Anti-Ragging Reference */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-700/90">
              Anti Ragging Reference Number
              <span className="text-red-500">*</span>
            </label>
            <input
              name="antiRaggingRef"
              placeholder="Enter your reference number"
              value={formData.personal.antiRaggingRef || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
