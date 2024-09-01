import { ActionFunctionArgs, json } from "@remix-run/node";
import { Page } from "~/components/layouts";
import CustomizationElements from "~/components/modules/customization";

export async function loader({
  request,
}: ActionFunctionArgs) {
  const customization = await prisma?.customization.findFirst({
    where: {
      shop: process.env.SHOP!
    }
  });

  return json({
    customization
  })
}

export async function action({
  request,
}: ActionFunctionArgs) {
  const { id, ...body } = await request.json();

  try {
    const payload = {
      shop: process.env.SHOP!,
      atwBtnStyles: body?.atwBtnStyles || ""
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
