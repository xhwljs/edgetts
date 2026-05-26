import edgeTTS from 'edge-tts';

const tts = new edgeTTS();

export async function synthesizeSpeech(text, config) {
  const { voice = 'zh-CN-XiaoxiaoNeural', rate = '+0%', pitch = '+0Hz', volume = '+0%' } = config;
  
  try {
    const audioData = await tts.Communicate(text, voice, {
      rate,
      pitch,
      volume
    });
    
    return audioData;
  } catch (error) {
    throw new Error(`语音合成失败: ${error.message}`);
  }
}

export async function getVoices() {
  try {
    const voices = await tts.getVoices();
    
    const voiceList = voices.map(v => ({
      name: v.Name,
      shortName: v.ShortName,
      gender: v.Gender,
      locale: v.Locale,
      friendlyName: generateFriendlyName(v)
    }));
    
    return voiceList;
  } catch (error) {
    console.error('获取语音列表失败:', error);
    return getDefaultVoices();
  }
}

function generateFriendlyName(voice) {
  const localeNames = {
    'zh-CN': '中文',
    'zh-HK': '粤语',
    'zh-TW': '台湾',
    'en-US': '英语',
    'ja-JP': '日语',
    'ko-KR': '韩语',
    'fr-FR': '法语',
    'de-DE': '德语',
    'es-ES': '西班牙语',
    'pt-BR': '葡萄牙语',
    'it-IT': '意大利语',
    'ru-RU': '俄语',
    'ar-SA': '阿拉伯语'
  };
  
  const genderNames = {
    'Female': '女声',
    'Male': '男声'
  };
  
  const locale = localeNames[voice.Locale] || voice.Locale;
  const gender = genderNames[voice.Gender] || voice.Gender;
  
  return `${locale} - ${voice.ShortName}（${gender}）`;
}

function getDefaultVoices() {
  return [
    { name: 'zh-CN-XiaoxiaoNeural', shortName: 'Xiaoxiao', gender: 'Female', locale: 'zh-CN', friendlyName: '中文 - Xiaoxiao（女声）' },
    { name: 'zh-CN-YunxiNeural', shortName: 'Yunxi', gender: 'Male', locale: 'zh-CN', friendlyName: '中文 - Yunxi（男声）' },
    { name: 'zh-CN-YunyangNeural', shortName: 'Yunyang', gender: 'Male', locale: 'zh-CN', friendlyName: '中文 - Yunyang（男声）' },
    { name: 'zh-CN-XiaoyiNeural', shortName: 'Xiaoyi', gender: 'Female', locale: 'zh-CN', friendlyName: '中文 - Xiaoyi（女声）' },
    { name: 'en-US-JennyNeural', shortName: 'Jenny', gender: 'Female', locale: 'en-US', friendlyName: '英语 - Jenny（女声）' },
    { name: 'en-US-GuyNeural', shortName: 'Guy', gender: 'Male', locale: 'en-US', friendlyName: '英语 - Guy（男声）' },
    { name: 'ja-JP-NanamiNeural', shortName: 'Nanami', gender: 'Female', locale: 'ja-JP', friendlyName: '日语 - Nanami（女声）' },
    { name: 'ko-KR-SunHiNeural', shortName: 'SunHi', gender: 'Female', locale: 'ko-KR', friendlyName: '韩语 - SunHi（女声）' }
  ];
}
