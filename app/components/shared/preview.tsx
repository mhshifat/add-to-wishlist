import { PropsWithChildren } from "react";

export default function Preview({ children }: PropsWithChildren) {
  return (
    <div className="sticky top-8 left-0 shadow-sm border border-border p-8 flex justify-center items-center h-auto aspect-[1/.9] rounded-lg bg-background-secondary/20">
      {children}
    </div>
  )
}
