
## 1. Architecture Design
```mermaid
graph TB
    A[React前端] -->|HTTP请求| B[Express后端]
    B -->|调用| C[edge-tts Node.js库]
    C -->|生成音频| D[返回MP3流]
    B -->|返回音频| A
```

## 2. Technology Description
- Frontend: React@18 + TypeScript + tailwindcss@3 + vite
- Initialization Tool: vite-init
- Backend: Express@4 + TypeScript
- External Services: edge-tts库

## 3. Route Definitions
| Route | Purpose |
|-------|---------|
| / | 主页 |
| /api/voices | 获取可用发音人列表 |
| /api/generate | 生成音频 |

## 4. API Definitions

### 4.1 获取发音人列表
```typescript
interface Voice {
  Name: string;
  ShortName: string;
  Gender: string;
  Locale: string;
}

// GET /api/voices
type GetVoicesResponse = Voice[];
```

### 4.2 生成音频
```typescript
// POST /api/generate
interface GenerateAudioRequest {
  text: string;
  voice: string;
  rate?: string; // e.g., "+0%", "-10%"
  volume?: string; // e.g., "+0%", "-10%"
  pitch?: string; // e.g., "+0Hz", "-10Hz"
}

// 响应：audio/mpeg 流
```

## 5. Server Architecture Diagram
```mermaid
graph LR
    A[前端] -->|请求| B[控制器/路由]
    B -->|调用| C[服务层]
    C -->|使用| D[edge-tts库]
    D -->|生成| E[MP3音频]
    E -->|返回| B
```

## 6. Data Model
不需要数据库，使用内存存储临时音频文件或直接流式返回。

