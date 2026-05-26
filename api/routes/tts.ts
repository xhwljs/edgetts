import express, { type Request, type Response } from 'express'
import { getVoices, tts } from 'edge-tts'

const router = express.Router()

interface Voice {
  Name: string
  ShortName: string
  Gender: string
  Locale: string
}

// 获取发音人列表
router.get('/voices', async (req: Request, res: Response) => {
  try {
    const voices = await getVoices()
    res.json(voices)
  } catch (error) {
    console.error('Error getting voices:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get voices'
    })
  }
})

// 生成音频
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { text, voice, rate = '+0%', volume = '+0%', pitch = '+0Hz' } = req.body

    if (!text || !voice) {
      return res.status(400).json({
        success: false,
        error: 'Text and voice are required'
      })
    }

    console.log('Generating audio for:', voice)
    const audioBuffer = await tts(text, {
      voice,
      rate,
      volume,
      pitch
    })

    console.log('Audio generated, size:', audioBuffer.length)
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', Buffer.byteLength(audioBuffer))
    res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"')
    res.send(audioBuffer)
  } catch (error) {
    console.error('Error generating audio:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate audio'
    })
  }
})

export default router
