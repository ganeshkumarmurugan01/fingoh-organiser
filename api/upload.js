export default async function handler(req, res) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'https://api-dev.fingoh.ai'
    const eventId = req.query.event_id
    if (!eventId) return res.status(400).json({ detail: 'event_id required' })

    const target = `${backendUrl}/api/v1/organiser/events/${eventId}/visitor-upload`
    const auth = req.headers['x-fingoh-auth'] || ''

    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = Buffer.concat(chunks)

    const upstream = await fetch(target, {
      method: 'POST',
      headers: {
        ...req.headers,
        host: new URL(backendUrl).host,
        'x-fingoh-auth': auth,
      },
      body,
    })

    const data = await upstream.text()
    res.status(upstream.status).setHeader('content-type', 'application/json').send(data)
  } catch (err) {
    res.status(500).json({ detail: 'Upload proxy error: ' + err.message })
  }
}

export const config = { api: { bodyParser: false } }
