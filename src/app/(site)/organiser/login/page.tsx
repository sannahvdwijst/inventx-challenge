import { organiserLogin } from "./actions";

export default async function OrganiserLoginPage({
  searchParams,
}: PageProps<"/organiser/login">) {
  const params = await searchParams;
  const error = params?.error;
  const from = typeof params?.from === "string" ? params.from : "/organiser";

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-20">
      <h1 className="text-2xl font-bold text-cap-dark-blue">Organiser login</h1>
      <p className="mt-1 text-center text-sm text-cap-dark-blue/60">
        Enter the organiser password to view the dashboard.
      </p>

      <form action={organiserLogin} className="mt-8 w-full space-y-4">
        <input type="hidden" name="from" value={from} />
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-cap-dark-blue">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoFocus
            className="w-full rounded-lg border border-cap-dark-blue/20 px-4 py-2.5 outline-none focus:border-cap-blue focus:ring-2 focus:ring-cap-blue/20"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">Incorrect password. Please try again.</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-cap-blue px-4 py-2.5 font-semibold text-white transition hover:bg-cap-dark-blue"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
