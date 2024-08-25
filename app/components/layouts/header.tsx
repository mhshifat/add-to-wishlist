import { Link } from "@remix-run/react";
import Logo from "../shared/logo";

export default function Header() {
  return (
    <header className="flex items-center gap-5 h-[5.5rem] px-[2rem] shadow-sm">
      <Link to="/">
        <Logo />
      </Link>
    </header>
  )
}
