import { useState } from "react";
import CustomModal from "../../../components/CustomModal";
import axios from "axios";
import ProgressBar from "../../../components/ProgressBar";
import Instructions from "./STEP1_Instructions";
import PersonalInfo from "./STEP2_PersonalInfo";
import AcademicInfo from "./STEP3_AcademicInfo";
import DocumentsUpload from "./STEP5_DocumentsUpload";
import ReviewSubmit from "./STEP6_ReviewSubmit";
import ParentsInfo from "./STEP4_ParentDetails"; // Assuming this is the correct import path

import { useEffect } from "react";

const StudentRegistration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onClose: null,
  });

  // Helper to show modal
  const showModal = ({ title, message, type = "info", onClose }) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onClose: onClose || (() => setModal((m) => ({ ...m, isOpen: false }))),
    });
  };

  const [formData, setFormData] = useState({
    personal: {
      course: "",
      firstName: "",
      middleName: "",
      lastName: "",
      abcId: "",
      dob: "",
      placeOfBirth: "",
      mobile: "",
      email: "",
      examRoll: "",
      examRank: "",
      gender: "",
      category: "",
      subCategory: "",
      region: "",
      currentAddress: "",
      permanentAddress: "",
      feeReimbursement: "",
      antiRaggingRef: "",
    },
    academic: {
      classX: {
        institute: "",
        board: "",
        year: "",
        aggregate: "",
        pcm: "",
        isDiplomaOrPolytechnic: "",
      },
      classXII: {
        institute: "",
        board: "",
        year: "",
        aggregate: "",
        pcm: "",
      },
      otherQualification: {
        institute: "",
        board: "",
        year: "",
        aggregate: "",
        pcm: "",
      },
      academicAchievements: [{ event: "", date: "", outcome: "" }],
      coCurricularAchievements: [{ event: "", date: "", outcome: "" }],
    },
    documents: {
      photo: null,
      ipuRegistration: null,
      allotmentLetter: null,
      examAdmitCard: null,
      examScoreCard: null,
      marksheet10: null,
      passing10: null,
      marksheet12: null,
      passing12: null,
      aadhar: null,
      characterCertificate: null,
      medicalCertificate: null,
      migrationCertificate: null,
      categoryCertificate: null,
      specialCategoryCertificate: null,
      academicFeeReceipt: null,
      collegeFeeReceipt: null,
      parentSignature: null,
    },
    parents: {
      father: {
        name: "",
        qualification: "",
        occupation: "",
        email: "",
        mobile: "",
        telephoneSTD: "",
        telephone: "",
        officeAddress: "",
      },
      mother: {
        name: "",
        qualification: "",
        occupation: "",
        email: "",
        mobile: "",
        telephoneSTD: "",
        telephone: "",
        officeAddress: "",
      },
      familyIncome: "",
    },
  });

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        // Show confirmation modal for current step
        let stepName = steps[currentStep]?.label || "Current form";
        showModal({
          title: "Step Completed!",
          message: `${stepName} successfully filled. Proceeding to next step...`,
          type: "success",
          onClose: () => {
            setModal((m) => ({ ...m, isOpen: false }));
            setCurrentStep(currentStep + 1);
          },
        });
      }
    } else {
      showModal({
        title: "Incomplete Fields",
        message: "Please fill all required fields before proceeding.",
        type: "error",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return true; // Instructions
      case 1:
        return validatePersonalInfo();
      case 2:
        return validateAcademicInfo();
      case 3:
        return validateParentInfo();
      case 4:
        return validateDocuments();
      default:
        return true;
    }
  };

  const validatePersonalInfo = () => {
    const { personal } = formData;
    return (
      personal.firstName &&
      personal.lastName &&
      personal.email &&
      personal.mobile &&
      personal.dob &&
      personal.gender &&
      personal.category &&
      personal.antiRaggingRef
    );
  };

  const validateAcademicInfo = () => {
    const { academic } = formData;

    const isClassXValid =
      academic.classX.institute &&
      academic.classX.board &&
      academic.classX.year &&
      academic.classX.aggregate &&
      academic.classX.pcm &&
      academic.classX.isDiplomaOrPolytechnic !== undefined &&
      academic.classX.isDiplomaOrPolytechnic !== null;

    const isClassXIIValid =
      academic.classXII.institute &&
      academic.classXII.board &&
      academic.classXII.year &&
      academic.classXII.aggregate &&
      academic.classXII.pcm;

    const hasOtherQualification =
      academic.otherQualification.institute ||
      academic.otherQualification.board ||
      academic.otherQualification.year ||
      academic.otherQualification.aggregate ||
      academic.otherQualification.pcm;

    const isOtherQualificationValid =
      !hasOtherQualification ||
      (academic.otherQualification.institute &&
        academic.otherQualification.board &&
        academic.otherQualification.year &&
        academic.otherQualification.aggregate &&
        academic.otherQualification.pcm);

    const isAchievementsValid = academic.academicAchievements.every((ach) => {
      const anyFilled = ach.event || ach.date || ach.outcome;
      const allFilled = ach.event && ach.date && ach.outcome;
      return !anyFilled || allFilled;
    });

    const isCoAchievementsValid = academic.coCurricularAchievements.every(
      (ach) => {
        const anyFilled = ach.event || ach.date || ach.outcome;
        const allFilled = ach.event && ach.date && ach.outcome;
        return !anyFilled || allFilled;
      }
    );

    return (
      isClassXValid &&
      isClassXIIValid &&
      isOtherQualificationValid &&
      isAchievementsValid &&
      isCoAchievementsValid
      // && isCourseValid
    );
  };

  const validateDocuments = () => {
    const { documents } = formData;
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

    return requiredDocs.every((doc) => documents[doc]);
  };

  const validateParentInfo = () => {
    const { parents } = formData;

    const fatherValid =
      parents.father.name &&
      parents.father.qualification &&
      parents.father.occupation &&
      parents.father.email &&
      parents.father.mobile;

    const motherValid =
      parents.mother.name &&
      parents.mother.qualification &&
      parents.mother.occupation &&
      parents.mother.mobile;

    const incomeValid = parents.familyIncome;

    return fatherValid && motherValid && incomeValid;
  };

  console.log("Valid Parent Info:", validateParentInfo());

  // Helper: convert File to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      alert("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build a plain object for JSON submission
      const payload = {};

      // Personal
      for (const [key, value] of Object.entries(formData.personal)) {
        if (value !== null && value !== undefined) {
          payload[`personal.${key}`] = value;
        }
      }

      // Academic
      for (const [section, data] of Object.entries(formData.academic)) {
        if (Array.isArray(data)) {
          payload[`academic.${section}`] = data;
        } else {
          for (const [field, value] of Object.entries(data)) {
            if (value)
              payload[`academic.${section}.${field}`] = value;
          }
        }
      }

      // Parents
      for (const [parentType, data] of Object.entries(formData.parents)) {
        if (parentType === "familyIncome") {
          if (data) payload["parents.familyIncome"] = data;
          continue;
        }
        for (const [field, value] of Object.entries(data)) {
          if (value) payload[`parents.${parentType}.${field}`] = value;
        }
      }

      // Documents: convert File to base64
      for (const [docType, file] of Object.entries(formData.documents)) {
        if (file instanceof File) {
          payload[docType] = await fileToBase64(file);
        } else {
          payload[docType] = null;
        }
      }

      // Achievements arrays as JSON strings (for backend compatibility)
      if (formData.academic.academicAchievements)
        payload["academic.academicAchievements"] = JSON.stringify(formData.academic.academicAchievements);
      if (formData.academic.coCurricularAchievements)
        payload["academic.coCurricularAchievements"] = JSON.stringify(formData.academic.coCurricularAchievements);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/student/register`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setSubmitSuccess(true);
      console.log("Registration successful:", response.data);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { label: "Instructions", component: <Instructions nextStep={nextStep} /> },
    {
      label: "Personal Info",
      component: <PersonalInfo formData={formData} setFormData={setFormData} />,
    },
    {
      label: "Academic Info",
      component: <AcademicInfo formData={formData} setFormData={setFormData} />,
    },
    {
      label: "Parents Info",
      component: <ParentsInfo formData={formData} setFormData={setFormData} />,
    },
    {
      label: "Documents",
      component: (
        <DocumentsUpload formData={formData} setFormData={setFormData} />
      ),
    },
    { label: "Review", component: <ReviewSubmit formData={formData} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={modal.onClose}
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Student Registration
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete all steps to register
          </p>
        </div>

        <ProgressBar steps={steps} currentStep={currentStep} />

        <div className="bg-white shadow rounded-lg p-6">
          {steps[currentStep].component}

          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0 || isSubmitting}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              currentStep !== 0 && (
                <button
                  onClick={nextStep}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md ${
                  isSubmitting
                    ? "bg-gray-500"
                    : "bg-green-600 hover:bg-green-700"
                } text-white flex items-center justify-center min-w-32`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </button>
            )}
          </div>

          {submitError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-md text-sm">
              Registration successful! You will receive a confirmation email
              shortly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
