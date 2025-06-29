import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-950 to-indigo-950 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left side - GDPR compliance */}
          <div className="flex items-center space-x-4 text-white/70">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇪🇺</span>
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20"></div>
            <span className="text-sm">🔒 EU Data Protection Standards</span>
          </div>

          {/* Right side - Links & Copyright */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-white/70 text-sm">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <span>© 2025 Flowen. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}