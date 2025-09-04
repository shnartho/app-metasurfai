import React from "react";
import ComingSoonBox from "../../utils/ui/ComingSoonBox";

const explanation =
  "This section will be your gateway to our immersive 3D metaverse world, where you can buy land, advertise, and interact with others in a next-generation gaming and social experience.";

const Metaverse = () => {
  return (
    <div className="relative w-full min-h-[70vh] flex flex-col items-center justify-center overflow-hidden">
      <div className="hidden md:flex w-full justify-center items-center">
        <img
          src="/MV.png"
          alt="Metaverse Preview"
          className="w-full max-w-7xl object-cover"
          style={{ pointerEvents: 'none', userSelect: 'none', objectPosition: 'center 60%' }}
        />
      </div>
      <div className="relative z-10 w-full flex flex-col items-center justify-center -mt-16">
      </div>
      <div className="fixed right-4 z-50" style={{ bottom: 32, maxWidth: '95vw' }}>
        <ComingSoonBox
          explanation={explanation}
          link="https://www.metasurfai.com/#roadmap"
        />
      </div>
    </div>
  );
};

export default Metaverse;
