import { invokeCommand } from "./tauriBridge";

/**
 * Checks whether a file exists at the given absolute path.
 */
export async function fileExists(path: string): Promise<boolean> {
  return invokeCommand<boolean>("file_exists", { path });
}

/**
 * Reads a file at the given absolute path and returns its UTF-8 content.
 */
export async function readFile(path: string): Promise<string> {
  return invokeCommand<string>("read_file", { path });
}

/**
 * Writes UTF-8 content to a file at the given absolute path.
 */
export async function writeFile(path: string, content: string): Promise<void> {
  return invokeCommand<void>("write_file", { path, content });
}

/**
 * Lists file names in the given directory.
 */
export async function listDirectory(dirPath: string): Promise<string[]> {
  return invokeCommand<string[]>("list_directory", { dirPath });
}
