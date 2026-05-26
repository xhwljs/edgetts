import { useState, useEffect } from 'react'
import axios from 'axios'
import TextInput from './components/TextInput'
import VoiceSelector from './components/VoiceSelector'
import ParameterControls from './components/ParameterControls'
import AudioPlayer from './components/AudioPlayer'

function App() {
  const [text, setText] = useState('')
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [rate, setRate] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [volume, setVolume] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVoices()
  }, [])

  const fetchVoices = async () => {
    try {
      const response = await axios.get('/api/voices')
      setVoices(response.data.voices)
      if (response.data.voices.length > 0) {
        setSelectedVoice(response.data.voices[0].name)
      }
    } catch (error) {
      console.error('获取语音列表失败:', error)
      setError('获取语音列表失败，请确保后端服务正在运行')
    }
  }

  const handleSynthesize = async () => {
    if (!text.trim()) {
      setError('请输入要转换的文本')
      return
    }

    if (!selectedVoice) {
      setError('请选择语音')
      return
    }

    setLoading(true)
    setError('')

    try {
      const rateStr = rate >= 0 ? `+${rate}%` : `${rate}%`
      const pitchStr = pitch >= 0 ? `+${pitch}Hz` : `${pitch}Hz`
      const volumeStr = volume >= 0 ? `+${volume}%` : `${volume}%`

      const response = await axios.post('/api/tts', {
        text: text,
        voice: selectedVoice,
        rate: rateStr,
        pitch: pitchStr,
        volume: volumeStr
      }, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
    } catch (error) {
      console.error('语音合成失败:', error)
      setError('语音合成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return

    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `tts_audio_${Date.now()}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_50%)]"></div>
      
      <div className="relative z-10">
        <header className="bg-card/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Edge TTS 音频制作工具
                </h1>
                <p className="text-sm text-gray-400">基于微软Edge高质量语音合成</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-6">
              <div className="bg-card/80 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  文本输入
                </h2>
                <TextInput value={text} onChange={setText} />
                <p className="text-xs text-gray-500 mt-2">
                  当前字符数: {text.length} / 10000
                </p>
              </div>

              <div className="bg-card/80 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  语音配置
                </h2>
                <VoiceSelector 
                  voices={voices} 
                  selectedVoice={selectedVoice} 
                  onSelect={setSelectedVoice} 
                />
                <ParameterControls
                  rate={rate}
                  pitch={pitch}
                  volume={volume}
                  onRateChange={setRate}
                  onPitchChange={setPitch}
                  onVolumeChange={setVolume}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card/80 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  音频预览
                </h2>
                <AudioPlayer audioUrl={audioUrl} />
              </div>

              <div className="bg-card/80 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  操作
                </h2>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleSynthesize}
                    disabled={loading || !text.trim()}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      loading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 hover:scale-105'
                    } text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        正在合成...
                      </span>
                    ) : (
                      '生成音频'
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={!audioUrl}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      audioUrl
                        ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105'
                        : 'bg-gray-600 cursor-not-allowed'
                    } text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载音频
                  </button>
                </div>
              </div>

              <div className="bg-card/80 backdrop-blur-md rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  使用说明
                </h2>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>1. 在左侧输入要转换的文本内容</p>
                  <p>2. 选择合适的语音和调整参数</p>
                  <p>3. 点击"生成音频"按钮开始合成</p>
                  <p>4. 预览无误后点击"下载音频"保存</p>
                  <p className="text-yellow-400 mt-3">
                    💡 提示：在Termux中运行后端服务后访问 http://localhost:5173
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center py-6 text-gray-500 text-sm">
          <p>Edge TTS Audio Tool - 免费在线文本转语音工具</p>
        </footer>
      </div>
    </div>
  )
}

export default App
