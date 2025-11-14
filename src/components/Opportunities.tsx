import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Users, Clock, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Opportunities = () => {
  const scholarships = [
    {
      title: "CHED Merit Scholarship Program",
      institution: "Commission on Higher Education",
      students: "2.5K",
      rating: 4.8,
      deadline: "30 araw nalang",
      amount: "₱50,000",
      tags: ["Full Tuition", "STEM"],
    },
    {
      title: "DOST-SEI Undergraduate Scholarship",
      institution: "Department of Science and Technology",
      students: "1.8K",
      rating: 4.9,
      deadline: "45 araw nalang",
      amount: "₱25,000",
      tags: ["Partial", "Science"],
    },
    {
      title: "SM Foundation College Scholarship",
      institution: "SM Foundation",
      students: "3.2K",
      rating: 4.7,
      deadline: "60 araw nalang",
      amount: "₱75,000",
      tags: ["Full Tuition", "Leadership"],
    },
  ];

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  return (
    <section id="opportunities" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-12 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Tingnan ang Aming{" "}
            <span className="text-primary">
              Mga Opportunities
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tuklasin at mag-apply sa mga scholarships na tugma sa iyong profile at academic goals
          </p>
        </div>

        {/* Scholarship Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {scholarships.map((scholarship, index) => (
            <ScholarshipCard key={index} scholarship={scholarship} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button variant="default" size="lg" className="group hover:shadow-hover transition-all duration-300">
            Tingnan Lahat ng Scholarships
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

const ScholarshipCard = ({ scholarship, index }: { scholarship: any; index: number }) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card className="group overflow-hidden hover:shadow-hover transition-all duration-300 hover:-translate-y-2 cursor-pointer">
        {/* Card Image Placeholder */}
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-foreground mb-2">
                {scholarship.amount}
              </div>
              <div className="text-sm text-muted-foreground">Award Value</div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="absolute top-4 left-4 flex gap-2">
            {scholarship.tags.map((tag: string, tagIndex: number) => (
              <span
                key={tagIndex}
                className="px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-semibold text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
            {scholarship.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {scholarship.institution}
          </p>

          {/* Meta Information */}
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{scholarship.students}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span>{scholarship.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="text-primary font-medium">{scholarship.deadline}</span>
            </div>
          </div>

          {/* Apply Button */}
          <Button variant="outline" className="w-full group/btn hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
            View Details
            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Opportunities;
