// src/app/(auth)/RecaptchaV3Field.jsx
'use client'

import { useEffect, useState } from 'react'

export default function RecaptchaV3Field({ actionName = 'submit' }) {
  const [token, setToken] = useState('')
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  useEffect(() => {
    if (!siteKey) {
      console.warn('reCAPTCHA Warning: NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not defined in .env.local')
      return
    }

    const handleVerify = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(async () => {
          try {
            const generatedToken = await window.grecaptcha.execute(siteKey, { action: actionName })
            setToken(generatedToken)
          } catch (err) {
            console.error('reCAPTCHA Execution Error:', err)
          }
        })
      }
    }

    // Delay slightly to ensure google script is loaded
    const timer = setTimeout(handleVerify, 500)
    return () => clearTimeout(timer)
  }, [siteKey, actionName])

  return <input type="hidden" name="g-recaptcha-response" value={token} />
}