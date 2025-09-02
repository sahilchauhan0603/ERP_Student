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

exports.chatWithGemini = async (req, res) => {
	try {
		const apiKey = process.env.GOOGLE_API_KEY;
		if (!apiKey) {
			return res.status(500).json({ error: "GOOGLE_API_KEY is not configured" });
		}

		const { messages } = req.body || {};
		if (!Array.isArray(messages) || messages.length === 0) {
			return res.status(400).json({ error: "messages array is required" });
		}

		const genAI = new GoogleGenerativeAI(apiKey);
		// Gemini 2.5 Flash model id; fallback to a widely available flash model if needed
		const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

		// You can use multi-turn with system/user messages; for simplicity, build a single prompt
		const prompt = buildPromptFromMessages(messages);
		const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
		const responseText = result?.response?.text() || "";

		return res.json({ reply: responseText });
	} catch (err) {
		console.error("Gemini chat error:", err);
		return res.status(500).json({ error: "Failed to get response from Gemini" });
	}
};

// Server-Sent Events streaming endpoint
exports.streamWithGemini = async (req, res) => {
	try {
		const apiKey = process.env.GOOGLE_API_KEY;
		if (!apiKey) {
			return res.status(500).json({ error: "GOOGLE_API_KEY is not configured" });
		}

		const { messages } = req.body || {};
		if (!Array.isArray(messages) || messages.length === 0) {
			return res.status(400).json({ error: "messages array is required" });
		}

		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache, no-transform');
		res.setHeader('Connection', 'keep-alive');
		res.flushHeaders?.();

		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
		const prompt = buildPromptFromMessages(messages);

		const streamResp = await model.generateContentStream({ contents: [{ role: "user", parts: [{ text: prompt }] }] });

		// Keep-alive ping every 15 seconds
		const keepAlive = setInterval(() => {
			try { res.write(`: keep-alive\n\n`); } catch {}
		}, 15000);

		for await (const chunk of streamResp.stream) {
			const text = chunk?.text?.() || "";
			if (!text) continue;
			res.write(`data: ${JSON.stringify({ text })}\n\n`);
		}

		clearInterval(keepAlive);
		res.write(`event: done\n`);
		res.write(`data: end\n\n`);
		res.end();
	} catch (err) {
		console.error('Gemini stream error:', err);
		try {
			res.write(`event: error\n`);
			res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
		} catch {}
		res.end();
	}
};


