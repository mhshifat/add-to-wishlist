import { Customization } from "@prisma/client";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { CSSProperties, useEffect, useReducer, useRef, useState } from "react";
import Container from "~/components/shared/container";
import Preview from "~/components/shared/preview";
import Accordion from "~/components/ui/accordion";
import Button from "~/components/ui/button";
import Input from "~/components/ui/input";
import { toast } from "~/utils/toast";

const DEFAULT_WISHLIST_BTN_STYLES = {
  "--atw-btn-background": "#101010",
  "--atw-btn-foreground": "#FFFFFF",
  "--atw-btn-border": "#101010",
  "--atw-btn-px": "25px",
  "--atw-btn-py": "16px",
  "--atw-btn-height": "auto",
  "--atw-btn-width": "auto",
  "--atw-btn-root": "10px",
}

export default function CustomizationElements() {
  const fetcher = useFetcher();
  const { customization } = useLoaderData() as { customization: Customization };
  const [loading, setLoading] = useState(false);
  const [, forceUpdate] = useReducer((x: number) => 1, 0);
  const wishlistBtnStylesRef = useRef(structuredClone(DEFAULT_WISHLIST_BTN_STYLES));
  const [wishlistBtnStyles, setWishlistBtnStyles] = useState(structuredClone(DEFAULT_WISHLIST_BTN_STYLES));
  const wishlistBtnStylesObj = {
    width: "var(--atw-btn-width)",
    height: "var(--atw-btn-height)",
    fontSize: "calc((var(--atw-btn-root) * 1.8))",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "var(--atw-btn-background)",
    color: "var(--atw-btn-foreground)",
    padding: "var(--atw-btn-py) var(--atw-btn-px)",
    border: "1px solid var(--atw-btn-border)",
  } as CSSProperties;

  useEffect(() => {
    if (fetcher?.data === undefined) return;
    const { success, message } = fetcher?.data as { success: boolean, message: string };
    if (success) toast.success(message);
    else toast.error(message);
    setLoading(false);
  }, [fetcher?.data])

  useEffect(() => {
    if (!customization?.id) return;
    const payload = JSON.parse(customization?.styleVariables || "{}");
    setWishlistBtnStyles(payload as typeof wishlistBtnStyles);
    wishlistBtnStylesRef.current = payload as typeof wishlistBtnStyles;
  }, [customization?.id])

  function handleSave() {
    setLoading(true);
    const dummy = document.createElement('p');
    Object.assign(dummy.style, wishlistBtnStylesObj);

    try {
      fetcher.submit({
        id: customization?.id,
        atwBtnStyles: dummy.getAttribute("style"),
        styleVariables: JSON.stringify(wishlistBtnStyles)
      }, {
        method: "POST",
        encType: "application/json",
      });
      wishlistBtnStylesRef.current = wishlistBtnStyles;
      forceUpdate();
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <>
      <Container className="py-8 grid grid-cols-[1fr_400px] gap-10 relative">
        <Accordion className="flex flex-col gap-5">
          <Accordion.Item className="bg-background-secondary/20 h-max rounded-md border border-border" open>
            <Accordion.Trigger className="px-5 py-3">
              <h3 className="text-2xl font-medium">Customize Styles</h3>
              <p className="text-lg font-medium text-foreground/50 mt-1">Customize your wishlist button styles</p>
            </Accordion.Trigger>
            <Accordion.Content>
              <div className="p-5 border-t border-border grid grid-cols-3 gap-5">
                <label className="flex flex-col gap-[2px]">
                  <span className="text-lg font-semibold">Border</span>
                  <Input type="color" value={wishlistBtnStyles["--atw-btn-border"]} onTextChange={(value) => setWishlistBtnStyles(values => ({
                    ...values,
                    "--atw-btn-border": value
                  }))} />
                </label>
                <label className="flex flex-col gap-[2px]">
                  <span className="text-lg font-semibold">Background</span>
                  <Input type="color" value={wishlistBtnStyles["--atw-btn-background"]} onTextChange={(value) => setWishlistBtnStyles(values => ({
                    ...values,
                    "--atw-btn-background": value
                  }))} />
                </label>
                <label className="flex flex-col gap-[2px]">
                  <span className="text-lg font-semibold">Foreground</span>
                  <Input type="color" value={wishlistBtnStyles["--atw-btn-foreground"]} onTextChange={(value) => setWishlistBtnStyles(values => ({
                    ...values,
                    "--atw-btn-foreground": value
                  }))} />
                </label>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>

        <Preview>
          <div style={wishlistBtnStyles as CSSProperties}>
            <button style={wishlistBtnStylesObj}>Add To Wishlist</button>
          </div>
        </Preview>
      </Container>
      <div className="fixed bottom-0 left-0 w-full py-3 px-5">
          <Button disabled={JSON.stringify(wishlistBtnStylesRef.current) === JSON.stringify(wishlistBtnStyles)} onClick={handleSave}>{loading ? "Loading..." : "Save"}</Button>
      </div>
    </>
  )
}
