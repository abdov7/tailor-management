import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getMeasurementsByCustomerId,
  createOrUpdateMeasurement,
  getOrdersByCustomerId,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getStatistics,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Customer procedures
  customers: router({
    list: protectedProcedure.query(({ ctx }) =>
      getCustomers(ctx.user.id)
    ),

    getById: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(({ ctx, input }) =>
        getCustomerById(input.customerId, ctx.user.id)
      ),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          phone: z.string().min(1),
          email: z.string().email().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createCustomer(ctx.user.id, input)
      ),

    update: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          name: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { customerId, ...data } = input;
        const customer = await getCustomerById(customerId, ctx.user.id);
        if (!customer) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "العميل غير موجود أو غير مصرح",
          });
        }
        return updateCustomer(customerId, ctx.user.id, data);
      }),
  }),

  // Measurement procedures
  measurements: router({
    getByCustomerId: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ ctx, input }) => {
        const customer = await getCustomerById(input.customerId, ctx.user.id);
        if (!customer) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "العميل غير موجود أو غير مصرح",
          });
        }
        return getMeasurementsByCustomerId(input.customerId);
      }),

    createOrUpdate: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          height: z.number().optional(),
          shoulder: z.number().optional(),
          chest: z.number().optional(),
          waist: z.number().optional(),
          hips: z.number().optional(),
          armLength: z.number().optional(),
          inseam: z.number().optional(),
          additionalNotes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { customerId, ...data } = input;
        const customer = await getCustomerById(customerId, ctx.user.id);
        if (!customer) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "العميل غير موجود أو غير مصرح",
          });
        }
        return createOrUpdateMeasurement(customerId, data);
      }),
  }),

  // Order procedures
  orders: router({
    listByCustomer: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ ctx, input }) => {
        const customer = await getCustomerById(input.customerId, ctx.user.id);
        if (!customer) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "العميل غير موجود أو غير مصرح",
          });
        }
        return getOrdersByCustomerId(input.customerId);
      }),

    getById: protectedProcedure
      .input(z.object({ orderId: z.number(), customerId: z.number() }))
      .query(async ({ ctx, input }) => {
        const customer = await getCustomerById(input.customerId, ctx.user.id);
        if (!customer) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "العميل غير موجود أو غير مصرح",
          });
        }
        return getOrderById(input.orderId, input.customerId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          description: z.string().min(1),
          designIdeas: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const customer = await getCustomerById(input.customerId, ctx.user.id);
        if (!customer) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "العميل غير موجود أو غير مصرح",
          });
        }
        return createOrder(input.customerId, {
          description: input.description,
          designIdeas: input.designIdeas,
          notes: input.notes,
        });
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          customerId: z.number(),
          status: z.enum(["جديد", "قيد التنفيذ", "جاهز", "تم التسليم"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const customer = await getCustomerById(input.customerId, ctx.user.id);
        if (!customer) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "العميل غير موجود أو غير مصرح",
          });
        }
        return updateOrderStatus(input.orderId, input.customerId, input.status);
      }),
  }),

  // Dashboard statistics
  dashboard: router({
    getStatistics: protectedProcedure.query(({ ctx }) =>
      getStatistics(ctx.user.id)
    ),
  }),
});

export type AppRouter = typeof appRouter;
