import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="#" className="hover:text-blue-400 transition-colors">
              <FaTwitter size={24} />
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              <FaGithub size={24} />
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              <FaLinkedin size={24} />
            </a>
          </div>
          <p className="text-gray-400 text-sm">© 2025 SocialApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
