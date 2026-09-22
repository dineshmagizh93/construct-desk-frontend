import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import './marketing.css'
import { MarketingFooter } from './MarketingFooter'
import { MarketingNav } from './MarketingNav'

export function MarketingLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <MotionConfig reducedMotion="user">
      <div className="marketing-site min-h-screen overflow-x-clip bg-background">
        <a href="#main-content" className="marketing-skip-link">Skip to content</a>
        <MarketingNav />
        <main id="main-content" tabIndex={-1}><Outlet /></main>
        <MarketingFooter />
      </div>
    </MotionConfig>
  )
}
