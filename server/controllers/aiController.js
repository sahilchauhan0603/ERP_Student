const { GoogleGenerativeAI } = require("@google/generative-ai");

// Comprehensive ERP Portal Knowledge Base
const ERP_CONTEXT = `
# COLLEGE ERP PORTAL KNOWLEDGE BASE

## SYSTEM OVERVIEW
This is a comprehensive College ERP (Enterprise Resource Planning) portal for student registration and management.

### CORE ENTITIES
- **Students**: Register, submit documents, track application status
- **Admins**: Review applications, approve/decline students, manage portal
- **AI Assistant**: Automated student profile review and assistance

## USER ROLES & AUTHENTICATION

### STUDENT ROLE
- **Registration Process**: Multi-step form (6 steps)
- **Login**: OTP-based authentication via email
- **Dashboard**: View profile, application status, download documents
- **Profile Management**: Update personal information when in declined status

### ADMIN ROLE  
- **Login**: OTP-based authentication via authorized admin emails
- **Dashboard**: Statistics, batch analysis, student management
- **Student Management**: View, approve, decline, search, filter students
- **AI Integration**: Use AI for automated student profile review

## STUDENT REGISTRATION PROCESS (6 STEPS)

### STEP 1: Instructions
- Welcome page with registration guidelines
- Course selection information
- Document requirements overview

### STEP 2: Personal Information
- **Basic Details**: firstName, middleName, lastName, email, mobile, dob, placeOfBirth
- **Identity**: gender, category, subCategory, region
- **Addresses**: currentAddress, permanentAddress (with copy feature)
- **Academic Info**: course, examRoll, examRank, abcId
- **Additional**: feeReimbursement, antiRaggingRef

### STEP 3: Academic Information
- **Class X**: institute, board, year, aggregate%, PCM%, diploma/polytechnic status
- **Class XII**: institute, board, year, aggregate%, PCM%
- **Other Qualifications**: institute, board, year, aggregate%, PCM% (optional)
- **Achievements**: academicAchievements, coCurricularAchievements (JSON arrays)

### STEP 4: Parent Details
- **Father**: name, qualification, occupation, email, mobile, telephoneSTD, telephone, officeAddress
- **Mother**: name, qualification, occupation, email, mobile, telephoneSTD, telephone, officeAddress
- **Family**: familyIncome (dropdown: 0-1L, 1-3L, 3-5L, 5-7L, 7-10L, 10L+)

### STEP 5: Document Upload
**Required Documents**: photo, ipuRegistration, allotmentLetter, examAdmitCard, examScoreCard, marksheet10, passing10, marksheet12, passing12, aadhar, characterCertificate, medicalCertificate, migrationCertificate, categoryCertificate
**Optional Documents**: specialCategoryCertificate, academicFeeReceipt, collegeFeeReceipt, parentSignature

### STEP 6: Review & Submit
- Complete profile review
- Email confirmation after successful submission
- Application tracking begins

## STUDENT STATUS SYSTEM

### STATUS TYPES
- **PENDING**: Newly submitted, awaiting review
- **APPROVED**: Application accepted, student can access full dashboard
- **DECLINED**: Application rejected, specific fields marked for correction

### DECLINED FIELDS SYSTEM
- When declined, specific fields are marked as problematic
- Students can see red-highlighted fields that need correction
- Students can update declined fields and resubmit
- Field mapping system for precise error indication

## ADMIN DASHBOARD FEATURES

### STATISTICS & ANALYTICS
- **Student Stats**: Total, pending, approved, declined counts
- **Batch Analytics**: Year-wise student distribution
- **Branch Analytics**: Course-wise student distribution
- **Real-time Updates**: Live data refresh

### STUDENT MANAGEMENT
- **View All Students**: Comprehensive table with sorting/filtering
- **Status-based Filtering**: Separate views for pending/approved/declined
- **Search Functionality**: By name, email, ID, course, gender
- **Detailed Student Profiles**: Complete information modal
- **Bulk Operations**: Mass approval/decline capabilities

### REVIEW SYSTEM
- **Manual Review**: Field-by-field verification with approve/decline buttons
- **AI Review**: Automated profile analysis using Google Gemini AI
- **Verification Progress**: Track review completion percentage
- **Section-wise Review**: Personal, Academic, Parent, Documents sections

## AI FEATURES

### AI STUDENT REVIEW
- **Automated Analysis**: Reviews student profiles for completeness and validity
- **Smart Validation**: Checks data consistency and quality
- **Recommendation Engine**: Suggests approve/decline with reasoning
- **Field-specific Feedback**: Identifies problematic fields with detailed explanations

### AI CHAT ASSISTANT
- **Student Support**: Answers registration queries
- **Process Guidance**: Step-by-step help
- **Status Inquiries**: Application status information
- **Document Help**: Upload and requirement assistance

## TECHNICAL ARCHITECTURE

### BACKEND STACK
- **Framework**: Node.js with Express.js
- **Database**: MySQL with connection pooling
- **Authentication**: JWT tokens with HTTP-only cookies
- **File Storage**: Cloudinary for document uploads
- **Email Service**: SendGrid for notifications
- **AI Integration**: Google Gemini 2.5 Flash model
- **Security**: Rate limiting, input validation, role-based access

### FRONTEND STACK
- **Framework**: React.js with hooks
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context for authentication
- **Routing**: React Router for navigation
- **Forms**: Multi-step form with validation
- **UI Components**: Custom modals, progress bars, tabs
- **Icons**: React Icons (Feather Icons)

### DATABASE SCHEMA
**Students Table**: Comprehensive student data with 80+ fields
- Personal information (15 fields)
- Academic records (18 fields)  
- Parent details (17 fields)
- Document URLs (18 fields)
- System fields (status, timestamps, declinedFields, batch)

## KEY FEATURES

### REGISTRATION FEATURES
- **Multi-step Form**: 6-step guided registration
- **Real-time Validation**: Field-level error checking
- **Address Copy Feature**: Permanent same as current address
- **File Upload**: Drag-drop with format validation
- **Progress Tracking**: Visual progress indicator
- **Auto-save**: Form data persistence

### ADMIN FEATURES
- **Student Verification**: Field-by-field review system
- **Status Management**: Approve/decline with reasons
- **Search & Filter**: Advanced student discovery
- **Batch Operations**: Bulk status updates
- **Analytics Dashboard**: Comprehensive statistics
- **AI Integration**: Automated review capabilities

### STUDENT DASHBOARD
- **Profile Overview**: Complete information display
- **Status Tracking**: Real-time application status
- **Document Management**: View/download uploaded files
- **Update Capability**: Edit declined fields
- **Progress Visualization**: Application completion status

### SECURITY FEATURES
- **OTP Authentication**: Email-based secure login
- **Role-based Access**: Student/Admin permission system
- **Rate Limiting**: API abuse prevention
- **Data Validation**: Input sanitization and validation
- **Secure File Upload**: Type and size restrictions
- **Session Management**: Secure token handling

## COMMON USER WORKFLOWS

### STUDENT REGISTRATION WORKFLOW
1. Access registration portal
2. Complete 6-step form (Personal → Academic → Parent → Documents → Review → Submit)
3. Receive email confirmation
4. Wait for admin review
5. Check status on dashboard
6. If declined: Update flagged fields and resubmit
7. If approved: Access full student portal

### ADMIN REVIEW WORKFLOW
1. Login to admin portal
2. View pending applications
3. Select student for review
4. Examine all sections (Personal, Academic, Parent, Documents)
5. Use manual review or AI review
6. Approve/decline with field-specific feedback
7. Student receives status notification

### AI REVIEW PROCESS
1. Admin clicks "AI Review" button
2. System sends student data to Google Gemini
3. AI analyzes profile comprehensively
4. Returns recommendation with specific field feedback
5. Admin can accept or modify AI decision
6. Decision applied to student record

## BUSINESS RULES

### DATA VALIDATION RULES
- **Email**: Must be unique and valid format
- **Phone**: 10-digit numbers only
- **Dates**: Proper format validation
- **Files**: Specific formats (PDF/JPG/PNG), size limits
- **Academic**: Percentage validations, year constraints
- **Addresses**: Required field completeness

### STATUS TRANSITION RULES
- **Pending → Approved**: All fields verified satisfactory
- **Pending → Declined**: Issues found, specific fields marked
- **Declined → Pending**: Student updates declined fields
- **Approved**: Final status, no further changes allowed

This ERP portal serves educational institutions for efficient student admission management with AI-powered automation and comprehensive tracking capabilities.
`;

// Enhanced prompt builder with ERP context
function buildPromptFromMessages(messages) {
  const instruction = `You are an intelligent AI assistant specialized in helping users with a College ERP Portal system. You have comprehensive knowledge about student registration, admin management, and all portal features.

INSTRUCTIONS:
- Answer questions specifically about the ERP portal using the knowledge base provided
- Be concise but thorough - provide step-by-step guidance when needed
- Use clean Markdown formatting: bullet points, numbered lists, **bold** for emphasis
- If asked about features not in the ERP system, politely clarify what the system actually offers
- For technical issues, provide specific troubleshooting steps
- Always be helpful and professional

RESPONSE FORMAT:
- Keep answers focused and actionable
- Use bullet points for lists of steps or features
- Include relevant sections/field names when discussing specific parts of the system
- Suggest next steps or related actions when appropriate`;

  const context = `\n\nERP SYSTEM KNOWLEDGE BASE:\n${ERP_CONTEXT}\n\n`;

  const history = messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  return `${instruction}${context}CONVERSATION HISTORY:\n${history}\n\nAssistant:`;
}

// Enhanced chat function with ERP-specific context
module.exports.chatWithGemini = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ success: false, message: "GOOGLE_API_KEY is not configured" });
    }

    const { messages, userRole, studentData } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "messages array is required" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Enhanced prompt with user context
    let prompt = buildPromptFromMessages(messages);

    // Add user-specific context
    if (userRole) {
      prompt += `\n\nUSER CONTEXT: Current user role is "${userRole}".`;
    }

    if (studentData && userRole === "student") {
      prompt += `\nSTUDENT INFO: Status: ${studentData.status || "unknown"}`;
      if (studentData.declinedFields && studentData.declinedFields.length > 0) {
        prompt += `, Declined fields: ${studentData.declinedFields.join(", ")}`;
      }
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const responseText =
      result?.response?.text?.() ||
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I couldn't generate a response. Please try rephrasing your question.";

    return res.json({ success: true, reply: responseText });
  } catch (err) {
    console.error("Gemini chat error:", err);

    // Provide more specific error messages
    let errorMessage = "Failed to get response from AI assistant";
    if (err.message?.includes("API_KEY")) {
      errorMessage = "AI service configuration error";
    } else if (err.message?.includes("quota")) {
      errorMessage = "AI service temporarily unavailable due to high usage";
    } else if (err.message?.includes("safety")) {
      errorMessage = "Unable to process request due to content policy";
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Quick help function for common ERP queries
module.exports.getQuickHelp = async (req, res) => {
  try {
    const { category } = req.query;

    const quickHelp = {
      registration: {
        title: "Student Registration Help",
        items: [
          "**Complete all 6 steps**: Instructions → Personal → Academic → Parents → Documents → Review",
          "**Upload documents** in PDF, JPG, or PNG format (max 5MB each)",
          "**Use permanent address** same as current address feature if applicable",
          "**Save progress automatically** - you can return anytime",
          "**Check email** for confirmation after successful submission",
        ],
      },
      documents: {
        title: "Document Upload Guide",
        items: [
          "**Required**: Photo, IPU Registration, Allotment Letter, Admit Card, Score Card",
          "**Academic**: Class X & XII marksheets and passing certificates",
          "**Identity**: Aadhar card, Character certificate, Medical certificate",
          "**Category**: Category certificate (if applicable)",
          "**Optional**: Migration certificate, special certificates, fee receipts",
        ],
      },
      status: {
        title: "Application Status Information",
        items: [
          "**Pending**: Under review by admin team",
          "**Approved**: Application accepted, full access granted",
          "**Declined**: Issues found, check red-highlighted fields",
          "**Dashboard**: Login to dashboard to check current status",
          "**Updates**: Update declined fields and resubmit if needed",
        ],
      },
      admin: {
        title: "Admin Portal Features",
        items: [
          "**View Students**: Filter by status (Pending/Approved/Declined)",
          "**Search Function**: Find students by name, email, course, or ID",
          "**Manual Review**: Review applications section by section",
          "**AI Review**: Use automated analysis for quick decisions",
          "**Decision Making**: Approve/decline with specific field feedback",
        ],
      },
    };

    const help = quickHelp[category] || {
      title: "General Help",
      items: [
        "**Ask Questions**: Specific questions about registration, documents, or status",
        "**Search Feature**: Use the search feature to find information quickly",
        "**Technical Support**: Contact support if you encounter technical issues",
        "**FAQ Section**: Check the FAQ section for common questions",
      ],
    };

    return res.json({ success: true, help });
  } catch (err) {
    console.error("Quick help error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get help information" });
  }
};

// No streaming endpoint for now (deployment compatibility)
