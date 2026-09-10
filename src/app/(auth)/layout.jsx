import RecaptchaProvider from './RecaptchaProvider'

export default function AuthLayout({ children }) {
  return <RecaptchaProvider>{children}</RecaptchaProvider>
}