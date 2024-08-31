import { Await, useLoaderData, useNavigate } from "@remix-run/react"
import { useState } from "react";
import Button from "~/components/ui/button";
import { ITheme } from "~/domain/theme";
import { cn } from "~/utils/helpers";

export default function ChooseThemeStep() {
  const navigate = useNavigate();
  const { themesPromise, shop, appId } = useLoaderData() as { themesPromise:  unknown; shop: string; appId: string };
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  function handleGettingStarted() {
    window.open(`https://${shop}/admin/themes/${selectedTheme}/editor?template=product&addAppBlockId=${appId}/wishlist_btn&target=mainSection`, "__blank");
    navigate("/app/customization");
  }
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

      <Button className="mt-10" disabled={!selectedTheme} onClick={handleGettingStarted}>Get Started</Button>
    </div>
  )
}
