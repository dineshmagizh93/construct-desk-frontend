import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MarketingFooter } from './MarketingFooter'
import { MarketingNav } from './MarketingNav'

export function MarketingLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="marketing-page-bg min-h-screen overflow-x-hidden">
      <MarketingNav />
      <Outlet />
      <MarketingFooter />
    </div>
  )
}
