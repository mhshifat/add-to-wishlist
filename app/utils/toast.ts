import { toast as sonnerT } from "sonner";

export const toast = {
  success: (message: string) => sonnerT.success(message),
  error: (message: string) => sonnerT.error(message),
}
