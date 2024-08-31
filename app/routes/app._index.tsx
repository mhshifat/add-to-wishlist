import { LoaderFunctionArgs, json, defer } from "@remix-run/node";
import { Page } from "~/components/layouts";
import HomeElements from "~/components/modules/home";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const accessToken = await session?.accessToken;
  const themesPromise = getThemes(process.env.SHOP!, accessToken!);

  return defer({
    themesPromise,
    shop: session.shop,
    appId: process.env.SHOPIFY_ADD_TO_WISHLIST_ID
  });
}

export default function Index() {
  return (
    <Page>
      <HomeElements />
    </Page>
  );
}

async function getThemes(shop: string, accessToken: string) {
  const url = `https://${shop}/admin/api/2024-07/themes.json`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error fetching themes:', error);
    throw error;
  }
};
