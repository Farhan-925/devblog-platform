// src/app/(auth)/RecaptchaV3Field.jsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

export default function RecaptchaV3Field({ actionName = 'submit' }) {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [token, setToken] = useState('')

  const handleVerify = useCallback(async () => {
    if (!executeRecaptcha) return
    const generatedToken = await executeRecaptcha(actionName)
    setToken(generatedToken)
  }, [executeRecaptcha, actionName])

  useEffect(() => {
    handleVerify()
  }, [handleVerify])

  return <input type="hidden" name="g-recaptcha-response" value={token} />
}