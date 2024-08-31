import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { v4 } from 'uuid';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export function generateUUID() {
  return v4();
}
