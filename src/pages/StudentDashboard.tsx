import { useEffect, useState } from 'react';
import { Clock, Play, GraduationCap, Calendar, Trophy, Search } from 'lucide-react';
import { User, Test } from '../types';

export default function StudentDashboard({ user, token, onTakeTest }: { user: User, token: string, onTakeTest: (id: number) => void }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, 15, 45, 90

  useEffect(() => {
    fetch(`/api/tests?grade=${user.gradeLevel}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTests(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.gradeLevel, token]);

  const filteredTests = tests.filter(t => filter === 'all' || t.duration_minutes === Number(filter));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Chào mừng, {user.fullName}! 👋</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <GraduationCap size={18} />
              Học sinh Lớp {user.gradeLevel} • Hôm nay bạn đã sẵn sàng thử thách chưa?
            </p>
          </div>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            {['15', '45', '90'].map((time) => (
              <button
                key={time}
                onClick={() => setFilter(filter === time ? 'all' : time)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === time ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {time} Phút
              </button>
            ))}
            <button
               onClick={() => setFilter('all')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Tất cả
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100">
          <Calendar className="mb-4 opacity-80" />
          <h3 className="text-3xl font-bold mb-1">{tests.length}</h3>
          <p className="text-blue-100 font-medium">Bài tập có sẵn</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <Clock className="mb-4 text-orange-500" />
          <h3 className="text-3xl font-bold text-slate-900 mb-1">0</h3>
          <p className="text-slate-500 font-medium">Giờ học tuần này</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <Trophy className="mb-4 text-yellow-500" />
          <h3 className="text-3xl font-bold text-slate-900 mb-1">---</h3>
          <p className="text-slate-500 font-medium">Xếp hạng lớp</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Danh sách bài thi</h2>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài thi..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center text-slate-400 font-medium">Đang tải danh sách bài thi...</div>
        ) : filteredTests.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredTests.map((test) => (
              <div key={test.id} className="p-6 md:p-8 hover:bg-slate-50 transition-colors group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">{test.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {test.duration_minutes} phút</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(test.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onTakeTest(test.id)}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    Bắt đầu làm bài
                    <Play size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy bài thi</h3>
            <p className="text-slate-500">Hãy thử thay đổi bộ lọc hoặc quay lại sau.</p>
          </div>
        )}
      </div>
    </div>
  );
}
