import { login } from "@/app/actions/auth";
import Link from "next/link";
import { Ticket } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-600">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
            <Ticket className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to Ticketa
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm font-medium">
              {message}
            </div>
          )}

          <form action={login} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}