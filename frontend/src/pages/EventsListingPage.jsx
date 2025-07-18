import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  MapPin,
  Filter,
  ArrowUpDown,
  Users,
  Tag,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import eventService from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Sidebar from "../components/common/Navbar";
import { FooterBlock } from "./BhoomiLandingPage/sections/FooterBlock";

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";

    try {
      const options = { weekday: "short", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-US", options);
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Invalid date";
    }
  };

  const getAttendeeCount = (attendeeCounts, type) => {
    if (!attendeeCounts) return 0;

    const count = attendeeCounts[type];

    if (typeof count === "number") {
      return count;
    }

    if (count && typeof count === "object" && count.count !== undefined) {
      return count.count;
    }

    return 0;
  };

  const goingCount = getAttendeeCount(event.attendeeCounts, "going");

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border cursor-pointer">
      <div className="relative">
        <img
          src={event.coverImage?.url || "/api/placeholder/400/200"}
          alt={event.name || "Event"}
          className="w-full h-48 object-cover"
        />
        {event.category && (
          <span className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded-full">
            {typeof event.category === "string" ? event.category : "Other"}
          </span>
        )}
        <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-2 py-1">
          <p className="text-xs font-semibold text-gray-800">
            {formatDate(event.startDateTime)}
          </p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
          {event.name || "Untitled Event"}
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1 text-blue-500" />
          <span className="text-sm truncate">
            {event.virtual
              ? "Virtual Event"
              : event.location?.name || "Location TBA"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-1">
              {[
                ...Array(
                  Math.min(
                    3,
                    goingCount > 0
                      ? Math.max(1, Math.floor(goingCount / 20))
                      : 1
                  )
                ),
              ].map((_, i) => (
                <div
                  key={`avatar-${i}-${event._id || event.id}`}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center"
                >
                  <span className="text-xs text-white font-medium">
                    {String.fromCharCode(65 + i)}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-600 ml-2">
              {goingCount || 0} attending
            </span>
          </div>
          <Link to={`/events/${event._id || event.id}`}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 cursor-pointer">
              View
            </button>
          </Link>
          {event.id === "skillshift" && event.ticketUrl && (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 cursor-pointer"
            >
              Book Ticket
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const CarouselCard = ({ event }) => {
  const truncateDescription = (text, maxLength = 80) => {
    if (!text) return "Join us for an amazing experience";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    try {
      const options = { weekday: "long", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-US", options);
    } catch (err) {
      return "Date TBA";
    }
  };

  return (
    <div className="relative min-w-full h-80 rounded-2xl overflow-hidden shadow-lg">
      <img
        src={event.coverImage?.url || "/api/placeholder/800/320"}
        alt={event.name || "Featured Event"}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            {formatDate(event.startDateTime)}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2 line-clamp-2">
          {event.name || "Featured Event"}
        </h2>
        <p className="text-sm opacity-90 mb-4 line-clamp-2">
          {truncateDescription(event.description)}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {event.virtual
                  ? "Virtual"
                  : event.location?.name || "Location TBA"}
              </span>
            </div>
            {event.attendeeCounts?.going > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {event.attendeeCounts.going} attending
                </span>
              </div>
            )}
          </div>
          <Link to={`/events/${event._id || event.id}`}>
            <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
              View Event
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const EventListingPage = () => {
  const [events, setEvents] = useState([]);
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [categories, setCategories] = useState([
    "All",
    "Business",
    "Technology",
    "Social",
    "Education",
    "Entertainment",
    "Health",
    "Other",
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const apiFilters = {};

        if (filter === "upcoming") {
          apiFilters.filter = "upcoming";
        } else if (filter === "past") {
          apiFilters.filter = "past";
        } else if (filter === "all") {
          // No filter for all events
          apiFilters.filter = "all";
        }

        if (categoryFilter && categoryFilter !== "All") {
          apiFilters.category = categoryFilter.toLowerCase();
        }

        if (searchQuery) {
          apiFilters.search = searchQuery;
        }

        const response = await eventService.getEvents(apiFilters);

        if (response.categories && response.categories.length > 0) {
          const extractedCategories = [
            "All",
            ...response.categories.map((cat) =>
              typeof cat === "string" ? cat : cat._id || "Other"
            ),
          ];
          setCategories(extractedCategories);
        }

        const eventsData = response.events || response.data || [];
        const ideationxEvent = {
          id: "ideationx2",
          name: "IdeationX 2.0",
          description: `IdeationX 2.0 is a national innovation challenge by SBI Life, inviting students from select 100 colleges to reinvent the insurance sector.\n\nTotal Prizes: ₹18,00,000\n\nCompetition Structure:\n1. Idea Screening Submission: 2-min elevator pitch video\n2. Detailed Summary Round: 8-10 slide presentation\n3. Zonal Semi-Final (Offline): Regional in-person pitch\n4. Grand Finale (Offline): Present to SBI Life execs and industry leaders\n\nRewards:\n- Winner: ₹10,00,000 + goodies, certificates, trophies\n- 1st Runner-Up: ₹5,00,000 + goodies, certificates, trophies\n- 2nd Runner-Up: ₹3,00,000 + goodies, certificates, trophies\n- Semi-Finalists: Goodies, certificates\n- Select participants: PPIs, CNBC feature, celebrity interaction\n\nEligibility: Teams of 3, students from select 100 colleges, no cross-college teams.\n\nRegistration Deadline: 3rd Aug 2025, 11:59 PM IST\n\nFor more details and registration, visit the official website.`,
          startDateTime: "2025-07-16T09:00:00Z",
          endDateTime: "2025-08-03T23:59:00Z",
          location: {
            name: "Online",
            address: "Online",
          },
          virtual: true,
          category: "Hackathon",
          coverImage: {
            url: "/ideation.webp",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/competition/ideationx-2-unstop-1142539",
        };
        const airothonEvent = {
          id: "airothon2025",
          name: "AiroThon 2025 - Agentic AI Hackathon",
          description: `AiroThon 2025 is a platform for professionals, developers, engineers, and data scientists to find creative, practical solutions using MS Platform to real-world problems in BFSI, Healthcare, and Manufacturing domains.\n\nTheme: Agentic AI\n\nCash Pool Prize: 75,000 INR\nRegistration Fee: Free\nEligibility: Fresher, Experienced Professionals, Engineering Students\n\nStages: Pre-screening, Online submission and presentations, top 10 teams for offline battle.\n\nVenue: Online\n\nImportant Dates:\n- Start of Pre-screening Submission: 16th July 2025\n- Last Date of Pre-screening PPT Submission: 21st July 2025\n- Pre-screening Result Announcement: 27th July 2025\n- Round 1 Hackathon (Online): 11th August 2025\n- Round 2 Offline: 22nd August 2025\n\nFor more details and problem statements, visit the event page.`,
          startDateTime: "2025-07-16T09:00:00Z",
          endDateTime: "2025-08-22T18:00:00Z",
          location: {
            name: "Online",
            address: "Online",
          },
          virtual: true,
          category: "Hackathon",
          coverImage: {
            url: "/airo.webp",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/hackathons/airothon-2025-agentic-ai-hackathon-airo-digital-labs-1524702",
        };
        const dataVortexEvent = {
          id: "datavortex2025",
          name: "DataVortex SkyIntellect Hackfest 2025",
          description: `DataVortex SkyIntellect Hackfest 2025 is a global 24-hour software hackathon organized by student-led clubs of KL University — including the School of Data Science Club, Cyber Security Club, Garuda Club, and VEDA Club.\n\nThis hackathon invites student innovators to develop impactful, software-based solutions in emerging domains such as Data Science, Cybersecurity, and Drone Technology. With expert mentorship, global collaboration, and an exciting offline finale, it's an ideal platform to learn, innovate, and grow.\n\nPrizes & Internship Opportunities:\nTop 1 Team (per domain): Internship opportunities + ₹5,000 cash prize\nTop 2 Team (per domain): ₹2,000 cash prize\nTop 3 Team (per domain): ₹1,000 cash prize\n\nVenue: Koneru Lakshmaiah Education Foundation (K.L. University), Guntur\nKL University, Green Fields, Vaddeswaram, Andhra Pradesh 522302, Guntur, Andhra Pradesh, India\n\nRegistrations Open: 17 July 2025\nLast Date to Register: 5th August 2025\nFinal Hackathon Event (Offline): 6th & 7th October 2025`,
          startDateTime: "2025-10-06T09:00:00Z",
          endDateTime: "2025-10-07T18:00:00Z",
          location: {
            name: "KL University, Green Fields, Vaddeswaram, Andhra Pradesh 522302, Guntur, Andhra Pradesh, India",
            address:
              "KL University, Green Fields, Vaddeswaram, Andhra Pradesh 522302, Guntur, Andhra Pradesh, India",
          },
          virtual: false,
          category: "Hackathon",
          coverImage: {
            url: "/DataVortex.webp",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/hackathons/datavortex-skyintellect-hackfest-2025-koneru-lakshmaiah-education-foundation-kl-university-guntur-1521579",
        };
        const skillShiftEvent = {
          id: "skillshift",
          name: "SkillShift – Tech for Skilling & Employment",
          description:
            "SkillShift is a premier event focused on leveraging technology for skilling and employment. Join industry leaders, innovators, and job seekers for a day of insightful talks, networking, and opportunities. Don't miss the chance to upskill and connect!",
          startDateTime: "2024-07-15T10:00:00Z",
          endDateTime: "2024-07-15T18:00:00Z",
          location: { name: "Virtual Event" },
          virtual: true,
          category: "Hackathon",
          coverImage: {
            url: "/skillshift.webp",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/hackathons/skillshift-tech-for-skilling-employment-fairseat-1525081",
        };
        const aceReframeEvent = {
          id: "acereframe2025",
          name: "AceReframe: The UI/UX Challenge",
          description: `AceReframe: The UI/UX Challenge is a national-level solo design competition by Bootcoding (creators of AceInt). Reimagine and redesign any page of the AceInt platform to elevate its user experience and interface.\n\nOpen to individuals only.\n\nRewards:\n- Winner: Cash Prize + Direct Interview Opportunity with Bootcoding\n- First Runner-Up: Cash Prize + Direct Interview Opportunity\n- Top 5: Certificates/Goodies\n\nRegistration Deadline: 29th July 2025, 12:00 AM IST\nSubmission Deadline: 18th July 2025, 11:59 PM IST\n\nFor more details and registration, visit the event page.`,
          startDateTime: "2025-07-14T09:00:00Z",
          endDateTime: "2025-07-29T00:00:00Z",
          location: {
            name: "Online",
            address: "Online",
          },
          virtual: true,
          category: "Hackathon",
          coverImage: {
            url: "/ace.webp",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/hackathons/acereframe-the-uiux-challenge-bootcoding-pvt-ltd-1522662",
        };
        const aiHiringShowEvent = {
          id: "aihiringshow2025",
          name: "The AI Hiring Show: Tech + Business Edition",
          description: `The AI Hiring Show - 2nd Edition by Rabbitt Learning is back, bringing together AI developers, marketers, product thinkers, problem solvers, and recruiters from top companies.\n\nWho Should Attend?\n- AI Developers, Engineers, Coders\n- Product, Strategy, and Business Students\n- Marketers, Creators, and Operators\n- College Students (any stream)\n- Working Professionals (0–4 years experience)\n\nEvent Details:\n- Date: 2nd August 2025\n- Location: New Delhi (In-person only)\n- Time: 9:00 AM – 6:00 PM\n- Registration Fee: Free\n\nFormat: Problem Solving Sprint, Pitch Round, Hiring & Final Conversations.\n\nOutcomes: On-the-spot job offers, interview calls, certificates, networking, and more.\n\nRegistration Deadline: 30th July 2025, 11:00 PM IST\n\nFor more details and registration, visit the event page.`,
          startDateTime: "2025-08-02T09:00:00+05:30",
          endDateTime: "2025-08-02T18:00:00+05:30",
          location: {
            name: "New Delhi, Delhi, India",
            address: "New Delhi, Delhi, India",
          },
          virtual: false,
          category: "Hackathon",
          coverImage: {
            url: "/THEAI.webp",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/hackathons/the-ai-hiring-show-tech-business-edition-rabbittai-1525713",
        };
        const openSourceSummerEvent = {
          id: "opensource2025",
          name: "Open Source Summer Code",
          description: `Open Source Summer Code is a 1-month hands-on coding journey for students passionate about open-source and real-world projects.\n\nWhy Join?\n- Contribute to real open-source projects\n- Build a strong project portfolio\n- Receive mentorship from experienced developers\n- Network with tech peers\n- Internship tie-ups for top contributors\n\nPrizes:\n- 1st Prize: ₹4,000 cash + Goodies worth ₹10,000\n- 2nd Prize: ₹3,000 cash + Goodies worth ₹8,000\n- 3rd Prize: ₹1,000 cash + Goodies worth ₹5,000\n\nPlatform: Git, GitHub, WhatsApp, Discord\n\nRegistration Deadline: 29th July 2025, 11:55 PM IST\n\nFor more details and registration, visit the event page.`,
          startDateTime: "2025-07-21T09:00:00+05:30",
          endDateTime: "2025-08-21T18:00:00+05:30",
          location: {
            name: "Online",
            address: "Online",
          },
          virtual: true,
          category: "Hackathon",
          coverImage: {
            url: "/open.webp",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/hackathons/open-source-summer-code-nexorainfotech-1524774",
        };
        const zuoraPromptAThonEvent = {
          id: "zuorapromptathon2025",
          name: "Zuora Prompt-A-Thon 2025: The 10x Catalyst",
          description: `Welcome to the Zuora Prompt-A-Thon 2025: The 10x Catalyst—an experience designed for professionals who are ready to think differently, experiment boldly, and explore the true potential of generative AI.\n\nThis Prompt-A-Thon is a creative space for professionals who have a creative mind focused on solving real business challenges using smart, structured, and strategic prompting. Whether you want to sharpen your prompting skills, exchange ideas with forward-thinkers, or gain visibility with an innovation-led global brand, this is where it all begins.\n\n**Eligibility Criteria**\nOpen to working professionals with at least 3 years of experience in software development, or related technical roles such as DevOps, QA, and data engineering. Also open to techno-functional professionals working as product managers, solution architects, etc. Applicants must be currently based in India.\n\n**Team Size:** Solo\n**Mode:** In Person\n**Fee:** Free\n\n**Dates:**\n02 Jul 25, 12:01 AM IST - 30 Jul 25, 11:59 PM IST\n\nFor more details and registration, visit the official website.`,
          startDateTime: "2025-07-02T00:01:00+05:30",
          endDateTime: "2025-07-30T23:59:00+05:30",
          location: {
            name: "In Person (India)",
            address: "India",
          },
          virtual: false,
          category: "Hackathon",
          coverImage: {
            url: "/zuora.webp",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://vision.hack2skill.com/event/zuora-prompt-a-thon-2025?sectionid=6862172eaf151d42f18f2273",
        };
        const spaceAppsNoidaEvent = {
          id: "spaceappsnoida2025",
          name: "Space Apps Challenge Noida 2025",
          description: `Registration for the 2025 NASA Space Apps Challenge opens July 17!\n\nThe main event page will be opening on the 17th of July. Once you register on our platform, you will be getting an opportunity to stand out from others by registering on the H2S platform.\n\n**Team Size:** 2-6\n**Mode:** In Person\n**Fee:** Free\n\n**Dates:**\n01 Jul 25, 04:55 PM IST - 07 Sep 25, 11:59 PM IST\n\nLocation: Noida\n\nFor more details and registration, visit the official website.`,
          startDateTime: "2025-07-01T16:55:00+05:30",
          endDateTime: "2025-09-07T23:59:00+05:30",
          location: {
            name: "Noida",
            address: "Noida, India",
          },
          virtual: false,
          category: "Hackathon",
          coverImage: {
            url: "/space.webp",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://vision.hack2skill.com/event/nasaspaceappsnoida2025?sectionid=6863c5a8ec35720c9409e656",
        };
        const tvsEpicEvent = {
          id: "tvsepic7it2025",
          name: "TVS Credit E.P.I.C 7.0 — IT Challenge",
          description: `TVS Credit presents E.P.I.C (Enrich, Perform, Innovate, Challenge) a campus challenge programme designed for college students.\n\nThis contest offers you a platform to apply your technical knowledge and skills to real-life business problems. Through your participation, you stand the chance to network with the best minds in the industry, hone your skills through the challenges, and to top it all, win exciting cash rewards.\n\n**Eligibility Criteria:**\n- B.Tech/B.E students from 3rd and 4th year, M.E./M.Tech students and MBA (IT) students are eligible to participate.\n- The participants should be full-time students of the same college.\n- The participants could either register individually or as a team of two.\n- One person can’t be a member of more than one team.\n- No cross-college teams allowed.\n\n**Team Size:** 1-2\n**Mode:** Online\n\n**Stages:**\n- Round 1: Assessment (MCQs + Coding)\n- Round 2: Case Study Challenge\n- Round 3: Grand Finale (Prototype Building)\n\n**Prizes:**\n- 1st Prize: INR 1,00,000\n- 2nd Prize: INR 75,000\n- 3rd Prize: INR 50,000\n- PPI opportunities for select top performers\n- Participation Certificates\n\n**Registration Deadline:** 03 Aug 25, 11:59 PM IST\n\nFor more details and registration, visit the official website.`,
          startDateTime: "2025-07-09T00:00:00+05:30",
          endDateTime: "2025-08-03T23:59:00+05:30",
          location: {
            name: "Online",
            address: "Online",
          },
          virtual: true,
          category: "Challenge",
          coverImage: {
            url: "/tvs.png",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/competitions/tvs-credit-epic-70-it-challenge-epic-season-7-tvs-credit-1510621",
        };
        const vignetteEvent = {
          id: "vignettefilm2025",
          name: "Vignette | The Film-Making Competition",
          description: `Vignette is the canvas for your cinematic vision — the official filmmaking event of Atharv Ranbhoomi 2025, where creativity meets craft, and storytelling becomes spectacle. Whether you're a one-take wonder or a director in the making, this is your chance to shoot something unforgettable.\n\n**About the Event:**\nVignette celebrates the art of filmmaking in its raw, expressive, and imaginative form. From scripting to shooting, directing to editing — every frame you capture is a window into your world.\nWhether you’re into thrillers, dramas, documentaries, or satire — if you’ve got a story to tell and a lens to tell it with, Vignette is where it all comes together.\n\n**Why Should You Participate:**\n- Explore your passion for visual storytelling in a national arena\n- Compete with some of India’s most talented campus filmmakers\n- Gain recognition for your creative voice, technique, and narrative\n- Shoot and screen your work at IIM Indore’s fest, Atharv Ranbhoomi 2025\n- Be judged on everything from story structure and cinematography to editing and innovation\n\n**Eligibility & Guidelines:**\n- Open to college students across India\n- Multiple teams per college allowed\n- Each participant can be part of only one team\n- Final filmmaking challenges will take place on campus at IIM Indore\n- Submissions must follow format and content guidelines (shared post-registration)\n- Films in any language are allowed, but subtitles are mandatory for vernacular entries\n- Judges’ decisions will be final and binding\n- Stay updated via email, Instagram, and the Atharv website for themes and announcements\n\nSo gather your crew, charge your batteries, and hit record — because VIGNETTE 2025 isn’t just about filmmaking. It’s about crafting stories that stay.\n\n**Location:** IIM INDORE, Indore, Madhya Pradesh, India\n**Registration Deadline:** 01 Aug 25, 12:00 AM IST\n\nFor more details and registration, visit the official website.`,
          startDateTime: "2025-07-14T00:00:00+05:30",
          endDateTime: "2025-08-01T00:00:00+05:30",
          location: {
            name: "IIM INDORE, Indore, Madhya Pradesh, India",
            address: "IIM INDORE, Indore, Madhya Pradesh, India",
          },
          virtual: false,
          category: "Film Competition",
          coverImage: {
            url: "/film.png",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/events/vignette-the-film-making-competition-atharv-ranbhoomi-2025-the-international-management-cultural-literary-and-spo-1504667",
        };
        const timeCapsuleEvent = {
          id: "timecapsule2025",
          name: "Time Capsule",
          description: `A Photography Contest by Petrichor '26, the annual techno-cultural fest of IIT Palakkad!\n\nRelive your childhood through a photograph of an object that holds memories — a toy, lunchbox, book, or anything that sparks nostalgia.\n\n**Rules at a Glance:**\n- Only objects allowed as the subject – No people, animals, or landscapes.\n- The object can be kept anywhere (enhancing the theme) as long as it's the focus.\n- Submit 1 photo per participant.\n- Include a title + a caption (max 50 words).\n- Only basic edits allowed (brightness, contrast, crop).\n- No filters, AI images, or internet-sourced photos.\n- File Format: JPG/PNG | Max Size: 10MB\n- Rename file as: YourName_Title.jpg\n- Submit via: Gform link\n\n**Judging Criteria:**\n- Relevance to Theme\n- Visual Appeal\n- Storytelling & Caption\n- Originality & Creativity\n\n**Disqualification If:**\n- Entry includes people, scenery as the main focus, or AI/stock content\n- More than one entry\n- Late submission\n\n**Prize pool:** ₹3,500\n\n**Submission link:** https://forms.gle/nWpJA16Zy4T7Naxs6\n\n**Location:** Online\n**Registration Deadline:** 02 Aug 25, 11:59 PM IST\n**Deadline:** 02 Aug 25, 11:59 PM IST\n\nFor more details and registration, visit the official website.`,
          startDateTime: "2025-07-16T00:00:00+05:30",
          endDateTime: "2025-08-02T23:59:00+05:30",
          location: {
            name: "Online",
            address: "Online",
          },
          virtual: true,
          category: "Photography Contest",
          coverImage: {
            url: "/time.png",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/events/time-capsule-petrichor-26-iit-palakkad-1524746",
        };
        const musicChallengeEvent = {
          id: "48hourmusic2025",
          name: "48 Hour Music Challenge",
          description: `MAGAN, the Official Music Club of SRM IST Delhi NCR presents The 48-Hour Music Challenge inviting college students from across India to take on a unique musical mission to create a complete original performance based on a surprise theme, in just two days.\n\n**General Guidelines – 48-Hour Music Challenge**\n- Open to all college students across India\n- Perform solo or in a group (maximum 4 members)\n- All music genres are welcome, but your piece must reflect the given theme/topic\n- The 48-Hour Music Challenge is a theme-based musical competition where participants are given a topic or concept and exactly 48 hours to create and submit an original music performance based on it.\n- It’s about pushing creativity under pressure. Whether you’re a solo artist, rapper, instrumentalist, or a group, the goal is to express the given theme through your music all in just two days.\n\n**Performance Duration & Breakdown**\n- Total performance duration: 3 to 5 minutes\n- Talk about how the theme inspired your piece\n- Up to 4 minutes: Your pre-recorded performance\n- The performance video will be played during the live event on Magan's YouTube channel\n\n**Creative Requirements**\n- The piece must be original (lyrics, music, or both)\n- Covers, remixes, or previously released content are not allowed\n- Use of AI-generated music, vocals, or lyrics is strictly prohibited\n- Use of the following is allowed: Instruments, Loop pedals, MIDI, Beatboxing, Digital Audio Workstations (DAWs)\n\n**Stages and Timelines**\n- Video Submission Round\n- Submission Deadline: 21th July, 11:59 PM IST\n- File format: MP4 (preferred), recorded in horizontal/landscape mode\n- Only one submission per team/participant is allowed\n\n**Location:** Online\n**Start:** 21 Jul 25, 12:00 AM IST\n**End:** 21 Jul 25, 11:59 PM IST\n\nFor more details and registration, visit the official website.`,
          startDateTime: "2025-07-21T00:00:00+05:30",
          endDateTime: "2025-07-21T23:59:00+05:30",
          location: {
            name: "Online",
            address: "Online",
          },
          virtual: true,
          category: "Music Competition",
          coverImage: {
            url: "/srm.jpg",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/p/48-hour-music-challenge-srm-institute-of-science-and-technology-srmist-delhincr-campus-1510189",
        };
        const grabHackEvent = {
          id: "grabhack2025",
          name: "GrabHack: Campus Edition",
          description: `Grab Taxi aims to amplify its brand presence across top Indian campuses by positioning itself as an exciting, future-ready workplace. As part of this initiative, Grab invites engineering students to GrabHack: Shaping the Future…Dream It. Build It. Grab It.—a premier AI-focused hackathon. Participants will tackle real-world challenges by choosing from three cutting-edge tracks: Generative AI + Agentic Automation in Fintech, Gen AI-powered Personalised User Experiences, and Generative AI for Monetising Payment Capabilities. This is your chance to showcase your skills and shape the future with Grab.\n\nEligibility & Team Rules:\n- Open to all students enrolled in full-time BE/B.Tech and Integrated Dual Degree course programmes from the eligible list of engineering colleges.\n- Teams of 2 or 3 members, same college only.\n- Any specialization, cross-year/specialization allowed, no cross-college.\n\nRounds:\n1. Computer Fundamentals MCQ Assessment\n2. Executive Summary Submission (1-2 slides PDF)\n3. Detailed Submission + Coding Test (3-5 slides PDF + 3-min video)\n4. Grand Finale (presentation to Grab leadership)\n\nPrizes:\n- Winner: INR 1,50,000 + PPI\n- 1st Runner-Up: INR 1,00,000 + PPI\n- 2nd Runner-Up: INR 50,000 + PPI\n- All finalists: PPI\n- All participants: e-certificates\n\nStart: 04 Aug 25, 12:00 PM IST\nEnd: 04 Aug 25, 08:00 PM IST\n\nFor more details and registration, visit the official website: https://unstop.com/hackathons/grabhack-campus-edition-grab-1525360`,
          startDateTime: "2025-08-04T12:00:00+05:30",
          endDateTime: "2025-08-04T20:00:00+05:30",
          location: {
            name: "Online",
            address: "Online",
          },
          virtual: true,
          category: "Hackathon",
          coverImage: {
            url: "/grab.webp",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/hackathons/grabhack-campus-edition-grab-1525360",
        };
        const lorealEvent = {
          id: "lorealsustainability2025",
          name: "L'Oréal Sustainability Challenge 2025",
          description: `Launching its 9th edition, L'Oréal is back with the Sustainability Challenge 2025. It is an all-Digital Challenge that resonates with L’Oréal’s sustainability program.\n\nAt L’Oréal we are continuously striving towards an ever more responsible & sustainable business model.\n\nOur commitments focus on three key pillars - the planet, the people, and our products – with multiple initiatives and day-to-day actions to achieve our goals.\n\nThis year for the L’Oréal Sustainability Challenge we will be focusing on the PEOPLE, PLANET & PRODUCT pillars. We want to create long-term and sustainable impact and to achieve this, we want young and passionate change agents like you, to contribute to a better and more sustainable planet, while also creating a community of our consumers and supporters who can take this journey with us.\n\nEligibility and Team Rules:\n- Open to all final & pre-final year full-time undergraduate & postgraduate students from any discipline in any college based out of India.\n- A team must consist of exactly 3 members.\n- Each member has to register with official college email IDs. If your college does not provide official email IDs, you can use your personal email address.\n- Cross-specialization & cross-college teams are eligible.\n- Cross-year teams are not eligible.\n- A student cannot be a part of more than one team.\n- Modification of team post registration will not be allowed.\n\nStructure of the competition:\n- Treasure Hunt (non-eliminatory)\n- Online Aptitude Assessment (all team members, 20 min)\n- Executive Summary Submission (choose a pillar, 3 slides + 2-min video)\n- Mentorship Session\n- Detailed Submission (up to 10 slides)\n- Virtual Presentation (top 20 teams)\n- Final Submission (up to 10 slides + 2 appendix)\n- Grand Finale (top 6 teams)\n\nPrizes:\n- PPIs for National Finalists and Semi-Finalists\n- Final-year MBA: CTC ₹28 LPA*\n- Pre-final MBA: stipend ₹1.6L/month*\n- Pre-final UG: stipend ₹80K/month*\n- Final-year UG: role-specific offer\n- L’Oréal goodies for all National Finalists\n\nRegistration Deadline: 10 Aug 25, 11:59 PM IST\n\nFor more details and registration, visit the official website: https://unstop.com/competitions/loreal-sustainability-challenge-2025-loreal-1504673`,
          startDateTime: "2025-08-10T23:59:00+05:30",
          endDateTime: "2025-08-10T23:59:00+05:30",
          location: {
            name: "Online",
            address: "Online",
          },
          virtual: true,
          category: "Challenge",
          coverImage: {
            url: "/loreal.webp",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/competitions/loreal-sustainability-challenge-2025-loreal-1504673",
        };
        const accentureEvent = {
          id: "accenturestrategyconnect4",
          name: "Accenture Strategy Connect Season 4",
          description: `Shape your career with strategy-led reinvention across industries!\n\nKickstart your consulting career with Accenture Strategy Connect. This flagship program, now in its fourth year, offers you a unique opportunity to learn and grow by engaging with some of our most talented innovators and consulting leaders.\n\nStages and Timelines:\n1. Virtual Launch Webinar: 01 Aug 25, 05:00 PM IST - 01 Aug 25, 06:00 PM IST\n2. Preliminary Online Quiz\n3. Business Simulation Game Round\n4. Entrepreneurial Business Challenge\n5. Grand Finale\n\nEligibility:\n- Register your four-member team from your campus.\n- Cross-year and cross-specialization team formation is welcomed.\n- Open to full-time graduates and postgraduates (non-MBA) and engineering students from select 30 campuses.\n\nRewards & Prizes:\n- Pre-Placement Interviews (PPI) for all participants who clear the Simulation Round\n- Gift Vouchers Worth ₹14 Lakhs\n- 1st Prize (8 teams): ₹1,00,000 per team\n- 2nd Prize (8 teams): ₹48,000 per team\n- 3rd Prize (8 teams): ₹32,000 per team\n- Certificates for all winners and participants\n\nStart: 01 Aug 25, 05:00 PM IST\nEnd: 01 Aug 25, 06:00 PM IST\n\nFor more details and registration, visit the official website: https://unstop.com/competitions/accenture-strategy-connect-season-4-accenture-1511156`,
          startDateTime: "2025-08-01T17:00:00+05:30",
          endDateTime: "2025-08-01T18:00:00+05:30",
          location: {
            name: "Online",
            address: "Online",
          },
          virtual: true,
          category: "Challenge",
          coverImage: {
            url: "/accenture.webp",
          },
          attendeeCounts: { going: 0 },
          ticketUrl:
            "https://unstop.com/competitions/accenture-strategy-connect-season-4-accenture-1511156",
        };
        setEvents([
          accentureEvent,
          lorealEvent,
          grabHackEvent,
          musicChallengeEvent,
          timeCapsuleEvent,
          vignetteEvent,
          tvsEpicEvent,
          spaceAppsNoidaEvent,
          zuoraPromptAThonEvent,
          openSourceSummerEvent,
          aiHiringShowEvent,
          aceReframeEvent,
          ideationxEvent,
          airothonEvent,
          dataVortexEvent,
          skillShiftEvent,
          ...eventsData,
        ]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filter, categoryFilter, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const filteredEvents = events.filter((event) => {
    const eventName = event.name || "";
    const matchesSearch =
      searchQuery === "" ||
      eventName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const featuredEvents = filteredEvents.slice(0, 3);

  const categorizedEvents = {
    recommended: filteredEvents.slice(0, 4),
    hackathons: filteredEvents
      .filter(
        (event) =>
          event.category?.toLowerCase().includes("hackathon") ||
          event.name?.toLowerCase().includes("hack")
      )
      .slice(0, 4),
    network: filteredEvents
      .filter(
        (event) =>
          event.category?.toLowerCase().includes("network") ||
          event.category?.toLowerCase().includes("business") ||
          event.name?.toLowerCase().includes("network")
      )
      .slice(0, 4),
    live: filteredEvents
      .filter(
        (event) =>
          event.category?.toLowerCase().includes("entertainment") ||
          event.name?.toLowerCase().includes("live") ||
          event.name?.toLowerCase().includes("show")
      )
      .slice(0, 4),
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, featuredEvents.length));
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.max(1, featuredEvents.length)) %
        Math.max(1, featuredEvents.length)
    );
  };

  useEffect(() => {
    if (featuredEvents.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredEvents.length]);

  const EventSection = ({ title, events, showSeeAll = true, category }) => {
    if (!events || events.length === 0) return null;

    return (
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {showSeeAll && (
            <button
              onClick={() => {
                setCategoryFilter(category || "");
                setShowAllEvents(true);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer flex items-center gap-1"
            >
              See All <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id || event.id || `event-${Math.random()}`}
              event={event}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <div className="z-20 relative">
        <Sidebar user={user || {}} onLogout={logout} />
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 mt-20 ">
        <div className="flex justify-end pr-4  mb-2">
          <Link to="/events/new">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl">
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">Host Event</span>
            </button>
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {featuredEvents.length > 0 && (
            <div className="relative mb-16">
              <div className="overflow-hidden rounded-3xl shadow-xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featuredEvents.map((event, index) => (
                    <CarouselCard
                      key={event._id || event.id || index}
                      event={event}
                    />
                  ))}
                </div>
              </div>

              {featuredEvents.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {featuredEvents.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                          currentSlide === index
                            ? "bg-white scale-125"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <button
                className={`px-5 py-2.5 rounded-xl ${
                  filter === "upcoming"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                } transition-all duration-200 font-medium cursor-pointer`}
                onClick={() => {
                  setFilter("upcoming");
                  setShowAllEvents(false);
                }}
              >
                Upcoming
              </button>
              <button
                className={`px-5 py-2.5 rounded-xl ${
                  filter === "all"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                } transition-all duration-200 font-medium cursor-pointer`}
                onClick={() => {
                  setFilter("all");
                  setShowAllEvents(false);
                }}
              >
                All Events
              </button>
              <button
                className={`px-5 py-2.5 rounded-xl ${
                  filter === "past"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                } transition-all duration-200 font-medium cursor-pointer`}
                onClick={() => {
                  setFilter("past");
                  setShowAllEvents(false);
                }}
              >
                Past
              </button>
            </div>

            <div className="flex space-x-3">
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:border-gray-300 shadow-sm cursor-pointer"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">Category</option>
                  {categories.map((category, index) => (
                    <option key={`category-${index}`} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm cursor-pointer">
                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Sort</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">
                Loading events...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 font-medium">{error}</p>
              <button
                className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium cursor-pointer"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 font-medium">
                No events found matching your criteria.
              </p>
              {(searchQuery || categoryFilter) && (
                <button
                  className="mt-4 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium cursor-pointer"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : showAllEvents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id || event.id || `event-${Math.random()}`}
                  event={event}
                />
              ))}
            </div>
          ) : (
            <>
              <EventSection
                title="Recommended"
                events={categorizedEvents.recommended}
                category=""
              />
              <EventSection
                title="Hackathons"
                events={categorizedEvents.hackathons}
                category="hackathon"
              />
              <EventSection
                title="Network Events"
                events={categorizedEvents.network}
                category="network"
              />
              <EventSection
                title="The best of live events"
                events={categorizedEvents.live}
                category="entertainment"
              />

              {/* Category Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                {[
                  {
                    title: "Comedy Shows",
                    color: "from-pink-500 to-purple-600",
                    icon: "🎭",
                  },
                  {
                    title: "Theatre Shows",
                    color: "from-blue-500 to-cyan-600",
                    icon: "🎪",
                  },
                  {
                    title: "Workshops & More",
                    color: "from-red-500 to-pink-600",
                    icon: "🛠️",
                  },
                  {
                    title: "Upskill & Training",
                    color: "from-orange-500 to-yellow-600",
                    icon: "📚",
                  },
                ].map((category, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${category.color} rounded-2xl p-8 text-white cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group`}
                  >
                    <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className="font-bold text-xl">{category.title}</h3>
                  </div>
                ))}
              </div>

              <footer className="mt-12">
                <FooterBlock />
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventListingPage;
