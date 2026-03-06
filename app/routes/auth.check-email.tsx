import { Link } from "@remix-run/react";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex items-center justify-center">
      <div className="container-pad">
        <div className="mx-auto w-full max-w-lg">
          <div className="card p-6 md:p-8 text-center">
            <h1 className="text-2xl font-semibold">Check Your Email</h1>
            <p className="mt-4 text-zinc-300">
              We've sent a confirmation link to your email address. Please click
              the link to activate your account.
            </p>
            <p className="mt-2 text-zinc-400 text-sm">
              The link will expire in 1 hour.
            </p>
            <p className="small-muted mt-6">
              Didn't receive an email? Check your spam folder or{" "}
              <Link to="/join" className="text-gold-400 hover:text-gold-500">
                try signing up again
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
