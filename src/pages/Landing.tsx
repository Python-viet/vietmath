import { ArrowRight, CheckCircle2, GraduationCap, Laptop, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-bold mb-8 border border-blue-100"
            >
              <GraduationCap size={16} />
              <span>Nền tảng Toán học số 1 cho THCS</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight"
            >
              Chinh phục <span className="text-blue-600">Toán học</span><br />
              Dễ dàng hơn bao giờ hết
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 mb-10 max-w-2xl"
            >
              Luyện tập với kho đề thi chuẩn cấu trúc Bộ Giáo dục, nhận kết quả tức thì và lộ trình học tập tối ưu cho riêng bạn.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={onStart}
                className="group px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center gap-2 transition-all hover:translate-y-[-2px]"
              >
                Bắt đầu học ngay
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">
                Tìm hiểu thêm
              </button>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Grade Selection */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Lộ trình học tập theo khối lớp</h2>
            <p className="text-slate-500">Nội dung được biên soạn sát với chương trình SGK mới của Bộ GD&ĐT.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[6, 7, 8, 9].map((grade) => (
              <motion.div
                key={grade}
                whileHover={{ y: -5 }}
                className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center text-center group cursor-pointer hover:bg-white hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-black">{grade}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Toán Lớp {grade}</h3>
                <p className="text-slate-500 text-sm mb-4">Số học, Hình học, Đại số & Thống kê xác suất.</p>
                <span className="text-blue-600 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Khám phá <ArrowRight size={16} />
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Tính năng vượt trội cho giáo dục hiện đại</h2>
                <div className="space-y-8">
                  {[
                    { icon: <Zap className="text-yellow-400" />, title: "Chấm điểm tức thì", desc: "Biết kết quả và lời giải chi tiết ngay sau khi nộp bài." },
                    { icon: <ShieldCheck className="text-green-400" />, title: "Bảo mật & Nội bộ", desc: "Dữ liệu được lưu trữ an toàn, chỉ dành cho học sinh nội bộ." },
                    { icon: <Laptop className="text-blue-400" />, title: "Tương thích mọi thiết bị", desc: "Học tập mọi lúc mọi nơi trên điện thoại, máy tính bảng và PC." }
                  ].map((f, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1">{f.icon}</div>
                      <div>
                        <h4 className="text-lg font-bold mb-1">{f.title}</h4>
                        <p className="text-slate-400">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video bg-blue-600/20 rounded-3xl border border-white/10 flex items-center justify-center">
                   <div className="text-center p-12">
                     <Laptop size={64} className="mx-auto mb-4 text-blue-400" />
                     <p className="text-xl font-bold">Giao diện Dashboard chuyên nghiệp</p>
                   </div>
                </div>
                {/* Float elements */}
                <div className="absolute -top-10 -right-10 px-6 py-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 animate-bounce">
                  <CheckCircle2 className="text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
