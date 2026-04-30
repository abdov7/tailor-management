import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export default function EditMeasurements() {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const customerId = parseInt(id || "0");

  const [formData, setFormData] = useState({
    height: "",
    shoulder: "",
    chest: "",
    waist: "",
    hips: "",
    armLength: "",
    inseam: "",
    additionalNotes: "",
  });

  const { data: customer } = trpc.customers.getById.useQuery(
    { customerId },
    { enabled: !!user && customerId > 0 }
  );

  const { data: measurements } = trpc.measurements.getByCustomerId.useQuery(
    { customerId },
    { enabled: !!user && customerId > 0 }
  );

  useEffect(() => {
    if (measurements) {
      setFormData({
        height: measurements.height?.toString() || "",
        shoulder: measurements.shoulder?.toString() || "",
        chest: measurements.chest?.toString() || "",
        waist: measurements.waist?.toString() || "",
        hips: measurements.hips?.toString() || "",
        armLength: measurements.armLength?.toString() || "",
        inseam: measurements.inseam?.toString() || "",
        additionalNotes: measurements.additionalNotes || "",
      });
    }
  }, [measurements]);

  const updateMutation = trpc.measurements.createOrUpdate.useMutation({
    onSuccess: () => {
      setLocation(`/customers/${customerId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      customerId,
      height: formData.height ? parseFloat(formData.height) : undefined,
      shoulder: formData.shoulder ? parseFloat(formData.shoulder) : undefined,
      chest: formData.chest ? parseFloat(formData.chest) : undefined,
      waist: formData.waist ? parseFloat(formData.waist) : undefined,
      hips: formData.hips ? parseFloat(formData.hips) : undefined,
      armLength: formData.armLength ? parseFloat(formData.armLength) : undefined,
      inseam: formData.inseam ? parseFloat(formData.inseam) : undefined,
      additionalNotes: formData.additionalNotes,
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
            <h1 className="text-6xl font-bold text-accent mb-2">المقاسات</h1>
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
            {/* Measurements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Height */}
              <div>
                <label className="block text-accent font-semibold mb-2">
                  الطول (سم)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                  placeholder="مثال: 170"
                  className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Shoulder */}
              <div>
                <label className="block text-accent font-semibold mb-2">
                  الكتف (سم)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.shoulder}
                  onChange={(e) =>
                    setFormData({ ...formData, shoulder: e.target.value })
                  }
                  placeholder="مثال: 45"
                  className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Chest */}
              <div>
                <label className="block text-accent font-semibold mb-2">
                  الصدر (سم)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.chest}
                  onChange={(e) =>
                    setFormData({ ...formData, chest: e.target.value })
                  }
                  placeholder="مثال: 100"
                  className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Waist */}
              <div>
                <label className="block text-accent font-semibold mb-2">
                  الخصر (سم)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.waist}
                  onChange={(e) =>
                    setFormData({ ...formData, waist: e.target.value })
                  }
                  placeholder="مثال: 85"
                  className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Hips */}
              <div>
                <label className="block text-accent font-semibold mb-2">
                  الورك (سم)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.hips}
                  onChange={(e) =>
                    setFormData({ ...formData, hips: e.target.value })
                  }
                  placeholder="مثال: 95"
                  className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Arm Length */}
              <div>
                <label className="block text-accent font-semibold mb-2">
                  طول الذراع (سم)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.armLength}
                  onChange={(e) =>
                    setFormData({ ...formData, armLength: e.target.value })
                  }
                  placeholder="مثال: 65"
                  className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Inseam */}
              <div>
                <label className="block text-accent font-semibold mb-2">
                  طول الداخلي (سم)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.inseam}
                  onChange={(e) =>
                    setFormData({ ...formData, inseam: e.target.value })
                  }
                  placeholder="مثال: 80"
                  className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-accent font-semibold mb-2">
                ملاحظات إضافية
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) =>
                  setFormData({ ...formData, additionalNotes: e.target.value })
                }
                placeholder="أضف أي ملاحظات خاصة بالمقاسات (اختياري)"
                className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent min-h-20 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-border">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 bg-accent text-accent-foreground px-6 py-3 font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? "جاري الحفظ..." : "حفظ المقاسات"}
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
