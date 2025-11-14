import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const PurpleSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Purple Gradient Background */}
      <div className="absolute inset-0 bg-gradient-purple" />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div
          ref={ref}
          className={`max-w-3xl mx-auto text-left md:text-left md:ml-auto md:mr-0 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Make your scholarship search easier and organized with QuiSKO
          </h2>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            Connect with opportunities, track applications, and achieve your educational dreams
          </p>
        </div>
      </div>
    </section>
  );
};

export default PurpleSection;
