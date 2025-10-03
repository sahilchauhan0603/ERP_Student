import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import bpitLogo from "../../assets/icons/BPIT-logo-transparent.png";
import campusBackground from "../../assets/images/BPIT.png";
import Swal from "sweetalert2";
import AIChatLauncher from "../../components/AIChatLauncher"; // adjust path as needed

const API_URL = import.meta.env.VITE_API_URL;

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputsRef = React.useRef([]);

  // ...existing code...

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
    if (localStorage.getItem("showBackToHomePopup") === "admin") {
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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/admin/send-otp`,
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
      setError(err.response?.data?.message || "Failed to send OTP.");
    }
    setLoading(false);
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

  // Handle OTP submit
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/admin/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      setSuccess("Login successful! Redirecting...");

      // Update authentication state
      await checkAuthStatus();

      // Redirect to admin dashboard
      setTimeout(() => navigate("/admin/dashboard"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP.");
    }
    setLoading(false);
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
      <header className="w-full bg-gradient-to-r from-red-50 via-white/95 to-red-50 backdrop-blur-sm border-b border-gray-200 shadow-xl relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
              <div className="hidden sm:block border rounded-2xl border-gray-300 bg-white/50 backdrop-blur-sm p-1 pl-8 pr-44 relative border-r-4 border-r-gradient-to-b border-r-blue-600 shadow-sm">
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

              {/* Mobile Institution Text */}
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  <span className="bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                    BPIT
                  </span>
                </h1>
                <p className="text-sm text-red-600 font-semibold">BBCT Unit</p>
                <p className="text-xs text-gray-600">
                  AICTE Approved • GGSIPU Affiliated
                </p>
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
        </div>

        {/* Decorative Bottom Border */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-red-500 to-blue-600"></div>
      </header>

      <div className="flex-1 flex flex-col justify-center items-center py-8 px-2 sm:px-4 mt-2 md:mt-6">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-gradient-to-br from-white via-blue-50 to-red-50 p-1 rounded-2xl shadow-lg">
            <div className="bg-white py-8 px-6 shadow-lg rounded-2xl border-2 border-blue-200/40 relative">
              <div className="flex flex-col items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-blue-600 mb-2"
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
                <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-1">
                  Admin Portal Login
                </h2>
                <p className="text-sm text-blue-700">
                  Secure access for administrators
                </p>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center justify-between">
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {success}
                  </span>
                  {step === 2 && otpTimer > 0 && (
                    <span className="ml-2 text-xs font-semibold text-blue-700">
                      OTP valid for {Math.floor(otpTimer / 60)}:
                      {(otpTimer % 60).toString().padStart(2, "0")} min
                    </span>
                  )}
                  {step === 2 && otpTimer === 0 && (
                    <span className="ml-2 text-xs font-semibold text-red-600">
                      OTP expired
                    </span>
                  )}
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200 flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-blue-800 text-sm">
                  Please use your registered admin email address. If you don't
                  receive the OTP, check your spam folder or contact support.
                </span>
              </div>

              {step === 1 && (
                <form className="space-y-6" onSubmit={handleEmailSubmit}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Admin Email address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                        placeholder="admin@email.com"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex justify-center cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        loading ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? (
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
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form className="space-y-6" onSubmit={handleOtpSubmit}>
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Enter 6-digit OTP
                    </label>
                    <div
                      className="mt-1 flex gap-2 justify-center"
                      onPaste={handleOtpBoxPaste}
                    >
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputsRef.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          pattern="[0-9]"
                          autoComplete="one-time-code"
                          className={`w-10 h-12 text-center text-xl font-bold border-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            digit
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 bg-white"
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
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Check your email for the OTP. It may take a few minutes to
                      arrive.
                    </p>
                    {otpTimer === 0 && (
                      <button
                        type="button"
                        className={`mt-2 w-full py-2 px-4 rounded-md font-semibold transition ${
                          loading
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
                        }`}
                        onClick={handleEmailSubmit}
                        disabled={loading}
                      >
                        {loading ? "Sending OTP..." : "Resend OTP"}
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
                      className="text-sm cursor-pointer font-medium text-blue-600 hover:text-blue-500 flex items-center"
                      disabled={loading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
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
                      className={`ml-3 inline-flex justify-center py-2 cursor-pointer px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        loading || otp.length !== 6 || otpTimer === 0
                          ? "opacity-75 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {loading ? "Verifying..." : "Login"}
                    </button>
                  </div>
                </form>
              )}
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
        className="fixed cursor-pointer bottom-6 right-24 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
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

export default AdminLogin;
