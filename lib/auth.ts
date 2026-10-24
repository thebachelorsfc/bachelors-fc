import { cookies } from "next/headers";
export const ADMIN_COOKIE = "bfc_admin";
export const adminPassword = () => process.env.ADMIN_PASSWORD || "bfc-admin-2026";
export const isAdmin = () => cookies().get(ADMIN_COOKIE)?.value === "ok";
