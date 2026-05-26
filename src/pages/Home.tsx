
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
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 获取发音人列表
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/voices')
        const data = await response.json()
        
        // 按语言分组，中文优先排序
        const groupedVoices = data.reduce((acc: any, voice: Voice) => {
          const lang = voice.Locale.split('-')[0]
          if (!acc[lang]) acc[lang] = []
          acc[lang].push(voice)
          return acc
        }, {})
        
        // 按语言优先级排序（中英文优先）
        const langOrder = ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'it', 'pt', 'ru']
        const sortedVoices = langOrder.flatMap(lang => groupedVoices[lang] || [])
        
        setVoices(sortedVoices)
        
        // 默认选择中文发音人
        const chineseVoice = data.find((v: Voice) => v.Locale.startsWith('zh-'))
        if (chineseVoice) {
          setSelectedVoice(chineseVoice.ShortName)
        } else if (data.length > 0) {
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
    setProgress(0)
    setProgressText('正在连接服务器...')
    
    try {
      setProgress(10)
      setProgressText('正在发送请求...')
      
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

      setProgress(30)
      setProgressText('正在生成音频...')
      
      // 获取总内容长度
      const contentLength = response.headers.get('content-length')
      const total = parseInt(contentLength || '0', 10)
      
      // 读取响应流
      const reader = response.body?.getReader()
      const chunks: Uint8Array[] = []
      let receivedLength = 0

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          chunks.push(value)
          receivedLength += value.length
          
          if (total > 0) {
            const progressPercent = 30 + Math.round((receivedLength / total) * 60)
            setProgress(progressPercent)
            setProgressText(`正在下载音频... ${Math.round((receivedLength / total) * 100)}%`)
          }
        }
      }

      setProgress(90)
      setProgressText('正在处理音频...')
      
      // 合并所有chunks
      const blob = new Blob(chunks, { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      
      setProgress(100)
      setProgressText('生成完成！')
      
      // 2秒后清除进度
      setTimeout(() => {
        setProgress(0)
        setProgressText('')
      }, 2000)
      
    } catch (error) {
      console.error('Failed to generate audio:', error)
      alert('生成音频失败，请重试')
      setProgress(0)
      setProgressText('')
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

  // 语言代码到中文名称的映射
  const langNames: Record<string, string> = {
    'zh': '中文', 'en': '英语', 'ja': '日语', 'ko': '韩语',
    'fr': '法语', 'de': '德语', 'es': '西班牙语', 'it': '意大利语',
    'pt': '葡萄牙语', 'ru': '俄语', 'ar': '阿拉伯语', 'hi': '印地语',
    'th': '泰语', 'vi': '越南语', 'id': '印尼语', 'ms': '马来语',
    'tr': '土耳其语', 'el': '希腊语', 'pl': '波兰语', 'hu': '匈牙利语',
    'cs': '捷克语', 'ro': '罗马尼亚语', 'uk': '乌克兰语', 'be': '白俄罗斯语',
    'bg': '保加利亚语', 'sr': '塞尔维亚语', 'hr': '克罗地亚语', 'sl': '斯洛文尼亚语',
    'sk': '斯洛伐克语', 'lt': '立陶宛语', 'lv': '拉脱维亚语', 'et': '爱沙尼亚语',
    'fi': '芬兰语', 'sv': '瑞典语', 'da': '丹麦语', 'no': '挪威语',
    'nn': '新挪威语', 'nb': '书面挪威语', 'is': '冰岛语', 'ga': '爱尔兰语',
    'cy': '威尔士语', 'gd': '苏格兰盖尔语', 'mt': '马耳他语', 'sq': '阿尔巴尼亚语',
    'eu': '巴斯克语', 'ca': '加泰罗尼亚语', 'gl': '加利西亚语', 'af': '南非荷兰语',
    'zu': '祖鲁语', 'xh': '科萨语', 'sw': '斯瓦希里语', 'ha': '豪萨语',
    'ig': '伊博语', 'yo': '约鲁巴语', 'am': '阿姆哈拉语', 'ps': '普什图语',
    'fa': '波斯语', 'ur': '乌尔都语', 'he': '希伯来语', 'ne': '尼泊尔语',
    'si': '僧伽罗语', 'my': '缅甸语', 'km': '高棉语', 'lo': '老挝语',
    'bn': '孟加拉语', 'pa': '旁遮普语', 'te': '泰卢固语', 'ta': '泰米尔语',
    'mr': '马拉地语', 'gu': '古吉拉特语', 'kn': '卡纳达语', 'ml': '马拉雅拉姆语',
    'or': '奥里亚语', 'tl': '他加禄语', 'fil': '菲律宾语', 'km': '高棉语',
    'uz': '乌兹别克语', 'kk': '哈萨克语', 'ky': '吉尔吉斯语', 'mn': '蒙古语',
    'ka': '格鲁吉亚语', 'hy': '亚美尼亚语', 'az': '阿塞拜疆语', 'mk': '马其顿语',
    'bs': '波斯尼亚语', 'nl': '荷兰语'
  }

  // 获取语言显示名称
  const getLangName = (lang: string) => langNames[lang] || lang

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
                  <optgroup key={lang} label={getLangName(lang)}>
                    {langVoices.map((voice) => (
                      <option key={voice.ShortName} value={voice.ShortName}>
                        {voice.Name} ({voice.Gender === 'Female' ? '女声' : voice.Gender === 'Male' ? '男声' : voice.Gender})
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

          {/* 进度条 */}
          {loading && progress > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{progressText}</span>
                <span className="text-sm font-medium text-blue-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

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
