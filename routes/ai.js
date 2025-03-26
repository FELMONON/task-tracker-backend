const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Error handling for OpenAI client initialization
if (!process.env.OPENAI_API_KEY) {
  console.error('OpenAI API key is not set in environment variables');
}

// Generate tasks based on goal and timeframe
router.post('/generate-tasks', async (req, res) => {
  try {
    const { goal, timeframe } = req.body;

    if (!goal || !timeframe) {
      return res.status(400).json({ error: 'Goal and timeframe are required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    const prompt = `Generate specific, actionable tasks to achieve the following goal: "${goal}" within the timeframe: "${timeframe}". 
    Format the response as a JSON array of objects, where each object has the following structure:
    {
      "title": "Task title",
      "description": "Detailed description of the task",
      "estimatedTime": "Estimated time to complete (e.g., '2 hours', '30 minutes')",
      "priority": "high/medium/low"
    }
    
    Make the tasks specific, measurable, and achievable. Include 3-5 tasks.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a task planning assistant that helps break down goals into specific, actionable tasks."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;
    const tasks = JSON.parse(response);

    res.json(tasks);
  } catch (error) {
    console.error('Error generating tasks:', error);
    res.status(500).json({ error: 'Failed to generate tasks' });
  }
});

module.exports = router;
