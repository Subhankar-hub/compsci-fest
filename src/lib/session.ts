import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const TEAM = "cs_team";
const ADMIN = "cs_admin";

function getSecret() {
  const s =
    process.env.JWT_SECRET ??
    (process.env.NODE_ENV !== "production"
      ? "local-dev-jwt-secret-min-32-characters-long!!"
      : undefined);
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET must be set (min 16 characters)");
  }
  return new TextEncoder().encode(s);
}

export type TeamSession = { teamId: string; name: string };

export async function signTeamToken(teamId: string, name: string) {
  return new SignJWT({ name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(teamId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function getTeamSession(): Promise<TeamSession | null> {
  const jar = await cookies();
  const raw = jar.get(TEAM)?.value;
  if (!raw) return null;
  try {
    const { payload } = await jwtVerify(raw, getSecret());
    const teamId = payload.sub;
    const name = payload.name;
    if (typeof teamId !== "string" || typeof name !== "string") return null;
    return { teamId, name };
  } catch {
    return null;
  }
}

export async function signAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getSecret());
}

export async function getAdminSession(): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(ADMIN)?.value;
  if (!raw) return false;
  try {
    const { payload } = await jwtVerify(raw, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export { TEAM, ADMIN };
