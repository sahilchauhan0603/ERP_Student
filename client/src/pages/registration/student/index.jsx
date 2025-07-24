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
  const [incompleteFields, setIncompleteFields] = useState([]);

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
    const missing = getIncompleteFields(currentStep);
    if (missing.length === 0) {
      if (currentStep < steps.length - 1) {
        let stepName = steps[currentStep]?.label || "Current form";
        showModal({
          title: "Step Completed!",
          message: `${stepName} successfully filled. Proceeding to next step...`,
          type: "success",
          onClose: () => {
            setModal((m) => ({ ...m, isOpen: false }));
            setCurrentStep(currentStep + 1);
            setIncompleteFields([]);
          },
        });
      }
    } else {
      setIncompleteFields(missing);
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
      personal.course &&
      personal.firstName &&
      personal.lastName &&
      personal.abcId &&
      personal.email &&
      personal.mobile &&
      personal.dob &&
      personal.examRoll &&
      personal.examRank &&
      personal.gender &&
      personal.category &&
      personal.region &&
      personal.currentAddress &&
      personal.permanentAddress &&
      personal.feeReimbursement &&
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

  // console.log("Valid Parent Info:", validateParentInfo());

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
            if (value) payload[`academic.${section}.${field}`] = value;
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
        payload["academic.academicAchievements"] = JSON.stringify(
          formData.academic.academicAchievements
        );
      if (formData.academic.coCurricularAchievements)
        payload["academic.coCurricularAchievements"] = JSON.stringify(
          formData.academic.coCurricularAchievements
        );

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

  function getIncompleteFields(step) {
    const missing = [];
    if (step === 1) {
      const { personal } = formData;
      if (!personal.course) missing.push("course");
      if (!personal.firstName) missing.push("firstName");
      if (!personal.lastName) missing.push("lastName");
      if (!personal.abcId) missing.push("abcId");
      if (!personal.email) missing.push("email");
      if (!personal.mobile) missing.push("mobile");
      if (!personal.dob) missing.push("dob");
      if (!personal.examRoll) missing.push("examRoll");
      if (!personal.examRank) missing.push("examRank");
      if (!personal.gender) missing.push("gender");
      if (!personal.category) missing.push("category");
      if (!personal.region) missing.push("region");
      if (!personal.currentAddress) missing.push("currentAddress");
      if (!personal.permanentAddress) missing.push("permanentAddress");
      if (!personal.feeReimbursement) missing.push("feeReimbursement");
      if (!personal.antiRaggingRef) missing.push("antiRaggingRef");
    } else if (step === 2) {
      const { academic } = formData;
      // Class X
      if (!academic.classX.institute) missing.push("classX.institute");
      if (!academic.classX.board) missing.push("classX.board");
      if (!academic.classX.year) missing.push("classX.year");
      if (!academic.classX.aggregate) missing.push("classX.aggregate");
      if (
        academic.classX.isDiplomaOrPolytechnic === undefined ||
        academic.classX.isDiplomaOrPolytechnic === null ||
        academic.classX.isDiplomaOrPolytechnic === ""
      )
        missing.push("classX.isDiplomaOrPolytechnic");
      // Class XII
      if (!academic.classXII.institute) missing.push("classXII.institute");
      if (!academic.classXII.board) missing.push("classXII.board");
      if (!academic.classXII.year) missing.push("classXII.year");
      if (!academic.classXII.aggregate) missing.push("classXII.aggregate");
      if (!academic.classXII.pcm) missing.push("classXII.pcm");
      // Other Qualification (optional, but if any field is filled, all must be filled)
      const oq = academic.otherQualification;
      const oqAny =
        oq.institute || oq.board || oq.year || oq.aggregate || oq.pcm;
      if (oqAny) {
        if (!oq.institute) missing.push("otherQualification.institute");
        if (!oq.board) missing.push("otherQualification.board");
        if (!oq.year) missing.push("otherQualification.year");
        if (!oq.aggregate) missing.push("otherQualification.aggregate");
        if (!oq.pcm) missing.push("otherQualification.pcm");
      }
    } else if (step === 3) {
      const { parents } = formData;
      // Father
      if (!parents.father.name) missing.push("father.name");
      if (!parents.father.qualification) missing.push("father.qualification");
      if (!parents.father.occupation) missing.push("father.occupation");
      if (!parents.father.email) missing.push("father.email");
      if (!parents.father.mobile) missing.push("father.mobile");
      // Mother
      if (!parents.mother.name) missing.push("mother.name");
      if (!parents.mother.qualification) missing.push("mother.qualification");
      if (!parents.mother.occupation) missing.push("mother.occupation");
      if (!parents.mother.mobile) missing.push("mother.mobile");
      // Family Income
      if (!parents.familyIncome) missing.push("familyIncome");
    } else if (step === 4) {
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
      requiredDocs.forEach((doc) => {
        if (!documents[doc]) missing.push(doc);
      });
    }
    return missing;
  }

  const steps = [
    { label: "Instructions", component: <Instructions nextStep={nextStep} /> },
    {
      label: "Personal Info",
      component: (
        <PersonalInfo
          formData={formData}
          setFormData={setFormData}
          incompleteFields={incompleteFields}
        />
      ),
    },
    {
      label: "Academic Info",
      component: (
        <AcademicInfo
          formData={formData}
          setFormData={setFormData}
          incompleteFields={incompleteFields}
        />
      ),
    },
    {
      label: "Parents Info",
      component: (
        <ParentsInfo
          formData={formData}
          setFormData={setFormData}
          incompleteFields={incompleteFields}
        />
      ),
    },
    {
      label: "Documents",
      component: (
        <DocumentsUpload
          formData={formData}
          setFormData={setFormData}
          incompleteFields={incompleteFields}
        />
      ),
    },
    {
      label: "Review",
      component: (
        <ReviewSubmit formData={formData} incompleteFields={incompleteFields} />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={modal.onClose}
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">
            Student Registration
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete all steps to register
          </p>
        </div>

        <ProgressBar steps={steps} currentStep={currentStep} />

        <div className="bg-gray-50 shadow rounded-lg p-6">
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
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md ${
                  isSubmitting ? "bg-gray-500" : "bg-gray-900 hover:bg-gray-800"
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
