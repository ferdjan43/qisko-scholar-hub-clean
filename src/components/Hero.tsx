import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import heroImage from "@/assets/hero-students.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Filipino students collaborating"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Image Card */}
          <div className="hidden md:block">
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-background/20">
              <img
                src={heroImage}
                alt="Students achieving success"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="text-center md:text-left text-background animate-fade-in">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 rounded-full bg-background/20 backdrop-blur-sm border border-background/30 text-sm font-medium text-background">
                WELCOME TO QUISKO
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect{" "}
              <span className="text-primary">
                Scholarship
              </span>
              <br />
              Para sa Inyong Kinabukasan
            </h1>
          
            <p className="text-lg md:text-xl mb-8 text-background/90">
              Kumonekta sa mga kilalang institusyon, mag-access ng eksklusibong resources, at palakasin ang iyong scholarship applications gamit ang personalized quizzes at study materials.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-12">
            <Button variant="hero" size="xl" className="group">
              Magsimula Ngayon
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
              <Button variant="heroOutline" size="xl">
                <Search className="mr-2" />
                Maghanap ng Scholarship
              </Button>
            </div>
          </div>
        </div>

        {/* Stats - Full Width Below */}
        <div className="mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { number: "500+", label: "Active Scholarships" },
              { number: "200+", label: "Partner Institutions" },
              { number: "10K+", label: "Success Stories" },
              { number: "95%", label: "Success Rate" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-background/10 backdrop-blur-sm border border-background/20 rounded-2xl p-4 md:p-6 hover:bg-background/20 transition-all hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-background mb-1 md:mb-2">
                  {stat.number}
                </div>
                <div className="text-xs md:text-sm text-background/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
        <div className="w-6 h-10 border-2 border-background/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-background/70 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
