import Link from "next/link";
import { signup } from "../actions/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" action={signup}>
          {params.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {params.error}
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 sm:text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 sm:text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Register
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-slate-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}