import { Search, User, LogOut, BarChart3, Settings } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import UploadButton from "../ui/upload-button";

export default function NavigationBar({
  isLoading,
  filteredImages,
  searchTerm,
  setSearchTerm,
  username,
  handleSignOut,
  loadUserImages,
}) {
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 w-full">
          <div className="flex items-end flex-1">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight drop-shadow">
              Gallery Dashboard
            </h1>
          </div>

          <div className="flex-1 flex justify-start">
            <div className="relative w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search by title, tags, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-full focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white shadow-sm text-sm"
              />
            </div>
          </div>

          <div className="flex items-center flex-1 justify-end space-x-4">
            <UploadButton onUploadSuccess={loadUserImages} />
            <div className="relative group">
              <button className="inline-flex items-center justify-center w-9 h-9 text-gray-500 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-150">
                <Settings className="w-5 h-5" />
              </button>
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide font-medium border-b border-gray-100">
                    Account
                  </div>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{username?.split('@')[0]}</span>
                      <span className="text-xs text-gray-500">{username}</span>
                    </div>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                    <BarChart3 className="w-4 h-4 mr-3 text-gray-400" />
                    View Statistics
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-red-400" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}