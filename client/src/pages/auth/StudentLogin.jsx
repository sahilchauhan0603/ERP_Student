import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import bpitLogo from "../../assets/icons/BPIT-logo-transparent.png";
import campusBackground from "../../assets/images/BPIT.png";
import Swal from "sweetalert2";
import AIChatLauncher from "../../components/AI/AIChatLauncher"; // adjust path as needed

const API_URL = import.meta.env.VITE_API_URL;

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputsRef = React.useRef([]);
  const [step, setStep] = useState(1); // 1: email, 2: otp
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [otpTimer, setOtpTimer] = useState(0); // seconds left
  const timerRef = React.useRef();
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    // Clean up any leftover localStorage items
    if (localStorage.getItem("showBackToHomePopup") === "student") {
      localStorage.removeItem("showBackToHomePopup");
    }

    // Alert on page refresh if OTP step is active
    const handleBeforeUnload = (e) => {
      if (step === 2) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/student/send-login-otp`,
        { email },
        { withCredentials: true }
      );
      setStep(2);
      setSuccess(`OTP sent to ${email}`);
      setOtpTimer(300); // 5 minutes
      // Start timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Modern OTP input: handle digit change
  const handleOtpBoxChange = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[idx] = val;
    setOtpDigits(newDigits);
    setOtp(newDigits.join(""));
    // Auto-focus next box
    if (val && idx < 5) {
      otpInputsRef.current[idx + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleOtpBoxKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      otpInputsRef.current[idx - 1]?.focus();
    }
  };

  // Paste support
  const handleOtpBoxPaste = (e) => {
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (paste.length) {
      const arr = paste.split("");
      while (arr.length < 6) arr.push("");
      setOtpDigits(arr);
      setOtp(arr.join(""));
      // Focus last filled
      const lastIdx = arr.findIndex((d) => d === "");
      otpInputsRef.current[lastIdx === -1 ? 5 : lastIdx]?.focus();
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/student/verify-login-otp`,
        { email, otp },
        { withCredentials: true }
      );
      setSuccess("Login successful! Redirecting...");

      // Set login time when user successfully logs in
      localStorage.setItem("studentLoginTime", Date.now().toString());

      // Update authentication state
      await checkAuthStatus();

      if (
        response.data.success &&
        response.data.student &&
        response.data.student.id
      ) {
        // Navigate to dashboard first
        navigate("/student/me");

        // Then fetch student details and show status alert after navigation
        setTimeout(async () => {
          try {
            const detailsRes = await axios.get(
              `${import.meta.env.VITE_API_URL}/student/students/me/details`,
              { withCredentials: true }
            );
            const status =
              detailsRes.data?.data?.personal?.status ||
              detailsRes.data?.personal?.status ||
              "pending";

            if (status === "approved") {
              await Swal.fire({
                icon: "success",
                title: "Congratulations!",
                text: "Your profile is approved. You have full access to the portal.",
                confirmButtonColor: "#22c55e",
              });
            } else if (status === "pending") {
              await Swal.fire({
                icon: "info",
                title: "Profile Pending",
                text: "Your profile is under review. Please wait for approval.",
                confirmButtonColor: "#f59e42",
              });
            } else if (status === "declined") {
              await Swal.fire({
                icon: "warning",
                title: "Profile Declined",
                text: "Your profile was declined. Please update the required information.",
                confirmButtonColor: "#ef4444",
              });
            }
          } catch (error) {
            console.error("Failed to fetch student status:", error);
          }
        }, 500); // 500ms delay to ensure dashboard is rendered
      } else {
        setError(
          "Login successful but unable to redirect. Please contact support."
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

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
      {/* BPIT Modern Header */}
      <header className="w-full bg-gradient-to-r from-red-50 to-red-50 backdrop-blur-sm border-b border-gray-200 shadow-xl relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Desktop Layout - Horizontal */}
          <div className="hidden sm:flex items-center justify-between">
            {/* Logo and Institution Info */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="h-20 rounded-2xl p-2 shadow-sm border border-blue-200 hover:shadow-md transition-shadow duration-200">
                  <img
                    src={bpitLogo}
                    alt="BPIT Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Institution Text */}
              <div className="border rounded-2xl border-gray-300 bg-white/50 backdrop-blur-sm p-1 pl-8 pr-44 relative border-r-4 border-r-gradient-to-b border-r-blue-600 shadow-sm">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-red-500 to-blue-600 rounded-r-xl"></div>
                <h1 className="text-xl md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                  <span className="bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                    Bhagwan Parshuram Institute of Technology
                  </span>
                </h1>
                <div className="flex flex-col mt-1 space-y-0.5">
                  <p className="text-sm md:text-base text-red-600 font-semibold">
                    A Unit of Bhartiya Brahmin Charitable Trust (Regd.)
                  </p>
                  <div className="text-xs md:text-sm text-gray-600 space-y-0.5">
                    <p>
                      (Approved by AICTE, Ministry of Education) • Affiliated to
                      GGSIPU, Delhi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Accreditation Logo */}
            <div className="flex-shrink-0">
              <div className="h-20 rounded-3xl border border-gray-200 shadow-md hover:shadow-md transition-shadow duration-200">
                <img
                  src="https://bpitindia.ac.in/wp-content/uploads/2024/03/Header-1-1-300x88-1.jpg"
                  alt="G20 & Accreditation Logos"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Mobile Layout - Logo and Text */}
          <div className="sm:hidden flex flex-col items-center space-y-3">
            {/* BPIT Logo */}
            <div className="flex-shrink-0">
              <div className="h-16 rounded-2xl p-2 shadow-sm border border-blue-200 hover:shadow-md transition-shadow duration-200">
                <img
                  src={bpitLogo}
                  alt="BPIT Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Institution Text */}
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                <span className="bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                  Bhagwan Parshuram Institute of Technology
                </span>
              </h1>
              <p className="text-sm text-red-600 font-semibold mt-1">
                A Unit of Bhartiya Brahmin Charitable Trust (Regd.)
              </p>
              <p className="text-xs text-gray-600 mt-1">
                (Approved by AICTE, Ministry of Education) <br />
                Affiliated to GGSIPU, Delhi
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Border */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-red-500 to-blue-600"></div>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center py-8 px-2 sm:px-4 mt-2 md:mt-6">
        <div className="w-full max-w-md mx-auto">
          {/* Enhanced Login Card */}
          <div className="relative">
            {/* Glowing Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-3xl blur-xl opacity-20 animate-pulse"></div>

            {/* Main Card */}
            <div className="relative bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 overflow-hidden">
              {/* Card Header with Gradient */}
              <div className="bg-green-50 px-8 py-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black/20 backdrop-blur-sm rounded-full mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-black mb-2">
                  Student Portal
                </h2>
                <p className="text-blue-900 font-medium">
                  Secure Student Access
                </p>
              </div>

              {/* Card Content */}
              <div className="px-8 py-8">
                {/* Enhanced Alert Messages */}
                {error && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-red-800 font-medium">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                {success && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-100 border-l-4 border-green-500 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500 mr-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-green-800 font-medium">{success}</p>
                      </div>
                      {step === 2 && otpTimer > 0 && (
                        <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded-full">
                          {Math.floor(otpTimer / 60)}:
                          {(otpTimer % 60).toString().padStart(2, "0")}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Enhanced Info Box */}
                <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-blue-100 border border-green-200 rounded-xl">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-600 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-green-800 text-sm font-medium">
                        Please use your registered student email address. Check
                        spam folder if OTP doesn't arrive.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Forms */}
                {step === 1 && (
                  <form className="space-y-6" onSubmit={handleSendOtp}>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-bold text-gray-700 mb-3"
                      >
                        Student Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/80 text-gray-900 placeholder-gray-500 font-medium"
                          placeholder="your.email@example.com"
                          disabled={loading}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        💡 <strong>Tip:</strong> You can login with either your
                        personal email or Microsoft email (if registered in your
                        SAR profile)
                      </p>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative cursor-pointer overflow-hidden bg-green-100 hover:bg-green-300 text-black font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
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
                            Sending OTP...
                          </div>
                        ) : (
                          "Send OTP Code"
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <form className="space-y-8" onSubmit={handleVerifyOtp}>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-4 text-center">
                        Enter 6-Digit Verification Code
                      </label>
                      <div
                        className="flex gap-3 justify-center"
                        onPaste={handleOtpBoxPaste}
                      >
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (otpInputsRef.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className={`w-12 h-14 text-center text-2xl font-black border-2 rounded-xl shadow-sm focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 ${
                              digit
                                ? "border-green-500 bg-green-50 text-green-600"
                                : "border-gray-300 bg-white text-gray-900"
                            }`}
                            value={digit}
                            onChange={(e) =>
                              handleOtpBoxChange(idx, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpBoxKeyDown(idx, e)}
                            disabled={otpTimer === 0}
                          />
                        ))}
                      </div>

                      <p className="mt-4 text-xs text-gray-600 text-center">
                        Check your email for the verification code
                      </p>

                      {otpTimer === 0 && (
                        <button
                          type="button"
                          className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-green-100 hover:to-green-200 text-gray-700 hover:text-green-700 font-bold rounded-xl transition-all duration-200"
                          onClick={handleSendOtp}
                          disabled={loading}
                        >
                          {loading ? "Resending..." : "Resend OTP"}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setOtpDigits(["", "", "", "", "", ""]);
                          setOtp("");
                        }}
                        className="flex cursor-pointer items-center text-sm font-bold text-green-600 hover:text-green-800 transition-colors duration-200"
                        disabled={loading}
                      >
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                          />
                        </svg>
                        Change Email
                      </button>

                      <button
                        type="submit"
                        disabled={loading || otp.length !== 6 || otpTimer === 0}
                        className="bg-green-200 hover:bg-green-300 text-black font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? "Verifying..." : "Access Portal"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        New student?{" "}
                        <a
                          href="/registration/student"
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          Create account
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Home Navigation Button */}
      <button
        onClick={async () => {
          const result = await Swal.fire({
            title: "Go to Homepage?",
            text: "Are you sure you want to leave this page?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            reverseButtons: true,
          });
          if (result.isConfirmed) {
            window.location.href = "/";
          }
        }}
        className="fixed bottom-6 cursor-pointer right-24 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
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

export default StudentLogin;
