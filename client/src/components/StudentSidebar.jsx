import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import AIChat from "./AIChat";

export default function StudentSidebar({ open = true, onToggle, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);

    const navItems = [
        { label: "Dashboard", to: "/student/me", icon: "📊" },
        { label: "SAR Booklet", to: "/student/sar", icon: "📘" },
    ];

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, logout!",
            //   background: "#0f172a",
            //   color: "#e5e7eb",
        });
        if (result.isConfirmed) {
            try {
                await logout("student");
                navigate("/login");
            } catch (e) { }
        }
    };

    return (
        <>
            <aside
                className={`${open ? "w-60" : "w-16"} fixed left-0 top-0 h-screen transition-all duration-300 bg-gradient-to-b from-neutral-950 to-neutral-900 text-white border-r border-neutral-800 shadow-2xl flex flex-col z-30`}
            >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[length:20px_20px]"></div>

                <div className="flex items-center gap-3 px-3 py-4 border-b border-white/10 bg-gradient-to-r from-neutral-950 to-neutral-900 relative z-10">
                    <button
                        onClick={() => onToggle && onToggle(!open)}
                        title={open ? "Collapse" : "Expand"}
                        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
                        className="w-9 h-9 rounded-md border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg"
                    >
                        {open ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                    {open && (
                        <div className="font-bold tracking-wide text-white/90">
                            Student Portal
                        </div>
                    )}
                </div>

                <nav className="flex flex-col p-3 flex-1 overflow-y-auto relative z-10">
                    {navItems.map((item) => {
                        const active = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                title={item.label}
                                className={`relative flex items-center gap-3 no-underline px-3 py-3 rounded-lg mb-2 transition-all duration-200 ${active
                                        ? "bg-white/10 border-l-4 border-white shadow-md"
                                        : "bg-transparent hover:bg-white/5 hover:shadow-sm"
                                    }`}
                            >
                                <span className={`text-lg w-6 text-center ${active ? "text-white drop-shadow-md" : "text-gray-300"}`}>
                                    {item.icon}
                                </span>
                                {open && (
                                    <span className={`${active ? "text-white font-semibold" : "text-gray-200/90"}`}>
                                        {item.label}
                                    </span>
                                )}
                                {active && (
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-white/70"></div>
                                )}
                            </Link>
                        );
                    })}

                    <div className="flex-1" />

                    {/* AI Chatbot Button */}
                    <button
                        onClick={() => setIsAIChatOpen(true)}
                        title="AI Assistant"
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl text-gray-200 border border-blue-600 hover:bg-white/10 hover:shadow-sm transition-all duration-200 text-left group mb-2"
                    >
                        <span className="text-lg w-6 text-center group-hover:scale-110 transition-transform">🤖</span>
                        {open && <span className="text-gray-200 group-hover:text-white">AI Assistant</span>}
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl text-gray-200 border border-red-800 hover:bg-white/10 hover:shadow-sm transition-all duration-200 text-left group"
                    >
                        <span className="text-lg w-6 text-center group-hover:scale-110 transition-transform">⎋</span>
                        {open && <span className="text-gray-200 group-hover:text-white">Logout</span>}
                    </button>
                </nav>

                {/* Subtle bottom divider */}
                <div className="h-1 bg-white/10"></div>
            </aside>

            {/* AI Chat Modal */}
            {isAIChatOpen && (
                <div className="fixed right-0 top-0 z-50 shadow-lg">
                  <AIChat onClose={() => setIsAIChatOpen(false)} />
                </div>
            )}
        </>
    );
}