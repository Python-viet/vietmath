import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Role, User as UserType } from './types';

// Mock Pages (will be extracted to separate files if needed)
import AdminDashboard from './pages/AdminDashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TestRunner from './pages/TestRunner';

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      // Re-fetch user or decode token (simplified here)
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCurrentPage('landing');
  };

  const navigate = (page: string) => {
    setCurrentPage(page);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // Auth Guard
  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <Landing onStart={() => navigate(user ? (user.role === 'admin' ? 'admin' : 'student') : 'login')} />;
      case 'login': return <Login onLogin={(u, t) => { setUser(u); setToken(t); navigate(u.role === 'admin' ? 'admin' : 'student'); }} onGoRegister={() => navigate('register')} />;
      case 'register': return <Register onRegister={() => navigate('login')} onGoLogin={() => navigate('login')} />;
      case 'student': return user ? <StudentDashboard user={user} token={token!} onTakeTest={(id) => { setSelectedTestId(id); navigate('exam'); }} /> : <Login onLogin={() => {}} onGoRegister={() => {}}/>;
      case 'exam': return user && selectedTestId ? <TestRunner testId={selectedTestId} token={token!} onFinish={() => navigate('student')} onCancel={() => navigate('student')} /> : <StudentDashboard user={user!} token={token!} onTakeTest={() => {}} />;
      case 'admin': return user?.role === 'admin' ? <AdminDashboard token={token!} /> : <Landing onStart={() => {}} />;
      default: return <Landing onStart={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('landing')}>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl italic">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">MathEdu Portal</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Middle School Mathematics</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {user ? (
                <>
                  <button onClick={() => navigate(user.role === 'admin' ? 'admin' : 'student')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm">
                    <LayoutDashboard size={18} />
                    {user.role === 'admin' ? 'Quản trị' : 'Góc học tập'}
                  </button>
                  <div className="flex items-center space-x-4 pl-8 border-l border-gray-200">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium">{user.fullName}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-bold">
                        {user.role === 'admin' ? 'Giáo viên' : `Lớp ${user.gradeLevel}`}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                      <User size={24} className="text-gray-400 mt-1" />
                    </div>
                    <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex gap-4">
                  <button onClick={() => navigate('login')} className="px-5 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors">Đăng nhập</button>
                  <button onClick={() => navigate('register')} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-all">Đăng ký</button>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {user ? (
                  <>
                    <button onClick={() => navigate(user.role === 'admin' ? 'admin' : 'student')} className="block w-full text-left py-2 text-slate-600 font-medium">Bảng điều khiển</button>
                    <button onClick={handleLogout} className="block w-full text-left py-2 text-red-500 font-medium">Đăng xuất</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => navigate('login')} className="block w-full text-left py-2 text-slate-600 font-medium">Đăng nhập</button>
                    <button onClick={() => navigate('register')} className="block w-full py-3 bg-blue-600 text-white text-center font-bold rounded-lg">Đăng ký ngay</button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <BookOpen size={18} />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">Math<span className="text-blue-600">Pro</span></span>
              </div>
              <p className="text-slate-500 max-w-sm">Nền tảng học tập Toán học chuyên sâu dành cho học sinh THCS, đồng hành cùng bạn chinh phục mọi kỳ thi.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Khối lớp</h4>
              <ul className="space-y-2 text-slate-600">
                <li>Lớp 6</li>
                <li>Lớp 7</li>
                <li>Lớp 8</li>
                <li>Lớp 9</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-slate-600">
                <li>Hỗ trợ học tập</li>
                <li>Điều khoản sử dụng</li>
                <li>Chính sách bảo mật</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
            <p>© 2026 MathPro Education. All rights reserved.</p>
            <div className="flex gap-6">
              <p>Facebook</p>
              <p>Youtube</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
