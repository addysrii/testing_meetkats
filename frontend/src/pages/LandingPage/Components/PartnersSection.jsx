import React from 'react';

const partners = [
  {
    name: 'Kartikey Mishra',
    org: 'ABCDE Events',
    text: 'MeetKats made event planning a delight! Filled hall in one week. 7 talks on one stage—solution we never needed.',
  },
  {
    name: 'Kartikey Mishra',
    org: 'ABCDE Events',
    text: 'MeetKats made event planning a delight! Filled hall in one week. 7 talks on one stage—solution we never needed.',
  },
  {
    name: 'Kartikey Mishra',
    org: 'ABCDE Events',
    text: 'MeetKats made event planning a delight! Filled hall in one week. 7 talks on one stage—solution we never needed.',
  },
  {
    name: 'Kartikey Mishra',
    org: 'ABCDE Events',
    text: 'MeetKats made event planning a delight! Filled hall in one week. 7 talks on one stage—solution we never needed.',
  },
];

const PartnersSection = () => {
  return (
    <section className="w-full py-10 bg-white flex flex-col items-center">
      <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">Our Partners</h2>
      {/* Post Testimonials button above the boxes */}
      <button className="bg-cyan-400 text-white text-base md:text-lg px-6 py-2 rounded mb-6 font-semibold shadow hover:bg-cyan-500 transition">Post Testimonials</button>
      {/* Boxes take full width with margin */}
      <div className="w-full max-w-9xl px-4 flex flex-col md:flex-row gap-6 justify-center">
        {partners.map((p, i) => (
          <div
            key={i}
            className="bg-cyan-400 rounded-lg p-6 flex-1 min-w-0 text-white shadow hover:scale-105 transition-transform duration-200"
            style={{ minWidth: 0 }}
          >
            <div className="font-bold text-xl mb-2">{p.name}</div>
            <div className="text-sm font-semibold mb-3">{p.org}</div>
            <div className="text-base">{p.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PartnersSection;