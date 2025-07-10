export default function DocumentsUpload({ formData, setFormData }) {
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: files[0]
      }
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
    { name: "characterCertificate", label: "Character Certificate", icon: "🧾" },
    { name: "medicalCertificate", label: "Medical Certificate", icon: "🏥" },
    { name: "migrationCertificate", label: "Migration Certificate", icon: "✈️" },
    { name: "categoryCertificate", label: "Category Certificate (if applicable)", icon: "🏷️" },
    { name: "specialCategoryCertificate", label: "Special Category Certificate (if applicable)", icon: "🏷️" },
    { name: "academicFeeReceipt", label: "Academic Fee Receipt", icon: "💰" },
    { name: "collegeFeeReceipt", label: "College Fee Receipt", icon: "💵" },
    { name: "parentSignature", label: "Parent's Signature", icon: "✍️" }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          Documents Upload
        </h2>
        <p className="text-blue-600/80 text-lg">
          Please upload scanned copies of your documents
        </p>
      </div>

      <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-white/20">
        
        <div className="mt-2 mb-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
          <div className="flex">
            <svg
              className="h-5 w-5 text-blue-500 mr-2 mt-0.5"
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
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-700">
                Important Notes:
              </p>
              <ul className="list-disc pl-5 text-sm text-blue-600/90 mt-1 space-y-1">
                <li>Maximum file size: 2MB per document</li>
                <li>Name files clearly (e.g., "10th_Marksheet_YourName.pdf")</li>
                <li>Ensure documents are clear and legible</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentFields.map(({ name, label, icon }) => (
            <div key={name} className="space-y-2">
              <label className="block text-sm font-medium text-blue-700/90 flex items-center">
                <span className="mr-2 text-lg">{icon}</span>
                {label}
              </label>
              <div className="relative">
                <input
                  type="file"
                  name={name}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id={`file-upload-${name}`}
                />
                <label
                  htmlFor={`file-upload-${name}`}
                  className="block w-full px-4 py-3 border-2 border-dashed border-blue-200 rounded-xl hover:border-blue-300 transition-colors duration-300 cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <svg
                      className="w-8 h-8 text-blue-400 mb-2"
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
                    <span className="text-sm text-blue-600 font-medium">
                      {formData.documents[name] ? (
                        <span className="text-green-600">{formData.documents[name].name}</span>
                      ) : (
                        "Click to upload"
                      )}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG</span>
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </div>
  );
}