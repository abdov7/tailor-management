import { eq, and, inArray, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, customers, measurements, orders } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Customer queries
 */
export async function getCustomers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).where(eq(customers.userId, userId));
}

export async function getCustomerById(customerId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCustomer(
  userId: number,
  data: { name: string; phone: string; email?: string; notes?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values({
    userId,
    ...data,
  });
  return result;
}

export async function updateCustomer(
  customerId: number,
  userId: number,
  data: Partial<{ name: string; phone: string; email: string; notes: string }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(customers)
    .set(data)
    .where(and(eq(customers.id, customerId), eq(customers.userId, userId)));
}

/**
 * Measurement queries
 */
export async function getMeasurementsByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(measurements)
    .where(eq(measurements.customerId, customerId))
    .orderBy((m) => m.updatedAt)
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateMeasurement(
  customerId: number,
  data: any
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getMeasurementsByCustomerId(customerId);
  if (existing) {
    return db
      .update(measurements)
      .set(data)
      .where(eq(measurements.customerId, customerId));
  } else {
    return db.insert(measurements).values({
      customerId,
      ...data,
    });
  }
}

/**
 * Order queries
 */
export async function getOrdersByCustomerId(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy((o) => o.createdAt);
}

export async function getOrderById(orderId: number, customerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.customerId, customerId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrder(
  customerId: number,
  data: { description: string; designIdeas?: string; notes?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orders).values({
    customerId,
    status: "جديد",
    ...data,
  });
}

export async function updateOrderStatus(
  orderId: number,
  customerId: number,
  status: "جديد" | "قيد التنفيذ" | "جاهز" | "تم التسليم"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(orders)
    .set({ status })
    .where(and(eq(orders.id, orderId), eq(orders.customerId, customerId)));
}

export async function getAllOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const userCustomers = await getCustomers(userId);
  if (userCustomers.length === 0) return [];
  const customerIds = userCustomers.map((c) => c.id);
  return db.select().from(orders).where((o) => inArray(orders.customerId, customerIds));
}

export async function getStatistics(userId: number) {
  const db = await getDb();
  if (!db) return { totalCustomers: 0, newOrders: 0, readyOrders: 0 };
  
  const customerCount = await db
    .select({ count: count() })
    .from(customers)
    .where(eq(customers.userId, userId));
  
  const userCustomers = await getCustomers(userId);
  const customerIds = userCustomers.map((c) => c.id);
  
  if (customerIds.length === 0) {
    return { totalCustomers: 0, newOrders: 0, readyOrders: 0 };
  }
  
  const newOrdersCount = await db
    .select({ count: count() })
    .from(orders)
    .where(
      and(
        inArray(orders.customerId, customerIds),
        eq(orders.status, "جديد")
      )
    );
  
  const readyOrdersCount = await db
    .select({ count: count() })
    .from(orders)
    .where(
      and(
        inArray(orders.customerId, customerIds),
        eq(orders.status, "جاهز")
      )
    );
  
  return {
    totalCustomers: customerCount[0]?.count || 0,
    newOrders: newOrdersCount[0]?.count || 0,
    readyOrders: readyOrdersCount[0]?.count || 0,
  };
}
