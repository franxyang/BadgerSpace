
export default function WelcomeCard() {
  return (
    <section className="card p-6">
      <h2 className="text-xl font-semibold">Welcome to our community</h2>
      <p className="mt-2 text-gray-600">
        Share and recommend MADSPACE to your friends. We appreciate your support and contributions to this community.
      </p>
      <div className="mt-4 flex gap-2">
        <button className="px-3 py-1.5 rounded-xl bg-uw-red text-white text-sm">Like</button>
        <button className="px-3 py-1.5 rounded-xl border text-sm">Share</button>
      </div>
    </section>
  );
}
