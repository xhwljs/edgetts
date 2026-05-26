
import { useState, useEffect, useRef } from 'react'
import { Mic, Download, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react'

interface Voice {
  Name: string
  ShortName: string
  Gender: string
  Locale: string
}

export default function Home() {
  const [text, setText] = useState('')
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [rate, setRate] = useState(0)
  const [volume, setVolume] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingVoices, setLoadingVoices] = useState(true)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 获取发音人列表
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/voices')
        const data = await response.json()
        setVoices(data)
        if (data.length > 0) {
          setSelectedVoice(data[0].ShortName)
        }
      } catch (error) {
        console.error('Failed to fetch voices:', error)
      } finally {
        setLoadingVoices(false)
      }
    }
    fetchVoices()
  }, [])

  // 生成音频
  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) return

    setLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: selectedVoice,
          rate: rate >= 0 ? `+${rate}%` : `${rate}%`,
          volume: volume >= 0 ? `+${volume}%` : `${volume}%`,
          pitch: `${pitch}Hz`,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate audio')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
    } catch (error) {
      console.error('Failed to generate audio:', error)
      alert('生成音频失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 下载音频
  const handleDownload = () => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = 'audio.mp3'
    a.click()
  }

  // 播放/暂停
  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // 按语言分组发音人
  const groupedVoices = voices.reduce((acc, voice) => {
    const lang = voice.Locale.split('-')[0]
    if (!acc[lang]) acc[lang] = []
    acc[lang].push(voice)
    return acc
  }, {} as Record<string, Voice[]>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Mic className="w-10 h-10 text-blue-600" />
            EdgeTTS 音频制作工具
          </h1>
          <p className="text-gray-600">简单易用的在线语音合成</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* 文本输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
            <textarea
              className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="请输入要转换为语音的文本..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {text.length} 字符
            </div>
          </div>

          {/* 发音人选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择发音人</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={loadingVoices}
            >
              {loadingVoices ? (
                <option>加载中...</option>
              ) : (
                Object.entries(groupedVoices).map(([lang, langVoices]) => (
                  <optgroup key={lang} label={lang}>
                    {langVoices.map((voice) => (
                      <option key={voice.ShortName} value={voice.ShortName}>
                        {voice.Name} ({voice.Gender})
                      </option>
                    ))}
                  </optgroup>
                ))
              )}
            </select>
          </div>

          {/* 参数调节 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                语速: {rate >= 0 ? `+${rate}%` : `${rate}%`}
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                音量: {volume >= 0 ? `+${volume}%` : `${volume}%`}
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                音调: {pitch}Hz
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={loading || !text.trim() || !selectedVoice}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" />
                生成音频
              </>
            )}
          </button>

          {/* 音频播放器 */}
          {audioUrl && (
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                <div className="flex-1">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full"
                    controls
                  />
                </div>
                <button
                  onClick={handleDownload}
                  className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center"
                >
                  <Download className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 页脚 */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          使用 EdgeTTS 技术
        </div>
      </div>
    </div>
  )
}
