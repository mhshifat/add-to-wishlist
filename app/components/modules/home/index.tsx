import { lazy } from "react";
import ClientOnly from "~/components/shared/client-only";
import Steps from "~/components/ui/step";
import { cn } from "~/utils/helpers";

const STEPS = [
  {
    title: "Choose Theme",
    description: "Choose a theme to install the app",
    component: lazy(() => import("./choose-theme-step"))
  },
  {
    title: "Add Blocks",
    description: "Add your wishlist buttons",
    component: lazy(() => import("./choose-theme-step"))
  },
];

export default function HomeElements() {
  return (
    <div className="flex flex-col h-full">
      <ClientOnly>
        <Steps>
          <div className="w-full h-auto shadow-sm flex items-center">
            {STEPS.map(({ component: Component, ...step }, stepIdx) => (
              <Steps.Item key={step.title}>
                <Steps.Placeholder className="flex-1 min-h-[5.5rem] p-[2rem] border-r border-border last-of-type:border-none">
                  <div className="flex items-start gap-[1rem]">
                    <div className="text-primary text-4xl font-medium">{(stepIdx + 1).toString().padStart(2, '0')}</div>
                    <div className="flex flex-col">
                      <h3 className="text-2xl font-medium">{step.title}</h3>
                      <p className="text-xl text-foreground/50">{step.description}</p>
                    </div>
                  </div>
                </Steps.Placeholder>
                <Steps.Content>
                  <Component />
                </Steps.Content>
              </Steps.Item>
            ))}
          </div>

          <div className="w-full p-[2rem]">
            <div className="w-full max-w-[50rem] mx-auto">
              <Steps.Body />
            </div>
          </div>

        <Steps.Progress
          className="mt-auto flex"
          renderItem={({ isActive }) => <span className={cn("flex flex-1 bg-background-secondary h-3", {
            "bg-primary": isActive
          })} />}
        />
        </Steps>
      </ClientOnly>
    </div>
  )
}
