import Sidebar from "../components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[var(--bg-void)] flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative">
                {/* Background gradient for depth */}
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[var(--accent-primary)] opacity-[0.03] blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto z-10 relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
