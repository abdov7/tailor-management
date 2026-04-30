import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function AddOrder() {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const customerId = parseInt(id || "0");

  const [formData, setFormData] = useState({
    description: "",
    designIdeas: "",
    notes: "",
  });

  const { data: customer } = trpc.customers.getById.useQuery(
    { customerId },
    { enabled: !!user && customerId > 0 }
  );

  const createMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      setLocation(`/customers/${customerId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) {
      alert("يرجى إدخال وصف الطلب");
      return;
    }
    createMutation.mutate({
      customerId,
      description: formData.description,
      designIdeas: formData.designIdeas,
      notes: formData.notes,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent text-2xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-6xl font-bold text-accent mb-2">طلب جديد</h1>
            <p className="text-muted-foreground text-lg">
              {customer?.name}
            </p>
            <div className="h-1 w-24 bg-accent mt-2"></div>
          </div>
          <Button
            onClick={() => setLocation(`/customers/${customerId}`)}
            className="bg-transparent border border-accent text-accent px-6 py-3 font-semibold hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            العودة
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="art-deco-border p-8">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-accent font-semibold mb-2">
                وصف الطلب *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="أدخل وصف عام للملابس المطلوب خياطتها"
                className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent min-h-24 resize-none"
                required
              />
            </div>

            {/* Design Ideas */}
            <div>
              <label className="block text-accent font-semibold mb-2">
                أفكار التصميم
              </label>
              <textarea
                value={formData.designIdeas}
                onChange={(e) =>
                  setFormData({ ...formData, designIdeas: e.target.value })
                }
                placeholder="أضف أفكار التصميم والمراجع (اختياري)"
                className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent min-h-24 resize-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-accent font-semibold mb-2">
                ملاحظات إضافية
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="أضف أي ملاحظات أخرى (اختياري)"
                className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent min-h-24 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-border">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-accent text-accent-foreground px-6 py-3 font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                {createMutation.isPending ? "جاري الحفظ..." : "حفظ الطلب"}
              </Button>
              <Button
                type="button"
                onClick={() => setLocation(`/customers/${customerId}`)}
                className="flex-1 bg-transparent border border-accent text-accent px-6 py-3 font-semibold hover:bg-accent hover:text-accent-foreground transition-all"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
