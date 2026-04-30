import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Users, FileText, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: stats, isLoading } = trpc.dashboard.getStatistics.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent text-2xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-6xl font-bold text-accent mb-2">لوحة التحكم</h1>
          <div className="h-1 w-24 bg-accent"></div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Total Customers */}
          <div className="stat-card group hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">عدد الزبائن</p>
                <p className="text-5xl font-bold text-accent">
                  {stats?.totalCustomers || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-accent opacity-30" />
            </div>
          </div>

          {/* New Orders */}
          <div className="stat-card group hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">الطلبات الجديدة</p>
                <p className="text-5xl font-bold text-accent">
                  {stats?.newOrders || 0}
                </p>
              </div>
              <FileText className="w-12 h-12 text-accent opacity-30" />
            </div>
          </div>

          {/* Ready Orders */}
          <div className="stat-card group hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">الطلبات الجاهزة</p>
                <p className="text-5xl font-bold text-accent">
                  {stats?.readyOrders || 0}
                </p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-accent opacity-30" />
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="art-deco-border p-8">
          <h2 className="text-3xl font-bold text-accent mb-4">أهلاً وسهلاً</h2>
          <p className="text-foreground text-lg leading-relaxed">
            مرحباً بك في تطبيق إدارة الخياطة. استخدم القائمة الجانبية للتنقل بين أقسام التطبيق المختلفة. يمكنك إدارة العملاء وتسجيل مقاساتهم وتتبع حالة الطلبات بسهولة.
          </p>
        </div>
      </div>
    </div>
  );
}
