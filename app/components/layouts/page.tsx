import { PropsWithChildren } from "react";
import Header from "./header";

export default function Page({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
