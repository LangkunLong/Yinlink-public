'use client'

import { useState } from 'react'
import { useLocalParticipant, useRoomContext } from '@livekit/components-react'
import { Track } from 'livekit-client'

interface ControlBarProps {
  onLeave: () => void
}

export default function ControlBar({ onLeave }: ControlBarProps) {
  const { localParticipant } = useLocalParticipant()
  const room = useRoomContext()
  const [isMuted, setIsMuted] = useState(false)

  const handleMuteToggle = async () => {
    if (!localParticipant) return

    const micTrack = localParticipant.getTrackPublication(Track.Source.Microphone)
    if (micTrack) {
      if (isMuted) {
        await micTrack.unmute()
      } else {
        await micTrack.mute()
      }
      setIsMuted(!isMuted)
    }
  }

  const handleLeave = async () => {
    await room?.disconnect()
    onLeave()
  }

  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex items-center justify-center gap-4">
        {/* Mute Button */}
        <button
          onClick={handleMuteToggle}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMuted
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
          }`}
        >
          {isMuted ? (
            <MicOffIcon className="w-6 h-6" />
          ) : (
            <MicIcon className="w-6 h-6" />
          )}
        </button>

        {/* Leave Button */}
        <button
          onClick={handleLeave}
          className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"
        >
          <PhoneOffIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Status Text */}
      <p className="text-center text-xs text-indigo-400/60 mt-3">
        {isMuted ? 'Microphone muted' : 'Tap to mute'}
      </p>
    </div>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  )
}

function MicOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
      />
    </svg>
  )
}

function PhoneOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.28 3H5z"
      />
    </svg>
  )
}
