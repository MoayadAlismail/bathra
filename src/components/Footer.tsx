import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { homeTranslations } from "@/utils/language/home";

const Footer = () => {
  const { language } = useLanguage();
  return (
    <footer className="bg-black text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/Logo.svg"
                alt="Bathra"
                className="h-8 w-8 filter brightness-0 invert"
              />
              <span className="text-xl font-bold">Bathra</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {homeTranslations.footerDescription[language]}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {" "}
              {homeTranslations.footerQuickLinks[language]}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {homeTranslations.footerHome[language]}
                </Link>
              </li>
              <li>
                <Link
                  to="/articles"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {homeTranslations.footerArticles[language]}
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {homeTranslations.footerJoinPlatform[language]}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {homeTranslations.footerLearnMore[language]}
            </h3>
            <ul className="space-y-2 mb-6">
              <li>
                <Link
                  to="/terms-and-conditions"
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {homeTranslations.footerTerms[language]}
                </Link>
              </li>
            </ul>

            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com/company/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:no-reply@bathra.com"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Bathra.
            {homeTranslations.footerRights[language]}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
