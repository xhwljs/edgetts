function ParameterControls({ rate, pitch, volume, onRateChange, onPitchChange, onVolumeChange }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-300">语速</label>
          <span className="text-xs text-gray-400 font-mono">
            {rate >= 0 ? '+' : ''}{rate}%
          </span>
        </div>
        <input
          type="range"
          min="-50"
          max="100"
          value={rate}
          onChange={(e) => onRateChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-300">音调</label>
          <span className="text-xs text-gray-400 font-mono">
            {pitch >= 0 ? '+' : ''}{pitch}Hz
          </span>
        </div>
        <input
          type="range"
          min="-50"
          max="50"
          value={pitch}
          onChange={(e) => onPitchChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-300">音量</label>
          <span className="text-xs text-gray-400 font-mono">
            {volume >= 0 ? '+' : ''}{volume}%
          </span>
        </div>
        <input
          type="range"
          min="-50"
          max="50"
          value={volume}
          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  )
}

export default ParameterControls
