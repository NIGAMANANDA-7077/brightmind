import React from 'react';

const BentoGrid = () => {
  return (
    <section className="pb-8">
      <div className="container-custom max-w-6xl mx-auto px-4 mt-8 md:mt-12 text-center md:text-left">
        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[240px]">

          {/* Left Tall Image */}
          <div className="col-span-1 md:row-span-2 rounded-[2.5rem] overflow-hidden shadow-sm h-[300px] md:h-auto">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80"
              alt="Students learning together"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Middle Column (Two stacked cards) */}
          <div className="col-span-1 md:row-span-2 grid grid-rows-2 gap-6 h-[500px] md:h-auto">
            {/* Top Orange Card */}
            <div className="bg-[#ffa48e] rounded-[2.5rem] p-8 flex flex-col justify-center shadow-lg transform transition-transform hover:-translate-y-1">
              <div className="flex -space-x-3 mb-6">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                ].map((src, i) => (
                  <img key={i} src={src} className="w-12 h-12 rounded-full border-2 border-[#ffa48e] object-cover shadow-sm" alt="Teacher avatar" />
                ))}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#111827] leading-tight">
                We have 40+<br />Professional<br />Teachers
              </h3>
            </div>

            {/* Bottom Green Card */}
            <div className="bg-[#6ee7b7] rounded-[2.5rem] p-8 flex flex-col justify-center shadow-lg transform transition-transform hover:-translate-y-1">
              <p className="text-lg md:text-xl text-[#064e3b] font-medium leading-relaxed mb-6">
                "Believe in yourself, keep learning, and success will follow."
              </p>
              <div>
                <h4 className="text-lg font-bold text-[#064e3b]">Eswar Reddy.</h4>
                <p className="text-sm text-[#064e3b] font-medium opacity-80 mt-0.5">Quote from our teacher</p>
              </div>
            </div>
          </div>

          {/* Right Tall Image */}
          <div className="col-span-1 md:row-span-2 rounded-[2.5rem] overflow-hidden shadow-sm h-[300px] md:h-auto">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
              alt="Two students coding on a laptop"
              className="w-full h-full object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
