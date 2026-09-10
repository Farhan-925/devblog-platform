'use client'
import { useState } from "react"

export default function PasswordField(){
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const getStrength = (pwd) =>{
        if(!pwd) return {label: '', color: '', bg: '', width: 'w-0'}

        let score = 0
        if (pwd.length >= 8) score++
        if(/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
        if(/[0-9]/.test(pwd)) score++
        if(/[$!%*?&]/.test(pwd)) score++

        if(score <= 2){
           return { label: 'Weak (Must be Good or Strong to submit)', color: 'text-red-500', bg: 'bg-red-500', width: 'w-1/3' }
           } else if (score === 3) {
           return { label: 'Good', color: 'text-amber-600', bg: 'bg-amber-500', width: 'w-2/3' }
           } else {
           return { label: 'Strong', color: 'text-green-600', bg: 'bg-green-500', width: 'w-full' }
           }
        }

         const strength = getStrength(password)
         const isMatch = confirmPassword.length > 0 && password === confirmPassword
         const isMismatch = confirmPassword.length > 0 && password !== confirmPassword

    
    return(
        <div>
      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={32}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Live Strength Bar */}
        {password && (
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${strength.bg} ${strength.width}`}></div>
            </div>
            <p className={`text-[11px] font-medium ${strength.color}`}>
              Strength: {strength.label}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          maxLength={32}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
            isMismatch ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />

        {/* Live Match Text */}
        {confirmPassword && (
          <p className={`text-xs mt-1 font-medium ${isMatch ? 'text-green-600' : 'text-red-500'}`}>
            {isMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
          </p>
        )}
      </div>
    </div>
    )
}