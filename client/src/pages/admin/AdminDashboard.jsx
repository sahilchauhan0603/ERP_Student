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
import Swal from "sweetalert2";

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
  const [batchStats, setBatchStats] = useState([]);
  const [branchStats, setBranchStats] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    fetchStats();
    fetchBatchStats();
    fetchBranchStats();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchBranchStats(selectedBatch);
    }
  }, [selectedBatch]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/stats`, {
        withCredentials: true,
      });
      setStats(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setStats({ total: 0, pending: 0, approved: 0, declined: 0 });
      Swal.fire({
        icon: "error",
        title: "Failed to load stats",
        text: "Could not fetch dashboard statistics. Please try again later.",
        confirmButtonColor: "#5048E5",
      });
    }
    setLoading(false);
  };

  const fetchBatchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/batch-stats`, {
        withCredentials: true,
      });
      setBatchStats(res.data);
      // Set default selected batch to the most recent one
      if (res.data.length > 0 && !selectedBatch) {
        setSelectedBatch(res.data[0].batch_year);
      }
    } catch (err) {
      console.error("Failed to fetch batch stats:", err);
      setBatchStats([]);
    }
  };

  const fetchBranchStats = async (batchYear = '') => {
    try {
      const url = batchYear 
        ? `${API_URL}/admin/branch-stats?batchYear=${batchYear}`
        : `${API_URL}/admin/branch-stats`;
      
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setBranchStats(res.data);
    } catch (err) {
      console.error("Failed to fetch branch stats:", err);
      setBranchStats([]);
    }
  };

  const calculatePercentageChange = (current, previous = current * 0.975) => {
    if (previous === 0) return "+0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  const statsConfig = [
    {
      key: "total",
      title: "Total Students",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      ),
      color: "blue",
      change: calculatePercentageChange(stats.total),
    },
    {
      key: "pending",
      title: "Pending",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      color: "amber",
      change: calculatePercentageChange(stats.pending),
    },
    {
      key: "approved",
      title: "Approved",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      color: "teal",
      change: calculatePercentageChange(stats.approved),
    },
    {
      key: "declined",
      title: "Declined",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      ),
      color: "red",
      change: calculatePercentageChange(stats.declined),
    },
  ];

  const pieData = {
    labels: ["Pending", "Approved", "Declined"],
    datasets: [
      {
        data: [stats.pending, stats.approved, stats.declined],
        backgroundColor: ["#FFB020", "#14B8A6", "#D14343"],
        hoverBackgroundColor: ["#FFC154", "#2DD4BF", "#E56969"],
        borderWidth: 0,
        hoverOffset: 8,
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
        borderSkipped: false,
      },
    ],
  };

  // Batch Statistics Pie Chart
  const batchPieData = {
    labels: batchStats.map(item => `Batch ${item.batch_year}`),
    datasets: [
      {
        data: batchStats.map(item => item.student_count),
        backgroundColor: [
          "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", 
          "#EF4444", "#6366F1", "#EC4899", "#84CC16"
        ],
        hoverBackgroundColor: [
          "#A78BFA", "#22D3EE", "#34D399", "#FBBF24", 
          "#F87171", "#818CF8", "#F472B6", "#A3E635"
        ],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  // Function to shorten branch names for better display
  const shortenBranchName = (branch) => {
    const branchMap = {
      'B.Tech Computer Science Engineering (CSE)': 'CSE',
      'B.Tech Electronics and Communication Engineering (ECE)': 'ECE',
      'B.Tech Electrical and Electronics Engineering (EEE)': 'EEE',
      'B.Tech Information Technology Engineering (IT)': 'IT',
      'B.Tech Artificial Intelligence and Data Science Engineering (AI-DS)': 'AI-DS',
      'B.Tech Computer Science Engineering with specialization in Data Science (CSE-DS)': 'CSE-DS',
      'LE-B.Tech Computer Science Engineering (CSE)': 'LE-CSE',
      'LE-B.Tech Information Technology Engineering (IT)': 'LE-IT',
      'LE-B.Tech Electronics and Communication Engineering (ECE)': 'LE-ECE',
      'LE-B.Tech Electrical and Electronics Engineering (EEE)': 'LE-EEE',
      'BBA': 'BBA',
      'MBA': 'MBA',
    };
    return branchMap[branch] || branch;
  };

  // Branch Statistics Pie Chart
  const branchPieData = {
    labels: branchStats.map(item => shortenBranchName(item.branch)),
    datasets: [
      {
        data: branchStats.map(item => item.student_count),
        backgroundColor: [
          "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
          "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
        ],
        hoverBackgroundColor: [
          "#60A5FA", "#F87171", "#34D399", "#FBBF24",
          "#A78BFA", "#F472B6", "#22D3EE", "#A3E635"
        ],
        borderWidth: 0,
        hoverOffset: 10,
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
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1F2937",
        bodyColor: "#4B5563",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        boxPadding: 6,
      },
    },
    maintainAspectRatio: false,
  };

  const quickGuideItems = [
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      title: "Review Applications",
      description: "Check the Pending Applications section to review and approve/decline new student submissions",
      color: "blue",
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      ),
      title: "Monitor Statistics",
      description: "Use the charts above to track application trends and status distributions in real-time",
      color: "purple",
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
      ),
      title: "Manage Workflow",
      description: "Define application stages, automate status updates, and streamline the review process",
      color: "green",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: "bg-blue-50", text: "text-blue-600", hover: "hover:text-blue-800" },
      amber: { bg: "bg-amber-50", text: "text-amber-600", hover: "hover:text-amber-800" },
      teal: { bg: "bg-teal-50", text: "text-teal-600", hover: "hover:text-teal-800" },
      red: { bg: "bg-red-50", text: "text-red-600", hover: "hover:text-red-800" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", hover: "hover:text-purple-800" },
      green: { bg: "bg-green-50", text: "text-green-600", hover: "hover:text-green-800" },
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
              Your Central Hub for Student Insights & Activity
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-500">
                Welcome back! Here's what's happening today.
              </p>
              {lastUpdated && (
                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                  Updated {lastUpdated}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={fetchStats}
            className="mt-4 cursor-pointer sm:mt-0 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsConfig.map((stat) => {
            const colorClasses = getColorClasses(stat.color);
            return (
              <div
                key={stat.key}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {stats[stat.key].toLocaleString()}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses.bg} group-hover:scale-110 transition-transform duration-200`}>
                    <svg className={`w-6 h-6 ${colorClasses.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {stat.icon}
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`text-sm font-medium ${
                    stat.change.startsWith("+") 
                      ? stat.key === "declined" ? "text-red-600" : "text-green-600"
                      : "text-red-600"
                  }`}>
                    {stat.change} from last week
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Status Distribution
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Real-time data
              </div>
            </div>
            <div className="h-80">
              <Pie
                data={pieData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
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
                  cutout: "50%",
                }}
              />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Student Statistics
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Current overview
              </div>
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
                        color: "rgba(0, 0, 0, 0.05)",
                      },
                      ticks: {
                        precision: 0,
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Batch and Branch Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Batch-wise Statistics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Batch Distribution
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                By Year
              </div>
            </div>
            <div className="h-80">
              {batchStats.length > 0 ? (
                <Pie
                  data={batchPieData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const label = context.label || "";
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} students (${percentage}%)`;
                          },
                        },
                      },
                      legend: {
                        position: "bottom",
                        labels: {
                          padding: 15,
                          usePointStyle: true,
                          font: {
                            size: 11,
                            weight: '500'
                          },
                          boxWidth: 12,
                          boxHeight: 12,
                          generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                              return data.labels.map((label, index) => {
                                const value = data.datasets[0].data[index];
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return {
                                  text: `${label} (${percentage}%)`,
                                  fillStyle: data.datasets[0].backgroundColor[index],
                                  strokeStyle: data.datasets[0].backgroundColor[index],
                                  lineWidth: 0,
                                  pointStyle: 'circle',
                                  hidden: false,
                                  index: index
                                };
                              });
                            }
                            return [];
                          }
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <div>No batch data available</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Branch-wise Statistics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Branch Distribution
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                By Course
              </div>
            </div>
            
            {/* Batch Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Batch Year:
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Batches</option>
                {batchStats.map((batch) => (
                  <option key={batch.batch_year} value={batch.batch_year}>
                    Batch {batch.batch_year}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-64">
              {branchStats.length > 0 ? (
                <Pie
                  data={branchPieData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const shortLabel = context.label || "";
                            const originalBranch = branchStats[context.dataIndex]?.branch || shortLabel;
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return [`${originalBranch}`, `${value} students (${percentage}%)`];
                          },
                        },
                      },
                      legend: {
                        position: "bottom",
                        labels: {
                          padding: 12,
                          usePointStyle: true,
                          font: {
                            size: 10,
                            weight: '500'
                          },
                          boxWidth: 12,
                          boxHeight: 12,
                          generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                              return data.labels.map((label, index) => {
                                const value = data.datasets[0].data[index];
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return {
                                  text: `${label} (${percentage}%)`,
                                  fillStyle: data.datasets[0].backgroundColor[index],
                                  strokeStyle: data.datasets[0].backgroundColor[index],
                                  lineWidth: 0,
                                  pointStyle: 'circle',
                                  hidden: false,
                                  index: index
                                };
                              });
                            }
                            return [];
                          }
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎓</div>
                    <div>No branch data available</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Guide Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Guide
            </h2>
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Admin Resources
            </div>
          </div>
          <div className="space-y-4">
            {quickGuideItems.map((item, index) => {
              const colorClasses = getColorClasses(item.color);
              return (
                <div
                  key={index}
                  className="flex items-start pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 group hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors duration-200"
                >
                  <div className={`p-2 rounded-lg ${colorClasses.bg} mr-4 group-hover:scale-105 transition-transform duration-200`}>
                    <svg className={`w-5 h-5 ${colorClasses.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}