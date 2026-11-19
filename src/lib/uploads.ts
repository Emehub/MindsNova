import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomToken } from "./utils";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function uploadDir() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR || ".data/uploads");
}

/** Detects the real file type from its first bytes. SVG and HTML are rejected on purpose. */
export function sniffType(buf: Buffer): { mime: string; ext: string } | null {
  const hex = buf.subarray(0, 12).toString("hex");
  if (hex.startsWith("89504e47")) return { mime: "image/png", ext: "png" };
  if (hex.startsWith("ffd8ff")) return { mime: "image/jpeg", ext: "jpg" };
  if (hex.startsWith("47494638")) return { mime: "image/gif", ext: "gif" };
  if (hex.startsWith("52494646") && buf.subarray(8, 12).toString() === "WEBP") return { mime: "image/webp", ext: "webp" };
  if (hex.startsWith("25504446")) return { mime: "application/pdf", ext: "pdf" };
  return null;
}

export async function storeFile(buf: Buffer) {
  const type = sniffType(buf);
  if (!type) throw new Error("Only PNG, JPEG, GIF, WebP images and PDF documents are allowed.");
  if (buf.length > MAX_UPLOAD_BYTES) throw new Error("Files must be 8 MB or smaller.");
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const storedName = `${Date.now()}-${randomToken(9)}.${type.ext}`;
  await writeFile(path.join(dir, storedName), buf);
  return { storedName, mime: type.mime };
}

export async function readStored(storedName: string) {
  if (!/^[\w.-]+$/.test(storedName)) throw new Error("bad name");
  return readFile(path.join(uploadDir(), storedName));
}

export async function deleteStored(storedName: string) {
  if (!/^[\w.-]+$/.test(storedName)) return;
  await unlink(path.join(uploadDir(), storedName)).catch(() => {});
}

export const mediaUrl = (id: number, fileName: string) =>
  `/media/${id}/${encodeURIComponent(fileName.replace(/[^\w.-]+/g, "-"))}`;
