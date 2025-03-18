export const metadata = {
  title: 'About - Tehnopol Matchmaking',
  description: 'Page description',
}

import Hero from '@/components/hero-about'
import FeaturesGallery from '@/components/features-gallery'
import Timeline from '@/components/timeline'
import Career from '@/components/career'
import FeaturesAnimation from '@/components/features-animation'
import Team from '@/components/team'
import CtaContact from '@/components/cta-contact'

export default function About() {
  return (
    <>
      <Hero />
      <FeaturesGallery />
      <Timeline />
      <Career />
      <FeaturesAnimation />
      <Team />
      <CtaContact />
    </>
  )
}
