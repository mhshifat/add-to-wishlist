import { InputHTMLAttributes, PropsWithChildren, useEffect, useRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  onTextChange?: (value: string) => void
}

export default function Input({ type, onTextChange, value }: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const colorInputSpanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (type !== 'color') return;
    inputRef.current?.addEventListener("keyup", (e) => {
      const value = (e.target as unknown as { value: string }).value;
      setTimeout(() => {
        if (colorInputRef.current) colorInputRef.current.value = value;
        if (colorInputSpanRef.current) colorInputSpanRef.current.setAttribute("style", `background: ${value};`);
      }, 0)
      onTextChange?.(value);
    });
    colorInputRef.current?.addEventListener("change", (e) => {
      const value = (e.target as unknown as { value: string }).value;
      setTimeout(() => {
        if (inputRef.current) inputRef.current.value = value;
        if (colorInputSpanRef.current) colorInputSpanRef.current.setAttribute("style", `background: ${value};`);
      }, 0)
      onTextChange?.(value);
    });
  }, [type])

  switch (type) {
    case "color":
      return (
        <Input.Wrapper>
          <span ref={colorInputSpanRef} className="rounded-tl-md rounded-bl-md relative w-[40px] h-full flex items-center justify-center border-r border-b" style={{
            background: `${value || "#000000"}`
          }}>
            <input value={value} onChange={({ target }) => onTextChange?.(target.value)} ref={colorInputRef} type="color" className="absolute top-0 left-0 opacity-0 appearance-none block border-none p-0 m-0 shadow-none outline-none" />
          </span>
          <input onChange={({ target }) => onTextChange?.(target.value)} ref={inputRef} className="block px-5 w-full h-full border-none outline-none text-lg font-medium rounded-md" value={value || "#000000"} />
        </Input.Wrapper>
      )
    default:
      return (
        <Input.Wrapper>
          <input onChange={({ target }) => onTextChange?.(target.value)} ref={inputRef} className="block px-5 w-full h-full border-none outline-none text-lg font-medium rounded-md" value={value} />
        </Input.Wrapper>
      )
  }
}

Input.Wrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="w-full h-[var(--size)] border border-border rounded-md bg-background flex items-center relative">
      {children}
    </div>
  )
}
