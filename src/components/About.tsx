import { Button } from "@/components/ui/button";
import { CheckCircle2, Phone } from "lucide-react";
import aboutPattern from "@/assets/about-pattern.jpg";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const About = () => {
  const { ref: leftRef, isVisible: leftVisible } = useScrollAnimation();
  const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation();

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div
            ref={leftRef}
            className={`transition-all duration-700 ${
              leftVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="mb-4">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                TUNGKOL SA AMIN
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Ang Aming Scholarship Platform{" "}
              <span className="text-primary">
                Ay Tumutulong sa Iyo.
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Ang QuiSKO ay higit pa sa isang scholarship search platform. Kami ay isang 
              komprehensibong ecosystem na dinisenyo upang tulungan ang mga estudyante na 
              makahanap ng opportunities, maghanda para sa entrance exams, at magtagumpay 
              sa kanilang scholarship applications.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {[
                {
                  title: "Personalized Dashboard",
                  description: "Makatanggap ng scholarship recommendations base sa iyong profile, interests, at academic performance.",
                },
                {
                  title: "Interactive Quiz Platform",
                  description: "Mag-practice gamit ang institution-created quizzes at subaybayan ang iyong progress over time.",
                },
                {
                  title: "Resource Library",
                  description: "Mag-access, mag-download, at mag-aral mula sa malawak na koleksyon ng materials na may built-in tools.",
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-4 group">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <CheckCircle2 className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button variant="default" size="lg">
                Alamin Pa ang Tungkol sa Amin
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shadow-md">
                  <Phone className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tawagan kami anumang oras</div>
                  <div className="font-semibold text-foreground">+63 917 123 4567</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Grid */}
          <div
            ref={rightRef}
            className={`relative transition-all duration-700 ${
              rightVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Large placeholder */}
              <div className="col-span-1 row-span-2">
                <div className="h-full bg-gradient-secondary rounded-3xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 hover:scale-105">
                  <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                    <span className="text-secondary-foreground/50 text-sm">Student Success</span>
                  </div>
                </div>
              </div>
              
              {/* Top right placeholder */}
              <div className="col-span-1">
                <div className="h-48 bg-primary/10 rounded-3xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 hover:scale-105">
                  <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                    <span className="text-primary/50 text-sm">Resources</span>
                  </div>
                </div>
              </div>

              {/* Middle placeholder with pattern */}
              <div className="col-span-1">
                <div className="h-48 rounded-3xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 hover:scale-105">
                  <img
                    src={aboutPattern}
                    alt="Education pattern"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Bottom accent */}
              <div className="col-span-2">
                <div className="h-24 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105">
                  <div className="text-center text-primary-foreground">
                    <div className="text-3xl font-bold">10,000+</div>
                    <div className="text-sm">Mga Estudyanteng Natulungan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
