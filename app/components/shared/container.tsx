import { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "~/utils/helpers";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {}

export default function Container({ children, className }: PropsWithChildren<ContainerProps>) {
  return (
    <div className={cn("max-w-[1024px] mx-auto w-full", className)}>
      {children}
    </div>
  )
}
