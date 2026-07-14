import React from 'react';
import { MdOutlinePets, MdOutlineWorkspacePremium, MdOutlinePublic } from 'react-icons/md';

export default function About() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-surface-container-low"></div>
        <div className="relative z-10 text-center px-margin-mobile">
          <span className="text-primary font-label-lg tracking-widest bg-primary/10 px-4 py-1 rounded-full mb-6 inline-block">OUR STORY</span>
          <h1 className="font-display text-display text-on-surface mb-6 max-w-3xl mx-auto">Elevating the standard of <span className="text-primary italic">pet care</span> worldwide.</h1>
          <p className="text-body-lg text-secondary max-w-2xl mx-auto">We believe that our companions deserve the same quality of life, design, and nutrition as we do.</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="aspect-square bg-surface-subtle rounded-3xl overflow-hidden shadow-card">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5uYGOStypKu65qeHgohTwWezKByN9OtMAjnDxAsCnP0IhRsCJ5r5Bj5Pxvn_bg-ri89myGBjoHqYGR_Jk0AY6bxdi7VNvtUf8P4o7DjqAcoytqAy2EvFJDExmxKTxXEDyzI5dDwjzJsdAK0sLkBupN2rlWkXPNfAhqNiz2Hrm7anqvZsYK3YT7M8qcaOX69krTbCWJlwPDKvQYVIiIv04KflDo1MbX-m8BwB-sp8fJ5gHB_hKZjplJrTCusCZLP0CuO5EwbUanQs" alt="About Us" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
          </div>
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">Uncompromising Quality</h2>
            <p className="text-body-lg text-secondary mb-6 leading-relaxed">
              Founded in 2024, PetStore Hub was born from a simple realization: the pet industry was saturated with low-quality, mass-produced items that didn't align with modern aesthetics or health standards.
            </p>
            <p className="text-body-lg text-secondary mb-8 leading-relaxed">
              We set out to create a curated marketplace of editorial-grade pet supplies. From organic, ethically-sourced nutrition to minimalist accessories designed to complement your home, every item we carry is rigorously tested by our team.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MdOutlineWorkspacePremium size={24} />
                </div>
                <div>
                  <h4 className="font-headline-md text-[20px] text-on-surface">Curated Excellence</h4>
                  <p className="text-body-md text-secondary mt-1">We accept less than 5% of the brands that apply to be featured on our platform.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MdOutlinePublic size={24} />
                </div>
                <div>
                  <h4 className="font-headline-md text-[20px] text-on-surface">Sustainable Sourcing</h4>
                  <p className="text-body-md text-secondary mt-1">Prioritizing eco-friendly materials and ethical manufacturing processes globally.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MdOutlinePets size={24} />
                </div>
                <div>
                  <h4 className="font-headline-md text-[20px] text-on-surface">Species-Appropriate</h4>
                  <p className="text-body-md text-secondary mt-1">Products designed specifically for the anatomical and psychological needs of dogs and cats.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
