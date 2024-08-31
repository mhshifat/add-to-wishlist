import { PropsWithChildren } from "react";
import Header from "./header";

export default function Page({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <main className="flex-[1_1_0] flex flex-col overflow-auto">
        {children}
      </main>
    </div>
  )
}
