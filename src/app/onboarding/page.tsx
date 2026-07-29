import { completeOnboarding } from "../actions/auth";

export default async function OnboardingPage({
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
            Setup Your Organization
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Convert your account to start hosting events and selling tickets.
          </p>
        </div>
        <form className="mt-8 space-y-6" action={completeOnboarding}>
          {params.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {params.error}
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="text-sm font-medium text-slate-700">Organization Name</label>
              <input
                id="orgName"
                name="orgName"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 sm:text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Unique URL Slug</label>
              <div className="mt-1 flex rounded-lg shadow-sm">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-slate-500 sm:text-sm">
                  tickethub.com/
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Complete Setup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}