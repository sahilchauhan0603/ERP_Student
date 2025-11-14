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

  const emailDomains = [
    "@gmail.com",
    "@yahoo.com",
    "@outlook.com",
    "@hotmail.com",
    "@protonmail.com",
    "@rediffmail.com",
    "@icloud.com",
    "@zoho.com",
  ];
  const [mobileCountry, setMobileCountry] = useState(
    formData.personal.mobileCountry || "+91"
  );
  const [emailDomain, setEmailDomain] = useState(
    formData.personal.email && emailDomains.some(d => formData.personal.email.endsWith(d))
      ? emailDomains.find(d => formData.personal.email.endsWith(d))
      : emailDomains[0]
  );
  const [emailUser, setEmailUser] = useState(
    formData.personal.email
      ? formData.personal.email.replace(/@.*/, "")
      : ""
  );
  const [emailError, setEmailError] = useState("");
  const [abcIdError, setAbcIdError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [dobError, setDobError] = useState("");
  const [nameError, setNameError] = useState("");
  const [examRollError, setExamRollError] = useState("");
  const [examRankError, setExamRankError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [antiRaggingError, setAntiRaggingError] = useState("");
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);

  // Place of Birth Dropdown Data
  const countries = [
    "India", "United States", "United Kingdom", "Australia", "Canada", "Germany", "France", "China", "Japan", "Singapore", "UAE", "South Africa", "Brazil", "Russia", "New Zealand", "Nepal", "Bangladesh", "Sri Lanka", "Pakistan", "Other"
  ];
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    // Union Territories
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];
  const usStates = ["California", "Texas", "New York", "Florida", "Illinois", "Other"];
  const ukRegions = ["England", "Scotland", "Wales", "Northern Ireland", "Other"];
  const ausStates = ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory", "Other"];
  const [birthCountry, setBirthCountry] = useState(formData.personal.placeOfBirth?.split(", ").pop() || "India");
  const [birthState, setBirthState] = useState(formData.personal.placeOfBirth?.split(", ")[0] || "");
  const [birthOtherCity, setBirthOtherCity] = useState("");

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

  // Validation functions
  const validateName = (name, value) => {
    if (!value) return "";
    // Only letters, spaces, and common name characters (hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-']+$/.test(value)) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return "";
  };

  const validateNumber = (name, value) => {
    if (!value) return "";
    if (!/^\d+$/.test(value)) {
      return `${name} must contain only numbers`;
    }
    return "";
  };

  const validateAddress = (name, value) => {
    if (!value) return "";
    // Alphanumeric with spaces, commas, periods, hyphens, and common address characters
    if (!/^[a-zA-Z0-9\s,.\-/#()]+$/.test(value)) {
      return `${name} can only contain letters, numbers, spaces, and common address characters (comma, period, hyphen, slash, hash, parentheses)`;
    }
    return "";
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
    // Validation: must be exactly 10 digits for India
    if (mobileCountry === "+91" && value.length !== 10) {
      setMobileError("Mobile number must be exactly 10 digits");
    } else if (!/^\d{10,15}$/.test(value)) {
      setMobileError("Mobile number must be numeric and 10-15 digits");
    } else {
      setMobileError("");
    }
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
        email: value ? value + emailDomain : "",
      },
    }));
  };
  const handleEmailDomainChange = (e) => {
    const domain = e.target.value;
    setEmailDomain(domain);
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        email: emailUser ? emailUser + domain : "",
      },
    }));
  };

  const handleAbcIdChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        abcId: value,
      },
    }));
    // Validation: must be exactly 12 digits
    if (!/^\d{12}$/.test(value)) {
      setAbcIdError("ABC ID must be a 12-digit number");
    } else {
      setAbcIdError("");
    }
  };

  const handleDobChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        dob: value,
      },
    }));
    // Validation: must be a valid date, not in future, reasonable age
    const dobDate = new Date(value);
    const now = new Date();
    if (isNaN(dobDate.getTime())) {
      setDobError("Invalid date of birth");
    } else if (dobDate > now) {
      setDobError("Date of birth cannot be in the future");
    } else {
      // Check age >= 15
      const age = now.getFullYear() - dobDate.getFullYear();
      if (age < 15) {
        setDobError("You must be at least 15 years old");
      } else {
        setDobError("");
      }
    }
  };

  // Name validation handlers
  const handleNameChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [name]: value,
      },
    }));
    const error = validateName(name, value);
    setNameError(error);
  };

  // Exam roll number validation
  const handleExamRollChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        examRoll: value,
      },
    }));
    const error = validateNumber("Exam Roll Number", value);
    setExamRollError(error);
  };

  // Exam rank validation
  const handleExamRankChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        examRank: value,
      },
    }));
    const error = validateNumber("Exam Rank", value);
    setExamRankError(error);
  };

  // Address validation handlers
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        personal: {
          ...prev.personal,
          [name]: value,
        },
      };
      
      // If updating current address and checkbox is checked, also update permanent address
      if (name === "currentAddress" && sameAsCurrentAddress) {
        updatedData.personal.permanentAddress = value;
      }
      
      return updatedData;
    });
    
    const error = validateAddress(name, value);
    setAddressError(error);
  };

  // Handle same as current address checkbox
  const handleSameAddressChange = (e) => {
    const isChecked = e.target.checked;
    setSameAsCurrentAddress(isChecked);
    
    if (isChecked) {
      // Copy current address to permanent address
      setFormData((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          permanentAddress: prev.personal.currentAddress || "",
        },
      }));
    }
    // Note: When unchecked, we keep the current value in permanentAddress
    // so users don't lose their data if they accidentally uncheck
  };

  // Anti-ragging reference number validation
  const handleAntiRaggingChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        antiRaggingRef: value,
      },
    }));
    const error = validateNumber("Anti Ragging Reference Number", value);
    setAntiRaggingError(error);
  };

  const handleBirthCountryChange = (e) => {
    const country = e.target.value;
    setBirthCountry(country);
    setBirthState("");
    setBirthOtherCity("");
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        placeOfBirth: country,
      },
    }));
  };
  const handleBirthStateChange = (e) => {
    const state = e.target.value;
    setBirthState(state);
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        placeOfBirth: `${state}, ${birthCountry}`,
      },
    }));
  };
  const handleBirthOtherCityChange = (e) => {
    const city = e.target.value;
    setBirthOtherCity(city);
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        placeOfBirth: city ? `${city}, ${birthCountry}` : birthCountry,
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
      // Email check error
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
      // ABC ID check error
      setAbcIdError("Could not verify ABC ID uniqueness.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-4 sm:p-6 lg:p-10 rounded-2xl shadow-xl border border-gray-300 animate-fade-in">
      {/* Header */}
      <div className="mb-8 sm:mb-10 text-center">
        <div className="flex justify-center items-center mb-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black tracking-tight">
            Personal Information
          </h2>
        </div>
        <div className="w-20 h-1 bg-black mx-auto rounded-full mb-4"></div>
        <p className="text-gray-700 text-base sm:text-lg font-medium">
          Please complete all required fields carefully and accurately
        </p>
      </div>

      <div className="space-y-12">
        {/* Course Selection */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-300 transition-all duration-300 hover:shadow-lg animate-slide-in">
          <label className="flex items-center gap-2 text-base font-semibold text-black mb-4">
            <span className="text-xl">🎓</span>Select Course
            <span className="text-red-500 font-bold">*</span>
          </label>
          <select
            name="course"
            value={formData.personal.course || ""}
            onChange={handleChange}
            className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 transition-all duration-300 bg-white text-gray-900 shadow-sm font-medium ${
              incompleteFields.includes("course")
                ? "border-red-500 focus:border-red-500 focus:ring-red-300"
                : "border-gray-400 focus:border-gray-400 focus:ring-gray-400 hover:border-gray-400"
            }`}
            required
          >
            <option value="" className="text-gray-400">
              -- Select Your Course --
            </option>
            {courses.map((course, index) => (
              <option key={index} value={course} className="text-gray-900">
                {course}
              </option>
            ))}
          </select>
          {incompleteFields.includes("course") && (
            <div className="text-xs text-red-500 mt-2 flex items-center">
              {/* <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg> */}
              Course selection is required
            </div>
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
              <label className="block text-sm font-semibold text-black">
                First Name<span className="text-red-500 font-bold">*</span>
              </label>
              <input
                name="firstName"
                placeholder="Enter your first name"
                value={formData.personal.firstName || ""}
                onChange={handleNameChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("firstName") || nameError
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                required
              />
              {(incompleteFields.includes("firstName") || nameError) && (
                <div className="text-xs text-red-500 mt-1">
                  {nameError || "First name is required"}
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
                onChange={handleNameChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("middleName") || nameError
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              />
              {(incompleteFields.includes("middleName") || nameError) && (
                <div className="text-xs text-red-500 mt-1">
                  {nameError || "Middle name is required"}
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
                onChange={handleNameChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("lastName") || nameError
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                required
              />
              {(incompleteFields.includes("lastName") || nameError) && (
                <div className="text-xs text-red-500 mt-1">
                  {nameError || "Last name is required"}
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
                onChange={handleAbcIdChange}
                onBlur={e => checkAbcIdUnique(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("abcId") || abcIdError
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                required
                maxLength={12}
                inputMode="numeric"
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
                onChange={handleDobChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("dob") || dobError
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                required
              />
              {(incompleteFields.includes("dob") || dobError) && (
                <div className="text-xs text-red-500 mt-1">
                  {dobError || "Date of birth is required"}
                </div>
              )}
            </div>

            {/* Place of Birth */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Place of Birth<span className="text-red-500 font-bold">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={birthCountry}
                  onChange={handleBirthCountryChange}
                  className={`w-full sm:w-auto px-2 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:ring-2 focus:ring-red-400 focus:border-red-400 ${
                    incompleteFields.includes("placeOfBirth")
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                  style={{ minWidth: 120 }}
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {birthCountry === "India" && (
                  <select
                    value={birthState}
                    onChange={handleBirthStateChange}
                    className={`w-full sm:w-auto px-2 py-3 border-2 rounded-xl bg-white text-gray-900 font-semibold focus:ring-2 focus:ring-red-400 focus:border-red-400 ${
                    incompleteFields.includes("placeOfBirth")
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                  style={{ minWidth: 120 }}
                  >
                    <option value="">-- State --</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                      ))}
                  </select>
                )}
                {birthCountry === "United States" && (
                  <select
                    value={birthState}
                    onChange={handleBirthStateChange}
                    className="w-full sm:w-1/2 px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 font-semibold"
                    required
                  >
                    <option value="">-- State --</option>
                    {usStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                )}
                {birthCountry === "United Kingdom" && (
                  <select
                    value={birthState}
                    onChange={handleBirthStateChange}
                    className="w-full sm:w-1/2 px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 font-semibold"
                    required
                  >
                    <option value="">-- Region --</option>
                    {ukRegions.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                )}
                {birthCountry === "Australia" && (
                  <select
                    value={birthState}
                    onChange={handleBirthStateChange}
                    className="w-full sm:w-1/2 px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 font-semibold"
                    required
                  >
                    <option value="">-- State --</option>
                    {ausStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                )}
                {birthCountry !== "India" && birthCountry !== "United States" && birthCountry !== "United Kingdom" && birthCountry !== "Australia" && (
                  <input
                    type="text"
                    value={birthOtherCity}
                    onChange={handleBirthOtherCityChange}
                    placeholder="City/State"
                    className="w-full sm:w-1/2 px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 font-semibold"
                    required
                  />
                )}
              </div>
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
                    incompleteFields.includes("mobile") || mobileError
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                  required
                  maxLength={15}
                  inputMode="numeric"
                />
              </div>
              {(incompleteFields.includes("mobile") || mobileError) && (
                <div className="text-xs text-red-500 mt-1">
                  {mobileError || "Mobile number is required"}
                </div>
              )}
            </div>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Email Address<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full min-w-0">
                <input
                  name="emailUser"
                  placeholder="your.email"
                  value={emailUser}
                  onChange={handleEmailUserChange}
                  onBlur={e => checkEmailUnique(e.target.value + emailDomain)}
                  className={`flex-1 sm:max-w-md px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold text-base sm:text-base ${
                    incompleteFields.includes("email") || emailError
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                  required
                  style={{ minWidth: 0 }}
                />
                <select
                  value={emailDomain}
                  onChange={handleEmailDomainChange}
                  className={`flex-1 sm:max-w-md px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold text-base sm:text-base ${
                    incompleteFields.includes("email") || emailError
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                  required
                  style={{ minWidth: 0 }}
                >
                  {emailDomains.map((domain) => (
                    <option key={domain} value={domain} className="truncate text-ellipsis">
                      {domain}
                    </option>
                  ))}
                </select>
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
                onChange={handleExamRollChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("examRoll") || examRollError
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                required
                inputMode="numeric"
              />
              {(incompleteFields.includes("examRoll") || examRollError) && (
                <div className="text-xs text-red-500 mt-1">
                  {examRollError || "Exam roll number is required"}
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
                onChange={handleExamRankChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("examRank") || examRankError
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                inputMode="numeric"
              />
              {(incompleteFields.includes("examRank") || examRankError) && (
                <div className="text-xs text-red-500 mt-1">
                  {examRankError || "Exam rank is required"}
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
                onChange={handleAddressChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("currentAddress") || addressError
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                rows={4}
                required
              />
              {(incompleteFields.includes("currentAddress") || addressError) && (
                <div className="text-xs text-red-500 mt-1">
                  {addressError || "Current address is required"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Permanent Address<span className="text-red-500">*</span>
                </label>
                {/* Same as Current Address Checkbox */}
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sameAsCurrentAddress}
                    onChange={handleSameAddressChange}
                    className="h-4 w-4 text-black focus:ring-2 focus:ring-gray-300 border-2 border-gray-400 rounded transition-all duration-200 hover:border-gray-500"
                  />
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span className="text-xs font-medium text-gray-700 select-none group-hover:text-gray-900 transition-colors duration-200">
                      Same as current address
                    </span>
                  </div>
                </label>
              </div>
              <textarea
                name="permanentAddress"
                placeholder={sameAsCurrentAddress ? "Same as current address" : "Your permanent residential address"}
                value={formData.personal.permanentAddress || ""}
                onChange={handleAddressChange}
                disabled={sameAsCurrentAddress}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 shadow-inner font-semibold ${
                  sameAsCurrentAddress 
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300" 
                    : "bg-white text-gray-900 placeholder-gray-300"
                } ${
                  incompleteFields.includes("permanentAddress") || addressError
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
                rows={4}
                required
              />
              {(incompleteFields.includes("permanentAddress") || addressError) && (
                <div className="text-xs text-red-500 mt-1">
                  {addressError || "Permanent address is required"}
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
              onChange={handleAntiRaggingChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                incompleteFields.includes("antiRaggingRef") || antiRaggingError
                  ? "border-red-500"
                  : "border-gray-400"
              }`}
              required
              inputMode="numeric"
            />
            {(incompleteFields.includes("antiRaggingRef") || antiRaggingError) && (
              <div className="text-xs text-red-500 mt-1">
                {antiRaggingError || "Anti-ragging reference number is required"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
