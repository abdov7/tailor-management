import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function AddCustomer() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const createMutation = trpc.customers.create.useMutation({
    onSuccess: (result) => {
      setLocation("/customers");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    createMutation.mutate(formData);
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
            <h1 className="text-6xl font-bold text-accent mb-2">عميل جديد</h1>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="art-deco-border p-8">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-accent font-semibold mb-2">
                الاسم *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="أدخل اسم العميل"
                className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-accent font-semibold mb-2">
                رقم الهاتف *
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="أدخل رقم الهاتف"
                className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-accent font-semibold mb-2">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="أدخل البريد الإلكتروني (اختياري)"
                className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-accent font-semibold mb-2">
                ملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="أضف أي ملاحظات عن العميل (اختياري)"
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
                {createMutation.isPending ? "جاري الحفظ..." : "حفظ العميل"}
              </Button>
              <Button
                type="button"
                onClick={() => setLocation("/customers")}
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
