import { ActionFunctionArgs, json } from "@remix-run/node";
import { Page } from "~/components/layouts";
import CustomizationElements from "~/components/modules/customization";
import prisma from '../db.server';
import { authenticate } from "~/shopify.server";

export async function loader({
  request,
}: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const customization = await prisma?.customization.findFirst({
    where: {
      shop: session.shop!
    }
  });

  return json({
    customization
  })
}

export async function action({
  request,
}: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { id, ...body } = await request.json();

  try {
    const payload = {
      shop: session.shop,
      atwBtnStyles: body?.atwBtnStyles || "",
      styleVariables: body?.styleVariables || "",
    }
    if (id) await prisma?.customization.update({
      where: {
        id,
      },
      data: payload
    });
    else await prisma?.customization.create({
      data: payload
    });
    return json({
      success: true,
      message: "Successfully saved"
    });
  } catch (err) {
    console.log(err);

    return json({
      success: false,
      message: "Failed to save"
    });
  }
}

export default function CustomizationPage() {
  return (
    <Page>
      <CustomizationElements />
    </Page>
  )
}
