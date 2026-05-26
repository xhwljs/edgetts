import express from 'express';
import cors from 'cors';
import { synthesizeSpeech, getVoices } from './tts-service.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/voices', async (req, res) => {
  try {
    const voices = await getVoices();
    res.json({ voices });
  } catch (error) {
    console.error('获取语音列表失败:', error);
    res.status(500).json({ error: '获取语音列表失败', code: 'API_ERROR' });
  }
});

app.post('/api/tts', async (req, res) => {
  const { text, voice, rate, pitch, volume } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: '文本不能为空', code: 'TEXT_EMPTY' });
  }

  if (text.length > 10000) {
    return res.status(400).json({ error: '文本过长，请控制在10000字符以内', code: 'TEXT_TOO_LONG' });
  }

  if (!voice) {
    return res.status(400).json({ error: '请选择语音', code: 'VOICE_NOT_FOUND' });
  }

  try {
    const audioBuffer = await synthesizeSpeech(text, { voice, rate, pitch, volume });
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="output.mp3"');
    res.send(audioBuffer);
  } catch (error) {
    console.error('语音合成失败:', error);
    res.status(500).json({ error: '语音合成失败', code: 'API_ERROR' });
  }
});

app.listen(PORT, () => {
  console.log(`Edge TTS API服务运行在 http://localhost:${PORT}`);
  console.log('按 Ctrl+C 停止服务');
});
