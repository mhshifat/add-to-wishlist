import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from '../db.server';
import { cors } from "remix-utils/cors";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const shop = searchParams.get("shop");
  const productId = searchParams.get("productId");
  const customerId = searchParams.get("customerId");
  if (!shop || !customerId) return json({
    success: true,
    data: []
  });

  // This is where you need to cors safe your request
  if (request.method === "OPTIONS") {
    const response = json({
      status: 200,
    });
    return await cors(request, response);
  }

  if (productId) {
    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        shop,
        productId,
        customerId
      }
    });
    return cors(request, json({
      success: true,
      data: wishlistItem
    }));
  }

  const wishlistItems = await prisma.wishlist.findMany({
    where: {
      shop,
      customerId
    }
  });
  return cors(request, json({
    success: true,
    data: wishlistItems
  }));
}

export async function action({
  request,
}: ActionFunctionArgs) {
  try {
    const searchParams = new URL(request.url).searchParams;

    if (request.method === "OPTIONS") {
      const response = json({
        status: 200,
      });
      return await cors(request, response);
    }

    switch (request.method) {
      case "POST": {
        const { id, ...body } = (await request.json()) || {};
        const wishlistItem = await prisma.wishlist.create({
          data: {
            shop: body.shop,
            images: body.images,
            name: body.name,
            price: body.price,
            compareAtPrice: body.compareAtPrice,
            productId: body.productId,
            customerId: body.customerId
          }
        });
        return await cors(request, json({
          success: true,
          data: wishlistItem
        }));
      }
      case "PUT": {
        /* handle "PUT" */
      }
      case "PATCH": {
        /* handle "PATCH" */
      }
      case "DELETE": {
        const shop = searchParams.get("shop");
        const productId = searchParams.get("productId");
        const customerId = searchParams.get("customerId");

        if (!shop || !productId || !customerId) return await cors(request, json({
          success: false,
          message: "Missing fields"
        }));
        const wishlistItems = await prisma.wishlist.deleteMany({
          where: { shop, productId, customerId }
        });
        return cors(request, json({
          success: true,
          data: wishlistItems
        }));
      }
    }

    return cors(request, json({
      success: true,
    }));
  } catch (err) {
    console.log(err);

    return cors(request, json({
      success: false,
      message: "Something went wrong"
    }));
  }
}
