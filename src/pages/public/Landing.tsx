export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">EduVerify</h1>
        <p className="text-slate-400 mb-8">Verify once. Apply anywhere.</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/register"
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="px-6 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/10 transition"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
