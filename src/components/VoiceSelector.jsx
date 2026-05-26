function VoiceSelector({ voices, selectedVoice, onSelect }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        选择语音
      </label>
      <select
        value={selectedVoice}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full p-3 bg-background/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-gray-100"
      >
        {voices.length === 0 ? (
          <option value="">加载中...</option>
        ) : (
          voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.friendlyName}
            </option>
          ))
        )}
      </select>
    </div>
  )
}

export default VoiceSelector
