import React from "react";

export default function AcademicInfo({
  formData,
  setFormData,
  incompleteFields = [],
}) {
  const handleChange = (e, section, field, index = null) => {
    const { name, value } = e.target;

    if (index !== null) {
      setFormData((prev) => ({
        ...prev,
        academic: {
          ...prev.academic,
          [section]: prev.academic[section].map((item, i) =>
            i === index ? { ...item, [name]: value } : item
          ),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        academic: {
          ...prev.academic,
          [section]: {
            ...prev.academic[section],
            [name]: value,
          },
        },
      }));
    }
  };

  const addAchievement = (section) => {
    setFormData((prev) => ({
      ...prev,
      academic: {
        ...prev.academic,
        [section]: [
          ...prev.academic[section],
          { event: "", date: "", outcome: "" },
        ],
      },
    }));
  };

  const removeAchievement = (index, section) => {
    setFormData((prev) => {
      const updated = [...prev.academic[section]];
      updated.splice(index, 1);
      return {
        ...prev,
        academic: {
          ...prev.academic,
          [section]: updated,
        },
      };
    });
  };

  const renderInput = (
    label,
    name,
    section,
    type = "text",
    required = false
  ) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData.academic[section][name] || ""}
        onChange={(e) => handleChange(e, section)}
        className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all duration-300 bg-white/50 text-gray-900 placeholder-gray-300 shadow-inner ${
          required && incompleteFields.includes(`${section}.${name}`)
            ? "border-red-500"
            : "border-gray-200"
        }`}
        required={required}
      />
      {required && incompleteFields.includes(`${section}.${name}`) && (
        <div className="text-xs text-red-500 mt-1">{label} is required</div>
      )}
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Class X */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-6 pb-3 border-b border-gray-200">
          <div className="bg-gray-100 p-2 rounded-lg mr-3">
            <svg
              className="w-6 h-6 text-gray-700"
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
          <h2 className="text-xl font-semibold text-gray-900">
            Class X Details
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderInput("Institute", "institute", "classX", "text", true)}
          {renderInput("Year", "year", "classX", "text", true)}
          {renderInput("Board", "board", "classX", "text", true)}
          {renderInput("PCM %", "pcm", "classX")}
          {renderInput("Aggregate %", "aggregate", "classX", "text", true)}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-800">
              Have you done Diploma/Polytechnic?
              <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 mt-2">
              {["Yes", "No"].map((option) => (
                <label
                  key={option}
                  className="inline-flex items-center cursor-pointer"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="isDiplomaOrPolytechnic"
                      value={option}
                      checked={
                        formData.academic.classX.isDiplomaOrPolytechnic ===
                        option
                      }
                      onChange={(e) => handleChange(e, "classX")}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-gray-500 flex items-center justify-center transition-all duration-300 ${
                        formData.academic.classX.isDiplomaOrPolytechnic ===
                        option
                          ? "scale-100"
                          : ""
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-gray-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                          formData.academic.classX.isDiplomaOrPolytechnic ===
                          option
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
          </div>
        </div>
      </div>

      {/* Class XII */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-6 pb-3 border-b border-gray-200">
          <div className="bg-gray-100 p-2 rounded-lg mr-3">
            <svg
              className="w-6 h-6 text-gray-700"
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
          <h2 className="text-xl font-semibold text-gray-900">
            Class XII Details
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderInput("Institute", "institute", "classXII", "text", true)}
          {renderInput("Year", "year", "classXII", "text", true)}
          {renderInput("Board", "board", "classXII", "text", true)}
          {renderInput("PCM %", "pcm", "classXII", "text", true)}
          {renderInput("Aggregate %", "aggregate", "classXII", "text", true)}
        </div>
      </div>

      {/* Other Qualification */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-6 pb-3 border-b border-gray-200">
          <div className="bg-gray-100 p-2 rounded-lg mr-3">
            <svg
              className="w-6 h-6 text-gray-700"
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
          <h2 className="text-xl font-semibold text-gray-900">
            Other Qualification
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderInput("Institute", "institute", "otherQualification")}
          {renderInput("Year", "year", "otherQualification")}
          {renderInput("Board", "board", "otherQualification")}
          {renderInput("PCM %", "pcm", "otherQualification")}
          {renderInput("Aggregate %", "aggregate", "otherQualification")}
        </div>
      </div>

      {/* Academic Achievements */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-6 pb-3 border-b border-gray-200">
          <div className="bg-gray-100 p-2 rounded-lg mr-3">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Academic Achievements
          </h2>
        </div>
        {formData.academic.academicAchievements.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end"
          >
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Event
              </label>
              <input
                type="text"
                name="event"
                placeholder="Event name"
                value={item.event}
                onChange={(e) =>
                  handleChange(e, "academicAchievements", "event", index)
                }
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={item.date}
                onChange={(e) =>
                  handleChange(e, "academicAchievements", "date", index)
                }
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Outcome
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="outcome"
                  placeholder="Achievement"
                  value={item.outcome}
                  onChange={(e) =>
                    handleChange(e, "academicAchievements", "outcome", index)
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold"
                />
                <button
                  type="button"
                  onClick={() =>
                    removeAchievement(index, "academicAchievements")
                  }
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addAchievement("academicAchievements")}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors duration-300 inline-flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add Academic Achievement
        </button>
      </div>

      {/* Co-Curricular Achievements */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-6 pb-3 border-b border-gray-200">
          <div className="bg-gray-100 p-2 rounded-lg mr-3">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Co-Curricular Achievements
          </h2>
        </div>
        {formData.academic.coCurricularAchievements.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end"
          >
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Event
              </label>
              <input
                type="text"
                name="event"
                placeholder="Event name"
                value={item.event}
                onChange={(e) =>
                  handleChange(e, "coCurricularAchievements", "event", index)
                }
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={item.date}
                onChange={(e) =>
                  handleChange(e, "coCurricularAchievements", "date", index)
                }
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Outcome
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="outcome"
                  placeholder="Achievement"
                  value={item.outcome}
                  onChange={(e) =>
                    handleChange(
                      e,
                      "coCurricularAchievements",
                      "outcome",
                      index
                    )
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-gray-900 placeholder-gray-300 shadow-inner font-semibold"
                />
                <button
                  type="button"
                  onClick={() =>
                    removeAchievement(index, "coCurricularAchievements")
                  }
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addAchievement("coCurricularAchievements")}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors duration-300 inline-flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add Co-Curricular Achievement
        </button>
      </div>
    </div>
  );
}
