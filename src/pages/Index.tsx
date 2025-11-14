import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import PurpleSection from "@/components/PurpleSection";
import About from "@/components/About";
import Stats from "@/components/Stats";
import Opportunities from "@/components/Opportunities";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <PurpleSection />
      <About />
      <Stats />
      <Opportunities />
      <Footer />
    </div>
  );
};

export default Index;
