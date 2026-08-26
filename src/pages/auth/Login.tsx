export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark text-white">
      <div className="w-full max-w-md p-8 rounded-2xl" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
        <h1 className="text-xl font-semibold mb-4">Sign In</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition" style={{ background: "#22C55E", color: "black" }}
          >
            Sign In
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-4">
          Don't have an account? <a href="/register" className="hover:underline" style={{ color: "#22C55E" }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}
