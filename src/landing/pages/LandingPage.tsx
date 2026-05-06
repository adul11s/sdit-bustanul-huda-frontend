import { Navbar } from '../components/Navbar';
import { HeroCarousel } from '../components/HeroCarousel';
import { AboutSection } from '../components/AboutSection';
import { StatsBanner } from '../components/StatsBanner';
import { ProgramsSection } from '../components/ProgramsSection';
import { GallerySection } from '../components/GallerySection';
import { AnnouncementsAndTestimonialsSection } from '../components/AnnouncementsAndTestimonialsSection';
import { ContactSection } from '../components/ContactSection';
import { FooterSection } from '../components/FooterSection';
import { BackToTopButton } from '../components/BackToTopButton';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      <main>
        <HeroCarousel />
        <AboutSection />
        <StatsBanner />
        <ProgramsSection />
        <GallerySection />
        <AnnouncementsAndTestimonialsSection />
        <ContactSection />
      </main>
      <FooterSection />
      <BackToTopButton />
    </div>
  );
}

export default LandingPage;
