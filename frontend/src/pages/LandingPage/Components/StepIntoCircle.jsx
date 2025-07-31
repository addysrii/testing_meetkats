import React from "react";
import QRCode from "react-qr-code";;

// Dummy phone SVG (you can swap with real images later)
const PhoneMockup = ({ className, style }) => (
  <div
    className={`relative rounded-3xl overflow-hidden shadow-[0_30px_60px_-10px_rgba(0,0,0,0.25)] bg-white ${className}`}
    style={{
      width: 220,
      height: 440,
      border: "8px solid #1f2937",
      borderRadius: 32,
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        width: 60,
        height: 6,
        borderRadius: 3,
        background: "#1f2937",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        width: 60,
        height: 6,
        borderRadius: 3,
        background: "#e5e7eb",
      }}
    />
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(to bottom, #a8d8ff 0%, #d2f2b2 60%, #7aa03f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        color: "#1f2937",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 80, lineHeight: 1 }}>☁️</div>
        <div style={{ marginTop: 8 }}>Landscape Preview</div>
      </div>
    </div>
  </div>
);

const StepIntoCircle = () => {
  return (
    <section className="w-full min-h-screen flex items-center justify-center px-6 py-12 bg-white">
      <div className="max-w-7xl w-full flex flex-col-reverse md:flex-row items-center gap-12">
        {/* Left: Phones */}
        <div className="relative flex-shrink-0 flex justify-center md:justify-start w-full md:w-1/2">
          <div className="relative" style={{ width: 300, height: 480 }}>
            <div
              className="absolute -left-6 -top-6"
              style={{ transform: "scale(1)", zIndex: 10 }}
            >
              <PhoneMockup />
            </div>
            <div
              className="absolute top-16 left-28"
              style={{ transform: "scale(0.9)", zIndex: 5 }}
            >
              <PhoneMockup />
            </div>
          </div>
        </div>

        {/* Right: Text + QR + Logo */}
        <div className="flex flex-col w-full md:w-1/2 gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Step into the <span className="text-black">Circle .</span>
            </h1>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Join MeetKats Lounge Now
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed max-w-prose">
              Our exclusive community where event lovers, artists, organizers
              come together! Get early bird discounts, behind-the-scenes updates,
              and be the first to know about exciting shows, gigs, and
              happenings.
            </p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="bg-white p-2 rounded-md shadow-md">
                <QRCode
                  value="https://example.com" // change to your real link
                  size={128}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={false}
                  aria-label="MeetKats Lounge QR Code"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              {/* Dummy logo */}
              <div className="flex items-center gap-2 border rounded-lg p-3 shadow-sm">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-6 h-6 rounded-full bg-green-300" />
                  <div className="w-6 h-6 rounded-full bg-sky-300" />
                  <div className="w-6 h-6 rounded-full bg-rose-300" />
                  <div className="w-6 h-6 rounded-full bg-yellow-300" />
                </div>
                <div className="ml-2 font-medium text-gray-800">MeetKats</div>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {/* optional small footer or tagline */}
            Scan the code to join the lounge.
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepIntoCircle;
