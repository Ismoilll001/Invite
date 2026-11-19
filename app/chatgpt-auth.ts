import { headers } from "next/headers";
import { ownerForToken } from "./link-access";

// Compatibility name for the existing pages. Standalone access uses capability
// tokens, never ChatGPT headers, email claims or a public invitation slug.
export async function getChatGPTUser() {
  const authorization = (await headers()).get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return null;
  const userId = await ownerForToken(authorization.slice(7));
  return userId ? { userId, displayName: "Клиент", email: "", fullName: null } : null;
}
