import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { saveQuizResult } from "../../supabase/quizApi";
import BackgroundMusic from "../../../public/Background_Music.mp3";
import { fetchQuizResultByEmail } from "../../supabase/quizApi";


const hardcodedQuiz = {
  title: "Marvel Cinematic Universe Challenge",
  timer: 600, 
  questions: [

    {
      text: "What is the name of Tony Stark’s company in Iron Man (2008)?",
      options: [
        "Stark Enterprises",
        "Stark Industries",
        "Stark Tech",
        "Stark Solutions",
      ],
      correct: 1,
    },
    {
      text: "What does S.H.I.E.L.D. stand for?",
      options: [
        "Super Heroes International Law Division",
        "Strategic Homeland Intervention, Enforcement, and Logistics Division",
        "Supreme Headquarters for International Espionage and Law Division",
        "Security Headquarters In International Law Division",
      ],
      correct: 1,
    },
    {
      text: "Who is the villain in Iron Man 2?",
      options: [
        "Justin Hammer",
        "Mandarin",
        "Ivan Vanko (Whiplash)",
        "Obadiah Stane",
      ],
      correct: 2,
    },
    {
      text: "What is the name of the alien race that attacks New York in The Avengers?",
      options: ["Skrulls", "Chitauri", "Kree", "Symbiotes"],
      correct: 1,
    },
    {
      text: "Who creates Ultron in Avengers: Age of Ultron?",
      options: ["Bruce Banner", "Tony Stark", "Hank Pym", "Nick Fury"],
      correct: 1,
    },
    {
      text: "How many infinity stones are there?",
      options: ["5", "6", "7", "8"],
      correct: 1,
    },
    {
      text: "Who takes up the Captain America mantle at the end of Endgame?",
      options: ["Bucky Barnes", "Sam Wilson", "Sharon Carter", "Clint Barton"],
      correct: 1,
    },
    {
      text: "What's the name of AI that replaces J.A.R.V.I.S. after Age of Ultron?",
      options: ["EDITH", "FRIDAY", "KAREN", "HOMER"],
      correct: 1,
    },
    // Medium (7 Questions)
    {
      text: "What realm is Thor originally from?",
      options: ["Midgard", "Jotunheim", "Asgard", "Nidavellir"],
      correct: 2,
    },
    {
      text: "What is the name of Scott Lang's daughter?",
      options: ["Cindy", "Cassie", "Carol", "Katie"],
      correct: 1,
    },
    {
      text: "Who recruits Spider-Man in Captain America: Civil War?",
      options: ["Captain America", "Hawkeye", "Black Widow", "Iron Man"],
      correct: 3,
    },
    {
      text: "What is the name of Black Panther's country?",
      options: ["Zamunda", "Wakanda", "Genosha", "Sokovia"],
      correct: 1,
    },
    {
      text: "What's the name of Thanos's home planet?",
      options: ["Titan", "Xandar", "Vormir", "Hala"],
      correct: 0,
    },
    {
      text: "How many years pass between the snap and the Avengers' time heist?",
      options: ["3", "5", "7", "10"],
      correct: 1,
    },
    {
      text: "Who is revealed to be behind the TVA in Loki?",
      options: [
        "Time-Keepers",
        "Loki himself",
        "Kang the Conqueror",
        "Ravonna Renslayer",
      ],
      correct: 2,
    },
    // Difficult (5 Questions)
    {
      text: "Who mentors Kamala in her heroic journey?",
      options: ["Nick Fury", "Iron Man", "Captain Marvel", "Monica Rambeau"],
      correct: 2,
    },
    {
      text: "What powerful entity do the Ten Rings connect to in Shang-Chi?",
      options: ["Mandarin", "Fin Fang Foom", "Dweller-in-Darkness", "K'un-Lun"],
      correct: 2,
    },
    {
      text: "What causes the multiverse to crack in No Way Home?",
      options: [
        "Kang's intervention",
        "Doctor Strange's spell",
        "Thanos using the Gauntlet",
        "Loki's escape",
      ],
      correct: 1,
    },
    {
      text: "What was the first MCU project where Ironheart appeared?",
      options: [
        "Ironheart (TV series)",
        "Ms. Marvel",
        "Black Panther: Wakanda Forever",
        "Spider-Man: No Way Home",
      ],
      correct: 2,
    },
    {
      text: "What character dies twice in Infinity War?",
      options: ["Loki", "Vision", "Gamora", "Iron Man"],
      correct: 1,
    },
  ],
};


const QuizPlatform = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    
    setStep("thankyou");
  },[]);
  // Redirect to dashboard if user already attempted quiz
  useEffect(() => {
    const checkQuizAttempt = async () => {
      if (!loading && user && user.email) {
        try {
          const result = await fetchQuizResultByEmail(user.email);
          if (result) {
            setStep("thankyou");
          }
        } catch (err) {
          // If error is not 'no rows found', log it
          if (!err.code || err.code !== "PGRST116") {
            console.error("Error checking quiz attempt:", err);
          }
        }
      }
    };
    checkQuizAttempt();
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  const [currentQuiz] = useState(hardcodedQuiz);
  const [userAnswers, setUserAnswers] = useState(
    Array(hardcodedQuiz.questions.length).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(hardcodedQuiz.timer);
  const [timerActive, setTimerActive] = useState(false);
  const [step, setStep] = useState("thankyou"); // intro | quiz | thankyou
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Initialize audio when component mounts
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2; // Set initial volume
    }
  }, []);

  const handleMusicToggle = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Start quiz
const handleStartQuiz = () => {
  setUserAnswers(Array(currentQuiz.questions.length).fill(null));
  setQuizResult(null);
  setTimeLeft(currentQuiz.timer);
  setTimerActive(true);
  setStep("quiz");
  setCurrentQuestion(0);
};

  // Handle answer selection (no auto-advance)
  const handleAnswer = (qIdx, oIdx) => {
    setUserAnswers((prev) => {
      const copy = [...prev];
      copy[qIdx] = oIdx;
      return copy;
    });
  };

  // Handle next button
  const handleNext = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    let score = 0;
    currentQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) score++;
    });
    setQuizResult({ score, total: currentQuiz.questions.length });
    setTimerActive(false);

    // Save to Supabase
    try {
      await saveQuizResult({
        name:
          user?.fullName ||
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
          user?.username ||
          "Anonymous",
        email: user?.email || "unknown@example.com",
        time: formatTime(timeLeft),
        score,
      });
    } catch (error) {
      console.error("Failed to save quiz result:", error.message);
    }

    setStep("thankyou");
  };

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timerActive && timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timerActive, timeLeft]);

  // Format time mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Animated background circles and 3D blobs
  const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Soft glowing circles */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-green-200 opacity-60 rounded-full animate-pulse-slow shadow-2xl filter blur-2xl" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-green-100 opacity-50 rounded-full animate-pulse-slower shadow-2xl filter blur-2xl" />
      {/* 3D-like SVG blobs */}
      <svg
        className="absolute top-1/4 left-[-120px] w-[350px] h-[350px] opacity-40 animate-blob-move"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.3" />
          </radialGradient>
        </defs>
        <path
          fill="url(#grad1)"
          d="M44.8,-67.2C57.2,-59.2,65.7,-44.2,70.2,-28.7C74.7,-13.2,75.2,2.8,70.2,16.7C65.2,30.6,54.7,42.4,41.7,51.2C28.7,60,14.3,65.8,-0.7,66.7C-15.7,67.7,-31.3,63.8,-44.2,55.2C-57.1,46.6,-67.3,33.2,-71.2,18.1C-75.1,3,-72.7,-13.8,-65.2,-28.2C-57.7,-42.6,-45.1,-54.6,-30.2,-62.2C-15.3,-69.8,1.9,-73,18.7,-72.2C35.5,-71.4,51.9,-66.2,44.8,-67.2Z"
          transform="translate(100 100)"
        />
      </svg>
      <svg
        className="absolute bottom-1/4 right-[-100px] w-[250px] h-[250px] opacity-30 animate-blob-rotate"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        <path
          fill="url(#grad2)"
          d="M38.2,-61.2C51.2,-54.2,62.7,-43.2,67.2,-29.7C71.7,-16.2,69.2,-0.2,63.2,13.7C57.2,27.6,47.7,39.4,35.7,48.2C23.7,57,9.3,62.8,-5.7,65.7C-20.7,68.7,-36.3,68.8,-48.2,60.2C-60.1,51.6,-68.3,34.2,-70.2,17.1C-72.1,0,-67.7,-16.8,-59.2,-30.2C-50.7,-43.6,-38.1,-53.6,-24.2,-60.2C-10.3,-66.8,5.9,-70,22.7,-69.2C39.5,-68.4,56.9,-63.2,38.2,-61.2Z"
          transform="translate(100 100)"
        />
      </svg>
    </div>
  );

  // Quiz attempt: show one question at a time
  const QuizAttempt = () => {
    const q = currentQuiz.questions[currentQuestion];
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fade-in relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-green-600">
            {currentQuiz.title}
          </h2>
          <div className="text-lg font-semibold text-green-700 bg-green-100 px-4 py-1 rounded-full shadow">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>
        <div className="mb-8">
          <div className="font-semibold mb-2 text-lg text-gray-800">
            Q{currentQuestion + 1} of {currentQuiz.questions.length}: {q.text}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {q.options.map((opt, oidx) => (
              <button
                key={oidx}
                className={`flex items-center border rounded-lg px-4 py-2 w-full text-left font-medium transition-all duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400
                  ${
                    userAnswers[currentQuestion] === oidx
                      ? "bg-green-100 border-green-500 scale-105"
                      : "bg-gray-50 border-gray-200"
                  }`}
                onClick={() => handleAnswer(currentQuestion, oidx)}
              >
                <span className="text-gray-700">{opt}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-8">
          <div className="text-gray-500">
            Question {currentQuestion + 1} / {currentQuiz.questions.length}
          </div>
          {userAnswers[currentQuestion] !== null && (
            <button
              className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-green-500 hover:to-green-700 transition-all"
              onClick={handleNext}
            >
              {currentQuestion < currentQuiz.questions.length - 1
                ? "Next"
                : "Submit"}
            </button>
          )}
        </div>
      </div>
    );
  };

  

  // Intro/landing
  const Intro = () => (
    <div className="bg-white rounded-xl shadow-lg p-10 mb-8 text-center animate-fade-in">
      <h1 className="text-4xl font-extrabold mb-4 text-green-700">
        Welcome to the MeetKats Quiz Platform!
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Test your knowledge with our {"Quiz Name"}
        Challenge. You have{" "}
        <span className="font-bold text-green-600">{"Duration"}</span> to complete
        the quiz. Good luck!
      </p>
      <button
        className="bg-gradient-to-r from-green-400 to-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow hover:from-green-500 hover:to-green-700 transition-all"
        onClick={handleStartQuiz}
      >
        Start Quiz
      </button>
    </div>
  );

  // Thank you page after quiz submission
  const ThankYou = () => (
    <div className="bg-white rounded-xl shadow-lg p-10 mb-8 text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-green-700 mb-4">
        Thank You for Attempting the Quiz!
      </h2>
      <p className="text-lg text-gray-700 mb-6">
        Your responses have been recorded. Results and winners will be announced
        soon. Stay tuned!
      </p>
      <button
        className="bg-gradient-to-r from-green-400 to-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow hover:from-green-500 hover:to-green-700 transition-all"
        onClick={() => navigate("/dashboard")}
      >
        Back to Home
      </button>
    </div>
  );

  // Not Started page before quiz starting
  const Inactive = () => (
    <div className="bg-white rounded-xl shadow-lg p-10 mb-8 text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-green-700 mb-4">
        Thank You for Visiting MeetKats!
      </h2>
      <p className="text-lg text-gray-700 mb-6">
        It Seems that the Quiz has not been started yet. It will be available at {"Time"} You can wait or come again later !
      </p>
      <button
        className="bg-gradient-to-r from-green-400 to-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow hover:from-green-500 hover:to-green-700 transition-all"
        onClick={() => navigate("/dashboard")}
      >
        Back to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-green-100 via-60% to-white flex flex-col items-center justify-start py-10 px-2 relative overflow-hidden">
      <AnimatedBackground />
     
 <audio
  ref={audioRef}
  src="https://res.cloudinary.com/dnnl72vrp/video/upload/v1753268097/WhatsApp_Audio_2025-07-23_at_16.21.25_e2047be9_l45aou.mp3"  
  loop
/>
      <button
        className="absolute top-6 right-6 z-10 bg-white/80 hover:bg-green-100 text-green-700 px-4 py-2 rounded-full shadow transition-all flex items-center"
        onClick={handleMusicToggle}
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? (
          <>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pause Music
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728" />
            </svg>
            Play Music
          </>
        )}
      </button>
      <div className="w-full max-w-3xl">
        {step === "intro" && <Intro />}
        {step === "quiz" && <QuizAttempt />}
        {step === "thankyou" && <ThankYou />}
      </div>
    </div>
  );
};

export default QuizPlatform;
