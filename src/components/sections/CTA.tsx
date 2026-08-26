import Button from "@/components/shared/Button";

export default function CTA() {
  return (
    <section
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 text-center"
      style={{ background: "linear-gradient(160deg, #000000 0%, #050F07 100%)" }}
    >
      <div className="max-w-3xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl md:text-6xl font-light text-white mb-6"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Trust the educator.
          <br />
          <em className="not-italic" style={{ color: "#4ADE80" }}>
            Simplify the recruitment.
          </em>
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-10">
          Join verified tutors and growing agencies already building the future of education recruitment.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="primary" size="hero" href="/register">
            Join as a Tutor
          </Button>
          <Button variant="secondary" size="hero" href="/register">
            Register Your Agency
          </Button>
        </div>
      </div>
    </section>
  );
}
