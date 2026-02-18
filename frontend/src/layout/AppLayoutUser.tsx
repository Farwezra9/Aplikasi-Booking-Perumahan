import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import UserDropdown from "../components/header/UserDropdown"; 

export default function AppLayoutUser() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    setIsLoggedIn(!!name && !!email);
  }, []);


  return (
    <div className="flex flex-col min-h-screen">
      {/* HEADER */}
      <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* LOGO */}
            <Link to="/">
             <img
              src="./images/logo/logo-icon.png"
              alt="Logo"
              width={60}
              height={40}
            />
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex space-x-6 items-center">

              {isLoggedIn ? (
                <UserDropdown />
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="px-4 py-1 border dark:text-gray-400 border-indigo-600 text-indigo-600 rounded hover:bg-indigo-600 hover:text-white transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-1 dark:text-gray-400 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* MOBILE TOGGLE BUTTON */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden dark:bg-gray-900 bg-white px-4 py-3 border-t">
            <div className="flex flex-wrap gap-4 items-center">
              {isLoggedIn ? (
                <UserDropdown />
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="px-3 py-1 border dark:text-gray-400 border-indigo-600 text-indigo-600 rounded hover:bg-indigo-600 hover:text-white transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 py-1 dark:text-gray-400 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer id="footer" className="bg-gray-800 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-2xl font-bold text-indigo-400 mb-2">PerumKu</div>
            <p className="text-gray-400 text-center md:text-left">&copy; {new Date().getFullYear()} PerumKu. All rights reserved.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Kontak Kami</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  Instagram: <a href="https://instagram.com/perumku" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">@perumku</a>
                </div>
                <div className="flex items-center gap-2">
                  Facebook: <a href="https://facebook.com/perumku" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">PerumKu</a>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  Whatsapp: <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">+62 812-3456-7890</a>
                </div>
                <div className="flex items-center gap-2">
                  No Handphone: <a href="tel:+6281234567890" className="hover:text-indigo-400">+62 812-3456-7890</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
