import bgImage from "../../../assets/background-CivicFix.img.png";
import HeroSection from "../components/HeroSection";
import StatsSection from "../components/StatsSection";
import HowItWorks from "../components/HowItWorks";
import RecentReports from "../components/RecentReports";

const HomePage = () => {
return (
    <main
    className="min-h-screen bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${bgImage})` }}>
    <HeroSection />
    <StatsSection />
    <HowItWorks />
    <RecentReports />
    </main>
);
};
export default HomePage;