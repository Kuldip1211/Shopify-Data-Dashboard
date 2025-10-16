// app/routes/api.products.jsx
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  console.log("🚀 Loader called: Fetching all products with total quantity");

  try {
    // ✅ Authenticate the Shopify session
    const { admin } = await authenticate.admin(request);

    // ✅ GraphQL query to fetch first 100 products + their variants
    const query = `
      query getProducts {
        products(first: 100) {
          edges {
            node {
              id
              title
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    `;

    // ✅ Call Shopify Admin API
    const response = await admin.graphql(query);
    const data = await response.json();

    // 🧮 Calculate total quantity per product
    const products = data?.data?.products?.edges?.map(({ node }) => {
      const totalQuantity = node.variants.edges.reduce(
        (sum, variant) => sum + (variant.node.inventoryQuantity || 0),
        0
      );
      return {
        id: node.id,
        title: node.title,
        totalQuantity,
      };
    });

    // ✅ Return success response
    return Response.json({
      success: true,
      count: products?.length || 0,
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
