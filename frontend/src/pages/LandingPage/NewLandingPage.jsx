import React from 'react'
import Footer from './Components/Footer'
import LandingNavbar from './Components/LandingNavbar'
import HeroSection from './Components/HeroSection'
import EventCategories from './Components/EventCategories'
import PopularEvents from './Components/PopularEvents'
import DiscountBanner from './Components/DiscountBanner'
import PopularEventsIndia from './Components/PopularEventsIndia'
import HostEventBanner from './Components/HostEventBanner'
import PartnersSection from './Components/PartnersSection'
import StepIntoCircle from './Components/StepIntoCircle'

const NewLandingPage = () => {
  return (
    <div>
      <LandingNavbar />
      <HeroSection />
      <EventCategories />
      <PopularEvents />
      <DiscountBanner />
      <PopularEventsIndia />
      <HostEventBanner />
      <PartnersSection />
      <StepIntoCircle />
      <Footer />
    </div>
  )
}

export default NewLandingPage