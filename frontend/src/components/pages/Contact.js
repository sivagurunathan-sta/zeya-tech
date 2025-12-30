import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiClock,
  FiSend,
  FiMessageSquare,
  FiUser,
  FiAlertCircle,
  FiLinkedin,
  FiTwitter,
  FiFacebook,
  FiTarget,
  FiCheck
} from 'react-icons/fi';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    queryType: 'general',
    urgency: 'medium'
  });

  const submitMutation = useMutation(contactAPI.submit, {
    onSuccess: () => {},
    onError: () => {}
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      phone: formData.phone ? String(formData.phone).replace(/[^\d+]/g, '') : ''
    };
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      queryType: 'general',
      urgency: 'medium'
    });
    submitMutation.mutate(payload);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const contactInfo = [
    {
      icon: FiMail,
      title: 'Email Us',
      content: 'rctfzzbsiva@gmail.com',
      description: 'Send us an email anytime!',
      color: 'bg-blue-500',
      href: 'mailto:rctfzzbsiva@gmail.com'
    },
    {
      icon: FiPhone,
      title: 'Call Us',
      content: '+91 9150587418',
      description: 'Mon-Fri from 8am to 6pm.',
      color: 'bg-green-500',
      href: 'tel:+919150587418'
    },
    {
      icon: FiMapPin,
      title: 'Visit Us',
      content: 'Northern Bank of Coovum River',
      description: 'Egmore, Chennai 600008',
      color: 'bg-purple-500'
    },
    {
      icon: FiClock,
      title: 'Working Hours',
      content: 'Monday - Friday',
      description: '8:00 AM - 6:00 PM IST',
      color: 'bg-orange-500'
    }
  ];

  const faqs = [
    {
      question: 'How quickly do you respond to inquiries?',
      answer: 'We typically respond to all inquiries within 24 hours during business days.'
    },
    {
      question: 'What information should I include in my project inquiry?',
      answer: 'Please include your project timeline, budget range, specific requirements, and any relevant background information.'
    },
    {
      question: 'Do you offer free consultations?',
      answer: 'Yes! We offer a complimentary 30-minute consultation to discuss your project needs and how we can help.'
    },
    {
      question: 'Can you work with international clients?',
      answer: 'Absolutely! We work with clients worldwide and can accommodate different time zones for meetings and communication.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm mb-6">
              <FiMessageSquare className="w-4 h-4 mr-2" />
              We'd Love to Hear From You
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Get In <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Touch</span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Have a project in mind? Want to learn more about our services? We'd love to hear from you. 
              Let's start a conversation and explore how ZEYA-TECH can bring your vision to life!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-20 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group"
              >
                {info.href ? (
                  <a
                    href={info.href}
                    className="block bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                  >
                    <div className={`inline-flex p-4 rounded-xl ${info.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                      <info.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{info.title}</h3>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">{info.content}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{info.description}</p>
                  </a>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                    <div className={`inline-flex p-4 rounded-xl ${info.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                      <info.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{info.title}</h3>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">{info.content}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{info.description}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Contact Form Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 lg:p-12"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Send Us a Message</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      minLength={2}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-white hover:bg-white dark:hover:bg-white text-gray-900 placeholder-gray-600"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>

                {/* Email and Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-white hover:bg-white dark:hover:bg-white text-gray-900 placeholder-gray-600"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="tel"
                        name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      pattern="[+0-9\-\s()]{7,}"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-white hover:bg-white dark:hover:bg-white text-gray-900 placeholder-gray-600"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </div>

                {/* Query Type and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Query Type
                    </label>
                    <select
                      name="queryType"
                      value={formData.queryType}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-white hover:bg-white dark:hover:bg-white text-gray-900 placeholder-gray-600"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="project">New Project</option>
                      <option value="support">Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="career">Career Opportunity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Priority Level
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-white hover:bg-white dark:hover:bg-white text-gray-900 placeholder-gray-600"
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Standard response</option>
                      <option value="high">High - Urgent matter</option>
                      <option value="critical">Critical - Immediate attention</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <div className="relative">
                    <FiTarget className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      maxLength={200}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-white hover:bg-white dark:hover:bg-white text-gray-900 placeholder-gray-600"
                      placeholder="Brief subject of your message"
                      required
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <div className="relative">
                    <FiMessageSquare className="absolute left-4 top-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      minLength={10}
                      rows="6"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300 bg-white dark:bg-white hover:bg-white dark:hover:bg-white text-gray-900 placeholder-gray-600"
                      placeholder="Tell us about your project or inquiry..."
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={submitMutation.isLoading}
                  className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center justify-center">
                    {submitMutation.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <FiSend className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </motion.button>
              </form>
            </motion.div>

            {/* Right Side Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* FAQ Section */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                  <FiAlertCircle className="mr-3 text-blue-500" />
                  Frequently Asked Questions
                </h3>
                
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{faq.question}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Connect With Us */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Connect With ZEYA-TECH</h3>
                <p className="text-blue-100 mb-6">
                  Follow us on social media for the latest updates, insights, and behind-the-scenes content from our Chennai office.
                </p>
                
                <div className="flex space-x-4 mb-6">
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  >
                    <FiLinkedin className="w-6 h-6" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  >
                    <FiTwitter className="w-6 h-6" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  >
                    <FiFacebook className="w-6 h-6" />
                  </a>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-blue-100">
                    <FiCheck className="w-4 h-4 mr-3 text-green-300" />
                    <span className="text-sm">Average response time: 24 hours</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <FiCheck className="w-4 h-4 mr-3 text-green-300" />
                    <span className="text-sm">Free consultation available</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <FiCheck className="w-4 h-4 mr-3 text-green-300" />
                    <span className="text-sm">Worldwide project support</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <FiCheck className="w-4 h-4 mr-3 text-green-300" />
                    <span className="text-sm">Based in Chennai, India</span>
                  </div>
                </div>
              </div>

              {/* Location Map Info */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                  <FiMapPin className="mr-3 text-purple-500" />
                  Our Location
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">ZEYA-TECH Office</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                      Northern Bank of Coovum River<br />
                      Egmore, Chennai 600008<br />
                      Tamil Nadu, India
                    </p>
                    <div className="flex items-center text-purple-600 dark:text-purple-300 text-sm">
                      <FiMapPin className="w-4 h-4 mr-1" />
                      <span>Conveniently located in Chennai's business district</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <FiClock className="w-5 h-5 text-blue-600 dark:text-blue-300 mx-auto mb-1" />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Mon-Fri</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">8AM-6PM</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <FiPhone className="w-5 h-5 text-green-600 dark:text-green-300 mx-auto mb-1" />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Call Us</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">Quick Response</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-16 bg-gray-900 dark:bg-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Something Amazing?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of satisfied clients who have transformed their businesses with ZEYA-TECH's innovative solutions from our Chennai office.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+919150587418"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FiPhone className="mr-2" />
                Call Now
              </a>
              <a
                href="mailto:rctfzzbsiva@gmail.com"
                className="inline-flex items-center px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-xl hover:bg-gray-800 transition-all duration-300"
              >
                <FiMail className="mr-2" />
                Send Email
              </a>
            </div>
            
            {/* Office Location Info */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <div className="flex items-center justify-center text-gray-400 text-sm">
                <FiMapPin className="w-4 h-4 mr-2" />
                <span>Located in Egmore, Chennai - Northern Bank of Coovum River</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
