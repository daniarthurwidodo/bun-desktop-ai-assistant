import { invoke } from "@tauri-apps/api/core";
import logger from "./logger";

/**
 * Invoke a Tauri command with error handling and logging
 */
export async function invokeCommand<T>(
  command: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  logger.debug(`Invoking command: ${command}`, args);

  try {
    const result = await invoke<T>(command, args);
    logger.debug(`Command ${command} completed successfully`, result);
    return result;
  } catch (error) {
    logger.error(`Command ${command} failed`, { error });
    throw error;
  }
}

/**
 * Greet a user via Tauri command
 */
export async function greetUser(name: string): Promise<string> {
  return invokeCommand<string>("greet", { name });
}
