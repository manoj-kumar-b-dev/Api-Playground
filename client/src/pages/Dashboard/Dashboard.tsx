import WelcomeCard from "../../components/dashboard/WelcomeCard";
import StatsCard from "../../components/dashboard/StatsCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import QuickActions from "../../components/dashboard/QuickActions";

function Dashboard() {
  return (
    <div className="space-y-6 pb-6">
      {/* Step 5: Welcome Card */}
      <WelcomeCard />

      {/* Step 6: Statistics Cards */}
      <StatsCard />

      {/* Step 7 & 8: Recent Activity & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
