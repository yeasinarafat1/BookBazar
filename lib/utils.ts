import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));

}
export function getPublicIdFromUrl(url: string) {
  if (!url) return null;

  // Regex breakdown:
  // 1. \/upload\/       -> Finds the "/upload/" segment
  // 2. (?:v\d+\/)?      -> Optionally matches the version number (e.g. "v1767297699/") and ignores it
  // 3. (.+)             -> Captures the actual Public ID (everything after version)
  // 4. \.[^.]+$         -> Matches the file extension (e.g. ".png") at the end and ignores it
  
  const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
  const match = url.match(regex);

  return match ? match[1] : null;
}
