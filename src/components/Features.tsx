import { Award, BookOpen, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Features = () => {
  const features = [
    {
      icon: Award,
      number: "01",
      title: "Curated Scholarships",
      description: "Mag-access ng komprehensibong database ng verified scholarship opportunities na akma sa iyong profile at interes.",
    },
    {
      icon: BookOpen,
      number: "02",
      title: "Study Resources",
      description: "Mag-download at makipag-interact sa study materials, reviewers, at practice tests mula sa top institutions.",
    },
    {
      icon: Target,
      number: "03",
      title: "Smart Matching",
      description: "Ang aming AI-powered system ay hahanapin ang scholarships na tugma sa iyong unique profile at academic goals.",
    },
    {
      icon: TrendingUp,
      number: "04",
      title: "Track Progress",
      description: "I-monitor ang iyong application status, quiz scores, at improvement over time gamit ang detailed analytics.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FeatureCard key={index} feature={feature} Icon={Icon} index={index} />
            );
          })}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, Icon, index }: { feature: any; Icon: any; index: number }) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card className="relative overflow-hidden p-8 hover:shadow-hover transition-all duration-300 hover:-translate-y-2 bg-card border-border group cursor-pointer">
        {/* Number Badge */}
        <div className="absolute top-6 right-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-300">
            <span className="text-2xl font-bold text-primary">
              {feature.number}
            </span>
          </div>
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 shadow-elegant group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </Card>
    </div>
  );
};

export default Features;
