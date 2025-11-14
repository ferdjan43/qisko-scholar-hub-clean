import { Award, BookOpen, Building2, Users } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Stats = () => {
  const stats = [
    {
      icon: Users,
      number: "500",
      label: "Mga Estudyante",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Building2,
      number: "1900",
      label: "Active na Institusyon",
      color: "text-background",
      bgColor: "bg-background/10",
    },
    {
      icon: BookOpen,
      number: "750",
      label: "Available na Resources",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: Award,
      number: "30",
      label: "Taon ng Karanasan",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <section className="py-20 bg-gradient-secondary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-background rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-background rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ stat, index }: { stat: any; index: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  const Icon = stat.icon;

  return (
    <div
      ref={ref}
      className={`text-center group transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="mb-6 inline-block">
        <div className={`w-20 h-20 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon className={`w-10 h-10 ${stat.color}`} />
        </div>
      </div>
      <div className="text-5xl md:text-6xl font-bold text-secondary-foreground mb-3 group-hover:scale-105 transition-transform duration-300">
        {stat.number}
        <span className="text-3xl">+</span>
      </div>
      <div className="text-lg text-secondary-foreground/90 font-medium">
        {stat.label}
      </div>
    </div>
  );
};

export default Stats;
