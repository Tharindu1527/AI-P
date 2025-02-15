import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="lg:flex justify-between items-center">
          {/* Logo or App Name */}
          <div className="mb-6 lg:mb-0">
            <h2 className="text-3xl font-semibold text-white">
              <span className="text-yellow-400">Plagiarism</span>Detector
            </h2>
            <p className="text-sm text-gray-200 mt-2">Your trusted plagiarism detection tool.</p>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul>
                <li><a href="#about" className="hover:text-yellow-300">About Us</a></li>
                <li><a href="#services" className="hover:text-yellow-300">Services</a></li>
                <li><a href="#contact" className="hover:text-yellow-300">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul>
                <li><a href="#privacy" className="hover:text-yellow-300">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-yellow-300">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul>
                <li><a href="#faq" className="hover:text-yellow-300">FAQ</a></li>
                <li><a href="#help" className="hover:text-yellow-300">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Follow Us</h3>
              <ul className="flex justify-center space-x-6">
                <li>
                  <a href="https://twitter.com" target="_blank" className="hover:text-yellow-300">
                    <FaTwitter className="text-4xl" />
                  </a>
                </li>
                <li>
                  <a href="https://youtube.com" target="_blank" className="hover:text-yellow-300">
                    <FaYoutube className="text-4xl" />
                  </a>
                </li>
                <li>
                  <a href="https://facebook.com" target="_blank" className="hover:text-yellow-300">
                    <FaFacebookF className="text-4xl" />
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com" target="_blank" className="hover:text-yellow-300">
                    <FaInstagram className="text-4xl" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-gray-700 pt-6 text-center">
          <p className="text-sm text-gray-300">© 2025 PlagiarismDetector. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
