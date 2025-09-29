import { useState, useEffect } from "react";

// star = [id, size, x, y, opacity, animationDuration]

export const StarBackground = () => {   
    const [stars, setStars] = useState([]);
    const [meteors, setMeteors] = useState([]);

    useEffect(() => {
        generateStars();
        generateMeteors();
        const handleResize = () => {
            generateStars();
          };
      
          window.addEventListener("resize", handleResize);
      
          return () => window.removeEventListener("resize", handleResize);
        }, []);
    
    const generateStars = () => {
        const numberOfStars = Math.floor(window.innerWidth * window.innerHeight / 1000);
        const newStars = [];
    
        for (let i = 0; i < numberOfStars; i++) {
            newStars.push({
                id:i,
                size: Math.random() * 4 + 3,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: Math.random() * 0.5 + 0.5,
                animationDuration: Math.random() * 4 + 2,
            });
    }

    setStars(newStars);

    };

    const generateMeteors = () => {
        const numberOfMeteors = 5;
        const newMeteors = [];
    
        for (let i = 0; i < numberOfMeteors; i++) {
          newMeteors.push({
            id: i,
            size: Math.random() * 5 + 2,
            x: Math.random() * innerWidth/2,
            y: Math.random() * innerHeight/2,
            delay: Math.random() * 15,
            animationDuration: Math.random() * 3 + 3,
          });
        }
    
        setMeteors(newMeteors);
      };


    return(
     <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {stars.map((star) => (
            <div key={star.id} className="star animate-pulse-subtle" style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                left: `${star.x}%`,
                top: `${star.y}%`,
                opacity: star.opacity,
                animationDuration: `${star.animationDuration}s`,
            }}></div>
        ))}
        {meteors.map((meteor) => (
            <div key={meteor.id} className="meteor animate-meteor" style={{
                width: `${meteor.size * 10}px`,
                height: `${meteor.size}px`,
                left: `${meteor.x}%`,
                top: `${meteor.y}%`,
                opacity: meteor.opacity,
                animationDuration: `${meteor.animationDuration}s`,
            }}></div>
        ))}
    </div>
    );
};