const HostEventBanner = () => {
  return (
    <div className="w-full bg-cyan-400 py-6 px-4 flex flex-col md:flex-row md:items-center md:justify-between text-white">
      <div className="mb-4 md:mb-0">
        <div className="text-3xl md:text-4xl font-bold leading-tight mb-1">Do you host<br className="md:hidden" /> events?</div>
        <div className="text-base md:text-lg font-medium mb-2">Let&apos;s make the world <span className="font-semibold">#Happening together</span></div>
      </div>
      <div className="flex flex-col items-end">
        {/* Increased button size */}
        <button className="bg-white text-cyan-500 font-semibold px-10 py-4 text-lg md:text-xl rounded-lg shadow hover:bg-cyan-50 transition mb-3 md:mb-0">Create an event</button>
        {/* Increased text size */}
        <div className="text-base md:text-lg text-white/90 font-semibold">Create • Promote • Go live.</div>
      </div>
    </div>
  );
};

export default HostEventBanner;