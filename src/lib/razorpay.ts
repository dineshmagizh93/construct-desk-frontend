declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

let scriptPromise: Promise<void> | null = null

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'))
      document.body.appendChild(script)
    })
  }
  return scriptPromise
}

export async function openRazorpayCheckout(options: {
  keyId: string
  subscriptionId: string
  name: string
  description?: string
  prefillEmail?: string
}): Promise<void> {
  await loadRazorpayScript()
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: options.keyId,
      subscription_id: options.subscriptionId,
      name: options.name,
      description: options.description,
      prefill: { email: options.prefillEmail },
      handler: () => resolve(),
      modal: { ondismiss: () => reject(new Error('Checkout closed before completing payment')) },
    })
    rzp.open()
  })
}
