import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiX,
  FiCheck,
  FiXCircle,
  FiFileText,
  FiUser,
  FiBook,
  FiHome,
  FiDownload,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiAward,
  FiDollarSign,
  FiUsers,
  FiCalendar,
} from "react-icons/fi";

const sectionDefs = [
  { label: "Personal", key: "personal", icon: <FiUser className="mr-2" /> },
  { label: "Academic", key: "academic", icon: <FiBook className="mr-2" /> },
  { label: "Parent", key: "parent", icon: <FiHome className="mr-2" /> },
  {
    label: "Documents",
    key: "documents",
    icon: <FiFileText className="mr-2" />,
  },
];

export default function AdminStudentDetailsModal({
  student,
  onClose,
  refresh,
  tableType,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [verifications, setVerifications] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionCompleted, setSectionCompleted] = useState([
    false,
    false,
    false,
    false,
  ]);

  const declinedFields =
    student?.declinedFields || details?.declinedFields || [];

  useEffect(() => {
    if (!student?.id) return;
    setLoading(true);
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/admin/student-details/${student.id}`,
        { withCredentials: true }
      )
      .then((res) => setDetails(res.data))
      .catch(() => setDetails(null))
      .finally(() => setLoading(false));
    setActiveTab(0);
    setVerifications({});
    setSectionCompleted([false, false, false, false]);
  }, [student]);

  const isSectionVerified = (sectionKey) => {
    const sectionFields = {
      personal: [
        "firstName",
        "middleName",
        "lastName",
        "email",
        "mobile",
        "dob",
        "gender",
        "category",
        "subCategory",
        "region",
        "currentAddress",
        "permanentAddress",
        "course",
        "examRoll",
        "examRank",
        "abcId",
      ],
      academic: [
        "classX_institute",
        "classX_board",
        "classX_year",
        "classX_aggregate",
        "classX_pcm",
        "classX_isDiplomaOrPolytechnic",
        "classXII_institute",
        "classXII_board",
        "classXII_year",
        "classXII_aggregate",
        "classXII_pcm",
        "otherQualification_institute",
        "otherQualification_board",
        "otherQualification_year",
        "otherQualification_aggregate",
        "otherQualification_pcm",
        "academicAchievements",
        "coCurricularAchievements",
      ],
      parent: [
        "father_name",
        "father_mobile",
        "father_email",
        "mother_name",
        "mother_mobile",
        "mother_email",
        "family_income",
      ],
      documents: [
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
        "categoryCertificate",
        "specialCategoryCertificate",
        "academicFeeReceipt",
        "collegeFeeReceipt",
        "parentSignature",
      ],
    };
    return sectionFields[sectionKey].every(
      (f) => verifications[sectionKey]?.[f] !== undefined
    );
  };

  const handleSelectAll = (section) => {
    const sectionFields = {
      personal: [
        "firstName",
        "middleName",
        "lastName",
        "email",
        "mobile",
        "dob",
        "gender",
        "category",
        "subCategory",
        "region",
        "currentAddress",
        "permanentAddress",
        "course",
        "examRoll",
        "examRank",
        "abcId",
      ],
      academic: [
        "classX_institute",
        "classX_board",
        "classX_year",
        "classX_aggregate",
        "classX_pcm",
        "classX_isDiplomaOrPolytechnic",
        "classXII_institute",
        "classXII_board",
        "classXII_year",
        "classXII_aggregate",
        "classXII_pcm",
        "otherQualification_institute",
        "otherQualification_board",
        "otherQualification_year",
        "otherQualification_aggregate",
        "otherQualification_pcm",
        "academicAchievements",
        "coCurricularAchievements",
      ],
      parent: [
        "father_name",
        "father_mobile",
        "father_email",
        "mother_name",
        "mother_mobile",
        "mother_email",
        "family_income",
      ],
      documents: [
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
        "categoryCertificate",
        "specialCategoryCertificate",
        "academicFeeReceipt",
        "collegeFeeReceipt",
        "parentSignature",
      ],
    };

    setVerifications((prev) => ({
      ...prev,
      [section]: sectionFields[section].reduce(
        (acc, field) => ({
          ...acc,
          [field]: true, // Set all to verified (true)
        }),
        {}
      ),
    }));
  };

  const handleVerify = (section, field, value) => {
    setVerifications((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleProceed = () => {
    setSectionCompleted((prev) => [
      ...prev.map((v, i) => (i === activeTab ? true : v)),
    ]);
    setActiveTab((prev) => prev + 1);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/verify-student`, {
        studentId: student.id,
        verifications,
        status: "approved",
      }, { withCredentials: true });
      refresh?.();
      onClose();
    } catch (e) {
      setError("Failed to approve: " + e.message);
    }
    setActionLoading(false);
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/verify-student`, {
        studentId: student.id,
        verifications,
        status: "declined",
        declineReason: "Details not correct",
      }, { withCredentials: true });
      refresh?.();
      onClose();
    } catch (e) {
      setError("Failed to decline: " + e.message);
    }
    setActionLoading(false);
  };

  const getDeclinedFields = () => {
    const declined = [];
    Object.entries(verifications).forEach(([section, fields]) => {
      Object.entries(fields || {}).forEach(([field, value]) => {
        if (value === false) {
          declined.push(field);
        }
      });
    });
    return declined;
  };

  const handleDone = async () => {
    setActionLoading(true);
    const declinedFields = getDeclinedFields();
    const status = declinedFields.length > 0 ? "declined" : "approved";
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/verify-student`, {
        studentId: student.id,
        verifications,
        status,
        declinedFields,
      }, { withCredentials: true });
      refresh?.();
      onClose();
    } catch (e) {
      setError("Failed to update: " + e.message);
    }
    setActionLoading(false);
  };

  const DetailField = ({
    label,
    value,
    section,
    field,
    isDocument,
    showVerify,
  }) => {
    const verifiedStatus = verifications[section]?.[field];

    // Highlight if this field is declined and tableType is 'declined'
    const isDeclined =
      tableType === "declined" && declinedFields?.includes(field);

    let displayValue = value;
    if (
      (field === "academicAchievements" ||
        field === "coCurricularAchievements") &&
      value
    ) {
      try {
        displayValue = typeof value === "string" ? JSON.parse(value) : value;
      } catch {}
      if (Array.isArray(displayValue)) {
        displayValue =
          displayValue.length === 0 ? (
            <span className="text-gray-400">N/A</span>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {displayValue.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-700">
                  {item.event && (
                    <span className="font-medium">{item.event}</span>
                  )}
                  {item.date && (
                    <span className="ml-2 text-gray-500">({item.date})</span>
                  )}
                  {item.outcome && (
                    <span className="ml-2 text-blue-600">- {item.outcome}</span>
                  )}
                </li>
              ))}
            </ul>
          );
      }
    }

    return (
      <div
        className={`p-4 rounded-lg border transition-all ${
          isDeclined
            ? "border-red-400 bg-red-50"
            : verifiedStatus === true
            ? "border-green-200 bg-green-50"
            : verifiedStatus === false
            ? "border-red-200 bg-red-50"
            : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4
              className={`font-medium flex items-center ${
                isDeclined ? "text-red-700" : "text-gray-800"
              }`}
            >
              {label}
              {isDeclined && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-200 text-red-800 rounded-full">
                  Declined
                </span>
              )}
              {verifiedStatus === true && (
                <FiCheckCircle className="ml-2 text-green-500" />
              )}
              {verifiedStatus === false && (
                <FiAlertCircle className="ml-2 text-red-500" />
              )}
            </h4>
            <div className="mt-1 text-gray-600 text-sm">
              {isDocument && value ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FiDownload className="mr-1" /> View Document
                </a>
              ) : (
                displayValue || (
                  <span className="text-gray-400">Not provided</span>
                )
              )}
            </div>
          </div>
          {showVerify && (
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => handleVerify(section, field, true)}
                className={`p-1.5 rounded-full ${
                  verifiedStatus === true
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400 hover:bg-green-50"
                }`}
                title="Mark as correct"
              >
                <FiCheck size={16} />
              </button>
              <button
                onClick={() => handleVerify(section, field, false)}
                className={`p-1.5 rounded-full ${
                  verifiedStatus === false
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-400 hover:bg-red-50"
                }`}
                title="Mark as incorrect"
              >
                <FiX size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPersonal = () => (
    <div>
      {tableType === "pending" && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => handleSelectAll("personal")}
            className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
          >
            <FiCheck className="mr-1" /> Verify All Personal Fields
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField
          label="First Name"
          value={details?.personal?.firstName}
          section="personal"
          field="firstName"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Middle Name"
          value={details?.personal?.middleName}
          section="personal"
          field="middleName"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Last Name"
          value={details?.personal?.lastName}
          section="personal"
          field="lastName"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Email"
          value={details?.personal?.email}
          section="personal"
          field="email"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Mobile"
          value={details?.personal?.mobile}
          section="personal"
          field="mobile"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Date of Birth"
          value={details?.personal?.dob}
          section="personal"
          field="dob"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Gender"
          value={details?.personal?.gender}
          section="personal"
          field="gender"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Category"
          value={details?.personal?.category}
          section="personal"
          field="category"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Sub Category"
          value={details?.personal?.subCategory}
          section="personal"
          field="subCategory"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Region"
          value={details?.personal?.region}
          section="personal"
          field="region"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Current Address"
          value={details?.personal?.currentAddress}
          section="personal"
          field="currentAddress"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Permanent Address"
          value={details?.personal?.permanentAddress}
          section="personal"
          field="permanentAddress"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Course"
          value={details?.personal?.course}
          section="personal"
          field="course"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Exam Roll"
          value={details?.personal?.examRoll}
          section="personal"
          field="examRoll"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Exam Rank"
          value={details?.personal?.examRank}
          section="personal"
          field="examRank"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="ABC ID"
          value={details?.personal?.abcId}
          section="personal"
          field="abcId"
          showVerify={tableType === "pending"}
        />
      </div>
    </div>
  );

  const renderAcademic = () => {
    const academic = details?.academic || {};
    const classX = academic.classX || {};
    const classXII = academic.classXII || {};
    const otherQual = academic.otherQualification || {};

    return (
      <div>
        {tableType === "pending" && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => handleSelectAll("academic")}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
            >
              <FiCheck className="mr-1" /> Verify All Academic Fields
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Class X */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <FiBook className="mr-2" /> Class X Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
              <DetailField
                label="Institute"
                value={classX.institute}
                section="academic"
                field="classX_institute"
                showVerify={tableType === "pending"}
              />
              <DetailField
                label="Board"
                value={classX.board}
                section="academic"
                field="classX_board"
                showVerify={tableType === "pending"}
              />
              <DetailField
                label="Year"
                value={classX.year}
                section="academic"
                field="classX_year"
                showVerify={tableType === "pending"}
              />
              <DetailField
                label="Aggregate %"
                value={classX.aggregate}
                section="academic"
                field="classX_aggregate"
                showVerify={tableType === "pending"}
              />
              <DetailField
                label="PCM %"
                value={classX.pcm}
                section="academic"
                field="classX_pcm"
                showVerify={tableType === "pending"}
              />
              <DetailField
                label="Diploma/Polytechnic"
                value={classX.isDiplomaOrPolytechnic ? "Yes" : "No"}
                section="academic"
                field="classX_isDiplomaOrPolytechnic"
                showVerify={tableType === "pending"}
              />
            </div>
          </div>

          {/* Class XII */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <FiBook className="mr-2" /> Class XII Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
              <DetailField
                label="Institute"
                value={classXII.institute}
                section="academic"
                field="classXII_institute"
                showVerify={tableType === "pending"}
              />
              <DetailField
                label="Board"
                value={classXII.board}
                section="academic"
                field="classXII_board"
                showVerify={tableType === "pending"}
              />
              <DetailField
                label="Year"
                value={classXII.year}
                section="academic"
                field="classXII_year"
                showVerify={tableType === "pending"}
              />
              <DetailField
                label="Aggregate %"
                value={classXII.aggregate}
                section="academic"
                field="classXII_aggregate"
                showVerify={tableType === "pending"}
              />
              <DetailField
                label="PCM %"
                value={classXII.pcm}
                section="academic"
                field="classXII_pcm"
                showVerify={tableType === "pending"}
              />
            </div>
          </div>

          {/* Other Qualifications */}
          {otherQual.institute && (
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <FiAward className="mr-2" /> Other Qualifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                <DetailField
                  label="Institute"
                  value={otherQual.institute}
                  section="academic"
                  field="otherQualification_institute"
                  showVerify={tableType === "pending"}
                />
                <DetailField
                  label="Board"
                  value={otherQual.board}
                  section="academic"
                  field="otherQualification_board"
                  showVerify={tableType === "pending"}
                />
                <DetailField
                  label="Year"
                  value={otherQual.year}
                  section="academic"
                  field="otherQualification_year"
                  showVerify={tableType === "pending"}
                />
                <DetailField
                  label="Aggregate %"
                  value={otherQual.aggregate}
                  section="academic"
                  field="otherQualification_aggregate"
                  showVerify={tableType === "pending"}
                />
                <DetailField
                  label="PCM %"
                  value={otherQual.pcm}
                  section="academic"
                  field="otherQualification_pcm"
                  showVerify={tableType === "pending"}
                />
              </div>
            </div>
          )}

          {/* Achievements */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <FiAward className="mr-2" /> Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
              <DetailField
                label="Academic Achievements"
                value={academic.academicAchievements}
                section="academic"
                field="academicAchievements"
                showVerify={tableType === "pending"}
              />
              <DetailField
                label="Co-Curricular Achievements"
                value={academic.coCurricularAchievements}
                section="academic"
                field="coCurricularAchievements"
                showVerify={tableType === "pending"}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderParent = () => (
    <div>
      {tableType === "pending" && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => handleSelectAll("parent")}
            className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
          >
            <FiCheck className="mr-1" /> Verify All Parent Fields
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
            <FiUsers className="mr-2" /> Father's Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
            <DetailField
              label="Name"
              value={details?.parent?.father_name}
              section="parent"
              field="father_name"
              showVerify={tableType === "pending"}
            />
            <DetailField
              label="Mobile"
              value={details?.parent?.father_mobile}
              section="parent"
              field="father_mobile"
              showVerify={tableType === "pending"}
            />
            <DetailField
              label="Email"
              value={details?.parent?.father_email}
              section="parent"
              field="father_email"
              showVerify={tableType === "pending"}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
            <FiUsers className="mr-2" /> Mother's Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
            <DetailField
              label="Name"
              value={details?.parent?.mother_name}
              section="parent"
              field="mother_name"
              showVerify={tableType === "pending"}
            />
            <DetailField
              label="Mobile"
              value={details?.parent?.mother_mobile}
              section="parent"
              field="mother_mobile"
              showVerify={tableType === "pending"}
            />
            <DetailField
              label="Email"
              value={details?.parent?.mother_email}
              section="parent"
              field="mother_email"
              showVerify={tableType === "pending"}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
            <FiDollarSign className="mr-2" /> Family Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
            <DetailField
              label="Annual Income"
              value={details?.parent?.family_income}
              section="parent"
              field="family_income"
              showVerify={tableType === "pending"}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => {
    const docFields = [
      { label: "Photograph", key: "photo" },
      { label: "IPU Registration Slip", key: "ipuRegistration" },
      { label: "Allotment Letter", key: "allotmentLetter" },
      { label: "Exam Admit Card", key: "examAdmitCard" },
      { label: "Exam Score Card", key: "examScoreCard" },
      { label: "Xth Marksheet", key: "marksheet10" },
      { label: "Xth Passing Certificate", key: "passing10" },
      { label: "XIIth Marksheet", key: "marksheet12" },
      { label: "XIIth Passing Certificate", key: "passing12" },
      { label: "Aadhar Card", key: "aadhar" },
      { label: "Character Certificate", key: "characterCertificate" },
      { label: "Medical Certificate", key: "medicalCertificate" },
      { label: "Migration Certificate", key: "migrationCertificate" },
      { label: "Category Certificate", key: "categoryCertificate" },
      {
        label: "Special Category Certificate",
        key: "specialCategoryCertificate",
      },
      { label: "Academic Fee Receipt", key: "academicFeeReceipt" },
      { label: "College Fee Receipt", key: "collegeFeeReceipt" },
      { label: "Parent Signature", key: "parentSignature" },
    ];

    return (
      <div>
        {tableType === "pending" && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => handleSelectAll("documents")}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
            >
              <FiCheck className="mr-1" /> Verify All Documents
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docFields.map((doc) => (
            <DetailField
              key={doc.key}
              label={doc.label}
              value={details?.documents?.[doc.key]}
              section="documents"
              field={doc.key}
              isDocument
              showVerify={tableType === "pending"}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              {student?.firstName} {student?.lastName}
              <span className="ml-3 text-sm font-normal bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {student?.studentId}
              </span>
            </h2>
            <p className="text-gray-600 mt-1">{student?.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Progress bar for pending review */}
        {tableType === "pending" && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-2">
              {sectionDefs.map((section, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      sectionCompleted[index]
                        ? "bg-green-100 text-green-600"
                        : activeTab === index
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {sectionCompleted[index] ? <FiCheckCircle /> : index + 1}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      activeTab === index
                        ? "font-medium text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {section.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{
                  width: `${
                    ((activeTab + (sectionCompleted[activeTab] ? 1 : 0)) /
                      sectionDefs.length) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-4">
            {sectionDefs.map((section, index) => (
              <button
                key={section.key}
                onClick={() => tableType !== "pending" && setActiveTab(index)}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors flex items-center ${
                  activeTab === index
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {section.icon}
                {section.label}
                {tableType === "pending" && sectionCompleted[index] && (
                  <FiCheckCircle className="ml-2 text-green-500" size={16} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : !details ? (
            <div className="text-center py-10 text-red-500">
              Failed to load student details
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === 0 && renderPersonal()}
              {activeTab === 1 && renderAcademic()}
              {activeTab === 2 && renderParent()}
              {activeTab === 3 && renderDocuments()}
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        <div className="border-t border-gray-200 p-4 bg-white">
          {tableType === "pending" ? (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Section {activeTab + 1} of {sectionDefs.length}
              </div>
              <div className="flex space-x-3">
                {activeTab > 0 && (
                  <button
                    onClick={() => setActiveTab((prev) => prev - 1)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <FiArrowLeft className="mr-2" /> Previous
                  </button>
                )}
                {activeTab < sectionDefs.length - 1 ? (
                  <button
                    onClick={handleProceed}
                    disabled={!isSectionVerified(sectionDefs[activeTab].key)}
                    className={`flex items-center px-4 py-2 rounded-md text-white ${
                      isSectionVerified(sectionDefs[activeTab].key)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-300 cursor-not-allowed"
                    }`}
                  >
                    Next <FiArrowRight className="ml-2" />
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDone}
                      disabled={actionLoading}
                      className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Close
              </button>
            </div>
          )}
          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
