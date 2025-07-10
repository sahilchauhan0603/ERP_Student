import React from "react";

const ParentDetails = ({ formData, setFormData }) => {
  // Initialize parent objects if they don't exist
  if (!formData.father) {
    formData.father = {
      name: "",
      qualification: "",
      occupation: "",
      email: "",
      mobile: "",
      telephoneSTD: "",
      telephone: "",
      officeAddress: "",
    };
  }

  if (!formData.mother) {
    formData.mother = {
      name: "",
      qualification: "",
      occupation: "",
      email: "",
      mobile: "",
      telephoneSTD: "",
      telephone: "",
      officeAddress: "",
    };
  }

  if (!formData.familyIncome) {
    formData.familyIncome = "";
  }


  // Initialize parent objects if they don't exist
  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          Parent Details
        </h2>
        <p className="text-blue-600/80 text-lg">
          Please provide your parents' information
        </p>
      </div>

      <div className="space-y-8">
        {/* Father Section */}
        <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-white/20">
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
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-blue-800/90">
              Father's Details
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-700/90">
                Father's Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.father.name || ""}
                onChange={(e) => handleChange("father", "name", e.target.value)}
                required
                className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-700/90">
                Highest Qualification<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.father.qualification || ""}
                onChange={(e) =>
                  handleChange("father", "qualification", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-700/90">
                Occupation<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.father.occupation || ""}
                onChange={(e) =>
                  handleChange("father", "occupation", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-700/90">
                Email Address<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.father.email || ""}
                onChange={(e) =>
                  handleChange("father", "email", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-700/90">
                Mobile Number<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.father.mobile || ""}
                onChange={(e) =>
                  handleChange("father", "mobile", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-700/90">
                  Telephone STD
                </label>
                <input
                  type="text"
                  value={formData.father.telephoneSTD || ""}
                  onChange={(e) =>
                    handleChange("father", "telephoneSTD", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-700/90">
                  Telephone Number
                </label>
                <input
                  type="text"
                  value={formData.father.telephone || ""}
                  onChange={(e) =>
                    handleChange("father", "telephone", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-medium text-blue-700/90">
                Office Address
              </label>
              <textarea
                value={formData.father.officeAddress || ""}
                onChange={(e) =>
                  handleChange("father", "officeAddress", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Mother Section */}
        <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-white/20">
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
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-blue-800/90">
              Mother's Details
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-700/90">
                Mother's Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.mother.name || ""}
                onChange={(e) => handleChange("mother", "name", e.target.value)}
                required
                className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-700/90">
                Highest Qualification<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.mother.qualification || ""}
                onChange={(e) =>
                  handleChange("mother", "qualification", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-700/90">
                Occupation<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.mother.occupation || ""}
                onChange={(e) =>
                  handleChange("mother", "occupation", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-700/90">
                Email Address
              </label>
              <input
                type="email"
                value={formData.mother.email || ""}
                onChange={(e) =>
                  handleChange("mother", "email", e.target.value)
                }
                className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-blue-700/90">
                Mobile Number<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.mother.mobile || ""}
                onChange={(e) =>
                  handleChange("mother", "mobile", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-700/90">
                  Telephone STD
                </label>
                <input
                  type="text"
                  value={formData.mother.telephoneSTD || ""}
                  onChange={(e) =>
                    handleChange("mother", "telephoneSTD", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-700/90">
                  Telephone Number
                </label>
                <input
                  type="text"
                  value={formData.mother.telephone || ""}
                  onChange={(e) =>
                    handleChange("mother", "telephone", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-medium text-blue-700/90">
                Office Address
              </label>
              <textarea
                value={formData.mother.officeAddress || ""}
                onChange={(e) =>
                  handleChange("mother", "officeAddress", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border border-blue-200/70 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/50 text-blue-900 placeholder-blue-300 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Family Income */}
        <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-white/20">
          <div className="flex items-center mb-4">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-blue-800/90">
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
                    name="income"
                    value={range}
                    checked={formData.familyIncome === range}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        familyIncome: e.target.value,
                      }))
                    }
                    className="sr-only peer"
                    required
                  />
                  <div className="w-5 h-5 border-2 border-blue-300 rounded-full peer-checked:border-blue-500 flex items-center justify-center transition-all duration-300">
                    <div
                      className={`w-3 h-3 rounded-full bg-blue-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                        formData.familyIncome === range ? "scale-100" : ""
                      }`}
                    ></div>
                  </div>
                </div>
                <span className="ml-3 text-blue-800/90">
                  {range === "<5" && "Less than 5 lacs"}
                  {range === "5-7" && "5 lacs to 7 lacs"}
                  {range === "7-10" && "7 lacs to 10 lacs"}
                  {range === ">10" && "More than 10 lacs"}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDetails;
