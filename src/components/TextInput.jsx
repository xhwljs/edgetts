function TextInput({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="在这里输入要转换为语音的文本..."
      className="w-full h-64 p-4 bg-background/50 border border-white/10 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-gray-100 placeholder-gray-500 custom-scrollbar"
      maxLength={10000}
    />
  )
}

export default TextInput
