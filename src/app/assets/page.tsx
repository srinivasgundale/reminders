import AssetDashboard from "@/ui/components/AssetDashboard";

export const metadata = {
    title: "Digital Assets | SaaS Hub",
    description: "Track your domains, subscriptions, and digital assets.",
};

export default function AssetsPage() {
    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-card)' }}>
            <AssetDashboard />
        </main>
    );
}
