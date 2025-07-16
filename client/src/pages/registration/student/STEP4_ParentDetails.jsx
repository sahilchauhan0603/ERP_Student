import React from "react";

const ParentDetails = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const path = name.split('.');
    
    setFormData(prev => {
      // Handle nested objects (parents.father.name, etc.)
      if (path.length === 3) {
        return {
          ...prev,
          [path[0]]: {
            ...prev[path[0]],
            [path[1]]: {
              ...prev[path[0]][path[1]],
              [path[2]]: value
            }
          }
        };
      }
      // Handle top-level fields (parents.familyIncome)
      if (path.length === 2) {
        return {
          ...prev,
          [path[0]]: {
            ...prev[path[0]],
            [path[1]]: value
          }
        };
      }
      return prev;
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-white via-blue-50 to-red-50 p-10 rounded-3xl shadow-2xl border-2 border-blue-200/40 animate-fade-in">
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-4 mb-2">
          <span className="inline-block w-2 h-10 bg-blue-500 rounded-full"></span>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-red-500 to-blue-700 drop-shadow-lg">
            Parent Details
          </h2>
          <span className="inline-block w-2 h-10 bg-red-500 rounded-full"></span>
        </div>
        <p className="text-blue-700/90 text-lg font-medium tracking-wide">
          Please provide your parents' information
        </p>
      </div>

      <div className="space-y-12">
        {/* Father Section */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 p-6 rounded-2xl shadow-lg border-2 border-blue-200/40 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6 pb-3 border-b-2 border-blue-200/40">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">
                Father's Name<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.father.name"
                placeholder="Enter Father's Name"
                value={formData.parents.father.name || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">
                Highest Qualification<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.father.qualification"
                placeholder="Enter Father's Qualification"
                value={formData.parents.father.qualification || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">
                Occupation<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.father.occupation"
                placeholder="Enter Father's Occupation"
                value={formData.parents.father.occupation || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">
                Email Address<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.father.email"
                placeholder="Enter Father's Email"
                type="email"
                value={formData.parents.father.email || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">
                Mobile Number<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.father.mobile"
                placeholder="Enter Father's Mobile Number"
                value={formData.parents.father.mobile || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-blue-800">
                  Telephone STD
                </label>
                <input
                  name="parents.father.telephoneSTD"
                  placeholder="Enter Father's Telephone STD"
                  value={formData.parents.father.telephoneSTD || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-blue-800">
                  Telephone Number
                </label>
                <input
                  name="parents.father.telephone"
                  placeholder="Enter Father's Telephone Number"            
                  value={formData.parents.father.telephone || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-semibold text-blue-800">
                Office Address
              </label>
              <textarea
                name="parents.father.officeAddress"
                value={formData.parents.father.officeAddress || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Mother Section */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 p-6 rounded-2xl shadow-lg border-2 border-blue-200/40 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6 pb-3 border-b-2 border-blue-200/40">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">
                Mother's Name<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.mother.name"
                placeholder="Enter Mother's Name"
                value={formData.parents.mother.name || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">
                Highest Qualification<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.mother.qualification"
                placeholder="Enter Mother's Qualification"
                value={formData.parents.mother.qualification || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">
                Occupation<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.mother.occupation"
                placeholder="Enter Mother's Occupation"
                value={formData.parents.mother.occupation || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">
                Email Address
              </label>
              <input
                name="parents.mother.email"
                placeholder="Enter Mother's Email"
                type="email"
                value={formData.parents.mother.email || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-blue-800">
                Mobile Number<span className="text-red-500">*</span>
              </label>
              <input
                name="parents.mother.mobile"
                placeholder="Enter Mother's Mobile Number"
                value={formData.parents.mother.mobile || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-blue-800">
                  Telephone STD
                </label>
                <input
                  name="parents.mother.telephoneSTD"
                  placeholder="Enter Mother's Telephone STD"
                  value={formData.parents.mother.telephoneSTD || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-blue-800">
                  Telephone Number
                </label>
                <input
                  name="parents.mother.telephone"
                  placeholder="Enter Mother's Telephone Number"            
                  value={formData.parents.mother.telephone || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-semibold text-blue-800">
                Office Address
              </label>
              <textarea
                name="parents.mother.officeAddress"
                value={formData.parents.mother.officeAddress || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 bg-white text-blue-900 placeholder-blue-300 shadow-inner font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Family Income */}
        <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 p-6 rounded-2xl shadow-lg border-2 border-blue-200/40 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center mb-6 pb-3 border-b-2 border-blue-200/40">
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
            {['<5', '5-7', '7-10', '>10'].map((range, idx) => (
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
                  <div className="w-5 h-5 border-2 border-blue-300 rounded-full peer-checked:border-blue-500 flex items-center justify-center transition-all duration-300">
                    <div
                      className={`w-3 h-3 rounded-full bg-blue-500 scale-0 peer-checked:scale-100 transition-all duration-300 ${
                        formData.parents.familyIncome === range ? 'scale-100' : ''
                      }`}
                    ></div>
                  </div>
                </div>
                <span className="ml-3 text-blue-800/90">
                  {range === '<5' && 'Less than 5 lacs'}
                  {range === '5-7' && '5 lacs to 7 lacs'}
                  {range === '7-10' && '7 lacs to 10 lacs'}
                  {range === '>10' && 'More than 10 lacs'}
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