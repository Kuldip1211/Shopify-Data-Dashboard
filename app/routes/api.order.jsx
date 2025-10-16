import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  try {
    const { admin } = await authenticate.admin(request);

    // 🧠 GraphQL query to fetch order details with line items
    const query = `#graphql
      {
        orders(first: 60) {
          edges {
            node {
              id
              name
              displayFinancialStatus
              lineItems(first: 60) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await admin.graphql(query);
    const data = await response.json();

    // 🧩 Process each order
    const orders = data.data.orders.edges.map(({ node }) => {
      const lineItems = node.lineItems.edges.map(({ node }) => ({
        title: node.title,
        quantity: node.quantity,
      }));

      const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        id: node.id,
        name: node.name,
        paymentStatus: node.displayFinancialStatus || "N/A",
        totalQuantity,
        lineItems, // ✅ include product details
      };
    });

    return Response.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return Response.json({
      success: false,
      message: error.message,
    });
  }
}
