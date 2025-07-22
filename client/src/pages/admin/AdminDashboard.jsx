import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    declined: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/stats`, { withCredentials: true });
      setStats(res.data);
    } catch {
      setStats({ total: 0, pending: 0, approved: 0, declined: 0 });
    }
    setLoading(false);
  };

  const pieData = {
    labels: ["Pending", "Approved", "Declined"],
    datasets: [
      {
        data: [stats.pending, stats.approved, stats.declined],
        backgroundColor: ["#FFB020", "#14B8A6", "#D14343"],
        hoverBackgroundColor: ["#FFC154", "#2DD4BF", "#E56969"],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: ["Total", "Pending", "Approved", "Declined"],
    datasets: [
      {
        label: "Students",
        data: [stats.total, stats.pending, stats.approved, stats.declined],
        backgroundColor: ["#5048E5", "#FFB020", "#14B8A6", "#D14343"],
        hoverBackgroundColor: ["#6B63FF", "#FFC154", "#2DD4BF", "#E56969"],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "Inter, sans-serif",
            size: 14,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-2">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Students
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.total}
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-600 text-sm font-medium">
                    +2.5% from last week
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.pending}
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50">
                    <svg
                      className="w-6 h-6 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-amber-600 text-sm font-medium">
                    +1.2% from last week
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Approved
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.approved}
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg bg-teal-50">
                    <svg
                      className="w-6 h-6 text-teal-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-600 text-sm font-medium">
                    +4.3% from last week
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Declined
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.declined}
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-red-600 text-sm font-medium">
                    -0.8% from last week
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Status Distribution
                  </h2>
                  {/* <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View Details
                  </button> */}
                </div>
                <div className="h-80">
                  <Pie
                    data={pieData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              const label = context.label || "";
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce(
                                (a, b) => a + b,
                                0
                              );
                              const percentage = Math.round(
                                (value / total) * 100
                              );
                              return `${label}: ${value} (${percentage}%)`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Student Statistics
                  </h2>
                  {/* <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View Details
                  </button> */}
                </div>
                <div className="h-80">
                  <Bar
                    data={barData}
                    options={{
                      ...chartOptions,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            drawBorder: false,
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Admin Instructions Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Guide
                </h2>
                {/* <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View Full Documentation
                </button> */}
              </div>
              <div className="space-y-4">
                <div className="flex items-start pb-4 border-b border-gray-100">
                  <div className="p-2 bg-blue-50 rounded-lg mr-4">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Review Applications
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Check the Pending Applications section to review and
                      approve/decline new student submissions
                    </p>
                  </div>
                </div>

                <div className="flex items-start pb-4 border-b border-gray-100">
                  <div className="p-2 bg-purple-50 rounded-lg mr-4">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Monitor Statistics
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Use the charts above to track application trends and
                      status distributions
                    </p>
                  </div>
                </div>

                <div className="flex items-start pb-4">
                  <div className="p-2 bg-green-50 rounded-lg mr-4">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      System Settings
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure application deadlines, requirements, and other
                      system parameters in Settings
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
