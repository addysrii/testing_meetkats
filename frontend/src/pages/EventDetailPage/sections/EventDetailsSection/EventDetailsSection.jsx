import { SearchIcon } from "lucide-react";
import React from "react";
import { Input } from "../../../../components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../../../../components/ui/navigation-menu";

export const EventDetailsSection = ()=> {
  // Navigation menu items data
  const navigationItems = [
    { label: "Home", active: false },
    { label: "Network", active: false },
    { label: "Discover", active: false },
    { label: "Events", active: true },
    { label: "Profile", active: false },
  ];

  return (
    <header className="w-full py-5 px-5 flex items-center justify-between">
      {/* Logo section */}
      <div className="flex items-center">
        <img
          className="w-[50px] h-[51px] object-cover"
          alt="Meetkats Logo"
          src="/image-1-1.png"
        />
        <div className="ml-2">
          <h1 className="font-bold text-2xl text-[#0000009e] font-['Zen_Kaku_Gothic_Antique',Helvetica]">
            Meetkats
          </h1>
        </div>
      </div>

      {/* SearchIcon bar */}
      <div className="relative ml-8 max-w-[277px] w-full">
        <div className="flex items-center bg-sami-white rounded-[28px] h-10 overflow-hidden">
          <div className="flex items-center pl-3">
            <SearchIcon className="w-6 h-6 text-secondary-main" />
          </div>
          <Input
            className="border-0 bg-transparent h-10 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-secondary-main"
            type="text"
            placeholder="Search"
          />
        </div>
      </div>

      {/* Navigation menu */}
      <NavigationMenu className="ml-auto">
        <NavigationMenuList className="flex items-center gap-20">
          {navigationItems.map((item, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink
                className={`relative font-semibold text-base text-d-9d-9d-9 font-['Inter',Helvetica] whitespace-nowrap px-3 py-1 ${
                  item.active
                    ? "bg-base-green bg-opacity-48 rounded-[53px] border border-[#1f550a]"
                    : ""
                }`}
                href="#"
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
