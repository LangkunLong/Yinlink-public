'use client'

import { useState, useMemo } from 'react'
import { LiveKitRoom, RoomAudioRenderer, useConnectionState } from '@livekit/components-react'
import '@livekit/components-styles'
// Import the library and its styles
import PhoneInput, { getCountries, getCountryCallingCode } from 'react-phone-number-input'
import en from 'react-phone-number-input/locale/en.json'
import 'react-phone-number-input/style.css'
import TranscriptPanel from '@/components/TranscriptPanel'
import ControlBar from '@/components/ControlBar'

export default function Home() {
  const [token, setToken] = useState<string>('')
  const [roomName, setRoomName] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [targetPhone, setTargetPhone] = useState<string | undefined>()
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || ''

  // 2. Generate custom labels: "Country Name +Code" (e.g., "United States +1")
  const countryLabels = useMemo(() => {
    const labels: Record<string, string> = { ...en }
    getCountries().forEach((country) => {
      if (labels[country]) {
        labels[country] = `${labels[country]} +${getCountryCallingCode(country)}`
      }
    })
    return labels
  }, [])

  const handleJoin = async () => {
    if (!userName.trim()) {
      alert('Please enter your name')
      return
    }

    setIsConnecting(true)

    try {
      // Generate a room name if not provided
      const room = roomName.trim() || `call-${Date.now()}`

      // Fetch token from API
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomName: room, 
          participantName: userName,
          targetPhone: targetPhone
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get token')
      }

      const data = await response.json()
      setToken(data.token)
      setRoomName(room)
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to join:', error)
      alert('Failed to connect. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setToken('')
    setRoomName('')
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">YinLink</h1>
            <p className="text-indigo-300 text-sm">Real-time Translation</p>
          </div>

          {/* Join Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-white/10 border border-indigo-400/30 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Phone Input with Custom Labels */}
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">
                  Target Phone Number (Optional)
                </label>
                <div className="[&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-white [&_.PhoneInputInput]:placeholder-indigo-300/50 [&_.PhoneInputInput]:outline-none [&_.PhoneInputCountryIcon]:opacity-100 [&_.PhoneInputCountrySelect]:bg-slate-800 [&_.PhoneInputCountrySelect]:text-white px-4 py-3 bg-white/10 border border-indigo-400/30 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={targetPhone}
                    onChange={setTargetPhone}
                    placeholder="Enter phone number"
                    labels={countryLabels} // 3. Apply custom labels here
                  />
                </div>
                <p className="text-xs text-indigo-400/60 mt-1">
                  Select country flag to change code (Default: US +1)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">
                  Room Code (optional)
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Leave blank to create new"
                  className="w-full px-4 py-3 bg-white/10 border border-indigo-400/30 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleJoin}
                disabled={isConnecting}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? 'Connecting...' : 'Join Call'}
              </button>
            </div>

            {/* Feature callouts */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                <div className="text-indigo-300">
                  <span className="block text-2xl mb-1">EN</span>
                  English
                </div>
                <div className="text-indigo-300">
                  <span className="block text-2xl mb-1">ZH</span>
                  Mandarin
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-indigo-400/60 text-xs mt-6">
            Powered by LiveKit & OpenAI
          </p>
        </div>
      </main>
    )
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={handleDisconnect}
    >
      <main className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 flex items-center justify-between border-b border-white/10">
          <div>
            <h1 className="text-xl font-bold text-white">YinLink</h1>
            <p className="text-xs text-indigo-300">{roomName}</p>
          </div>
          <ConnectionStatus />
        </header>

        {/* Transcript Area */}
        <div className="flex-1 overflow-hidden">
          <TranscriptPanel />
        </div>

        {/* Controls */}
        <ControlBar onLeave={handleDisconnect} />

        {/* Audio Renderer */}
        <RoomAudioRenderer />
      </main>
    </LiveKitRoom>
  )
}

function ConnectionStatus() {
  const connectionState = useConnectionState()

  const statusColors: Record<string, string> = {
    connected: 'bg-green-500',
    connecting: 'bg-yellow-500',
    disconnected: 'bg-red-500',
    reconnecting: 'bg-yellow-500',
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${statusColors[connectionState] || 'bg-gray-500'}`} />
      <span className="text-xs text-indigo-300 capitalize">{connectionState}</span>
    </div>
  )
}