import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from '../db.server';
import { cors } from "remix-utils/cors";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const shop = searchParams.get("shop");
  if (!shop) return json({
    success: true,
    data: null
  });

  const customization = await prisma.customization.findFirst({
    where: {
      shop
    }
  });
  return await cors(request, json({
    success: true,
    data: customization
  }));
}
