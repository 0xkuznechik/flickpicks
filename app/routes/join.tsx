import { Link } from "@remix-run/react";

export default function Join() {
  return (
    <div className="container-pad py-10 md:py-16">
      <div className="mx-auto w-full max-w-lg">
        <div className="card p-6 md:p-8 text-center">
          <h1 className="text-2xl font-semibold">Registration Closed</h1>
          <p className="mt-2 text-zinc-300">
            Registration is by invitation only. If you have an account, please
            log in.
          </p>
          <div className="mt-6">
            <Link to="/login" className="btn btn-primary">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
