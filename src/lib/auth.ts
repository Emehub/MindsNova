import "server-only";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { can, type Permission, type Role } from "./catalog";
import { db, schema } from "./db";
import { randomToken } from "./utils";

export const SESSION_COOKIE = "mn_session";
const SESSION_DAYS = 7;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function passwordProblem(password: string): string | null {
  if (password.length < 12) return "Use at least 12 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
    return "Use upper case letters, lower case letters and numbers.";
  return null;
}

export async function createSession(userId: number) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(schema.sessions).values({ id: hashToken(token), userId, expiresAt });
  // Opportunistic cleanup of expired sessions.
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)));
  jar.delete(SESSION_COOKIE);
}

export type SessionUser = { id: number; name: string; email: string; role: Role };

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      active: schema.users.active,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.id, hashToken(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  const u = rows[0];
  if (!u || !u.active) return null;
  return { id: u.id, name: u.name, email: u.email, role: u.role as Role };
});

/** Use at the top of every admin page and server action. */
export async function requireUser(permission?: Permission): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (permission && !can(user.role, permission)) redirect("/admin?denied=1");
  return user;
}
