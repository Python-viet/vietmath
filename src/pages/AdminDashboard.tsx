import { useEffect, useState } from 'react';
import { Upload, Users, FileText, CheckCircle2, AlertCircle, Loader2, Download, Table } from 'lucide-react';
import { ScoreEntry } from '../types';

export default function AdminDashboard({ token }: { token: string }) {
  const [stats, setStats] = useState<ScoreEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'stats'>('stats');
  
  // Upload state
  const [uploadData, setUploadData] = useState({ title: '', gradeLevel: 6, durationMinutes: 15 });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setStats(data));
  }, [token]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setUploading(true);
    setStatus(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', uploadData.title);
    formData.append('gradeLevel', String(uploadData.gradeLevel));
    formData.append('durationMinutes', String(uploadData.durationMinutes));

    try {
      const res = await fetch('/api/admin/upload-test', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Tải đề thi lên thành công!' });
        setUploadData({ title: '', gradeLevel: 6, durationMinutes: 15 });
        setFile(null);
      } else {
        setStatus({ type: 'error', message: data.error });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Lỗi upload file' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Trung tâm Quản trị</h1>
        <p className="text-slate-500 font-medium">Quản lý kho đề thi và theo dõi kết quả của học sinh toàn hệ thống.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'stats' ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Table size={20} /> Thống kê kết quả
        </button>
        <button 
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'upload' ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Upload size={20} /> Tải đề thi lên
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'stats' ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Bảng kết quả học tập</h2>
              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold">
                {stats.length} Tổng số lượt làm bài
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold text-sm uppercase tracking-wider">
                    <th className="px-8 py-5">Học sinh</th>
                    <th className="px-8 py-5">Khối lớp</th>
                    <th className="px-8 py-5">Bài thi</th>
                    <th className="px-8 py-5">Điểm</th>
                    <th className="px-8 py-5">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-900">{s.full_name}</div>
                        <div className="text-xs text-slate-400">@{s.username}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">Lớp {s.grade_level}</span>
                      </td>
                      <td className="px-8 py-5 font-semibold text-slate-600">{s.test_title}</td>
                      <td className="px-8 py-5">
                        <span className={`text-lg font-black ${s.score >= 8 ? 'text-green-600' : s.score >= 5 ? 'text-blue-600' : 'text-red-500'}`}>
                          {s.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-400 font-medium">
                        {new Date(s.completed_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 md:p-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <FileText className="text-blue-600" />
                Upload bài thi từ file .DOCX
              </h2>
              
              {status && (
                <div className={`mb-8 p-6 rounded-2xl flex items-start gap-4 ${status.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="mt-1" /> : <AlertCircle className="mt-1" />}
                  <div>
                    <h4 className="font-bold">{status.type === 'success' ? 'Thành công' : 'Lỗi'}</h4>
                    <p className="text-sm opacity-80">{status.message}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tên bài thi</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Ví dụ: Kiểm tra cuối kỳ 1 - Đại số"
                    value={uploadData.title}
                    onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Khối lớp</label>
                    <select
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                      value={uploadData.gradeLevel}
                      onChange={e => setUploadData({ ...uploadData, gradeLevel: Number(e.target.value) })}
                    >
                      {[6, 7, 8, 9].map(g => <option key={g} value={g}>Lớp {g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Thời gian (phút)</label>
                    <select
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                      value={uploadData.durationMinutes}
                      onChange={e => setUploadData({ ...uploadData, durationMinutes: Number(e.target.value) })}
                    >
                      {[15, 30, 45, 60, 90].map(m => <option key={m} value={m}>{m} phút</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tệp đề thi (.docx)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".docx"
                      required
                      className="hidden"
                      id="file-upload"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                    <label 
                      htmlFor="file-upload"
                      className="w-full px-8 py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer group-hover:border-blue-400 group-hover:bg-blue-50 transition-all"
                    >
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm mb-4 transition-all">
                        <Upload size={32} />
                      </div>
                      <p className="font-bold text-slate-600 group-hover:text-blue-700">{file ? file.name : 'Nhấp để chọn tệp hoặc kéo thả'}</p>
                      <p className="text-xs text-slate-400 mt-2">Dịnh dạng hỗ trợ: .docx (Khuyên dùng cấu trúc "Câu X:", "A.", "B.")</p>
                    </label>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-2xl text-blue-700 text-sm font-medium flex gap-3">
                  <AlertCircle className="shrink-0" size={20} />
                  <p>Hệ thống tự động bách tách câu hỏi, đáp án và công thức Toán học bằng các biểu thức chính quy (Regex) tiên tiến.</p>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="animate-spin" /> : <>Bắt đầu Xử lý & Tải lên <ArrowRight size={20} /></>}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowRight({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}
