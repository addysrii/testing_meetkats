import { LinkIcon, SearchIcon } from "lucide-react";
import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const CardsWrapper = ()=> {
  const cardData = [
    {
      title: "Micro Networking",
      description: "Connect with peers from your college, city, or field.",
      bgColor: "bg-[#a4dbb761]",
      icon: <LinkIcon className="w-[67px] h-[67px]" />,
    },
    {
      title: "Event Hosting & Discovery",
      description: "Host and manage professional events with ease",
      bgColor: "bg-[#e3f3ff]",
      icon: <SearchIcon className="w-[67px] h-[67px]" />,
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-[30px] w-full py-8">
      {cardData.map((card, index) => (
        <Card
          key={index}
          className={`w-[272px] ${card.bgColor} border-none rounded-xl`}
        >
          <CardContent className="flex flex-col items-center justify-center p-[21px] h-[209px]">
            <div className="flex flex-col items-center gap-4">
              {index === 0 ? (
                <img
                  className="w-[89px] h-[94px]"
                  alt="Twemoji link"
                  src="/twemoji-link.svg"
                />
              ) : (
                <img
                  className="w-[67px] h-[67px]"
                  alt="Mdi event search"
                  src="/mdi-event-search.svg"
                />
              )}
              <h3 className="font-['Inter',Helvetica] font-bold text-[#2b2b2b] text-2xl text-center leading-[26px]">
                {card.title}
              </h3>
              <p className="font-['Inter',Helvetica] font-normal text-[#2b2b2b] text-[17px] text-center leading-[21px]">
                {card.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
