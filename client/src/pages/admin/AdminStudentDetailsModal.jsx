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
  FiClock,
  FiRefreshCw,
  FiEye,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { formatFamilyIncome } from "../../utils/formatters";

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
  openImageModal,
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
  const [showMessage, setShowMessage] = useState(false);

  const [progress, setProgress] = useState(0);
  const [reviewing, setReviewing] = useState(false);

  // Parse declined fields - handle both string and array formats
  const parseDeclinedFields = (fields) => {
    if (!fields) return [];
    if (Array.isArray(fields)) return fields;
    if (typeof fields === "string") {
      try {
        return JSON.parse(fields);
      } catch (e) {
        // Error parsing declined fields
        return [];
      }
    }
    return [];
  };

  const declinedFields = parseDeclinedFields(
    student?.declinedFields || details?.declinedFields
  );

  // Debug logging to help identify declined fields format
  React.useEffect(() => {
    if (declinedFields && declinedFields.length > 0) {
      // console.log('=== DECLINED FIELDS DEBUG ===');
      // console.log('Raw student.declinedFields:', student?.declinedFields);
      // console.log('Raw details.declinedFields:', details?.declinedFields);
      // console.log('Parsed declinedFields:', declinedFields);
      // console.log('Student status:', student?.status || details?.status);
      // console.log('=============================');
    }
  }, [declinedFields, student, details]);

  // Helper to check if a section has declined fields
  const getDeclinedSections = () => {
    const declinedSections = new Set();
    if (Array.isArray(declinedFields)) {
      declinedFields.forEach((fieldPath) => {
        // Handle both formats: "section.field" and just "field"
        const parts = fieldPath.split(".");
        if (parts.length > 1) {
          // Format: "section.field"
          declinedSections.add(parts[0]);
        } else {
          // Format: just "field" - need to find which section it belongs to
          const field = parts[0];
          // Check each section's fields to find where this field belongs
          const sectionFields = {
            personal: [
              "firstName",
              "middleName",
              "lastName",
              "email",
              "mobile",
              "dob",
              "placeOfBirth",
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
              "feeReimbursement",
              "antiRaggingRef",
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
              "father_qualification",
              "father_occupation",
              "father_mobile",
              "father_email",
              "father_telephoneSTD",
              "father_telephone",
              "father_officeAddress",
              "mother_name",
              "mother_qualification",
              "mother_occupation",
              "mother_mobile",
              "mother_email",
              "mother_telephoneSTD",
              "mother_telephone",
              "mother_officeAddress",
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
            ],
          };

          // Find which section contains this field
          for (const [section, fields] of Object.entries(sectionFields)) {
            if (fields.includes(field)) {
              declinedSections.add(section);
              break;
            }
          }
        }
      });
    }

    return declinedSections;
  };

  const declinedSections = getDeclinedSections();

  useEffect(() => {
    if (!student?.id) return;
    setLoading(true);
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/admin/student-details/${student.id}`,
        { withCredentials: true }
      )
      .then((res) => {
        setDetails(res.data);
      })
      .catch((err) => {
        setDetails(null);
      })
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
        "placeOfBirth",
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
        "feeReimbursement",
        "antiRaggingRef",
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
        "father_qualification",
        "father_occupation",
        "father_mobile",
        "father_email",
        "father_telephoneSTD",
        "father_telephone",
        "father_officeAddress",
        "mother_name",
        "mother_qualification",
        "mother_occupation",
        "mother_mobile",
        "mother_email",
        "mother_telephoneSTD",
        "mother_telephone",
        "mother_officeAddress",
        "familyIncome",
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

  // Check if all fields across all sections have been verified
  const isAllFieldsVerified = () => {
    const allSections = ["personal", "academic", "parent", "documents"];
    return allSections.every((section) => isSectionVerified(section));
  };

  const handleAIReview = async () => {
    const result = await Swal.fire({
      title: "Run AI Review?",
      text: "Do you want to let AI review this student?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setActionLoading(true);
    setReviewing(true);
    setProgress(0);

    // Fake progress simulation
    let i = 0;
    const interval = setInterval(() => {
      i += 10;
      setProgress((prev) => (prev < 95 ? i : prev)); // cap at 95% until API resolves
    }, 300);

    try {
      console.log("Sending student data to AI review:", details);

      // Transform data structure to match backend expectations
      const transformedStudent = {
        personal: details?.personal || {},
        academic: details?.academic || {},
        parents: {
          father: {
            name: details?.parent?.father_name,
            qualification: details?.parent?.father_qualification,
            occupation: details?.parent?.father_occupation,
            email: details?.parent?.father_email,
            mobile: details?.parent?.father_mobile,
            telephoneSTD: details?.parent?.father_telephoneSTD,
            telephone: details?.parent?.father_telephone,
            officeAddress: details?.parent?.father_officeAddress,
          },
          mother: {
            name: details?.parent?.mother_name,
            qualification: details?.parent?.mother_qualification,
            occupation: details?.parent?.mother_occupation,
            email: details?.parent?.mother_email,
            mobile: details?.parent?.mother_mobile,
            telephoneSTD: details?.parent?.mother_telephoneSTD,
            telephone: details?.parent?.mother_telephone,
            officeAddress: details?.parent?.mother_officeAddress,
          },
          familyIncome: details?.parent?.familyIncome,
        },
        documents: details?.documents || {},
      };

      // Step 1: Call backend AI review
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/ai-review-student`,
        { student: transformedStudent },
        { withCredentials: true }
      );

      console.log("AI Review Response:", res.data);

      const { status, declinedFields, verifications } = res.data;

      // Note: We no longer automatically call verify-student here
      // Instead, we show results to admin and let them confirm

      clearInterval(interval);
      setProgress(100); // finish progress

      setTimeout(async () => {
        setReviewing(false);
        
        // Prepare detailed AI review results
        const verifiedFieldsCount = Object.values(verifications || {}).reduce((count, section) => {
          return count + Object.values(section || {}).filter(field => field === true).length;
        }, 0);
        
        const declinedFieldsCount = declinedFields?.length || 0;
        const totalFieldsReviewed = verifiedFieldsCount + declinedFieldsCount;

        // Show detailed AI review results
        const reviewResult = await Swal.fire({
          icon: status === "approved" ? "success" : "warning",
          title: "🤖 AI Review Complete",
          html: `
            <div style="text-align: left; margin: 20px 0;">
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #333;">Student: ${student.firstName} ${student.lastName}</h4>
                <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${student.email}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Course:</strong> ${student.course || 'N/A'}</p>
              </div>
              
              <div style="background: ${status === 'approved' ? '#d4edda' : '#f8d7da'}; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: ${status === 'approved' ? '#155724' : '#721c24'};">
                  AI Decision: <strong>${status.toUpperCase()}</strong>
                </h4>
              </div>

              <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                <div style="flex: 1; background: #e8f5e8; padding: 12px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #28a745;">${verifiedFieldsCount}</div>
                  <div style="font-size: 12px; color: #666;">Verified Fields</div>
                </div>
                <div style="flex: 1; background: #ffeaa7; padding: 12px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #f39c12;">${totalFieldsReviewed}</div>
                  <div style="font-size: 12px; color: #666;">Total Reviewed</div>
                </div>
                <div style="flex: 1; background: #ffebee; padding: 12px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #dc3545;">${declinedFieldsCount}</div>
                  <div style="font-size: 12px; color: #666;">Declined Fields</div>
                </div>
              </div>

              ${declinedFieldsCount > 0 ? `
                <div style="background: #fff3cd; padding: 12px; border-radius: 6px; border-left: 4px solid #ffc107;">
                  <strong>Fields requiring attention:</strong>
                  <ul style="margin: 8px 0 0 20px; font-size: 13px;">
                    ${declinedFields.slice(0, 5).map(field => `<li>${field}</li>`).join('')}
                    ${declinedFields.length > 5 ? `<li>... and ${declinedFields.length - 5} more</li>` : ''}
                  </ul>
                </div>
              ` : ''}
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "✅ Complete Review",
          cancelButtonText: "❌ Cancel AI Review", 
          confirmButtonColor: status === "approved" ? "#28a745" : "#ffc107",
          cancelButtonColor: "#6c757d",
          reverseButtons: true,
          width: '650px',
          customClass: {
            popup: 'swal-wide'
          },
          didOpen: () => {
            // Add custom styles for better appearance
            const style = document.createElement('style');
            style.textContent = `
              .swal-wide {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
              }
              .swal-wide .swal2-html-container {
                line-height: 1.5 !important;
              }
            `;
            document.head.appendChild(style);
          }
        });

        if (reviewResult.isConfirmed) {
          // Admin confirmed AI review - call verify-student endpoint
          try {
            setActionLoading(true);
            await axios.post(
              `${import.meta.env.VITE_API_URL}/admin/verify-student`,
              {
                studentId: student.id,
                status,
                declinedFields: declinedFields || [],
                verifications: verifications || {},
              },
              { withCredentials: true }
            );

            // Close modal and refresh
            refresh?.();
            onClose();
            
            // Show completion message
            Swal.fire({
              icon: status === "approved" ? "success" : "info",
              title: "Review Completed",
              text: `${student.firstName} ${student.lastName} has been ${status} by AI review.`,
              timer: 3000,
              showConfirmButton: false,
            });
          } catch (error) {
            console.error("Error completing AI review:", error);
            Swal.fire({
              icon: "error",
              title: "Review Failed",
              text: "Failed to complete the AI review. Please try again.",
            });
          } finally {
            setActionLoading(false);
          }
        } else {
          // Admin cancelled AI review - continue with manual review
          if (verifications) {
            setVerifications(verifications);
          }
          
          Swal.fire({
            icon: "info",
            title: "AI Review Cancelled",
            text: "You can now manually review the student. The AI suggestions have been loaded for your reference.",
            timer: 3000,
            showConfirmButton: false,
          });
        }
      }, 500);
    } catch (e) {
      console.error("AI Review Error:", e);
      clearInterval(interval);
      setReviewing(false);
      setProgress(0);

      const errorMessage =
        e.response?.data?.message || e.message || "Could not review student.";

      Swal.fire({
        icon: "error",
        title: "AI Review Failed",
        text: errorMessage,
        confirmButtonText: "OK",
        showConfirmButton: true,
      });
    }

    setActionLoading(false);
  };

  // Get count of verified fields for progress tracking
  const getVerificationProgress = () => {
    const sectionFields = {
      personal: [
        "firstName",
        "middleName",
        "lastName",
        "email",
        "mobile",
        "dob",
        "placeOfBirth",
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
        "feeReimbursement",
        "antiRaggingRef",
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
        "father_qualification",
        "father_occupation",
        "father_mobile",
        "father_email",
        "father_telephoneSTD",
        "father_telephone",
        "father_officeAddress",
        "mother_name",
        "mother_qualification",
        "mother_occupation",
        "mother_mobile",
        "mother_email",
        "mother_telephoneSTD",
        "mother_telephone",
        "mother_officeAddress",
        "familyIncome",
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

    let totalFields = 0;
    let verifiedFields = 0;

    Object.entries(sectionFields).forEach(([section, fields]) => {
      totalFields += fields.length;
      fields.forEach((field) => {
        if (verifications[section]?.[field] !== undefined) {
          verifiedFields++;
        }
      });
    });

    return {
      verifiedFields,
      totalFields,
      percentage: Math.round((verifiedFields / totalFields) * 100),
    };
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
        "placeOfBirth",
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
        "feeReimbursement",
        "antiRaggingRef",
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
        "father_qualification",
        "father_occupation",
        "father_mobile",
        "father_email",
        "father_telephoneSTD",
        "father_telephone",
        "father_officeAddress",
        "mother_name",
        "mother_qualification",
        "mother_occupation",
        "mother_mobile",
        "mother_email",
        "mother_telephoneSTD",
        "mother_telephone",
        "mother_officeAddress",
        "familyIncome",
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
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/verify-student`,
        {
          studentId: student.id,
          verifications,
          status: "approved",
        },
        { withCredentials: true }
      );
      refresh?.();
      onClose();
      Swal.fire({
        icon: "success",
        title: "Profile Reviewed Successfully",
        text: `You have successfully reviewed the profile and ${student.firstName} ${student.lastName} has been approved.`,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Failed to approve",
        text: e.message || "Failed to approve student.",
      });
    }
    setActionLoading(false);
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/verify-student`,
        {
          studentId: student.id,
          verifications,
          status: "declined",
          declineReason: "Details not correct",
        },
        { withCredentials: true }
      );
      refresh?.();
      onClose();
      Swal.fire({
        icon: "info",
        title: "Profile Reviewed Successfully",
        text: `You have successfully reviewed the profile and ${student.firstName} ${student.lastName} has been declined.`,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Failed to decline",
        text: e.message || "Failed to decline student.",
      });
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
    // Check if all fields are verified before proceeding
    if (!isAllFieldsVerified()) {
      const progress = getVerificationProgress();
      Swal.fire({
        icon: "warning",
        title: "Incomplete Review",
        text: `Please review all fields before proceeding. You have verified ${progress.verifiedFields} out of ${progress.totalFields} fields.`,
        confirmButtonText: "Continue Review",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setActionLoading(true);
    const declinedFields = getDeclinedFields();
    const status = declinedFields.length > 0 ? "declined" : "approved";
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/verify-student`,
        {
          studentId: student.id,
          verifications,
          status,
          declinedFields,
        },
        { withCredentials: true }
      );
      refresh?.();
      onClose();

      // Show success popup based on status
      const actionText = status === "approved" ? "approved" : "declined";
      Swal.fire({
        icon: status === "approved" ? "success" : "info",
        title: "Profile Reviewed Successfully",
        text: `You have successfully reviewed the profile and ${student.firstName} ${student.lastName} has been ${actionText}.`,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Failed to update",
        text: e.message || "Failed to update student.",
      });
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

    // Highlight if this field is declined (for any declined student)
    const isDeclined = declinedFields?.some((fieldPath) => {
      // Handle direct field name match
      if (fieldPath === field) return true;

      // Handle section.field format
      if (fieldPath === `${section}.${field}`) return true;

      // Handle parent fields mapping
      if (section === "parent") {
        // Map parent field names to declined field format
        const parentFieldMappings = {
          father_name: "parent.father.name",
          father_qualification: "parent.father.qualification",
          father_occupation: "parent.father.occupation",
          father_email: "parent.father.email",
          father_mobile: "parent.father.mobile",
          father_telephoneSTD: "parent.father.telephoneSTD",
          father_telephone: "parent.father.telephone",
          father_officeAddress: "parent.father.officeAddress",
          mother_name: "parent.mother.name",
          mother_qualification: "parent.mother.qualification",
          mother_occupation: "parent.mother.occupation",
          mother_email: "parent.mother.email",
          mother_mobile: "parent.mother.mobile",
          mother_telephoneSTD: "parent.mother.telephoneSTD",
          mother_telephone: "parent.mother.telephone",
          mother_officeAddress: "parent.mother.officeAddress",
          familyIncome: "parent.familyIncome",
        };

        const mappedFieldPath = parentFieldMappings[field];
        if (mappedFieldPath && fieldPath === mappedFieldPath) {
          return true;
        }
      }

      // Handle academic fields mapping
      if (section === "academic" && field.includes("_")) {
        // Convert academic field names like "classX_institute" to "academic.classX.institute"
        const normalizedField = field.replace("_", ".");
        const academicFieldPath = `academic.${normalizedField}`;
        if (fieldPath === academicFieldPath) {
          return true;
        }
      }

      // Handle nested field paths (e.g., "personal.firstName", "documents.photo")
      const parts = fieldPath.split(".");
      if (parts.length > 1) {
        const [sectionPart, ...fieldParts] = parts;
        const fieldPart = fieldParts.join(".");

        if (sectionPart === section && fieldPart === field) {
          return true;
        }
      }

      return false;
    });

    let displayValue = value;

    // Format family income if it's the familyIncome field
    if (field === "familyIncome" && value) {
      displayValue = formatFamilyIncome(value);
    }

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
            : verifiedStatus === undefined && tableType === "pending"
            ? "border-orange-300 bg-orange-50"
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
              {verifiedStatus === undefined && tableType === "pending" && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-orange-200 text-orange-800 rounded-full">
                  Pending Review
                </span>
              )}
            </h4>
            <div className="mt-1 text-gray-600 text-sm">
              {isDocument && value
                ? (() => {
                    // Check if the document is a PDF or image with proper type checking
                    const isPDF =
                      value &&
                      typeof value === "string" &&
                      value.toLowerCase().includes(".pdf");
                    const isImage =
                      value &&
                      typeof value === "string" &&
                      (value.toLowerCase().includes(".jpg") ||
                        value.toLowerCase().includes(".jpeg") ||
                        value.toLowerCase().includes(".png") ||
                        value.toLowerCase().includes(".gif") ||
                        value.toLowerCase().includes(".webp"));

                    return (
                      <>
                        {openImageModal ? (
                          <button
                            onClick={() => openImageModal(value, label)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center"
                          >
                            <FiEye className="mr-1" /> View Document
                          </button>
                        ) : (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <FiEye className="mr-1" /> View Document
                          </a>
                        )}
                      </>
                    );
                  })()
                : displayValue || (
                    <span className="text-gray-400">Not provided</span>
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

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const renderPersonal = () => (
    <div>
      {tableType === "pending" && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => handleSelectAll("personal")}
            className="flex cursor-pointer items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
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
          value={formatDate(details?.personal?.dob)}
          section="personal"
          field="dob"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Place of Birth"
          value={details?.personal?.placeOfBirth}
          section="personal"
          field="placeOfBirth"
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
        <DetailField
          label="Fee Reimbursement"
          value={details?.personal?.feeReimbursement}
          section="personal"
          field="feeReimbursement"
          showVerify={tableType === "pending"}
        />
        <DetailField
          label="Anti Ragging Reference"
          value={details?.personal?.antiRaggingRef}
          section="personal"
          field="antiRaggingRef"
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
              className="flex items-center cursor-pointer px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
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
            className="flex items-center cursor-pointer px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
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
              label="Qualification"
              value={details?.parent?.father_qualification}
              section="parent"
              field="father_qualification"
              showVerify={tableType === "pending"}
            />
            <DetailField
              label="Occupation"
              value={details?.parent?.father_occupation}
              section="parent"
              field="father_occupation"
              showVerify={tableType === "pending"}
            />
            <DetailField
              label="Email"
              value={details?.parent?.father_email}
              section="parent"
              field="father_email"
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
              label="Telephone (STD)"
              value={details?.parent?.father_telephoneSTD}
              section="parent"
              field="father_telephoneSTD"
              showVerify={tableType === "pending"}
            />
            <DetailField
              label="Telephone"
              value={details?.parent?.father_telephone}
              section="parent"
              field="father_telephone"
              showVerify={tableType === "pending"}
            />
            <DetailField
              label="Office Address"
              value={details?.parent?.father_officeAddress}
              section="parent"
              field="father_officeAddress"
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
              label="Qualification"
              value={details?.parent?.mother_qualification}
              section="parent"
              field="mother_qualification"
              showVerify={tableType === "pending"}
            />
            <DetailField
              label="Occupation"
              value={details?.parent?.mother_occupation}
              section="parent"
              field="mother_occupation"
              showVerify={tableType === "pending"}
            />
            <DetailField
              label="Email"
              value={details?.parent?.mother_email}
              section="parent"
              field="mother_email"
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
              label="Telephone (STD)"
              value={details?.parent?.mother_telephoneSTD}
              section="parent"
              field="mother_telephoneSTD"
              showVerify={tableType === "pending"}
            />
            <DetailField
              label="Telephone"
              value={details?.parent?.mother_telephone}
              section="parent"
              field="mother_telephone"
              showVerify={tableType === "pending"}
            />
            <DetailField
              label="Office Address"
              value={details?.parent?.mother_officeAddress}
              section="parent"
              field="mother_officeAddress"
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
              value={details?.parent?.familyIncome}
              section="parent"
              field="familyIncome"
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
              className="flex cursor-pointer items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg bg-black/60">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              {student?.firstName} {student?.lastName}
              <span className="ml-3 text-sm font-normal bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {student?.studentId}
              </span>
            </h2>
            <p className="text-gray-600 mt-1">{student?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {student?.course && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <FiBook className="mr-1" />
                  {student.course}
                </span>
              )}
              {student?.batch && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                  <FiCalendar className="mr-1" />
                  Batch: {student.batch}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Status Icon */}
            {student?.status === "approved" && (
              <div className="relative group">
                <div className="p-2 rounded-full bg-green-100 text-green-600 cursor-help">
                  <FiCheckCircle size={20} />
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Approved Student
                </div>
              </div>
            )}
            {student?.status === "declined" && (
              <div className="relative group">
                <div className="p-2 rounded-full bg-red-100 text-red-600 cursor-help">
                  <FiXCircle size={20} />
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Declined Student
                </div>
              </div>
            )}
            {student?.status === "pending" && tableType === "pending" && (
              <>
                <div className="relative">
                  {/* AI Review Button */}
                  <button
                    type="button"
                    onClick={handleAIReview}
                    className="relative flex items-center px-3 py-1.5 cursor-pointer bg-gradient-to-r from-blue-600 to-red-500 text-white font-semibold rounded-lg shadow hover:from-blue-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 mr-6"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                    title="Let AI review this student"
                  >
                    <span className="relative flex h-3 w-3 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    AI Review
                  </button>
                  {reviewing && (
                    <div className="mt-3">
                      <div className="w-64 bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        AI reviewing student... {progress}%
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 cursor-help">
                    <FiClock size={20} />
                  </div>
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Pending Student
                  </div>
                </div>
              </>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setLoading(true);
                  axios
                    .get(
                      `${import.meta.env.VITE_API_URL}/admin/student-details/${
                        student.id
                      }`,
                      { withCredentials: true }
                    )
                    .then((res) => {
                      setDetails(res.data);
                    })
                    .catch((err) => {
                      // Error refreshing student details
                    })
                    .finally(() => setLoading(false));
                }}
                className="p-2 cursor-pointer rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Refresh student details"
              >
                <FiRefreshCw size={20} />
              </button>
              {/* Show cross (close) button only in pending student table */}
              {tableType === "pending" && (
                <button
                  onClick={onClose}
                  className="p-2 cursor-pointer rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Review Progress for pending review */}
        {tableType === "pending" && (
          <div className="px-6 pt-4">
            {(() => {
              const progress = getVerificationProgress();
              const allVerified = isAllFieldsVerified();
              return (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiCheckCircle
                        className={`mr-2 ${
                          allVerified ? "text-green-600" : "text-blue-600"
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Review Progress: {progress.verifiedFields}/
                        {progress.totalFields} fields verified
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        allVerified ? "text-green-600" : "text-blue-600"
                      }`}
                    >
                      {progress.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        allVerified ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                  {!allVerified && (
                    <p className="text-xs text-gray-600 mt-1">
                      Please review all fields before completing the review
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex space-x-4 whitespace-nowrap">
              {sectionDefs.map((section, index) => {
                const hasDeclinedFields = declinedSections.has(section.key);
                
                // For pending tables, check if current section is verified before allowing next tabs
                const isTabAccessible = tableType === "pending" 
                  ? index === 0 || isSectionVerified(sectionDefs[index - 1].key)
                  : true;
                
                const isDisabled = tableType === "pending" && !isTabAccessible;

                return (
                  <button
                    key={section.key}
                    onClick={() => {
                      if (tableType === "pending") {
                        if (isTabAccessible) {
                          setActiveTab(index);
                        }
                      } else {
                        setActiveTab(index);
                      }
                    }}
                    disabled={isDisabled}
                    className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors flex items-center relative ${
                      activeTab === index
                        ? "border-blue-500 text-blue-600"
                        : isDisabled
                        ? "border-transparent text-gray-300 cursor-not-allowed"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer"
                    }
                    ${hasDeclinedFields ? "border-red-400" : ""}`}
                    title={isDisabled ? "Complete previous section verification first" : ""}
                  >
                    {section.icon}
                    <span className="flex items-center">
                      {section.label}
                      {hasDeclinedFields && (
                        <div className="relative ml-1 group">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse cursor-help">
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 mt-2">
                            Declined section
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-600"></div>
                          </div>
                        </div>
                      )}
                    </span>
                    {tableType === "pending" && sectionCompleted[index] && (
                      <FiCheckCircle
                        className="ml-2 text-green-500"
                        size={16}
                      />
                    )}
                  </button>
                );
              })}
            </div>
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
                    className="flex items-center px-4 cursor-pointer py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <FiArrowLeft className="mr-2" /> Previous
                  </button>
                )}
                {activeTab < sectionDefs.length - 1 ? (
                  <button
                    onClick={handleProceed}
                    disabled={!isSectionVerified(sectionDefs[activeTab].key)}
                    className={`flex items-center px-4 cursor-pointer py-2 rounded-md text-white ${
                      isSectionVerified(sectionDefs[activeTab].key)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-300 cursor-not-allowed"
                    }`}
                  >
                    Next <FiArrowRight className="ml-2" />
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    {(() => {
                      const progress = getVerificationProgress();
                      const allVerified = isAllFieldsVerified();
                      return (
                        <>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">Review Progress:</span>
                            <span
                              className={`font-semibold ${
                                allVerified
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {progress.verifiedFields}/{progress.totalFields} (
                              {progress.percentage}%)
                            </span>
                          </div>
                          <button
                            onClick={handleDone}
                            disabled={actionLoading || !allVerified}
                            className={`flex items-center px-6 cursor-pointer py-2 rounded-md disabled:opacity-50 ${
                              allVerified
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-gray-400 text-gray-600 cursor-not-allowed"
                            }`}
                            title={
                              !allVerified
                                ? "Please review all fields before proceeding"
                                : "Complete review"
                            }
                          >
                            Done
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 cursor-pointer py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
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
