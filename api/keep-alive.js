export default async function handler(req, res) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)

    const response = await fetch('https://mines-backend-mex2.onrender.com/health', {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await response.json()
    return res.status(200).json({
      success: true,
      message: 'Render instance is awake and warm',
      render: data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to reach Render',
      timestamp: new Date().toISOString(),
    })
  }
}
