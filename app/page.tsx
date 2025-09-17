
import SearchBar from '@/components/SearchBar';
import Calendar from '@/components/Calendar';
import QuickLinks from '@/components/QuickLinks';
import WelcomeCard from '@/components/WelcomeCard';
import ContributorCard from '@/components/ContributorCard';

export default function Page() {
  return (
    <div className="container py-8">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="card p-4">
            <SearchBar />
          </section>
          <WelcomeCard />
          <ContributorCard />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Calendar />
          <QuickLinks />
        </div>
      </div>
    </div>
  );
}
