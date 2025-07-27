import React, { useState } from "react";

const ParentDetails = ({ formData, setFormData, incompleteFields = [] }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const path = name.split(".");

    setFormData((prev) => {
      // Handle nested objects (parents.father.name, etc.)
      if (path.length === 3) {
        return {
          ...prev,
          [path[0]]: {
            ...prev[path[0]],
            [path[1]]: {
              ...prev[path[0]][path[1]],
              [path[2]]: value,
            },
          },
        };
      }
      // Handle top-level fields (parents.familyIncome)
      if (path.length === 2) {
        return {
          ...prev,
          [path[0]]: {
            ...prev[path[0]],
            [path[1]]: value,
          },
        };
      }
      return prev;
    });
  };

  const countryCodes = [
    { code: "+91", label: "India (+91)" },
    { code: "+1", label: "USA (+1)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+61", label: "Australia (+61)" },
    { code: "+971", label: "UAE (+971)" },
    // Add more as needed
  ];

  const [fatherMobileCountry, setFatherMobileCountry] = useState(
    formData.parents.father.mobileCountry || "+91"
  );
  const [fatherEmailUser, setFatherEmailUser] = useState(
    formData.parents.father.email
      ? formData.parents.father.email.replace(/@gmail\.com$/, "")
      : ""
  );
  const [motherMobileCountry, setMotherMobileCountry] = useState(
    formData.parents.mother.mobileCountry || "+91"
  );
  const [motherEmailUser, setMotherEmailUser] = useState(
    formData.parents.mother.email
      ? formData.parents.mother.email.replace(/@gmail\.com$/, "")
      : ""
  );

  const handleFatherMobileChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      parents: {
        ...prev.parents,
        father: {
          ...prev.parents.father,
          mobile: value,
          mobileCountry: fatherMobileCountry,
        },
      },
    }));
  };
  const handleFatherMobileCountryChange = (e) => {
    setFatherMobileCountry(e.target.value);
    setFormData((prev) => ({
      ...prev,
      parents: {
        ...prev.parents,
        father: {
          ...prev.parents.father,
          mobileCountry: e.target.value,
        },
      },
    }));
  };
  const handleFatherEmailUserChange = (e) => {
    const value = e.target.value.replace(/@.*/, "");
    setFatherEmailUser(value);
    setFormData((prev) => ({
      ...prev,
      parents: {
        ...prev.parents,
        father: {
          ...prev.parents.father,
          email: value ? value + "@gmail.com" : "",
        },
      },
    }));
  };
  const handleMotherMobileChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      parents: {
        ...prev.parents,
        mother: {
          ...prev.parents.mother,
          mobile: value,
          mobileCountry: motherMobileCountry,
        },
      },
    }));
  };
  const handleMotherMobileCountryChange = (e) => {
    setMotherMobileCountry(e.target.value);
    setFormData((prev) => ({
      ...prev,
      parents: {
        ...prev.parents,
        mother: {
          ...prev.parents.mother,
          mobileCountry: e.target.value,
        },
      },
    }));
  };
  const handleMotherEmailUserChange = (e) => {
    const value = e.target.value.replace(/@.*/, "");
    setMotherEmailUser(value);
    setFormData((prev) => ({
      ...prev,
      parents: {
        ...prev.parents,
        mother: {
          ...prev.parents.mother,
          email: value ? value + "@gmail.com" : "",
        },
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border border-gray-200 animate-fade-in">
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-4 mb-2">
          <span className="inline-block w-2 h-10 bg-gray-800 rounded-full"></span>
          <h2 className="text-3xl font-extrabold text-black">Parent Details</h2>
          <span className="inline-block w-2 h-10 bg-gray-800 rounded-full"></span>
        </div>
        <p className="text-gray-700 text-lg font-medium tracking-wide">
          Please provide your parents' information
        </p>
      </div>

      <div className="space-y-12">
        {/* Father Section */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6 pb-3 border-b border-gray-200">
            <div className="bg-gray-100/50 p-2 rounded-lg mr-3">
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
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800/90">
              Father's Details
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Father's Name<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.father.name"
                placeholder="Enter Father's Name"
                value={formData.parents.father.name || ""}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("father.name")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              />
              {incompleteFields.includes("father.name") && (
                <div className="text-xs text-red-500 mt-1">
                  Father's name is required
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Highest Qualification<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.father.qualification"
                placeholder="Enter Father's Qualification"
                value={formData.parents.father.qualification || ""}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("father.qualification")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              />
              {incompleteFields.includes("father.qualification") && (
                <div className="text-xs text-red-500 mt-1">
                  Father's qualification is required
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Occupation<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.father.occupation"
                placeholder="Enter Father's Occupation"
                value={formData.parents.father.occupation || ""}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("father.occupation")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              />
              {incompleteFields.includes("father.occupation") && (
                <div className="text-xs text-red-500 mt-1">
                  Father's occupation is required
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Email Address<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full">
                <input
                  name="parents.father.emailUser"
                  placeholder="father.email"
                  value={fatherEmailUser}
                  onChange={handleFatherEmailUserChange}
                  required
                  className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                    incompleteFields.includes("father.email")
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                />
                <span className="text-gray-700 font-semibold select-none flex items-center px-2 sm:px-0">
                  @gmail.com
                </span>
              </div>
              {incompleteFields.includes("father.email") && (
                <div className="text-xs text-red-500 mt-1">
                  Father's email is required
                </div>
              )}
            </div>
            {/* Father Mobile and Email */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Mobile Number<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <select
                  value={fatherMobileCountry}
                  onChange={handleFatherMobileCountryChange}
                  className="w-full sm:w-auto px-2 py-2 border-2 border-gray-400 rounded-xl bg-white text-gray-900 font-semibold focus:ring-2 focus:ring-red-400 focus:border-red-400"
                  style={{ minWidth: 120 }}
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  name="parents.father.mobile"
                  placeholder="9876543210"
                  value={formData.parents.father.mobile || ""}
                  onChange={handleFatherMobileChange}
                  required
                  maxLength={15}
                  inputMode="numeric"
                  className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                    incompleteFields.includes("father.mobile")
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                />
              </div>
              {incompleteFields.includes("father.mobile") && (
                <div className="text-xs text-red-500 mt-1">
                  Father's mobile number is required
                </div>
              )}
            </div>
            {/* Father Telephone STD and Number */}
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <input
                name="parents.father.telephoneSTD"
                placeholder="Telephone STD"
                value={formData.parents.father.telephoneSTD || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold"
              />
              <input
                name="parents.father.telephone"
                placeholder="Telephone No."
                value={formData.parents.father.telephone || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Office Address
              </label>
              <textarea
                name="parents.father.officeAddress"
                value={formData.parents.father.officeAddress || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Mother Section */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6 pb-3 border-b border-gray-200">
            <div className="bg-gray-100/50 p-2 rounded-lg mr-3">
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
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800/90">
              Mother's Details
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Mother's Name<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.mother.name"
                placeholder="Enter Mother's Name"
                value={formData.parents.mother.name || ""}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("mother.name")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              />
              {incompleteFields.includes("mother.name") && (
                <div className="text-xs text-red-500 mt-1">
                  Mother's name is required
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Highest Qualification<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.mother.qualification"
                placeholder="Enter Mother's Qualification"
                value={formData.parents.mother.qualification || ""}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("mother.qualification")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              />
              {incompleteFields.includes("mother.qualification") && (
                <div className="text-xs text-red-500 mt-1">
                  Mother's qualification is required
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Occupation<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.mother.occupation"
                placeholder="Enter Mother's Occupation"
                value={formData.parents.mother.occupation || ""}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                  incompleteFields.includes("mother.occupation")
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              />
              {incompleteFields.includes("mother.occupation") && (
                <div className="text-xs text-red-500 mt-1">
                  Mother's occupation is required
                </div>
              )}
            </div>
            {/* Mother Email */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Email Address<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full">
                <input
                  name="parents.mother.emailUser"
                  placeholder="mother.email"
                  value={motherEmailUser}
                  onChange={handleMotherEmailUserChange}
                  required
                  className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                    incompleteFields.includes("mother.email")
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                />
                <span className="text-gray-700 font-semibold select-none flex items-center px-2 sm:px-0">
                  @gmail.com
                </span>
              </div>
              {incompleteFields.includes("mother.email") && (
                <div className="text-xs text-red-500 mt-1">
                  Mother's email is required
                </div>
              )}
            </div>
            {/* Mother Mobile */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Mobile Number<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <select
                  value={motherMobileCountry}
                  onChange={handleMotherMobileCountryChange}
                  className="w-full sm:w-auto px-2 py-2 border-2 border-gray-400 rounded-xl bg-white text-gray-900 font-semibold focus:ring-2 focus:ring-red-400 focus:border-red-400"
                  style={{ minWidth: 120 }}
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  name="parents.mother.mobile"
                  placeholder="9876543210"
                  value={formData.parents.mother.mobile || ""}
                  onChange={handleMotherMobileChange}
                  required
                  maxLength={15}
                  inputMode="numeric"
                  className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold ${
                    incompleteFields.includes("mother.mobile")
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                />
              </div>
              {incompleteFields.includes("mother.mobile") && (
                <div className="text-xs text-red-500 mt-1">
                  Mother's mobile number is required
                </div>
              )}
            </div>
            {/* Mother Telephone STD and Number */}
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <input
                name="parents.mother.telephoneSTD"
                placeholder="Telephone STD"
                value={formData.parents.mother.telephoneSTD || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold"
              />
              <input
                name="parents.mother.telephone"
                placeholder="Telephone No."
                value={formData.parents.mother.telephone || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Office Address
              </label>
              <textarea
                name="parents.mother.officeAddress"
                value={formData.parents.mother.officeAddress || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Family Income */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6 pb-3 border-b border-gray-200">
            <div className="bg-gray-100/50 p-2 rounded-lg mr-3">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800/90">
              Family Income<span className="text-red-500">*</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["<5", "5-7", "7-10", ">10"].map((range, idx) => (
              <label
                key={idx}
                className="inline-flex items-center cursor-pointer"
              >
                <div className="relative">
                  <input
                    type="radio"
                    name="parents.familyIncome"
                    value={range}
                    checked={formData.parents.familyIncome === range}
                    onChange={handleChange}
                    className="sr-only peer"
                    required
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-gray-500 flex items-center justify-center transition-all duration-300">
                    <div
                      className={`w-3 h-3 rounded-full bg-gray-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                        formData.parents.familyIncome === range
                          ? "scale-100"
                          : ""
                      }`}
                    ></div>
                  </div>
                </div>
                <span className="ml-3 text-gray-800/90">
                  {range === "<5" && "Less than 5 lacs"}
                  {range === "5-7" && "5 lacs to 7 lacs"}
                  {range === "7-10" && "7 lacs to 10 lacs"}
                  {range === ">10" && "More than 10 lacs"}
                </span>
              </label>
            ))}
          </div>
          {incompleteFields.includes("familyIncome") && (
            <div className="text-xs text-red-500 mt-1">
              Family income is required
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDetails;
