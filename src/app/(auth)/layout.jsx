// src/app/(auth)/layout.jsx
import RecaptchaProvider from './RecaptchaProvider'

export default function AuthLayout({ children }) {
  return <RecaptchaProvider>{children}</RecaptchaProvider>
}