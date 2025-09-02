const { GoogleGenerativeAI } = require("@google/generative-ai");

// Converts our simple {role, content} messages into a single prompt
function buildPromptFromMessages(messages) {
	const instruction =
		"You are a helpful assistant for a college ERP portal. Answer concisely and clearly using clean Markdown: short paragraphs, bullet points for steps, and numbered lists when explaining procedures. Avoid excessive verbosity. Keep most answers under 6 sentences unless the user asks for more details.";
	const history = messages
		.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
		.join("\n");
	return `${instruction}\n\n${history}\nAssistant:`;
}

module.exports.chatWithGemini = async (req, res) => {
	try {
		const apiKey = process.env.GOOGLE_API_KEY;
		if (!apiKey) {
			return res.status(500).json({ success: false, message: "GOOGLE_API_KEY is not configured" });
		}

		const { messages } = req.body || {};
		if (!Array.isArray(messages) || messages.length === 0) {
			return res.status(400).json({ success: false, message: "messages array is required" });
		}

		const genAI = new GoogleGenerativeAI(apiKey);
		// Gemini 2.5 Flash model id; fallback to a widely available flash model if needed
		const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

		// You can use multi-turn with system/user messages; for simplicity, build a single prompt
		const prompt = buildPromptFromMessages(messages);
		const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
		const responseText = result?.response?.text?.() || result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

		return res.json({ success: true, reply: responseText });
	} catch (err) {
		console.error("Gemini chat error:", err);
		return res.status(500).json({ success: false, message: "Failed to get response from Gemini" });
	}
};

// No streaming endpoint for now (deployment compatibility)


