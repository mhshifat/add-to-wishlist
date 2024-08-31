"use client";

import { Children, cloneElement, createContext, HTMLAttributes, PropsWithChildren, ReactElement, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { cn } from "~/utils/helpers";

interface AccordionContextState {
  toggleAccordion: (identifier: string) => void;
  isCollapsed: (identifier: string) => boolean;
}

const AccordionContext = createContext<AccordionContextState | null>(null);

interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
}

export default function Accordion({ children, className }: PropsWithChildren<AccordionProps>) {
  const [selectedAccordion, setSelectedAccordion] = useState<Record<string, boolean>>({});

  const toggleAccordion = useCallback((identifier: string) => {
    setSelectedAccordion((values) => {
      let prevVal = values[identifier];
      if (prevVal === undefined) prevVal = false;

      return {
        ...values,
        [identifier]: !values[identifier]
      }
    })
  }, []);

  const isCollapsed = useCallback((identifier: string) => {
    return !selectedAccordion[identifier];
  }, [selectedAccordion]);

  return (
    <AccordionContext.Provider value={{
      toggleAccordion,
      isCollapsed
    }}>
      <div className={className}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export function useAccordion() {
  const res = useContext(AccordionContext);
  if (!res) throw new Error("Component needs to be wrapped with `Accordion`");
  return res;
}

interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
}

Accordion.Item = ({ children, className, open }: PropsWithChildren<AccordionItemProps>) => {
  const id = useId();
  const rendered = useRef(false);
  const { toggleAccordion } = useAccordion();

  useEffect(() => {
    if (!open || rendered.current) return;
    toggleAccordion(id);
    rendered.current = true;
  }, [open, id])

  return (
    <div className={cn("", className)}>
      {Children.map(children, (child) => cloneElement(child as  ReactElement, {
        identifier: id
      }))}
    </div>
  )
}

interface AccordionTriggerProps extends HTMLAttributes<HTMLDivElement> {
  identifier?: string;
}

Accordion.Trigger = ({ children, className, identifier }: PropsWithChildren<AccordionTriggerProps>) => {
  const { toggleAccordion, isCollapsed } = useAccordion();
  const isAccordionCollapsed = isCollapsed(identifier!);

  return (
    <div role="button" className={cn("flex items-center gap-10", className)} onClick={() => toggleAccordion(identifier!)}>
      <div className="flex-1">
        {children}
      </div>
      <div className="w-auto">
        <svg className="w-8 h-8 transition will-change-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000" style={{
          ...!isAccordionCollapsed?{
            transform: "rotate(180deg)"
          }:{}
        }}>
          <g id="SVGRepo_bgCarrier" strokeWidth={0} />
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
          <g id="SVGRepo_iconCarrier">
            {" "}
            <title />{" "}
            <g id="Complete">
              {" "}
              <g id="F-Chevron">
                {" "}
                <polyline
                  fill="none"
                  id="Down"
                  points="5 8.5 12 15.5 19 8.5"
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />{" "}
              </g>{" "}
            </g>{" "}
          </g>
        </svg>
      </div>
    </div>
  )
}

interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  identifier?: string;
}

Accordion.Content = ({ children, className, identifier }: PropsWithChildren<AccordionContentProps>) => {
  const { isCollapsed } = useAccordion();

  if (isCollapsed(identifier!)) return null;
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}
