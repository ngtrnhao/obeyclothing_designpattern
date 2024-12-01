const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.chatResponse = async (req, res) => {
  try {
    console.log("Incoming POST request to /api/chat");
    
    console.log("Request body:", req.body);

    const { message, chatHistory } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return res.status(500).json({
        message: "OpenAI API key not configured",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Bạn là trợ lý AI của cửa hàng thời trang OBEY.
          Thông tin về size:
          - S: 40-60kg
          - M: 55-65kg
          - L: 63-75kg
          - XL: 70-85kg
          
          Hãy trả lời thân thiện và chuyên nghiệp về các vấn đề liên quan đến thời trang.`,
        },
        ...chatHistory.map((msg) => ({
          role: msg.isBot ? "assistant" : "user",
          content: msg.text,
        })),
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;
    console.log("AI Response:", aiResponse);

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat AI Error:", error);
    res.status(500).json({
      message: "Lỗi xử lý chat",
      error: error.message,
    });
  }
};
