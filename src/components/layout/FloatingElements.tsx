import { motion } from "framer-motion";
import {
  Bath,
  Bed,
  Car,
  Clock,
  Coffee,
  Flower,
  Home,
  Lamp,
  Laptop,
  Lightbulb,
  Microwave,
  Phone,
  Refrigerator,
  Sofa,
  TreePine,
  Tv,
} from "lucide-react";

const FloatingElements = () => {
  // Household icons to float around
  const householdIcons = [
    Home,
    Lightbulb,
    Coffee,
    Sofa,
    Tv,
    Refrigerator,
    Microwave,
    Bed,
    Bath,
    Car,
    TreePine,
    Flower,
    Lamp,
    Clock,
    Phone,
    Laptop,
  ];

  // Generate floating elements with household items
  const elements = Array.from({ length:8 }, (_, i) => {
    const IconComponent = householdIcons[i % householdIcons.length];

    return {
      id: i,
      icon: IconComponent,
      size: Math.random() * 20 + 20, // 30-70px
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 25 + Math.random() * 15, // 25-40 seconds
      direction: {
        x: (Math.random() - 0.5) * 200, // Random horizontal drift
        y: (Math.random() - 0.5) * 150, // Random vertical drift
      },
      opacity: 0.25 + Math.random() * 0.25, // 0.3-0.7 opacity
      rotationSpeed: (Math.random() - 0.5) * 720, // -360 to 360 degrees
    };
  });

  // Floating animation variants
  const floatingVariants = {
    animate: (custom: any) => ({
      x: [0, custom.direction.x, custom.direction.x * 0.5, custom.direction.x],
      y: [0, custom.direction.y, custom.direction.y * 0.7, custom.direction.y],
      rotate: [0, custom.rotationSpeed, custom.rotationSpeed * 0.5, custom.rotationSpeed],
      scale: [1, 1.2, 0.9, 1.1, 1],
    }),
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {/* EPIC Multi-layered Gradient Background */}
      <div className="absolute inset-0" />

      {/* Animated gradient waves */}
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating household elements */}
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute flex items-center justify-center"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: element.size,
            height: element.size,
          }}
          custom={element}
          variants={floatingVariants}
          animate="animate"
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <element.icon
            className="w-full h-full"
            style={{
              color: "var(--homey-primary)",
              opacity: element.opacity,
              filter: `drop-shadow(0 0 10px var(--homey-primary)40)`,
            }}
          />
        </motion.div>
      ))}

      {/* Glowing orbs that pulse */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 120 + 40,
            height: Math.random() * 120 + 40,
background: `radial-gradient(circle, var(--homey-primary)15 0%, var(--homey-primary)05 50%, transparent 70%)`,
            filter: "blur(20px)",
          }}
          animate={{
            scale: [0.8, 1.3, 0.9, 1.1, 0.8],
            opacity: [0.3, 0.7, 0.4, 0.6, 0.3],
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 80 - 40, 0],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            delay: Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating sparkles */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: "var(--homey-primary)",
              boxShadow: `0 0 15px var(--homey-primary)`,
            }}
            animate={{
              y: [-50, window.innerHeight + 50],
              x: [0, Math.random() * 100 - 50, Math.random() * 60 - 30, 0],
              opacity: [0, 1, 0.8, 0.9, 0],
              scale: [0.5, 1.5, 1, 1.2, 0.5],
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              delay: Math.random() * 6,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute top-0 right-1/3 w-2 h-full origin-top"
        style={{
          background: `linear-gradient(to bottom, var(--homey-primary)25, transparent)`,
          filter: "blur(3px)",
          transform: "rotate(-20deg)",
        }}
        animate={{
          opacity: [0.3, 0.7, 0.4, 0.6, 0.3],
          scaleX: [0.8, 1.5, 1, 1.2, 0.8],
        }}
        transition={{
          duration: 10,
          delay: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Corner accent glows */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96"
        style={{
          background: `radial-gradient(circle at bottom right, var(--homey-primary)15 0%, transparent 60%)`,
          filter: "blur(25px)",
        }}
        animate={{
          opacity: [0.4, 0.8, 0.5, 0.7, 0.4],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96"
        style={{
          background: `radial-gradient(circle at top left, var(--homey-primary)12 0%, transparent 60%)`,
          filter: "blur(25px)",
        }}
        animate={{
          opacity: [0.3, 0.7, 0.4, 0.6, 0.3],
        }}
        transition={{
          duration: 14,
          delay: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent 0%, var(--homey-primary)50 50%, transparent 100%)`,
          filter: "blur(2px)",
        }}
        animate={{
          opacity: [0.3, 0.8, 0.5, 0.7, 0.3],
        }}
        transition={{
          duration: 8,
          delay: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default FloatingElements;
