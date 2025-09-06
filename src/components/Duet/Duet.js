import React from "react";
import ComingSoonBox from "../../utils/ui/ComingSoonBox";

const explanation =
  "Duet section. For example, Coca Cola can post a video or text like 'I love Coca Cola' and users can duet or respond, similar to TikTok or social media, and get paid for their participation.";

const Duet = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] py-10 px-4 text-center">
      <h2 className="text-3xl font-bold mb-8">Duet Section</h2>
      <ComingSoonBox
        explanation={explanation}
        link="https://www.metasurfai.com/#roadmap"
        floating={true}
      />
    </div>
  );
};

export default Duet;
