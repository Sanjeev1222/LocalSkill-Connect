import { Link } from 'react-router-dom';
import { Wrench, Mail, Phone, MapPin, Github, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LocalSkillConnect</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Connecting you with trusted local technicians and offering premium tool rentals.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg hover:bg-gray-800 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-gray-800 transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/technicians" className="hover:text-white transition-colors">Find Technicians</Link></li>
              <li><Link to="/tools" className="hover:text-white transition-colors">Rent Tools</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Become a Technician</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">List Your Tools</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white transition-colors cursor-default">Plumbing</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">Electrical</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">Carpentry</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">AC Repair</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">Cleaning</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400" />
                support@localskill.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5" />
                Gorkhpur, India
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} LocalSkill Connect. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
