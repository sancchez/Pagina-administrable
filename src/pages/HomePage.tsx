import Layout from '../components/Layout';
import Hero from '../components/Hero';
import StatsCards from '../components/StatsCards';
import ServicesSection from '../components/ServicesSection';

export default function HomePage() {
  return (
    <Layout>
      <Hero />
      <StatsCards />
      <ServicesSection />
    </Layout>
  );
}