import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  try {
    const { admin } = await authenticate.admin(request);

    // 🧠 GraphQL query to fetch order details with line items and total price
    const query = `#graphql
      {
        orders(first: 60) {
          edges {
            node {
              id
              name
              displayFinancialStatus
              currentTotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 60) {
                edges {
                  node {
                    title
                    quantity
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
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
        price: parseFloat(node.originalUnitPriceSet?.shopMoney?.amount || 0),
        currency: node.originalUnitPriceSet?.shopMoney?.currencyCode || "USD",
      }));

      const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0);

      const totalPrice = parseFloat(
        node.currentTotalPriceSet?.shopMoney?.amount || 0
      ).toFixed(2);

      const currency = node.currentTotalPriceSet?.shopMoney?.currencyCode || "USD";

      return {
        id: node.id,
        name: node.name,
        paymentStatus: node.displayFinancialStatus || "N/A",
        totalQuantity,
        totalPrice: `${currency} ${totalPrice}`, // ✅ include formatted total price
        lineItems, // ✅ include detailed product list
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
