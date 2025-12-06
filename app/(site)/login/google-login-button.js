'use client'

import { Button } from '@/components/ui/button'

export default function GoogleLoginButton() {
  function handleClick() {
    sessionStorage.setItem('auth_state', 'true')
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth2/authorization/google`
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleClick}>
      <img src="/google.svg" alt="Google" className="h-6 w-6" />
      <span className="ml-2">Google</span>
    </Button>
  )
}
