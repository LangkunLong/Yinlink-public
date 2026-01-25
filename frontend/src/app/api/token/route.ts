import { NextRequest, NextResponse } from 'next/server'
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomName, participantName, targetPhone } = body // Extract targetPhone

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: 'Missing roomName or participantName' },
        { status: 400 }
      )
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !livekitUrl) {
      console.error('LiveKit credentials not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // New: Initialize RoomServiceClient to manage room metadata
    const roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret)

    // New: If targetPhone is provided, set it in room metadata
    if (targetPhone) {
      const metadata = JSON.stringify({ target_phone: targetPhone })
      // createRoom will create or update the room
      await roomService.createRoom({
        name: roomName,
        metadata: metadata,
        emptyTimeout: 10 * 60, // 10 minutes
        maxParticipants: 10,
      })
    }

    // Create access token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    })

    // Grant permissions
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    const token = await at.toJwt()

    return NextResponse.json({ token, roomName })
  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}