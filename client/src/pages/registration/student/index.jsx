import { useState } from "react";
import CustomModal from "../../../components/CustomModal";
import axios from "axios";
import Swal from "sweetalert2";
import ProgressBar from "../../../components/ProgressBar";
import Instructions from "./STEP1_Instructions";
import PersonalInfo from "./STEP2_PersonalInfo";
import AcademicInfo from "./STEP3_AcademicInfo";
import DocumentsUpload from "./STEP5_DocumentsUpload";
import ReviewSubmit from "./STEP6_ReviewSubmit";
import ParentsInfo from "./STEP4_ParentDetails"; // Assuming this is the correct import path
import bpitLogo from "../../../assets/icons/BPIT-logo-transparent.png";
import campusBackground from "../../../assets/images/BPIT.png";
import AIChatLauncher from "../../../components/AIChatLauncher"; // adjust path as needed

import { useEffect, useRef } from "react";
import { FiInfo } from "react-icons/fi";
import { FiHome } from "react-icons/fi";

const StudentRegistration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const skipUnloadRef = useRef(false);
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
      },
      mother: {
        name: "",
        qualification: "",
        occupation: "",
        mobile: "",
      },
      familyIncome: "",
    },
  });

  // Mark form as dirty on any change
  const setFormDataDirty = (updater) => {
    setIsDirty(true);
    if (typeof updater === "function") {
      setFormData((prev) => updater(prev));
    } else {
      setFormData(updater);
    }
  };

  // Warn on page reload/close when data may be unsaved
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isDirty || skipUnloadRef.current) return;
      e.preventDefault();
      e.returnValue = "Your data might not be saved";
      return "Your data might not be saved";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const nextStep = () => {
    const missing = getIncompleteFields(currentStep);
    if (missing.length > 0) {
      setIncompleteFields(missing);
      showModal({
        title: "Incomplete Fields",
        message:
          "Please fill all required fields before proceeding to the next section.",
        type: "error",
      });
      return;
    }
    // Show success modal before moving to next step
    showModal({
      title: "Section Completed!",
      message: `You have successfully completed this section. Proceeding to the next section...`,
      type: "success",
      onClose: () => {
        setModal((m) => ({ ...m, isOpen: false }));
        setCurrentStep((prev) => prev + 1);
        setIncompleteFields([]);
      },
    });
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setIncompleteFields([]);
  };

  const validateCurrentStep = () => {
    const missing = getIncompleteFields(currentStep);
    if (missing.length > 0) {
      setIncompleteFields(missing);
      showModal({
        title: "Incomplete Information",
        message: `Please complete all required fields before proceeding.`,
        type: "warning",
      });
      return false;
    }
    return true;
  };

  const validatePersonalInfo = () => {
    const { personal } = formData;
    const missing = [];
    if (!personal.course) missing.push("course");
    if (!personal.firstName) missing.push("firstName");
    if (!personal.lastName) missing.push("lastName");
    if (!personal.abcId) missing.push("abcId");
    if (!personal.dob) missing.push("dob");
    if (!personal.placeOfBirth) missing.push("placeOfBirth");
    if (!personal.mobile) missing.push("mobile");
    if (!personal.email) missing.push("email");
    if (!personal.examRoll) missing.push("examRoll");
    if (!personal.examRank) missing.push("examRank");
    if (!personal.gender) missing.push("gender");
    if (!personal.category) missing.push("category");
    if (!personal.region) missing.push("region");
    if (!personal.currentAddress) missing.push("currentAddress");
    if (!personal.permanentAddress) missing.push("permanentAddress");
    if (!personal.feeReimbursement) missing.push("feeReimbursement");
    if (!personal.antiRaggingRef) missing.push("antiRaggingRef");
    return missing;
  };

  const validateAcademicInfo = () => {
    const { academic } = formData;
    const missing = [];
    const { classX, classXII, otherQualification } = academic;

    // Class X validation
    if (!classX.institute) missing.push("classX.institute");
    if (!classX.board) missing.push("classX.board");
    if (!classX.year) missing.push("classX.year");
    if (!classX.aggregate) missing.push("classX.aggregate");
    // PCM % is NOT required for classX

    // Class XII validation
    if (!classXII.institute) missing.push("classXII.institute");
    if (!classXII.board) missing.push("classXII.board");
    if (!classXII.year) missing.push("classXII.year");
    if (!classXII.aggregate) missing.push("classXII.aggregate");
    if (!classXII.pcm) missing.push("classXII.pcm");

    // Other Qualification validation (if any field is filled)
    const oq = otherQualification;
    const oqAny = oq.institute || oq.board || oq.year || oq.aggregate || oq.pcm;
    if (oqAny) {
      if (!oq.institute) missing.push("otherQualification.institute");
      if (!oq.board) missing.push("otherQualification.board");
      if (!oq.year) missing.push("otherQualification.year");
      if (!oq.aggregate) missing.push("otherQualification.aggregate");
      if (!oq.pcm) missing.push("otherQualification.pcm");
    }
    return missing;
  };

  const validateDocuments = () => {
    const { documents } = formData;
    const missing = [];
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
    return missing;
  };

  const validateParentInfo = () => {
    const { parents } = formData;
    const missing = [];
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
    return missing;
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Convert all files to base64
      const documentsWithBase64 = { ...formData.documents };
      for (const [key, file] of Object.entries(documentsWithBase64)) {
        if (file) {
          documentsWithBase64[key] = await fileToBase64(file);
        }
      }

      // Flatten the nested object structure to match backend expectations
      const submissionData = {
        // Personal fields
        "personal.course": formData.personal.course,
        "personal.firstName": formData.personal.firstName,
        "personal.middleName": formData.personal.middleName,
        "personal.lastName": formData.personal.lastName,
        "personal.abcId": formData.personal.abcId,
        "personal.dob": formData.personal.dob,
        "personal.placeOfBirth": formData.personal.placeOfBirth,
        "personal.mobile": formData.personal.mobile,
        "personal.email": formData.personal.email,
        "personal.examRoll": formData.personal.examRoll,
        "personal.examRank": formData.personal.examRank,
        "personal.gender": formData.personal.gender,
        "personal.category": formData.personal.category,
        "personal.subCategory": formData.personal.subCategory,
        "personal.region": formData.personal.region,
        "personal.currentAddress": formData.personal.currentAddress,
        "personal.permanentAddress": formData.personal.permanentAddress,
        "personal.feeReimbursement": formData.personal.feeReimbursement,
        "personal.antiRaggingRef": formData.personal.antiRaggingRef,

        // Academic fields
        "academic.classX.institute": formData.academic.classX.institute,
        "academic.classX.board": formData.academic.classX.board,
        "academic.classX.year": formData.academic.classX.year,
        "academic.classX.aggregate": formData.academic.classX.aggregate,
        "academic.classX.pcm": formData.academic.classX.pcm,
        "academic.classX.isDiplomaOrPolytechnic":
          formData.academic.classX.isDiplomaOrPolytechnic,
        "academic.classXII.institute": formData.academic.classXII.institute,
        "academic.classXII.board": formData.academic.classXII.board,
        "academic.classXII.year": formData.academic.classXII.year,
        "academic.classXII.aggregate": formData.academic.classXII.aggregate,
        "academic.classXII.pcm": formData.academic.classXII.pcm,
        "academic.otherQualification.institute":
          formData.academic.otherQualification.institute,
        "academic.otherQualification.board":
          formData.academic.otherQualification.board,
        "academic.otherQualification.year":
          formData.academic.otherQualification.year,
        "academic.otherQualification.aggregate":
          formData.academic.otherQualification.aggregate,
        "academic.otherQualification.pcm":
          formData.academic.otherQualification.pcm,
        "academic.academicAchievements": JSON.stringify(
          formData.academic.academicAchievements
        ),
        "academic.coCurricularAchievements": JSON.stringify(
          formData.academic.coCurricularAchievements
        ),

        // Parents fields
        "parents.father.name": formData.parents.father.name,
        "parents.father.qualification": formData.parents.father.qualification,
        "parents.father.occupation": formData.parents.father.occupation,
        "parents.father.email": formData.parents.father.email,
        "parents.father.mobile": formData.parents.father.mobile,
        "parents.father.telephoneSTD": formData.parents.father.telephoneSTD,
        "parents.father.telephone": formData.parents.father.telephone,
        "parents.father.officeAddress": formData.parents.father.officeAddress,
        "parents.mother.name": formData.parents.mother.name,
        "parents.mother.qualification": formData.parents.mother.qualification,
        "parents.mother.occupation": formData.parents.mother.occupation,
        "parents.mother.email": formData.parents.mother.email,
        "parents.mother.mobile": formData.parents.mother.mobile,
        "parents.mother.telephoneSTD": formData.parents.mother.telephoneSTD,
        "parents.mother.telephone": formData.parents.mother.telephone,
        "parents.mother.officeAddress": formData.parents.mother.officeAddress,
        "parents.familyIncome": formData.parents.familyIncome,

        // Documents
        ...documentsWithBase64,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/student/register`,
        submissionData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSubmitSuccess(true);

        // Show success alert with SweetAlert2
        Swal.fire({
          title: "Registration Successful! 🎉",
          html: `
            <div class="text-center">
              <div class="mb-4">
                <svg class="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Welcome to BPIT!</h3>
              <p class="text-gray-600 mb-4">
                Your registration has been submitted successfully. You will receive a confirmation email shortly.
              </p>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p class="font-medium">What's Next?</p>
                <ul class="mt-1 space-y-1">
                  <li>• Your profile is under review</li>
                  <li>• You'll be notified once approved</li>
                  <li>• Check your email for updates</li>
                </ul>
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "Go to Homepage",
          confirmButtonColor: "#3B82F6",
          allowOutsideClick: false,
          allowEscapeKey: false,
    }).then((result) => {
          if (result.isConfirmed) {
      // Allow navigation without unload warning
      skipUnloadRef.current = true;
            // Redirect to homepage
            window.location.href = "/";
          }
        });
      }
    } catch (error) {
      // Registration error
      showModal({
        title: "Registration Failed",
        message:
          error.response?.data?.message ||
          "An error occurred during registration. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  function getIncompleteFields(step) {
    const missing = [];
    if (step === 1) {
      return validatePersonalInfo();
    } else if (step === 2) {
      return validateAcademicInfo();
    } else if (step === 3) {
      return validateParentInfo();
    } else if (step === 4) {
      return validateDocuments();
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
          setFormData={setFormDataDirty}
          incompleteFields={incompleteFields}
        />
      ),
    },
    {
      label: "Academic Info",
      component: (
        <AcademicInfo
          formData={formData}
          setFormData={setFormDataDirty}
          incompleteFields={incompleteFields}
        />
      ),
    },
    {
      label: "Parents Info",
      component: (
        <ParentsInfo
          formData={formData}
          setFormData={setFormDataDirty}
          incompleteFields={incompleteFields}
        />
      ),
    },
    {
      label: "Documents",
      component: (
        <DocumentsUpload
          formData={formData}
          setFormData={setFormDataDirty}
          incompleteFields={incompleteFields}
        />
      ),
    },
    {
      label: "Review",
      component: (
        <ReviewSubmit 
          formData={formData} 
          incompleteFields={incompleteFields} 
        />
      ),
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-red-50"
      style={{
        background: `
          linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1)),
          url(${campusBackground}) center/cover fixed no-repeat
        `,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <header
        className="w-full bg-white border-t-4 border-b-4 border-red-500 shadow-lg flex flex-col md:flex-row items-center justify-between px-2 md:px-10 py-3 relative z-20"
        style={{ minHeight: 100, borderRadius: "0 0 1.5rem 1.5rem" }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full md:w-auto">
          <div className="flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-1 md:p-2 shadow-sm border border-blue-200">
            <img
              src={bpitLogo}
              alt="BPIT Logo"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-md"
              style={{ minWidth: 56 }}
            />
          </div>
          <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left w-full">
            <h1
              className="text-lg xs:text-xl md:text-3xl font-extrabold text-blue-900 leading-tight tracking-tight drop-shadow-sm"
              style={{ fontFamily: "serif", letterSpacing: 0.5 }}
            >
              Bhagwan Parshuram Institute of Technology
            </h1>
            <div
              className="text-sm xs:text-base md:text-lg font-bold text-red-600 leading-tight mt-0.5 md:mt-1"
              style={{ fontFamily: "serif", letterSpacing: 0.2 }}
            >
              <span className="tracking-wide">
                A Unit of Bhartiya Brahmin Charitable Trust (Regd.)
              </span>
            </div>
            <div
              className="text-xs md:text-sm text-blue-700 font-medium mt-0.5 md:mt-1"
              style={{ fontFamily: "serif" }}
            >
              <span className="block">
                (Approved by AICTE, Ministry of Education (MoE))
              </span>
              <span className="block">
                Affiliated to Guru Gobind Singh Indraprastha University, Delhi
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 md:mt-0 md:ml-4">
          <img
            src="https://bpitindia.ac.in/wp-content/uploads/2024/03/Header-1-1-300x88-1.jpg"
            alt="G20 Logo"
            className="h-16 sm:h-20 md:h-24 w-auto object-contain bg-white rounded-lg border border-blue-100 shadow-sm p-1"
            style={{ minWidth: 40 }}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-8">
        <CustomModal
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onClose={modal.onClose}
        />
        <div className="max-w-6xl mx-auto">
          <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-lg rounded-2xl ">
            
            {/* Headings */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="relative mb-3 sm:mb-4">
                <div className="flex justify-center items-center">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
                    Student Registration Portal
                  </h1>
                </div>
                {/* <button
                  onClick={() => (window.location.href = "/")}
                  className="absolute right-0 top-0 text-black transition-all duration-300 hover:scale-110 group"
                  title="Go to Homepage"
                >
                  <FiInfo className="w-6 h-6" />
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Go to Homepage
                  </div>
                </button> */}
              </div>
              <p className="text-base sm:text-lg text-gray-700 font-medium">
                Official Registration System for New Students
              </p>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
                Complete all steps to register with BPIT
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-2 sm:px-0">
              <ProgressBar steps={steps} currentStep={currentStep} />
            </div>

            {/* Step Content */}
            <div className="mt-6 sm:mt-8">{steps[currentStep].component}</div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 cursor-pointer text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm sm:text-base"
              >
                Previous
              </button>

              {currentStep < steps.length - 1 ? (
                currentStep !== 0 && (
                  <button
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-700 cursor-pointer text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm sm:text-base"
                  >
                    Next
                  </button>
                )
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg cursor-pointer font-medium transition-colors text-sm sm:text-base ${
                    isSubmitting
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-gray-900 hover:bg-black"
                  } text-white flex items-center justify-center min-w-32 sm:min-w-40`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
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
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm border border-red-200">
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {submitError}
                </div>
              </div>
            )}

            {submitSuccess && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 text-green-600 rounded-lg text-xs sm:text-sm border border-green-200">
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Registration successful! You will receive a confirmation email
                  shortly.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persistent Home Navigation Button */}
      <button
        onClick={() => {
          Swal.fire({
            title: 'Do you want to leave this page?',
            text: 'Your data might not be saved',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Leave',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
          }).then((result) => {
            if (result.isConfirmed) {
              // Allow navigation without unload warning
              skipUnloadRef.current = true;
              window.location.href = "/";
            }
          });
        }}
        className="fixed bottom-22 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
        // title="Go to Homepage"
      >
        <FiHome className="w-8 h-8" />
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Go to Homepage
        </div>
      </button>

      <AIChatLauncher />
    </div>
  );
};

export default StudentRegistration;
