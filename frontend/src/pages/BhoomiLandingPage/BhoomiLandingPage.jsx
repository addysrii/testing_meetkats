import { FooterBlock } from "./sections/FooterBlock";
import React from 'react';
import { useState, useCallback } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { useAuth } from '../../context/AuthContext';
import { Separator } from "../../components/ui/separator";
import { LinkIcon, SearchIcon, Menu, X, CheckIcon, XIcon } from 'lucide-react';
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import hero_image from "../../assets/hero image.png"
import tile1 from "../../assets/Tile-1.png"
import tile2 from "../../assets/Tile-2.png"
import tile3 from "../../assets/Tile -3.png"
import tile4 from "../../assets/Tile-4.png"
//How it Works Section Essentials
// Define the steps data for better maintainability
const howItWorksSteps = [
  { title: "Create Account", color: "#FFE990", image: tile1 },
  { title: "Configure Profile", color: "#A4E387", image: tile2 },
  { title: "Upload Content", color: "#FF877B", image: tile3 },
  { title: "Share & Engage", color: "#66BEF0", image: tile4 }
];

// DivWrapper component from provided code
const DivWrapper = () => {
  // Define the step data for better maintainability
  const steps = [
    { number: "1", color: "#FFE990" },
    { number: "2", color: "#A4E387" },
    { number: "3", color: "#FF877B" },
    { number: "4", color: "#66BEF0" },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-center md:gap-x-[230px] py-4">
      {steps.map((step, index) => (
        <div
          key={index}
          className="w-[96px] h-[96px] md:w-[116px] md:h-[116px] relative rounded-full flex items-center justify-center mb-4 md:mb-0"
          style={{ backgroundColor: step.color }}
        >
          <div className="font-['Inter',Helvetica] font-semibold text-4xl md:text-6xl tracking-[-1.20px] text-white">
            {step.number}
          </div>
        </div>
      ))}
    </div>
  );
};

// Card illustration component to maintain exact visuals
const CardIllustration = ({ index }) => {
  return (
    <div className="relative w-full h-full">
      <div className="absolute w-72 h-[277px] top-[67px] left-3.5 bg-[#f5fafa]" />
      <div className="absolute w-[283px] h-[309px] top-0 left-0">
        <div className="absolute w-[283px] h-[203px] top-0 left-0">
          <div className="absolute w-52 h-[93px] top-0 left-[75px]">
            <div className="absolute w-52 h-20 top-[13px] left-0">
              <div className="absolute w-52 h-[13px] top-0 left-0 bg-[#dbe5fa]" />
              <div className="absolute w-[189px] h-[13px] top-[22px] left-0 bg-[#dbe5fa]" />
              <div className="absolute w-[168px] h-[13px] top-11 left-0 bg-[#dbe5fa]" />
              <div className="absolute w-[148px] h-[13px] top-[66px] left-0 bg-[#dbe5fa]" />
            </div>
            <div className="absolute w-[105px] h-[49px] top-0 left-[51px]">
              <div className="absolute w-11 h-11 top-1 left-0 bg-[#54bd95] rounded-[22.09px] rotate-180" />
              <img
                className="absolute w-[52px] h-10 -top-px left-14"
                alt="Vector"
                src="/vector-37-1.svg"
              />
            </div>
          </div>
          <div className="absolute w-52 h-20 top-[119px] left-[75px]">
            <div className="absolute w-52 h-[13px] top-0 left-0 bg-[#dbe5fa]" />
            <div className="absolute w-[189px] h-[13px] top-[22px] left-0 bg-[#dbe5fa]" />
            <div className="absolute w-[168px] h-[13px] top-11 left-0 bg-[#dbe5fa]" />
            <div className="absolute w-[148px] h-[13px] top-[66px] left-0 bg-[#dbe5fa]" />
          </div>
          <div className="absolute w-14 h-20 top-[13px] left-0 bg-[#54bd95] rounded-[1.77px]" />
          <div className="absolute w-14 h-20 top-[124px] left-0 bg-[#0f8ce9] rounded-[1.77px]" />
        </div>
        <div className="absolute w-[283px] h-20 top-[230px] left-0">
          <div className="absolute w-[283px] h-20 top-0 left-0">
            <div className="absolute w-20 h-20 top-0 left-0 bg-[#dbe5fa] rounded-[39.77px]" />
            <div className="absolute w-20 h-20 top-0 left-[102px] bg-[#0f8ce9] rounded-[39.77px]" />
            <div className="absolute w-20 h-20 top-0 left-[203px] bg-[#54bd95] rounded-[39.77px]" />
          </div>
          <div className="absolute w-[42px] h-4 top-8 left-[222px]">
            <div className="absolute w-[7px] h-[7px] top-1 left-[35px] bg-white rounded-[3.53px]" />
            <div className="absolute w-[11px] h-[11px] top-[3px] left-5 bg-white rounded-[5.3px]" />
            <div className="absolute w-4 h-4 top-0 left-0 bg-white rounded-[7.95px]" />
          </div>
        </div>
      </div>
      {index === 1 && (
        <div className="absolute w-[207px] top-[94px] left-[41px] [font-family:'Inter',Helvetica] font-normal text-black text-2xl tracking-[0] leading-[30px]">
          screenshots
        </div>
      )}
    </div>
  );
};

// Combined Step and Card component for mobile view
const StepWithCard = ({ step, index }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Step circle */}
      <div
        className="w-[96px] h-[96px] md:w-[116px] md:h-[116px] relative rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: step.color }}
      >
        <div className="font-['Inter',Helvetica] font-semibold text-4xl md:text-6xl tracking-[-1.20px] text-white">
          {index + 1}
        </div>
      </div>

      {/* Step Title */}
      <h3 className="[font-family:'Inter',Helvetica] font-normal text-black text-xl md:text-2xl tracking-[-0.48px] mb-4">
        {step.title}
      </h3>

      {/* Card */}
      <Card
        className="w-full max-w-[322px] h-[380px] bg-[#f9f8fe] rounded-[17.67px] overflow-hidden mb-12"
      >
        <CardContent className="p-0">
          <div className="relative w-full h-full pt-[35px] pl-[19px]">
            <CardIllustration index={index} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Testimonial data with consistent structure and naming
const testimonials = [
  {
    id: 1,
    name: "Aditya Srivastava",
    role: "CEO & CTO",
    bgColor: "#1f1933",
    textColor: "white",
    testimonial:
      "MeetKats brings a fresh vibe to professional networking. It’s fast, focused, and actually helps you build meaningful career relationships. Whether you're job hunting or hiring, the platform makes it easy to connect with the right people—without the noise. A game-changer in the making.",
    hasReadMore: false,
    readMoreColor: "",
    profileImage: "/group-4.png",
    profileBgColor: "transparent",
  },
  {
    id: 2,
    name: "Harsh Vardhan Singh",
    role: "CMO & COO",
    bgColor: "white",
    textColor: "#565656",
    testimonial:
      "With an unending passion and lasting love for management, I recently transitioned from engineering to management and execution. My main focus is on crafting strategies and building partnerships. I am determined to make sure that MeetKats hits the market with impact with our vision, energy and relentless efforts.",
    hasReadMore: false,
    readMoreColor: "#ffa26d",
    profileImage: "/harsh.png",
    profileBgColor: "#ffcc00",
  },
  {
    id: 3,
    name: "Aditya Srivastava",
    role: "CEO & CTO",
    bgColor: "white",
    textColor: "#565656",
    testimonial:
      "As the CTO and CEO, i foster the tech and innovation behind the product. I, alongside my dedicated team, am working day and night to bring the app to life, juggling a variety of responsibilities- from development to deployment with precision and passion.My goal is one: to make sure that MeetKats hits the market with impact!",
    hasReadMore: false,
    readMoreColor: "#fe7700",
    profileImage: "/addy.png",
    profileBgColor: "#fe7700",
  },
];

// Separate testimonial card component for better code organization
const TestimonialCard = ({ testimonial }) => {
  const isFirstCard = testimonial.id === 1;

  return (
    <Card
      className={`rounded-xl overflow-hidden ${isFirstCard ? "border-0" : "border border-[#ededed]"}`}
      style={{ backgroundColor: testimonial.bgColor }}
    >
      <CardContent className="p-0">
        <div className={`relative p-6 md:p-8 lg:p-10 h-full flex flex-col ${isFirstCard ? "min-h-[340px] md:min-h-[400px]" : "min-h-[280px] md:min-h-[340px]"}`}>
          {/* Profile Image - Different styling for first card */}
          {isFirstCard ? (
            <div className="w-16 h-16 mb-auto">
              <div className="relative w-[60px] h-[50px] top-2.5 left-1 bg-cover bg-center" style={{ backgroundImage: `url(${testimonial.profileImage})` }} />
            </div>
          ) : (
            <div className="mb-4">
              <div
                className="w-24 h-24 rounded-full bg-cover bg-center"
                style={{
                  backgroundColor: testimonial.profileBgColor,
                  backgroundImage: `url(${testimonial.profileImage})`
                }}
              />
              <div className="mt-4 md:ml-28 md:-mt-16">
                <h3 className="font-bold text-xl text-[#22272e]">
                  {testimonial.name}
                </h3>
                <p className="font-bold text-sm tracking-widest mt-1 text-[#22272e]">
                  {testimonial.role}
                </p>
              </div>
            </div>
          )}

          {/* Testimonial Text */}
          <div className={`font-normal text-base md:text-lg leading-relaxed ${testimonial.textColor ? `text-${testimonial.textColor}` : ""} ${isFirstCard ? "mt-auto" : "mt-4 md:mt-8"}`}>
            {testimonial.testimonial}
            {testimonial.hasReadMore && (
              <span
                className="font-bold underline ml-1 cursor-pointer"
                style={{ color: testimonial.readMoreColor }}
              >
                read more
              </span>
            )}
          </div>

          {/* Name and Role for first card positioned at bottom */}
          {isFirstCard && (
            <div className="mt-4">
              <h3 className="font-medium text-xl text-white">
                {testimonial.name}
              </h3>
              <p className="font-normal text-base text-white mt-1">
                {testimonial.role}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const BhoomiLandingPage = () => {
  //Navbar Essentials
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [
    { name: "Home", href: "#" },
    { name: "Features", href: "#features" },
    { name: "Why MeetKats", href: "#whymeetkats" },
    { name: "Contact", href: "#footer" },
  ];
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  //Hero Section Essentials
  const [hovered, setHovered] = useState(null);
  const { login, socialLogin } = useAuth();
  const handleGoogleLogin = useCallback(() => {
    socialLogin('google');
  }, [socialLogin]);

  const handleLinkedInLogin = useCallback(() => {
    socialLogin('linkedin');
  }, [socialLogin]);

  const buttons = [
    {
      id: "google",
      text: "Continue with Google",
      icon: FcGoogle,
      bgColor: "bg-white",
      textColor: "text-gray-700",
      hoverBg: "hover:bg-gray-50",
      onClick: handleGoogleLogin,
    },
    {
      id: "apple",
      text: "Continue with LinkedIn",
      icon: FaLinkedin,
      bgColor: "bg-black",
      textColor: "text-white",
      hoverBg: "hover:bg-gray-900",
      onClick: handleLinkedInLogin,
    },
    {
      id: "email",
      text: "Sign in with Email",
      icon: MdEmail,
      bgColor: "bg-white",
      textColor: "text-gray-700",
      hoverBg: "hover:bg-gray-50",
      onClick: () => {
        window.location.href = "/login";
      },
    },
  ];
  //Feature Section Essentials
  const cards = [
    {
      title: "Micro Networking",
      description: "Connect with peers from your college, city, or field.",
      icon: "/twemoji-link.svg",
      iconAlt: "Twemoji link",
      bgColor: "bg-[#a4dbb761]",
      iconClassName: "w-14 h-14",
    },
    {
      title: "Event Hosting & Discovery",
      description: "Host and manage professional events with ease",
      icon: "/mdi-event-search.svg",
      iconAlt: "Mdi event search",
      bgColor: "bg-[#e3f3ff]",
      iconClassName: "w-12 h-12",
    },
    {
      title: "Curated Connections",
      description: "Get matched with like-minded folks.",
      icon: "/vector-45.svg",
      iconAlt: "Vector",
      bgColor: "bg-[#fee85f42]",
      iconClassName: "w-12 h-12",
    },
    {
      title: "Real Impact",
      description: "Not just numbers. Build a meaningful network that helps you move forward.",
      icon: "/carbon-growth.svg",
      iconAlt: "Carbon growth",
      bgColor: "bg-[#fee1e4]",
      iconClassName: "w-14 h-14",
    },
    {
      title: "Lucide Icon Example",
      description: "Using JSX-based icon from a library.",
      iconJsx: <LinkIcon className="w-6 h-6" />,
      bgColor: "bg-[#e0f7e9]",
    },
    {
      title: "Search Features",
      description: "Easily find events and connections.",
      iconJsx: <SearchIcon className="w-6 h-6" />,
      bgColor: "bg-[#f0eaff]",
    },
  ];
  //Otherapp vs MeetKats Section Essentials
  // OtherApp features data
  const OtherAppFeatures = [
    "Broad, global, often impersonal",
    "Focused on content & personal branding",
    "Minimal visibility for tier 2/3 colleges",
    "Generic event and networking tools",
    "Many connections, low relevance",
  ];

  // MeetKats features data
  const meetkatsFeatures = [
    "Local, focused, deeply meaningful",
    "Focused on career growth & connections",
    "Built with tier 2/3 users in mind",
    "Smart tools for curated events",
    "Fewer connections, high relevance",
  ];
  //Element FAQ Section Essentials
  const faqItems = [
    {
      question: "What is Meetkats?",
      answer: "Meetkats is a platform designed to connect professionals and enthusiasts through events, fostering networking opportunities and knowledge sharing within communities.",
    },
    {
      question: "What will you get after joining us?",
      answer: "After joining Meetkats, you'll gain access to exclusive events, networking opportunities with industry professionals, and resources to help you grow both personally and professionally.",
    },
    {
      question: "How to register for an Event?",
      answer: "Registering for an event is simple. Browse through our events section, select an event you're interested in, click the 'Register' button, and follow the prompts to complete your registration.",
    },
    {
      question: "How will we help you in Networking?",
      answer: "We facilitate networking through curated events, matchmaking features based on interests, dedicated networking sessions, and digital tools to connect with attendees before, during, and after events.",
    },
    {
      question: "What is different in Meetkats from other websites?",
      answer: "Meetkats stands out with its focus on meaningful connections, personalized event recommendations, community-driven approach, and integrated tools specifically designed to enhance networking effectiveness.",
    },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        {/* Header and Navigation */}
        <header className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-2 bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center z-10">
              <img
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                alt="MeetKats Logo"
                src="./image-1.png"
              />
              <div className="ml-2">
                <div className="font-serif font-bold text-gray-800 text-xl sm:text-2xl leading-tight">
                  Meetkats
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="p-2 rounded-md lg:hidden focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="font-sans font-semibold text-black text-base hover:text-gray-600 transition-colors"
                >
                  {item.name}
                </a>
              ))}
              <a
                href="/login"
                className="font-sans font-semibold text-gray-900 text-base hover:text-gray-600 transition-colors ml-2"
              >
                Sign In
              </a>
              <button className="bg-red-400 px-4 py-2 rounded-lg shadow-md font-sans font-bold text-white hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300">
                Join the wanted
              </button>
            </nav>

            {/* Mobile Navigation */}
            <div
              className={`fixed inset-0 bg-white z-40 lg:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
              <div className="flex flex-col p-8 space-y-8 pt-20">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="font-sans font-semibold text-black text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <a
                  href="#"
                  className="font-sans font-semibold text-gray-900 text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </a>
                <button className="bg-red-400 w-full py-3 rounded-lg shadow-md font-sans font-bold text-white" onClick={() => setIsMenuOpen(false)}>
                  Join the wanted
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}

        <section className="flex flex-row mt-16 px-8">
          <div className="flex-1 ">
            <h1 className="[font-family:'Poppins',Helvetica] font-semibold text-black text-5xl leading-[67.2px]">
              Your Inner Circle <br />
              Just Got Bigger.
            </h1>
            <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-lg mt-8 max-w-[420px]">
              Micro-networking for meaningful career growth — from classrooms to
              conferences.
            </p>

            {/* Auth Buttons */}
            <div className="mt-8 space-y-2 max-w-sm">

              {buttons.map((button) => (
                <button
                  key={button.id}
                  className={`w-72 flex justify-center cursor-pointer items-center gap-3 ${button.bgColor
                    } ${button.textColor} ${button.hoverBg
                    } rounded-lg shadow-md  border border-gray-200 font-medium text-base h-12 transition-all duration-300 transform ${hovered === button.id ? "scale-[1.02]" : ""
                    }`}
                  onMouseEnter={() => setHovered(button.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={button.onClick ? button.onClick : undefined}
                >
                  <div
                    className={`${button.id === "google" ? "bg-transparent" : ""
                      } flex items-center justify-center`}
                  >
                    {button.icon({
                      size: 20,
                      className: button.id === "email" ? "text-blue-600" : "",
                    })}
                  </div>
                  <span>{button.text}</span>
                </button>
              ))}
            </div>

            <div className="mt-16 flex items-center">
              <p className="font-inter text-sm flex items-center gap-1.5">
                <span className="text-[#616161]">Are you a Newbie?</span>
                <span className="font-semibold text-[#21ab77] hover:underline cursor-pointer">
                  Join MeetKats - IT&#39;S FREE
                </span>
              </p>
            </div>
          </div>
          {/* <div className="flex-1 relative">
            <img src={hero_image} alt="hero" />
           </div> */}

          <div className="flex-1 relative">
            <div className="w-[247px] h-[233px] absolute top-0 left-[209px]">
              <img
                className="w-[235px] h-[149px] absolute top-[42px] left-1.5"
                alt="Group"
                src="/group.png"
              />
            </div>

            <div className="w-[370px] h-[333px] absolute top-[146px] left-[130px]">
              <div className="w-[305px] h-[270px] relative top-[31px] left-[33px]">
                <img
                  className="w-[298px] h-[261px] absolute -top-px -left-px"
                  alt="Group"
                  src="/group-1.png"
                />
              </div>
            </div>

            <div className="w-[92px] h-[207px] absolute top-[236px] left-[92px]">
              <img
                className="w-[79px] h-[199px] absolute top-[9px] left-3.5"
                alt="Vector"
                src="/vector-46.svg"
              />
              <img
                className="w-[83px] h-[199px] absolute top-0 left-0"
                alt="Vector"
                src="/vector-48.svg"
              />
              <img
                className="w-[71px] h-[45px] absolute top-6 left-1.5"
                alt="Vector"
                src="/vector-47.svg"
              />
              <img
                className="w-[71px] h-[25px] absolute top-[166px] left-1.5"
                alt="Vector"
                src="/vector-65.svg"
              />
              <img
                className="w-[71px] h-[81px] absolute top-[77px] left-1.5"
                alt="Vector"
                src="/vector-49.svg"
              />
              <img
                className="w-[71px] h-[53px] absolute top-[77px] left-1.5"
                alt="Vector"
                src="/vector-52.svg"
              />
              <img
                className="w-[30px] h-[7px] absolute top-[9px] left-1.5"
                alt="Vector"
                src="/vector-51.svg"
              />
              <img
                className="w-4 h-[7px] absolute top-[30px] left-3"
                alt="Vector"
                src="/vector-51.svg"
              />
              <img
                className="w-4 h-[7px] absolute top-[136px] left-3"
                alt="Vector"
                src="/vector-51.svg"
              />
              <img
                className="w-[59px] h-[3px] absolute top-[42px] left-3"
                alt="Vector"
                src="/vector-50.svg"
              />
              <img
                className="w-[59px] h-[3px] absolute top-[50px] left-3"
                alt="Vector"
                src="/vector-50.svg"
              />
              <img
                className="w-[54px] h-[3px] absolute top-[173px] left-[17px]"
                alt="Vector"
                src="/vector-50.svg"
              />
              <img
                className="w-[35px] h-[3px] absolute top-[180px] left-[17px]"
                alt="Vector"
                src="/vector-50.svg"
              />
              <img
                className="w-[50px] h-[3px] absolute top-[147px] left-3"
                alt="Vector"
                src="/vector-50.svg"
              />
              <img
                className="w-[27px] h-[3px] absolute top-[58px] left-3"
                alt="Vector"
                src="/vector-58.svg"
              />
              <img
                className="w-[45px] h-9 absolute top-[84px] left-[19px]"
                alt="Group"
                src="/group-2.png"
              />
              <img
                className="w-[3px] h-[3px] absolute top-[173px] left-3"
                alt="Vector"
                src="/vector-54.svg"
              />
              <img
                className="w-[3px] h-[3px] absolute top-[180px] left-3"
                alt="Vector"
                src="/vector-54.svg"
              />
            </div>

            <img
              className="w-36 h-[164px] absolute top-[304px] left-0"
              alt="Character"
              src="/character-2-1.png"
            />

            <div className="w-[135px] h-[159px] absolute top-[459px] left-[264px] rotate-[0.84deg]">
              <img
                className="w-5 h-[67px] absolute top-2.5 left-[62px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-69.svg"
              />
              <img
                className="w-1 h-3 absolute top-[57px] left-[76px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-62.svg"
              />
              <img
                className="w-[27px] h-[39px] absolute top-[47px] left-[74px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-66.svg"
              />
              <img
                className="w-[15px] h-4 absolute top-[81px] left-1.5 rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-63.svg"
              />
              <img
                className="w-[93px] h-[93px] absolute top-[68px] left-[43px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-6.svg"
              />
              <img
                className="w-3 h-[26px] absolute top-[57px] left-[89px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-9.svg"
              />
              <img
                className="w-[3px] h-[5px] absolute top-14 left-[93px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-2.svg"
              />
              <img
                className="w-[9px] h-[23px] absolute top-[60px] left-[73px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-28.svg"
              />
              <img
                className="w-[31px] h-[46px] absolute top-[94px] left-[17px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-3.svg"
              />
              <img
                className="w-[7px] h-[77px] absolute top-[83px] left-20 rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-16.svg"
              />
              <img
                className="w-[3px] h-1 absolute top-[97px] left-[86px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-8.svg"
              />
              <img
                className="w-[3px] h-1 absolute top-[106px] left-[86px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-8.svg"
              />
              <img
                className="w-[3px] h-1 absolute top-[116px] left-[89px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-8.svg"
              />
              <img
                className="w-4 h-7 absolute top-[113px] left-[42px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-10.svg"
              />
              <img
                className="w-1 h-[26px] absolute top-[73px] left-[113px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-5.svg"
              />
              <img
                className="w-[30px] h-[49px] absolute top-[7px] left-[66px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-61.svg"
              />
              <img
                className="w-[11px] h-[3px] absolute top-[26px] left-[76px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-4.svg"
              />
              <img
                className="w-1.5 h-0.5 absolute top-[27px] left-[66px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-1.svg"
              />
              <img
                className="w-1 h-1.5 absolute top-9 left-[73px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-68.svg"
              />
              <img
                className="w-[3px] h-1 absolute top-[38px] left-[77px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector.svg"
              />
              <img
                className="w-[3px] h-px absolute top-[41px] left-[75px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-7.svg"
              />
              <img
                className="w-[7px] h-[3px] absolute top-[30px] left-[78px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-15.svg"
              />
              <img
                className="w-[5px] h-[3px] absolute top-8 left-[68px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-11.svg"
              />
              <img
                className="w-2.5 h-[3px] absolute top-[30px] left-[77px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-59.svg"
              />
              <img
                className="w-[3px] h-[3px] absolute top-[31px] left-[79px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-35.svg"
              />
              <img
                className="w-[7px] h-0.5 absolute top-[31px] left-[78px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-60.svg"
              />
              <img
                className="w-[7px] h-0.5 absolute top-[33px] left-[78px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-12.svg"
              />
              <img
                className="w-1.5 h-1 absolute top-[38px] left-[78px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-13.svg"
              />
              <img
                className="w-1 h-0.5 absolute top-[34px] left-[69px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-14.svg"
              />
              <img
                className="w-0.5 h-0.5 absolute top-[33px] left-[69px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-34.svg"
              />
              <img
                className="w-[5px] h-0.5 absolute top-[34px] left-[68px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-25.svg"
              />
              <img
                className="w-[5px] h-0.5 absolute top-8 left-[68px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-30.svg"
              />
              <img
                className="w-[9px] h-1 absolute top-[45px] left-[73px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-19.svg"
              />
              <img
                className="w-[9px] h-[3px] absolute top-[45px] left-[73px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-18.svg"
              />
              <img
                className="w-[11px] h-[3px] absolute top-11 left-[73px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-17.svg"
              />
              <img
                className="w-2.5 h-1 absolute top-[45px] left-[73px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-27.svg"
              />
              <img
                className="w-[57px] h-[120px] absolute top-0 left-[67px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-40.svg"
              />
              <img
                className="w-[34px] h-8 absolute top-[70px] left-0 rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-41.svg"
              />
              <img
                className="w-[35px] h-[33px] absolute top-[68px] left-0 rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-20.svg"
              />
              <img
                className="w-[63px] h-[27px] absolute top-[126px] left-[57px] rotate-[-0.84deg]"
                alt="Group"
                src="/group-3.png"
              />
              <img
                className="w-[19px] h-[29px] absolute top-[74px] left-1.5 rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-29.svg"
              />
              <img
                className="w-0.5 h-2 absolute top-[95px] left-5 rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-21.svg"
              />
              <img
                className="w-[3px] h-[5px] absolute top-[83px] left-[52px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-26.svg"
              />
              <img
                className="w-1 h-6 absolute top-[90px] left-[62px] rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-24.svg"
              />
              <img
                className="w-[18px] h-[23px] absolute top-[119px] left-28 rotate-[-0.84deg]"
                alt="Vector"
                src="/vector-22.svg"
              />
            </div>

            <div className="w-[55px] h-[53px] absolute top-[186px] left-40">
              <img
                className="w-[52px] h-[53px] absolute top-0 left-[3px]"
                alt="Union"
                src="/union.svg"
              />
              <img
                className="w-[52px] h-[53px] absolute top-0 left-0"
                alt="Union"
                src="/union-1.svg"
              />
              <img
                className="w-[23px] h-5 absolute top-4 left-[15px]"
                alt="Vector"
                src="/vector-31.svg"
              />
            </div>

            <div className="w-[49px] h-[117px] absolute top-[403px] left-[382px]">
              <div className="w-12 h-[74px] absolute top-0 left-px">
                <div className="w-[38px] h-[53px] absolute top-[21px] left-2.5">
                  <div className="w-[38px] h-[43px] absolute top-0 left-0 bg-[url(/vector-31-1.svg)] bg-[100%_100%]">
                    <img
                      className="w-[15px] h-6 absolute top-[19px] left-3"
                      alt="Vector"
                      src="/vector-32-1.svg"
                    />
                  </div>
                  <div className="w-3 h-0.5 absolute top-11 left-[13px] bg-[#0b5243] rounded-[1px]" />
                  <div className="w-3 h-0.5 absolute top-[47px] left-[13px] bg-[#0b5243] rounded-[1px]" />
                  <div className="w-3 h-0.5 absolute top-[50px] left-[13px] bg-[#0b5243] rounded-[1px]" />
                </div>
                <img
                  className="w-[30px] h-[33px] absolute top-0 left-0"
                  alt="Three lines"
                  src="/three-lines.png"
                />
              </div>
              <img
                className="w-[33px] h-[41px] absolute top-[76px] -left-px"
                alt="Curved line"
                src="/curved-line.svg"
              />
            </div>

            <div className="w-[223px] h-[156px] absolute top-[252px] left-[431px]">
              <img
                className="w-[188px] h-[134px] absolute top-3.5 left-6"
                alt="Vector"
                src="/vector-42.svg"
              />
              <img
                className="w-[183px] h-[134px] absolute top-3.5 left-[27px]"
                alt="Vector"
                src="/vector-37.svg"
              />
              <img
                className="w-[183px] h-[13px] absolute top-3.5 left-[27px]"
                alt="Vector"
                src="/vector-32.svg"
              />
              <img
                className="w-1.5 h-[5px] absolute top-[18px] left-[35px]"
                alt="Vector"
                src="/vector-33.svg"
              />
              <img
                className="w-1.5 h-[5px] absolute top-[18px] left-[42px]"
                alt="Vector"
                src="/vector-33.svg"
              />
              <img
                className="w-1.5 h-[5px] absolute top-[18px] left-[50px]"
                alt="Vector"
                src="/vector-33.svg"
              />
              <div className="w-28 h-[71px] absolute top-8 left-[86px] bg-[url(/vector-43.svg)] bg-[100%_100%]">
                <img
                  className="w-[41px] h-[3px] absolute top-[54px] left-[5px]"
                  alt="Vector"
                  src="/vector-36.svg"
                />
                <img
                  className="w-[34px] h-[3px] absolute top-[60px] left-[5px]"
                  alt="Vector"
                  src="/vector-36.svg"
                />
                <img
                  className="w-[19px] h-[5px] absolute top-[59px] left-[87px]"
                  alt="Vector"
                  src="/vector-44.svg"
                />
                <img
                  className="w-[98px] h-[29px] absolute top-[11px] left-1.5"
                  alt="Group"
                  src="/group-5.png"
                />
              </div>
              <img
                className="w-[135px] h-[125px] absolute top-0 left-0"
                alt="Layer"
                src="/layer-1.svg"
              />
              <div className="w-14 h-[50px] absolute top-[66px] left-[161px]">
                <div className="w-[54px] h-[45px] absolute top-0 left-px bg-[#0b5243] rounded-lg" />
                <div className="w-[54px] h-[45px] absolute top-0 left-0 bg-white rounded-lg border-[0.75px] border-solid border-[#0b5243]" />
                <img
                  className="w-[54px] h-[51px] absolute top-0 left-0"
                  alt="Group"
                  src="/group-35.png"
                />
              </div>
              <img
                className="w-[38px] h-[35px] absolute top-[121px] left-[170px]"
                alt="Group"
                src="/group-3-1.png"
              />
              <div className="w-14 h-[49px] absolute top-[11px] left-[167px]">
                <div className="w-[55px] h-[49px] absolute top-0 left-px bg-[#0b5243] rounded-lg" />
                <div className="w-[55px] h-[49px] absolute top-0 left-0 bg-white rounded-lg border-[0.75px] border-solid border-[#0b5243]" />
                <img
                  className="w-[55px] h-[9px] absolute top-0 left-0"
                  alt="Group"
                  src="/group-35-1.png"
                />
                <img
                  className="w-[41px] h-[30px] absolute top-3 left-[7px]"
                  alt="Group"
                  src="/group-6.png"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What MeetKats Can Offer Section */}
        <section id="features" className="mt-40 px-8">
          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-black text-6xl tracking-[-1.20px] text-center mb-16">
            What MeetKats Can Offer
          </h2>

          {/* Feature Cards */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-wrap justify-center gap-6 py-12 w-full">
              {cards.map((card, index) => (
                <Card
                  key={index}
                  className={`w-[272px] ${card.bgColor ?? "bg-white"} border-none rounded-2xl shadow-md transition-transform hover:scale-105`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 h-[250px] text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow mb-4">
                      {card.icon && (
                        <img
                          src={card.icon}
                          alt={card.iconAlt || "icon"}
                          className={`${card.iconClassName || "w-10 h-10"}`}
                        />
                      )}
                      {card.iconJsx && card.iconJsx}
                    </div>
                    <h3 className="font-semibold text-xl text-[#2b2b2b] leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#2b2b2b] mt-2">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <section id="whymeetkats" className="relative w-full py-20 mt-10 bg-[#e2ecda]">
            <div className="container mx-auto px-4">
              <h2 className=" text-5xl sm:text-6xl font-semibold text-black text-center tracking-[-1.20px] mb-16 font-['Inter',Helvetica]">
                MeetKats vs Other Apps
              </h2>

              <div className="flex flex-col md:flex-row justify-center items-start gap-8 relative">
                <div className="flex-1">
                  <h3 className="text-[40px] font-medium text-[#353333] text-center tracking-[-0.80px] mb-12 font-['Poppins',Helvetica]">
                    MeetKats
                  </h3>
                  {/* MeetKats Column */}
                  <div className="space-y-[62px] lg:ml-24">
                    {meetkatsFeatures.map((feature, index) => (
                      <div
                        key={`meetkats-${index}`}
                        className="flex items-start gap-[52px]"
                      >
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <CheckIcon className="w-[25px] h-[26px] text-blue-300 " />
                          </div>
                        </div>
                        <p className="font-medium text-[#191a15] text-lg leading-[30px] font-['Inter',Helvetica]">
                          {feature}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Separator */}
                <Separator orientation="vertical" className="md:h-[416px] mx-4" />
                {/* OtherApps Column */}
                <div className="flex-1">
                  <h3 className="text-[40px] font-medium text-[#353333] text-center tracking-[-0.80px] mb-12 font-['Poppins',Helvetica]">
                    Other Apps
                  </h3>
                  <div className="space-y-[62px] lg:ml-24">
                    {OtherAppFeatures.map((feature, index) => (
                      <div
                        key={`OtherApp-${index}`}
                        className="flex items-start gap-[52px]"
                      >
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <XIcon className="w-[25px] h-[26px] text-red-500" />
                          </div>
                        </div>
                        <p className="font-medium text-[#191a15] text-lg leading-[30px] font-['Inter',Helvetica]">
                          {feature}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>





              </div>
            </div>
          </section>
        </section>

        {/* How it Works Section */}
        <section className="mt-16 md:mt-24 lg:mt-32 px-4 sm:px-6 md:px-8 max-w-9xl mx-auto">
          {/* Section Title */}
          <h2 className="[font-family:'Inter',Helvetica] font-semibold text-black text-4xl md:text-5xl lg:text-6xl text-center tracking-[-1.20px] mb-8 md:mb-12 lg:mb-16">
            How it Works
          </h2>

          {/* For Desktop: Steps and Cards as separate sections */}
          <div className="block">
            {/* Steps Indicator */}
            <div className="relative mt-8 md:mt-12 lg:mt-16">
              {/* Horizontal Separator */}
              <Separator className="absolute w-full max-w-4xl md:max-w-[800px] lg:max-w-[1099px] h-px top-[57px] left-1/2 transform -translate-x-1/2" />

              {/* Step Layout */}
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                  {howItWorksSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-center w-full max-w-[220px] space-y-3"
                    >
                      {/* Step Index Number */}
                      <div className="text-2xl font-bold text-gray-800 rounded-full w-20 h-20 pt-6" style={{ backgroundColor: step.color }} >{index + 1}</div>

                      {/* Step Title */}
                      <h3 className="text-black font-semibold text-base md:text-lg tracking-tight">
                        {step.title}
                      </h3>

                      {/* Step Circle with Image */}
                      <div className="w-60 h-80 rounded-xl shadow-md overflow-hidden">
                        <img
                          src={step.image}
                          alt={`Step ${index + 1}`}
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ and Frame Section */}
        <section className="mt-32">
          <div className="relative">
            <section className="relative w-full py-8 sm:py-12 md:py-16 bg-[#fff7f4]">
              <div className="container mx-auto px-4">
                {/* Headline */}
                <div className="max-w-4xl mx-auto mb-6 md:mb-12">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl text-center font-normal text-[#111019] leading-tight md:leading-[1.2] tracking-tight md:tracking-[-1px] lg:tracking-[-2px]">
                    More than 10,000 students across 200 colleges choose MeetKats!
                  </h1>
                </div>

                {/* CTA Button */}
                <div className="flex justify-center mb-10 md:mb-20">
                  <Button className="h-12 cursor-pointer md:h-16 lg:h-[67px] px-6 md:px-8 lg:w-[293px] bg-green-600 hover:bg-green-800 text-black text-lg md:text-2xl lg:text-[31px] tracking-tight leading-tight rounded-xl md:rounded-[18px] border border-[#9abe80] font-medium hover:bg-softgreen/90 transition-colors" onClick={() => window.location.href = "./login"}>
                    Get Started Now
                  </Button>
                </div>

                {/* Testimonials Section */}
                <div className="max-w-7xl mx-auto">
                  {/* Section Title */}
                  <div className="mb-8 md:mb-16 text-center relative">
                    <h2 className="font-bold text-3xl md:text-4xl lg:text-[55px] text-black tracking-tight md:tracking-[-1.5px] lg:tracking-[-2.75px] leading-tight max-w-md md:max-w-lg mx-auto">
                      Few Words About Our Platform
                    </h2>
                    <img
                      className="w-10 h-10 md:w-[50px] md:h-[54px] mx-auto mt-4"
                      alt="Decorative element"
                      src="/group-1000004351.png"
                    />
                  </div>

                  {/* Testimonial Cards - Responsive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                    {testimonials.map((testimonial) => (
                      <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                    ))}
                  </div>

                  {/* Pagination Dots */}
                  <div className="flex items-center justify-center gap-3 mt-8 md:mt-10">
                    <div className="w-3 h-1 bg-[#dfdfdf] rounded-lg"></div>
                    <div className="w-3 h-1 bg-[#dfdfdf] rounded-lg"></div>
                    <div className="w-8 md:w-10 h-1 bg-[#fe9171] rounded-lg"></div>
                  </div>
                </div>
              </div>
            </section>
            <section id="myfaq" className="flex flex-col w-full items-start p-4 sm:p-8 md:p-12 lg:p-20 xl:p-[140px] bg-white">
              <div className="flex flex-col lg:flex-row items-start gap-6 md:gap-8 lg:gap-[60px] w-full">
                <h2
                  className="mb-6 lg:mb-0 lg:sticky lg:top-8"
                  style={{
                    fontFamily: '"Outfit", Helvetica',
                    fontWeight: 600,
                    fontSize: '64px',
                    letterSpacing: '-1.28px',
                    lineHeight: '83px',
                    fontStyle: 'normal',
                    color: 'black',
                  }}
                >
                  Frequently <br className="hidden sm:block" />
                  asked questions
                </h2>

                <div className="flex flex-col items-start gap-6 flex-1 w-full">
                  <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border-b border-[#004b49] shadow-[10px_10px_20px_#0f0f0f1a] mb-6 last:mb-0"
                      >
                        <AccordionTrigger className="py-4 px-0 cursor-pointer">
                          <span
                            style={{
                              fontFamily: '"Outfit", Helvetica',
                              fontWeight: 600,
                              fontSize: '28px',
                              letterSpacing: '-0.56px',
                              lineHeight: '36px',
                              fontStyle: 'normal',
                              color: 'black',
                              textAlign: 'left',
                            }}
                          >
                            {item.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="py-2 text-gray-700">
                            {item.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </section>

          </div>
        </section>

        {/* Footer Section */}
        <footer>
          <FooterBlock />
        </footer>
      </div>
    </div>
  );
};
