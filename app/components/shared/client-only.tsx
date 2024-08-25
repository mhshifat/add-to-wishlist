import { PropsWithChildren, useEffect, useState } from "react";

export default function ClientOnly({ children }: PropsWithChildren) {
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    setRendered(true);
  }, [])

  if (!rendered) return null;
  return children;
}
