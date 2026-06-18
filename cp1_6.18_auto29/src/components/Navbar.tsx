import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Bell, User, PlusCircle, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/helpers';

interface NavbarProps {
  className?: string;
}

export const Navbar = ({ className }: NavbarProps) => {
  const { user, isLoggedIn, logout, notifications } = useStore();
  const navigate = useNavigate();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <nav className={cn('bg-white shadow-md sticky top-0 z-50', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-forest-500 rounded-full flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-forest-600 font-serif">绿行志愿</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-forest-600 transition-colors font-medium">
            活动墙
          </Link>
          {isLoggedIn && (
            <Link to="/create" className="text-gray-700 hover:text-forest-600 transition-colors font-medium flex items-center gap-1">
              <PlusCircle className="w-4 h-4" />
              发布活动
            </Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link 
                to="/notifications" 
                className="relative p-2 text-gray-600 hover:text-forest-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              <Link 
                to="/profile"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <img 
                  src={user?.avatar} 
                  alt={user?.username}
                  className="w-9 h-9 rounded-full border-2 border-forest-300"
                />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  {user?.username}
                </span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login"
                className="px-4 py-2 text-forest-600 font-medium hover:text-forest-700 transition-colors"
              >
                登录
              </Link>
              <Link 
                to="/register"
                className="px-4 py-2 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors font-medium"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
      </div>
    </nav>
  );
};

export default Navbar;
