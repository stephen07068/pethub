import React, { useState } from 'react';
import { MdLocationOn, MdEmail, MdAccessTime, MdCheckCircle, MdSend } from 'react-icons/md';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { api } from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '', email: '', subject: 'Order Inquiry', message: ''
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      await api.submitContactForm(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: 'Order Inquiry', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="bg-background min-h-screen py-12 md:py-24 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-display text-[40px] text-on-surface mb-4">Get in Touch</h1>
          <p className="text-secondary text-body-lg max-w-2xl mx-auto">Have a question about a product, your order, or just want to say hello? Our team is here to help.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Contact Information */}
          <div>
            <h2 className="font-headline-md text-[24px] text-on-surface mb-8">Contact Information</h2>
            
            <div className="space-y-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-subtle border border-border-light text-primary flex items-center justify-center shrink-0">
                  <MdLocationOn size={24} />
                </div>
                <div>
                  <h4 className="font-label-lg text-on-surface mb-1">Location</h4>
                  <p className="text-secondary text-body-md">100% Online Store<br />Shipping Worldwide</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-subtle border border-border-light text-primary flex items-center justify-center shrink-0">
                  <MdEmail size={24} />
                </div>
                <div>
                  <h4 className="font-label-lg text-on-surface mb-1">Email Support</h4>
                  <p className="text-secondary text-body-md">petstorehub12@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-subtle border border-border-light text-primary flex items-center justify-center shrink-0">
                  <MdAccessTime size={24} />
                </div>
                <div>
                  <h4 className="font-label-lg text-on-surface mb-1">Business Hours</h4>
                  <p className="text-secondary text-body-md">Monday - Friday: 9am - 6pm EST<br />Saturday: 10am - 4pm EST</p>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-low p-6 rounded-2xl border border-primary/10">
              <h3 className="font-headline-md text-[20px] text-on-surface mb-2">Wholesale Inquiries</h3>
              <p className="text-secondary text-body-md mb-4">Interested in carrying our curated products in your boutique?</p>
              <a href="mailto:petstorehub12@gmail.com" className="text-primary font-label-lg hover:underline">Contact us for wholesale &rarr;</a>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-card border border-border-light">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <MdCheckCircle size={48} className="text-primary" />
                </div>
                <h2 className="font-headline-md text-[24px] text-on-surface mb-3">Message Sent!</h2>
                <p className="text-secondary text-body-lg mb-8">Thank you for reaching out. We've received your message and will get back to you shortly.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-primary font-label-lg hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-headline-md text-[24px] text-on-surface mb-6">Send a Message</h2>

                {status === 'error' && (
                  <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-6 text-sm font-medium">
                    {errorMsg}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={handleChange('name')}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={handleChange('email')}
                      required
                    />
                  </div>
                  <Input label="Subject" type="select" value={formData.subject} onChange={handleChange('subject')}>
                    <option>Order Inquiry</option>
                    <option>Product Question</option>
                    <option>Returns &amp; Exchanges</option>
                    <option>Other</option>
                  </Input>
                  <Input
                    label="Message"
                    type="textarea"
                    placeholder="How can we help you today?"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange('message')}
                    required
                  />
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    isLoading={status === 'sending'}
                  >
                    <MdSend size={18} className="mr-2" />
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
