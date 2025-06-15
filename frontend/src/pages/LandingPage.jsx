import React, { useState, useRef } from "react";

import blueBoy from "../assets/blue-boy.png";
import greenBoy from "../assets/green-boy.png";
import pinkGirl from "../assets/pink-girl.png";
import yellowBoy from "../assets/yellow-boy.png";
import bulb from "../assets/bulb.png";
import tick from "../assets/tick.png";
import network from "../assets/network-connection.png";
import writingBoard from "../assets/writing-board.png";
import iconNetworking from "../assets/icon-networking.png";
import iconEvent from "../assets/icon-event.png";
import iconConnections from "../assets/icon-connections.png";
import iconImpact from "../assets/icon-impact.png";
import logo from "../assets/MeetKats.jpg";
// You'll need to add these new image assets
import checkCircleRed from "../assets/image.png";
import checkCircleGreen from "../assets/image.png";
import step1Icon from "../assets/image.png";
import step2Icon from "../assets/image.png";
import step3Icon from "../assets/image.png";
import step4Icon from "../assets/image.png";
import testimonialProfile1 from "../assets/image.png";
import testimonialProfile2 from "../assets/image.png";
import testimonialProfile3 from "../assets/image.png";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  
  // Refs for section scrolling
  const featuresRef = useRef(null);
  const whyMeetkatsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const eventsRef = useRef(null);
  const contactRef = useRef(null);

  // Handle continue to website button click
  const handleContinueClick = () => {
    navigate("/login");
  };

  // Handle scroll to section
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const offers = [
    {
      title: "Micro Networking",
      description: "Connect with peers from your college, city, or field.",
      bgColor: "bg-green-100",
      icon: iconNetworking,
    },
    {
      title: "Event Hosting & Discovery",
      description: "Host and manage professional events with ease.",
      bgColor: "bg-blue-100",
      icon: iconEvent,
    },
    {
      title: "Curated Connections",
      description: "Get matched with like-minded folks.",
      bgColor: "bg-yellow-100",
      icon: iconConnections,
    },
    {
      title: "Real Impact",
      description:
        "Not just numbers. Build a meaningful network that helps you move forward.",
      bgColor: "bg-red-100",
      icon: iconImpact,
    }
    
  ];

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  const faqItems = [
    {
      question: "What is Meetkats?",
      answer: "MeetKats is a micro-networking platform focused on creating meaningful connections for students and professionals. It helps you build your inner circle through targeted networking and events."
    },
    {
      question: "What will you get after joining us?",
      answer: "After joining MeetKats, you'll get access to micro-networking circles, event hosting capabilities, curated connections with like-minded professionals, and tools to build meaningful relationships that help your career growth."
    },
    {
      question: "How to register for an Event?",
      answer: "To register for an event, log into your MeetKats account, navigate to the Events section, choose an event you're interested in, and click the Register button. You'll receive a confirmation email with all the details."
    },
    {
      question: "How will we help you in Networking?",
      answer: "We help you network by matching you with relevant connections based on your interests, field, and goals. Our platform focuses on quality over quantity, enabling meaningful connections rather than accumulating random contacts."
    },
    {
      question: "What is different in Meetkats from other websites?",
      answer: "Unlike broad networking platforms, MeetKats focuses on micro-networking with meaningful connections. We prioritize quality interactions over content sharing, and offer targeted networking specifically designed for professional and academic growth."
    }
  ];

  const comparisonPoints = {
    linkedin: [
      "Broad, global, often impersonal",
      "Focused on content & personal branding"
    ],
    meetkats: [
      "Targeted, local, personalized",
      "Focused on meaningful connections"
    ]
  };

  const testimonials = [
    {
      id: 1,
      name: "Albert Flores",
      position: "Video editor",
      image: testimonialProfile1,
      text: "Very impressive video editing tool have ever seen. It has so many awesome features to a video like pro. I have enjoy a lot while making my youtube channel video. Really impressive video editing tool for me."
    },
    {
      id: 2,
      name: "Mr. Jan",
      position: "FOUNDER, STRATEGY & FINANCE",
      image: testimonialProfile2,
      text: "Very impressive video editing tool have ever seen. It has so many awesome features to a video like pro. I have enjoy a lot while making my youtube channel video. Really impressive video editing tool for me."
    },
    {
      id: 3,
      name: "Denis",
      position: "VIDEO PRODUCER",
      image: testimonialProfile3,
      text: "Very impressive video editing tool have ever seen. It has so many awesome features to a video like pro. I have enjoy a lot while making my youtube channel video. Really impressive video editing tool for me."
    }
  ];

  const howItWorksSteps = [
    {
      number: 1,
      title: "Sign up",
      description: "Create your MeetKats account in seconds.",
      color: "bg-yellow-200",
      icon: step1Icon
    },
    {
      number: 2,
      title: "Join a circle or create one.",
      description: "Find your people or start your own network.",
      color: "bg-green-200",
      icon: step2Icon
    },
    {
      number: 3,
      title: "Match, meet, grow!",
      description: "Connect with people who can help you advance.",
      color: "bg-red-200",
      icon: step3Icon
    },
    {
      number: 4,
      title: "Attend, host events in your niche.",
      description: "Expand your network with targeted events.",
      color: "bg-blue-200",
      icon: step4Icon
    }
  ];

  return (
    <div className="font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-20 py-6 shadow">
        <div className="text-2xl font-bold text-primary flex items-center gap-2">
          <img src={logo} alt="Meetkats Logo" className="h-8" />
          Meetkats
        </div>
        <div className="hidden md:flex gap-6 items-center text-sm">
          <a href="#" onClick={(e) => {e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' })}} className="hover:underline">
            Home
          </a>
          <a href="#" onClick={(e) => {e.preventDefault(); scrollToSection(featuresRef)}} className="hover:underline">
            Features
          </a>
          <a href="#" onClick={(e) => {e.preventDefault(); scrollToSection(whyMeetkatsRef)}} className="hover:underline">
            Why MeetKats
          </a>
          {/* <a href="#" onClick={(e) => {e.preventDefault(); scrollToSection(eventsRef)}} className="hover:underline">
            Events
          </a> */}
          <a href="#" onClick={(e) => {e.preventDefault(); scrollToSection(contactRef)}} className="hover:underline">
            Contact
          </a>
          <a href="/login" className="hover:underline">
            Sign In
          </a>
          <button className="bg-pink-500 text-white px-4 py-2 rounded-md text-sm" onClick={handleContinueClick}>
            Join the wanted
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full bg-white px-6 md:px-20 py-20 flex flex-col md:flex-row items-center justify-between">
        <div className="max-w-xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Your Inner Circle <br /> Just Got Bigger.
          </h1>
          <p className="text-gray-600 text-lg">
            Micro-networking for meaningful career growth — from classrooms to conferences.
          </p>
          <div className="space-y-4">
            <button 
              className="w-full md:w-[500px] bg-[#4285F4] text-white px-6 py-3 rounded-lg font-medium"
              onClick={handleContinueClick}
            >
              Continue to Website
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Are you a Newbie?{' '}
            <a href="#" onClick={handleContinueClick} className="text-green-600 font-semibold underline">
              Join MeetKats - IT'S FREE
            </a>
          </p>
        </div>

        {/* Hero Image Side with Overlays */}
        <div className="relative w-full md:w-[500px] h-[500px] mx-auto mt-16 md:mt-0">
          {/* Center network */}
          <img
            src={network}
            alt="network"
            className="absolute top-1/2 left-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2 z-0"
          />

          {/* Top (blue boy presenting) */}
          <img
            src={blueBoy}
            alt="writing-board"
            className="absolute top-[-18px] left-1/2 w-[180px] -translate-x-1/2 z-10"
          />

          {/* Top-left tick */}
          <img
            src={tick}
            alt="tick"
            className="absolute top-[150px] left-[120px] w-[40px] z-20"
          />

          {/* Left mobile mockup */}
          <img
            src={writingBoard}
            alt="mobile"
            className="absolute top-[170px] left-[40px] w-[100px] z-10"
          />

          {/* Bottom-left yellow boy */}
          <img
            src={yellowBoy}
            alt="yellow-boy"
            className="absolute bottom-[100px] left-[-30px] w-[120px] z-10"
          />

          {/* Bottom pink girl */}
          <img
            src={pinkGirl}
            alt="pink-girl"
            className="absolute bottom-[30px] left-1/2 w-[110px] -translate-x-1/2 z-10"
          />

          {/* Bulb attached near pink girl */}
          <img
            src={bulb}
            alt="bulb"
            className="absolute bottom-[70px] left-[300px] w-[40px] z-20"
          />

          {/* Right green boy */}
          <img
            src={greenBoy}
            alt="green-boy"
            className="absolute top-[180px] right-[-30px] w-[180px] z-10"
          />
        </div>
      </section>

      {/* LinkedIn vs MeetKats Comparison */}
      <section ref={whyMeetkatsRef} className="w-full bg-green-50 py-16 px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          LinkedIn vs MeetKats
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-12 md:gap-24">
          {/* LinkedIn Side */}
          <div className="flex-1 max-w-md">
            <h3 className="text-2xl font-semibold mb-8 text-center">LinkedIn</h3>
            <div className="space-y-4">
              {comparisonPoints.linkedin.map((point, index) => (
                <div key={index} className="flex items-center gap-4">
                  <img src={checkCircleRed} alt="×" className="w-6 h-6" />
                  <p className="text-base">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MeetKats Side */}
          <div className="flex-1 max-w-md">
            <h3 className="text-2xl font-semibold mb-8 text-center">MeetKats</h3>
            <div className="space-y-4">
              {comparisonPoints.meetkats.map((point, index) => (
                <div key={index} className="flex items-center gap-4">
                  <img src={checkCircleGreen} alt="✓" className="w-6 h-6" />
                  <p className="text-base">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section ref={howItWorksRef} className="w-full bg-white py-16 px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How it Works
        </h2>
        
        {/* Steps */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-16">
          {howItWorksSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center mb-8 md:mb-0">
              <div className={`${step.color} flex items-center justify-center w-16 h-16 rounded-full mb-4`}>
                <span className="text-2xl font-bold">{step.number}</span>
              </div>
              <h3 className="font-medium mb-2">{step.title}</h3>
            </div>
          ))}
        </div>

        {/* Screenshot mockups */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <div className="h-6 bg-green-100 rounded-md w-16 mb-3"></div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-blue-50 rounded-md w-full"></div>
                <div className="h-3 bg-blue-50 rounded-md w-full"></div>
                <div className="h-3 bg-blue-50 rounded-md w-3/4"></div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-8 w-8 bg-blue-400 rounded-full"></div>
                <div className="h-8 w-8 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What We Offer */}
      <section ref={featuresRef} className="w-full bg-white py-16 px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          What MeetKats Can Offer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-sm ${offer.bgColor} flex flex-col gap-4`}
            >
              <img src={offer.icon} alt={offer.title} className="w-12 h-12" />
              <h3 className="text-xl font-semibold">{offer.title}</h3>
              <p className="text-gray-700 text-sm">{offer.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Events and Statistics */}
      {/* <section ref={eventsRef} className="w-full bg-rose-50 py-16 px-6 md:px-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">
          More than 10,000 students across 200 colleges choose MeetKats!
        </h2>
        <button 
          className="bg-green-100 text-gray-800 font-medium px-8 py-3 rounded-full text-lg shadow-sm hover:shadow-md transition-all"
          onClick={handleContinueClick}
        >
          Get Started Now
        </button>
      </section> */}

     
      {/* <section className="w-full bg-rose-50 py-16 px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
          Few Words About Our <span className="relative">Platform <span className="absolute -right-8 -top-1 text-green-500">✓</span></span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className={testimonial.id === 1 ? "bg-gray-900 text-white p-8 rounded-lg" : "bg-white p-8 rounded-lg"}>
              {testimonial.id === 1 && <span className="text-6xl text-white mb-4 block">"</span>}
              <p className="mb-6">{testimonial.text}</p>
              {testimonial.id !== 1 && <a href="#" className="text-red-500">Read More</a>}
              <div className="flex items-center mt-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center mt-8 gap-2">
          <span className="w-8 h-1 bg-gray-300 rounded-full"></span>
          <span className="w-8 h-1 bg-red-500 rounded-full"></span>
        </div>
      {/* </section> */} 

      {/* FAQ Section */}
      <section className="w-full bg-white py-16 px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Frequently asked questions
        </h2>
        
        <div className="max-w-3xl">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b py-4">
              <button
                className="w-full flex items-center justify-between text-left focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <h3 className="text-lg font-medium">{item.question}</h3>
                <div className={`w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white transition-transform ${openFaq === index ? 'rotate-45' : ''}`}>
                  {openFaq === index ? '×' : '+'}
                </div>
              </button>
              {openFaq === index && (
                <div className="mt-2 text-gray-600">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer ref={contactRef} className="w-full bg-green-50 py-12 px-6 md:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center gap-4 mb-8">
            <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-800">in</span>
            </a>
            <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600">f</span>
            </a>
            <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-400">t</span>
            </a>
          </div>
          
          <div className="bg-green-100 p-6 rounded-lg mb-8">
            <h3 className="font-medium text-lg mb-4">Contact us:</h3>
            <p className="mb-2">Email: official@meetkats.com</p>
            <p className="mb-2">Phone: +919532448802</p>
            <p>Address: 237/3C ROOMA <br/> KANPUR UTTARPARDESH 208001</p>
          </div>
          
          <div className="border-t pt-6 text-center text-sm text-gray-600">
          <p>© 2025 Meetkats. All Rights Reserved.  <span className="mx-4">|</span>  <a href="/privacypolicy" className="underline">Privacy Policy</a>
            <span className="mx-4">|</span> <a href="/termsandconditons" className="underline">Terms&Conditons</a>
            <span className="mx-4">|</span> <a href="/refundpolicy" className="underline">Refund Policy </a>
            
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
