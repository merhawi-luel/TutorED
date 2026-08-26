export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">I am a</label>
            <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary">
              <option value="">Select role</option>
              <option value="tutor">Tutor</option>
              <option value="agency">Agency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition"
          >
            Create Account
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-4">
          Already have an account? <a href="/login" className="text-primary hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
