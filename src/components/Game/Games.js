import React from "react";
import ComingSoonBox from "../../utils/ui/ComingSoonBox";

const explanation =
  "Game section where advertisers can put games as ads (Android or online games). Users will be able to play and interact with these games directly as part of the ad experience.";

const Games = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-4 text-center relative">
      <h2 className="text-3xl font-bold mb-4">Game Ads Section</h2>
      <ComingSoonBox
        explanation={explanation}
        link="https://www.metasurfai.com/#roadmap"
      />
    </div>
  );
};

export default Games;
