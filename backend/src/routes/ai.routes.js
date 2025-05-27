import express from 'express';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI(process.env.OPENAI_API_KEY);

router.post('/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;