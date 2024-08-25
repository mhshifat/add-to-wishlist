import { Await, useLoaderData } from "@remix-run/react"
import { useState } from "react";
import Button from "~/components/ui/button";
import { ITheme } from "~/domain/theme";
import { cn } from "~/utils/helpers";

export default function ChooseThemeStep() {
  const { themesPromise } = useLoaderData() as { themesPromise:  unknown };
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  return (
    <div className="w-full">
      <Await resolve={themesPromise}>
        {(data) => {
          const { themes } = data as { themes: ITheme[] }
          return (
            <ul className="flex flex-col rounded-lg border border-border overflow-hidden">
              {themes?.map(theme => (
                <li
                  key={theme.id}
                  className="p-[2.2rem] text-xl cursor-pointer transition hover:bg-foreground/10 flex items-center gap-2 justify-between border-b border-border last-of-type:border-none"
                  onClick={() => setSelectedTheme(String(theme.id))}
                >
                  <span>{theme.name}</span>
                  <span
                    className={cn("w-3 h-3 rounded-full", {
                      "bg-foreground/10": selectedTheme !== String(theme.id),
                      "bg-primary": selectedTheme === String(theme.id),
                    })}
                  />
                </li>
              ))}
            </ul>
          )
        }}
      </Await>

      <Button className="mt-10">Continue</Button>
    </div>
  )
}
