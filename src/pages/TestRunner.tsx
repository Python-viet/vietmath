import { useEffect, useState } from 'react';
import { Clock, Send, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Question } from '../types';
import MathText from '../components/MathText';

export default function TestRunner({ testId, token, onFinish, onCancel }: { testId: number, token: string, onFinish: () => void, onCancel: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Fetch questions and test details
    fetch(`/api/tests?id=${testId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        const test = data.find((t: any) => t.id === testId);
        if (test) setTimeLeft(test.duration_minutes * 60);
      });

    fetch(`/api/tests/${testId}/questions`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setQuestions(data));
  }, [testId, token]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) handleSubmit();
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentIdx].id]: option }));
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ testId, answers })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (questions.length === 0) return <div className="p-20 text-center">Đang khởi tạo bài thi...</div>;

  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-blue-100 border border-slate-100">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Hoàn thành bài thi!</h2>
          <p className="text-slate-500 mb-10 text-lg">Bạn đã hoàn thành bài một cách xuất sắc. Dưới đây là kết quả của bạn.</p>
          
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-slate-50 rounded-3xl">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Điểm số</p>
              <p className="text-5xl font-black text-blue-600">{result.score.toFixed(1)}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Số câu đúng</p>
              <p className="text-5xl font-black text-slate-900">{result.correctCount}/{result.total}</p>
            </div>
          </div>

          <button onClick={onFinish} className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl">
            Quay lại bảng điều khiển
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="flex-1 flex overflow-hidden p-6 gap-6 min-h-[calc(100vh-64px)]">
      {/* Main Content Area */}
      <section className="flex-1 flex flex-col space-y-6 overflow-hidden">
        <div className="bg-white rounded-2xl border border-gray-200 flex flex-col flex-1 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                Câu hỏi {currentIdx + 1}
              </span>
              <span className="text-gray-400 text-sm">/ {questions.length} câu</span>
            </div>
            <div className={`flex items-center font-mono font-bold text-lg ${timeLeft && timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
              <Clock size={20} className="mr-2" />
              {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
            </div>
          </div>

          <div className="p-10 flex-1 overflow-auto bg-white">
            <div className="math-text text-xl md:text-2xl leading-relaxed mb-10 text-slate-800">
              <MathText text={currentQ.question_text} className="math-text" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {['A', 'B', 'C', 'D'].map((key) => {
                const optKey = `option_${key.toLowerCase()}` as keyof Question;
                const isSelected = answers[currentQ.id] === key;
                return (
                  <label
                    key={key}
                    onClick={() => handleSelect(key)}
                    className={`flex items-start p-5 border-2 rounded-xl hover:border-blue-200 cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      readOnly
                      checked={isSelected} 
                      className="w-5 h-5 mt-1 text-blue-600 mr-4 accent-blue-600" 
                    />
                    <div className="math-text text-lg text-slate-700">
                      <span className="font-bold mr-2">{key}.</span>
                      <MathText text={String(currentQ[optKey])} className="inline-block" />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-white disabled:opacity-30"
            >
              Câu trước
            </button>
            <div className="flex space-x-3">
              <button className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-white">Gắn cờ</button>
              {currentIdx === questions.length - 1 ? (
                <button 
                  onClick={handleSubmit}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg font-semibold btn-shadow hover:bg-green-700"
                >
                  Nộp bài thi
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg font-semibold btn-shadow hover:bg-blue-700"
                >
                  Câu kế tiếp
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sidebar Area */}
      <aside className="w-85 lg:w-80 flex flex-col space-y-6 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Tiến độ làm bài</h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold">{Object.keys(answers).length}/{questions.length}</span>
            <span className="text-sm text-gray-400">Đã hoàn thành {Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-8 gap-2 overflow-y-auto max-h-[380px] pr-2 custom-scrollbar">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  currentIdx === idx 
                    ? 'border-2 border-blue-600 text-blue-600 bg-white' 
                    : answers[q.id] 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {String(idx + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex flex-col flex-1">
          <h4 className="text-orange-800 font-bold text-sm mb-4">Ghi chú quan trọng:</h4>
          <ul className="text-orange-700 text-xs space-y-3 leading-relaxed">
            <li className="flex gap-2"><span>•</span> Thí sinh không được sử dụng tài liệu trong thời gian làm bài.</li>
            <li className="flex gap-2"><span>•</span> Kết quả sẽ được hệ thống lưu trữ ngay sau khi chọn đáp án.</li>
            <li className="flex gap-2"><span>•</span> Bạn có thể xem lại lịch sử làm bài và giải chi tiết sau khi nộp.</li>
          </ul>
          <button 
            onClick={handleSubmit}
            className="w-full mt-auto py-3 bg-white border border-orange-200 text-orange-600 rounded-xl font-bold hover:bg-orange-100 transition-colors uppercase text-[10px] tracking-widest shadow-sm"
          >
            Nộp bài thi ngay
          </button>
        </div>
      </aside>
    </div>
  );
}
