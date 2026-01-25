'use client'

import { useEffect, useRef, useState } from 'react'
import { useRoomContext, useDataChannel } from '@livekit/components-react'
import { DataPacket_Kind } from 'livekit-client'

interface TranscriptMessage {
  id: string
  speaker: 'A' | 'B' | 'system'
  original: string
  translated: string
  timestamp: Date
  language: 'en' | 'zh'
}

export default function TranscriptPanel() {
  const [messages, setMessages] = useState<TranscriptMessage[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const room = useRoomContext()

  // Listen for transcription data from the agent
  useEffect(() => {
    if (!room) return

    const handleDataReceived = (
      payload: Uint8Array,
      participant?: any,
      kind?: DataPacket_Kind
    ) => {
      try {
        const text = new TextDecoder().decode(payload)
        const data = JSON.parse(text)

        if (data.type === 'transcript') {
          const newMessage: TranscriptMessage = {
            id: `${Date.now()}-${Math.random()}`,
            speaker: data.speaker || 'A',
            original: data.original,
            translated: data.translated,
            timestamp: new Date(),
            language: data.language || 'en',
          }
          setMessages((prev) => [...prev, newMessage])
        }
      } catch (e) {
        // Not a JSON message, might be raw transcript
        console.log('Raw data received:', new TextDecoder().decode(payload))
      }
    }

    room.on('dataReceived', handleDataReceived)

    return () => {
      room.off('dataReceived', handleDataReceived)
    }
  }, [room])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Demo messages for visualization (remove in production)
  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: 'welcome',
        speaker: 'system',
        original: 'Translation enabled',
        translated: '',
        timestamp: new Date(),
        language: 'en',
      },
    ])
  }, [])

  return (
    <div className="h-full flex flex-col p-4">
      {/* Transcript Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-indigo-300">Live Transcript</h2>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">EN</span>
          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">ZH</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto transcript-scroll space-y-4"
      >
        {messages.map((msg) => (
          <TranscriptBubble key={msg.id} message={msg} />
        ))}

        {messages.length === 1 && (
          <div className="text-center text-indigo-400/50 text-sm mt-8">
            <p>Waiting for conversation...</p>
            <p className="text-xs mt-2">Speak in English or Mandarin</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TranscriptBubble({ message }: { message: TranscriptMessage }) {
  if (message.speaker === 'system') {
    return (
      <div className="text-center">
        <span className="text-xs text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full">
          {message.original}
        </span>
      </div>
    )
  }

  const isUserA = message.speaker === 'A'
  const bgColor = isUserA ? 'bg-blue-500/20' : 'bg-purple-500/20'
  const borderColor = isUserA ? 'border-blue-500/30' : 'border-purple-500/30'
  const alignment = isUserA ? 'items-start' : 'items-end'

  return (
    <div className={`flex flex-col ${alignment}`}>
      {/* Speaker Label */}
      <span className="text-xs text-indigo-400 mb-1">
        {isUserA ? 'Speaker A' : 'Speaker B'}
      </span>

      {/* Message Bubble */}
      <div className={`max-w-[85%] ${bgColor} border ${borderColor} rounded-2xl p-3`}>
        {/* Original */}
        <p className="text-white text-sm">{message.original}</p>

        {/* Translation */}
        {message.translated && (
          <p className="text-indigo-300 text-sm mt-2 pt-2 border-t border-white/10">
            {message.translated}
          </p>
        )}
      </div>

      {/* Timestamp */}
      <span className="text-xs text-indigo-500/50 mt-1">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}
