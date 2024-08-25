import { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cva } from 'class-variance-authority';


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary";
}

const buttonVariants = cva("flex justify-center items-center w-full rounded-md text-2xl", {
  variants: {
    variant: {
      primary: "bg-primary text-foreground/90 font-semibold",
    },
    size: {
      default: "h-[var(--size)] px-4",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

export default function Button({ children, className, variant = "primary" }: PropsWithChildren<ButtonProps>) {
  return (
    <button className={buttonVariants({ className, variant })}>{children}</button>
  )
}
