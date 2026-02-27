import { generateDeviceId } from "@/lib/utils";
import { appConfig, CONFIG_KEYS } from "@/lib/db/schema";

export async function getOrCreateDeviceId(): Promise<string> {
  let deviceId = await appConfig.get<string>(CONFIG_KEYS.DEVICE_ID);
  
  if (!deviceId) {
    deviceId = generateDeviceId();
    await appConfig.set(CONFIG_KEYS.DEVICE_ID, deviceId);
  }
  
  return deviceId;
}

export async function getStoredTerminalId(): Promise<string | null> {
  return (await appConfig.get<string>(CONFIG_KEYS.TERMINAL_ID)) || null;
}

export async function getStoredBranchId(): Promise<string | null> {
  return (await appConfig.get<string>(CONFIG_KEYS.BRANCH_ID)) || null;
}

export async function getStoredSessionId(): Promise<string | null> {
  return (await appConfig.get<string>(CONFIG_KEYS.SESSION_ID)) || null;
}

export async function saveTerminalConfig(
  terminalId: string,
  branchId: string,
  tenantId: string
): Promise<void> {
  await appConfig.set(CONFIG_KEYS.TERMINAL_ID, terminalId);
  await appConfig.set(CONFIG_KEYS.BRANCH_ID, branchId);
  await appConfig.set(CONFIG_KEYS.TENANT_ID, tenantId);
}

export async function saveSession(
  sessionId: string,
  cashierId: string,
  token: string
): Promise<void> {
  await appConfig.set(CONFIG_KEYS.SESSION_ID, sessionId);
  await appConfig.set(CONFIG_KEYS.CASHIER_TOKEN, token);
}

export async function clearSession(): Promise<void> {
  await appConfig.delete(CONFIG_KEYS.SESSION_ID);
  await appConfig.delete(CONFIG_KEYS.CASHIER_TOKEN);
}

export function hashPin(pin: string): string {
  // Simple hash for demo - in production use bcrypt or similar
  return btoa(`NEXUS-${pin}`);
}

export function verifyPin(inputPin: string, storedHash: string): boolean {
  return hashPin(inputPin) === storedHash;
}