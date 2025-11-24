export default function DocumentsUpload({
  formData,
  setFormData,
  incompleteFields = [],
}) {
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: files[0],
      },
    }));
  };

  const handleRemoveFile = (name) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: undefined,
      },
    }));
  };

  const documentFields = [
    { name: "photo", label: "Photograph", icon: "📷" },
    { name: "ipuRegistration", label: "IPU Registration Slip", icon: "📄" },
    { name: "allotmentLetter", label: "Allotment Letter", icon: "✉️" },
    { name: "examAdmitCard", label: "Exam Admit Card", icon: "📝" },
    { name: "examScoreCard", label: "Exam Score Card", icon: "🏆" },
    { name: "marksheet10", label: "Xth Marksheet", icon: "📊" },
    { name: "passing10", label: "Xth Passing Certificate", icon: "🎓" },
    { name: "marksheet12", label: "XIIth Marksheet", icon: "📈" },
    { name: "passing12", label: "XIIth Passing Certificate", icon: "🎓" },
    { name: "aadhar", label: "Aadhar Card", icon: "🆔" },
    {
      name: "characterCertificate",
      label: "Character Certificate",
      icon: "🧾",
    },
    { name: "medicalCertificate", label: "Medical Certificate", icon: "🏥" },
    {
      name: "migrationCertificate",
      label: "Migration Certificate",
      icon: "✈️",
    },
    {
      name: "categoryCertificate",
      label: "Category Certificate (if applicable)",
      icon: "🏷️",
    },
    {
      name: "specialCategoryCertificate",
      label: "Special Category Certificate (if applicable)",
      icon: "🏷️",
    },
    { name: "academicFeeReceipt", label: "Academic Fee Receipt", icon: "💰" },
    { name: "collegeFeeReceipt", label: "College Fee Receipt", icon: "💵" },
    { name: "parentSignature", label: "Parent's Signature", icon: "✍️" },
  ];

  const requiredDocs = [
    "photo",
    "ipuRegistration",
    "allotmentLetter",
    "examAdmitCard",
    "examScoreCard",
    "marksheet10",
    "passing10",
    "marksheet12",
    "passing12",
    "aadhar",
    "characterCertificate",
    "medicalCertificate",
    "migrationCertificate",
    "academicFeeReceipt",
    "collegeFeeReceipt",
    "parentSignature",
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 lg:p-10 rounded-3xl shadow-2xl border border-gray-200 animate-fade-in">
      <div className="text-center mb-8 sm:mb-10">
        <div className="flex justify-center items-center mb-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Documents Upload
          </h2>
        </div>
        <p className="text-gray-700 text-base sm:text-lg font-medium tracking-wide">
          Please upload scanned copies of your documents
        </p>
      </div>

      <div className="bg-gray-50 p-2 sm:p-4 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
        <div className="mt-2 mb-4 p-2 sm:p-4 bg-gray-100 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center">
            {/* <svg
              className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg> */}
            <div className="flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-700">
                Important Notes:
              </p>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-gray-600 mt-1 space-y-1 break-words">
                <li>Maximum file size: 2MB per document</li>
                <li>
                  Name files clearly (e.g., "10th_Marksheet_YourName.jpg")
                </li>
                <li>Ensure documents are clear and legible</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {documentFields.map(({ name, label, icon }) => (
            <div key={name} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 flex items-center">
                <span className="mr-2 text-lg">{icon}</span>
                {label}
                {requiredDocs.includes(name) && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="file"
                  name={name}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                  className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${
                    incompleteFields.includes(name) ? "border-red-500" : ""
                  }`}
                  id={`file-upload-${name}`}
                />
                <label
                  htmlFor={`file-upload-${name}`}
                  className={`block w-full px-4 py-3 border-2 border-dashed rounded-xl transition-colors duration-300 cursor-pointer bg-white text-gray-900 font-semibold ${
                    incompleteFields.includes(name)
                      ? "border-red-500 hover:border-red-500"
                      : "border-gray-400 hover:border-gray-500"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <svg
                      className="w-8 h-8 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm text-gray-600 font-medium">
                      {formData.documents[name] ? (
                        <span className="text-green-600">
                          {formData.documents[name].name}
                        </span>
                      ) : (
                        "Click to upload"
                      )}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      JPEG, JPG, or PNG
                    </span>
                  </div>
                </label>
                {incompleteFields.includes(name) && (
                  <div className="text-xs text-red-500 mt-1">
                    This document is required
                  </div>
                )}
              </div>
              {/* Move preview/cancel area here, outside the label */}
              {formData.documents[name] && (
                <div className="mt-2 flex flex-col items-center">
                  <a
                    href={URL.createObjectURL(formData.documents[name])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-2 text-center cursor-pointer py-1 px-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
                  >
                    View Document
                  </a>
                  <button
                    type="button"
                    className="mt-2 px-2 py-1 text-xs cursor-pointer rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                    onClick={() => handleRemoveFile(name)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
