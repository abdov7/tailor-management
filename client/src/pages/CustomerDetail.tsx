import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Edit2, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function CustomerDetail() {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const customerId = parseInt(id || "0");

  const { data: customer, isLoading: customerLoading } =
    trpc.customers.getById.useQuery(
      { customerId },
      { enabled: !!user && customerId > 0 }
    );

  const { data: measurements, isLoading: measurementsLoading } =
    trpc.measurements.getByCustomerId.useQuery(
      { customerId },
      { enabled: !!user && customerId > 0 }
    );

  const { data: orders = [], isLoading: ordersLoading } =
    trpc.orders.listByCustomer.useQuery(
      { customerId },
      { enabled: !!user && customerId > 0 }
    );

  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.listByCustomer.invalidate({ customerId });
    },
  });

  if (authLoading || customerLoading || measurementsLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent text-2xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">العميل غير موجود</p>
          <Button
            onClick={() => setLocation("/customers")}
            className="bg-accent text-accent-foreground px-6 py-3 font-semibold hover:bg-opacity-90 transition-all"
          >
            العودة للقائمة
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "جديد":
        return "text-blue-400";
      case "قيد التنفيذ":
        return "text-yellow-400";
      case "جاهز":
        return "text-green-400";
      case "تم التسليم":
        return "text-gray-400";
      default:
        return "text-accent";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "جديد":
        return "bg-blue-900 bg-opacity-30";
      case "قيد التنفيذ":
        return "bg-yellow-900 bg-opacity-30";
      case "جاهز":
        return "bg-green-900 bg-opacity-30";
      case "تم التسليم":
        return "bg-gray-900 bg-opacity-30";
      default:
        return "bg-accent bg-opacity-10";
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-6xl font-bold text-accent mb-2">
              {customer.name}
            </h1>
            <div className="h-1 w-24 bg-accent"></div>
          </div>
          <Button
            onClick={() => setLocation("/customers")}
            className="bg-transparent border border-accent text-accent px-6 py-3 font-semibold hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            العودة
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Customer Info */}
          <div className="lg:col-span-1">
            <div className="art-deco-border p-6">
              <h2 className="text-2xl font-bold text-accent mb-6">المعلومات</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">الهاتف</p>
                  <p className="text-foreground font-semibold">{customer.phone}</p>
                </div>

                {customer.email && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">البريد الإلكتروني</p>
                    <p className="text-foreground font-semibold">{customer.email}</p>
                  </div>
                )}

                {customer.notes && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">ملاحظات</p>
                    <p className="text-foreground">{customer.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="lg:col-span-2">
            <div className="art-deco-border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-accent">المقاسات</h2>
                <Button
                  onClick={() => setLocation(`/customers/${customerId}/measurements`)}
                  className="bg-accent text-accent-foreground px-4 py-2 font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  تحديث
                </Button>
              </div>

              {measurements ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {measurements.height && (
                    <div className="bg-card p-3 rounded-none border border-border">
                      <p className="text-muted-foreground text-xs mb-1">الطول</p>
                      <p className="text-accent font-bold">{measurements.height} سم</p>
                    </div>
                  )}
                  {measurements.shoulder && (
                    <div className="bg-card p-3 rounded-none border border-border">
                      <p className="text-muted-foreground text-xs mb-1">الكتف</p>
                      <p className="text-accent font-bold">{measurements.shoulder} سم</p>
                    </div>
                  )}
                  {measurements.chest && (
                    <div className="bg-card p-3 rounded-none border border-border">
                      <p className="text-muted-foreground text-xs mb-1">الصدر</p>
                      <p className="text-accent font-bold">{measurements.chest} سم</p>
                    </div>
                  )}
                  {measurements.waist && (
                    <div className="bg-card p-3 rounded-none border border-border">
                      <p className="text-muted-foreground text-xs mb-1">الخصر</p>
                      <p className="text-accent font-bold">{measurements.waist} سم</p>
                    </div>
                  )}
                  {measurements.hips && (
                    <div className="bg-card p-3 rounded-none border border-border">
                      <p className="text-muted-foreground text-xs mb-1">الورك</p>
                      <p className="text-accent font-bold">{measurements.hips} سم</p>
                    </div>
                  )}
                  {measurements.armLength && (
                    <div className="bg-card p-3 rounded-none border border-border">
                      <p className="text-muted-foreground text-xs mb-1">طول الذراع</p>
                      <p className="text-accent font-bold">{measurements.armLength} سم</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">لم يتم تسجيل مقاسات بعد</p>
                  <Button
                    onClick={() => setLocation(`/customers/${customerId}/measurements`)}
                    className="bg-accent text-accent-foreground px-6 py-3 font-semibold hover:bg-opacity-90 transition-all"
                  >
                    إضافة المقاسات
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="art-deco-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-accent">الطلبات</h2>
            <Button
              onClick={() => setLocation(`/customers/${customerId}/orders/new`)}
              className="bg-accent text-accent-foreground px-4 py-2 font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              طلب جديد
            </Button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">لا توجد طلبات</p>
              <Button
                onClick={() => setLocation(`/customers/${customerId}/orders/new`)}
                className="bg-accent text-accent-foreground px-6 py-3 font-semibold hover:bg-opacity-90 transition-all"
              >
                إنشاء طلب جديد
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-border p-4 hover:border-accent transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {order.description}
                      </h3>
                      {order.designIdeas && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {order.designIdeas}
                        </p>
                      )}
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          orderId: order.id,
                          customerId,
                          status: e.target.value as any,
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                      className={`px-3 py-1 rounded-none text-sm font-semibold ${
                        getStatusBgColor(order.status)
                      } ${getStatusColor(order.status)} cursor-pointer border border-current focus:outline-none focus:ring-1 focus:ring-accent ml-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="جديد">جديد</option>
                      <option value="قيد التنفيذ">قيد التنفيذ</option>
                      <option value="جاهز">جاهز</option>
                      <option value="تم التسليم">تم التسليم</option>
                    </select>
                  </div>
                  {order.notes && (
                    <p className="text-sm text-muted-foreground border-t border-border pt-3">
                      {order.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
