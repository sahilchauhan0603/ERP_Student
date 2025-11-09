import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  HelpCircle,
  Phone,
  Mail,
} from "lucide-react";
// import AIChatLauncher from "../../components/AIChatLauncher";

export default function Help() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I update my personal information?",
      answer:
        "Navigate to the SAR Booklet section and click the 'Edit' button next to Personal Info. Make your changes and click 'Save'.",
    },
    {
      question: "What is the SAR Booklet?",
      answer:
        "The SAR (Student Academic Record) Booklet is a comprehensive record of your academic journey, including personal details, academic achievements, and internship experiences.",
    },
    {
      question: "How can I contact support?",
      answer:
        "You can reach our support team at bpitindia@yahoo.com or call us at (011)-2757-2900 during business hours (9 AM - 5 PM, Monday to Friday).",
    },
    {
      question: "How do I report a technical issue?",
      answer:
        "Please use the AI Assistant feature to report technical issues, or email technical-bpitindia@yahoo.com with details about the problem you're experiencing.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we take data security seriously. All your personal and academic information is encrypted and stored securely following industry best practices.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 px-6">
      <div className="max-w-6xl mx-auto px-7">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-10 border border-gray-100"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Help & Support
          </h1>
          <p className="text-lg text-gray-600 font-serif">
            Find answers to common questions and get support for your Student
            Portal.
          </p>
        </motion.div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              icon: <HelpCircle className="h-7 w-7 text-blue-600" />,
              title: "FAQs",
              desc: "Find answers to frequently asked questions about using the Student Portal.",
              color: "blue",
            },
            {
              icon: <MessageCircle className="h-7 w-7 text-green-600" />,
              title: "AI Assistant",
              desc: "Get instant help from our AI assistant for any questions or issues you might have.",
              color: "green",
            },
            {
              icon: <Phone className="h-7 w-7 text-purple-600" />,
              title: "Contact Support",
              desc: "Reach out to our support team for personalized assistance with any issues.",
              color: "purple",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition"
            >
              <div
                className={`w-12 h-12 bg-${item.color}-100 rounded-full flex items-center justify-center mb-4`}
              >
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 mb-10"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="flex justify-between cursor-pointer items-center w-full px-4 py-3 text-left text-gray-800 font-medium hover:bg-gray-50"
                >
                  {faq.question}
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4 text-gray-600"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-6">
            If you couldn't find what you're looking for, our support team is
            here to help.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="border border-gray-200 rounded-xl p-5"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" /> Email Support
              </h3>
              <p className="text-gray-600 mb-2">
                Send us an email and we'll respond within 24 hours.
              </p>
              <a
                href="mailto:bpitindia@yahoo.com"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                bpitindia@yahoo.com
              </a>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="border border-gray-200 rounded-xl p-5"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                <Phone className="h-5 w-5 text-purple-600" /> Phone Support
              </h3>
              <p className="text-gray-600 mb-2">
                Call us during business hours (9 AM - 5 PM, Mon-Fri).
              </p>
              <a
                href="tel:011-2757-2900"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                (011)-2757-2900
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* <AIChatLauncher /> */}
    </div>
  );
}
