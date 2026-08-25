import { useState, FormEvent } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import api from "@/api/axios";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/newsletter/subscribe", { email });
      setSubscribed(true);
      setEmail("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to subscribe. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-app-cream border-y border-app-border py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <div className="size-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-app-border shadow-sm text-app-green">
          <Mail className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-app-green mb-2">
          Subscribe to Our Newsletter
        </h2>
        <p className="text-sm text-app-text-light mb-6">
          Get weekly updates on fresh produce, organic recipes, and exclusive store discounts directly to your inbox.
        </p>

        {subscribed ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl inline-flex items-center gap-2 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Thank you for subscribing!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl border border-app-border focus:border-app-green outline-none text-sm bg-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-app-green text-white font-medium text-sm rounded-xl hover:bg-app-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 text-left">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
