import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Phone, Mail } from "lucide-react";

export default function CustomersList() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers = [], isLoading } = trpc.customers.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.email?.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

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
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-6xl font-bold text-accent mb-2">العملاء</h1>
            <div className="h-1 w-24 bg-accent"></div>
          </div>
          <Button
            onClick={() => setLocation("/customers/new")}
            className="bg-accent text-accent-foreground px-6 py-3 font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            عميل جديد
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث عن عميل بالاسم أو الهاتف أو البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-input border border-border text-foreground px-4 py-3 rounded-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent w-full"
          />
        </div>

        {/* Customers Grid */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">لا توجد عملاء</p>
            <Button
              onClick={() => setLocation("/customers/new")}
              className="mt-4 bg-accent text-accent-foreground px-6 py-3 font-semibold hover:bg-opacity-90 transition-all"
            >
              إضافة عميل جديد
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => setLocation(`/customers/${customer.id}`)}
                className="art-deco-border p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 group"
              >
                <h3 className="text-2xl font-bold text-accent mb-4 group-hover:text-opacity-80 transition-all">
                  {customer.name}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-foreground">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>

                  {customer.email && (
                    <div className="flex items-center gap-3 text-foreground">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                  )}

                  {customer.notes && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {customer.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    انقر للعرض التفاصيل
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
