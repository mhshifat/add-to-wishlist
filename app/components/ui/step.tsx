"use client";

import { Children, cloneElement, createContext, Fragment, HTMLAttributes, PropsWithChildren, ReactElement, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import { cn } from "~/utils/helpers";
import { storage } from "~/utils/storage";

interface IStepOptions {
  content: ReactElement;
  metadata?: Record<string, unknown>;
}

interface StepsContextState {
  active: number;
  steps: Record<string, IStepOptions>;
  register: (identifier: string, options: IStepOptions) => void;
  nextStep: (data: Record<string, unknown>) => void;
  stepDetails: (step?: "current" | "prev" | "next") => IStepOptions;
}

const StepsContext = createContext<StepsContextState | null>(null);

interface StepsProps {
}

export default function Steps({ children }: PropsWithChildren<StepsProps>) {
  const [active, setActive] = useState(0);
  const [steps, setSteps] = useState<Record<string, IStepOptions>>({});
  const searchParams = new URLSearchParams(window.location.search);

  const register = useCallback((identifier: string, options: IStepOptions) => {
    setSteps((v) => ({
      ...v,
      [identifier]: {
        ...v[identifier] || {},
        ...options
      }
    }))
  }, [])

  const nextStep = useCallback((data: Record<string, unknown>) => {
    setSteps((v) => {
      const identifier = Object.keys(v).find((_, keyIdx) => active === keyIdx) || "";
      return {
        ...v,
        [identifier]: {
          ...v[identifier] || {},
          metadata: data
        }
      }
    });
    setActive(active + 1);
    searchParams.set("step", String(active + 1));
    window.history.replaceState({}, '', `${window.location.pathname}?${searchParams.toString()}`);
    storage.setStepsData(active, data);
  }, [active])

  const stepDetails = useCallback((step: "current" | "prev" | "next" = "current") => {
    switch (step) {
      case "current":
        return Object.values(steps)?.[active];
      case "prev":
        return Object.values(steps)?.[active - 1];
      case "next":
        return Object.values(steps)?.[active + 1];
    }
  }, [steps, active])

  useEffect(() => {
    const step = searchParams.get("step");
    if (step && +step > 0) {
      setActive(+step);
      const prevStep = +step - 1;
      const prevStepData = storage.getStepsData(prevStep);
      setSteps((v) => {
        const identifier = Object.keys(v).find((_, keyIdx) => prevStep === keyIdx) || "";
        return {
          ...v,
          [identifier]: {
            ...v[identifier] || {},
            metadata: prevStepData
          }
        }
      });
    }
  }, [])

  return (
    <StepsContext.Provider value={{
      active,
      steps,
      register,
      nextStep,
      stepDetails
    }}>
      {children}
    </StepsContext.Provider>
  )
}

export function useSteps() {
  const res = useContext(StepsContext);
  if (!res) throw new Error("Component needs to be wrapped with `Steps`");
  return res;
}

interface StepsItemProps extends HTMLAttributes<HTMLDivElement> {}

Steps.Item = ({ children }: PropsWithChildren<StepsItemProps>) => {
  const id = useId();

  return Children.map(children, (child) => cloneElement(child as ReactElement, {
    identifier: id
  }))
}

interface StepsPlaceholderProps extends HTMLAttributes<HTMLDivElement> {}

Steps.Placeholder = ({ children, className }: PropsWithChildren<StepsPlaceholderProps>) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

interface StepsContentProps extends HTMLAttributes<HTMLDivElement> {
  identifier?: string;
}

Steps.Content = ({ children, className, identifier }: PropsWithChildren<StepsContentProps>) => {
  const { register } = useSteps();

  const element = (
    <div className={cn("", className)}>
      {children}
    </div>
  );

  useEffect(() => {
    register(identifier!, {
      content: element
    })
  }, [])

  return null;
}

interface StepsProgressProps extends HTMLAttributes<HTMLDivElement> {
  renderItem: (args: {
    isActive: boolean;
  }) => JSX.Element;
}

Steps.Progress = ({ className, renderItem }: StepsProgressProps) => {
  const { steps, active } = useSteps();

  return (
    <div className={cn("", className)}>
      {Object.keys(steps).map((item, idx) => (
        <Fragment key={item}>
          {renderItem({
            isActive: active === idx
          })}
        </Fragment>
      ))}
    </div>
  )
}

interface StepsBodyProps extends HTMLAttributes<HTMLDivElement> {
}

Steps.Body = ({ className }: StepsBodyProps) => {
  const { steps, active } = useSteps();

  return (
    <>
      {Object.values(steps)?.find((_, itemIdx) => itemIdx === active)?.content}
    </>
  )
}
