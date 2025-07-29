import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FiHome } from "react-icons/fi";
import bpitLogo from "../../assets/icons/BPIT-logo-transparent.png";
import campusBackground from "../../assets/images/BPIT.png";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Removed showInfoButton state since we no longer need the popup functionality

  useEffect(() => {
    // Removed the SweetAlert popup since we now have persistent home navigation
    // Clean up any leftover localStorage items
    if (localStorage.getItem("showBackToHomePopup") === "student") {
      localStorage.removeItem("showBackToHomePopup");
    }
  }, []);

  // Removed handleInfoClick function since we no longer need the popup functionality

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/student/send-login-otp`,
        { email },
        { withCredentials: true }
      );
      setStep(2);
      setSuccess("OTP sent to your email. Please check your inbox.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

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
      if (
        response.data.success &&
        response.data.student &&
        response.data.student.id
      ) {
        // Fetch student details to get status
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
        } catch {}
        navigate("/student/me");
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-1">
                  Student Portal Login
                </h2>
                <p className="text-sm text-blue-700">
                  Secure access for registered students
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
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center">
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
                  Please use the exact email address you provided during
                  registration. If you don't receive the OTP, check your spam
                  folder or contact support.
                </span>
              </div>

              {step === 1 && (
                <form className="space-y-6" onSubmit={handleSendOtp}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email address
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
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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
                <form className="space-y-6" onSubmit={handleVerifyOtp}>
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Enter 6-digit OTP
                    </label>
                    <div className="mt-1">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setOtp(value.slice(0, 6));
                        }}
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm tracking-widest text-center text-lg font-semibold"
                        placeholder="••••••"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Check your email for the OTP. It may take a few minutes to
                      arrive.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
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
                      disabled={loading || otp.length !== 6}
                      className={`ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        loading || otp.length !== 6
                          ? "opacity-75 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {loading ? "Verifying..." : "Login"}
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

      {/* Persistent Home Navigation Button */}
      <button
        onClick={() => window.location.href = '/'}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
        title="Go to Homepage"
      >
        <FiHome className="w-6 h-6" />
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Go to Homepage
        </div>
      </button>
    </div>
  );
};

export default StudentLogin;
