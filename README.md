# YinLink

Real-time bi-directional English ↔ Mandarin translation system powered by LiveKit and OpenAI.

## Overview

YinLink is a voice AI translation system that acts as an invisible translator between English and Mandarin speakers. The agent follows the "Ghost Protocol" - functioning as a transparent logic layer with zero personality, translating speech in real-time without adding commentary or responding to commands.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User A    │────▶│   YinLink   │────▶│   User B    │
│  (English)  │◀────│    Agent    │◀────│  (Mandarin) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
               ┌────▼────┐  ┌────▼────┐
               │ OpenAI  │  │ LiveKit │
               │   API   │  │  Cloud  │
               └─────────┘  └─────────┘
```

## Components

| File | Description |
|------|-------------|
| `agent.py` | LiveKit Agents worker with Ghost Protocol translation |
| `sip_dispatch.json` | SIP ingress configuration for telephony |
| `frontend/` | Next.js mobile web app with real-time transcript |

## Prerequisites

- Python 3.9+
- Node.js 18+
- LiveKit Cloud account (or self-hosted LiveKit server)
- OpenAI API key
- SIP trunk provider (for telephony features)

## Setup

### 1. Clone and Install Dependencies

```bash
# Backend
cd Nexthacks
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### 2. Configure Environment Variables

**Backend** (`.env`):
```bash
cp .env.example .env
```

Edit `.env`:
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
OPENAI_API_KEY=sk-your-openai-api-key
SIP_OUTBOUND_TRUNK_ID=your_sip_trunk_id
```

**Frontend** (`frontend/.env.local`):
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### 3. Configure SIP Trunk (Optional - for telephony)

1. Go to your LiveKit Cloud dashboard
2. Navigate to **SIP** → **Trunks**
3. Create an inbound trunk and note the trunk ID
4. Create an outbound trunk and note the trunk ID
5. Update `SIP_OUTBOUND_TRUNK_ID` in your `.env`

To apply the dispatch rules:
```bash
lk sip dispatch create sip_dispatch.json
```

### 4. Run the Agent

```bash
python agent.py dev
```

The agent will:
- Connect to LiveKit Cloud
- Wait for participants to join rooms with `call-` prefix
- Provide real-time translation between English and Mandarin

### 5. Run the Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 on your mobile device.

## Usage

### Via Phone (SIP)
1. Call whoever you want to call
2. The call is routed to a LiveKit room
3. The agent translates all speech automatically

## Project Structure

```
./
├── agent.py              # LiveKit agent with Ghost Protocol
├── sip_dispatch.json     # SIP routing configuration
├── requirements.txt      # Python dependencies
├── .env.example          # Environment template
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Main app page
│   │   │   ├── layout.tsx        # App layout
│   │   │   ├── globals.css       # Styles
│   │   │   └── api/token/route.ts # Token API
│   │   └── components/
│   │       ├── TranscriptPanel.tsx  # Live transcript
│   │       └── ControlBar.tsx       # Call controls
│   ├── package.json
│   └── .env.local.example
└── README.md
```

## Tech Stack

- **LiveKit Agents**: Voice pipeline framework
- **GPT-4o-realtime**: Translation LLM for live audio to audio translation
- **Next.js**: Frontend framework
- **Tailwind CSS**: Styling

## License

MIT
# Yinlink-public
