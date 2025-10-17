import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  try {
    const { admin } = await authenticate.admin(request);

    const query = `{
      draftOrders(first: 50) {
        edges {
          node {
            id
            name
            email
            totalPriceSet {
              shopMoney { amount currencyCode }
            }
            createdAt
            status
          }
        }
      }
    }`;

    const response = await admin.graphql(query);
    const json = await response.json();

    const drafts =
      json.data?.draftOrders?.edges?.map((edge) => edge.node) || [];

    return Response.json({ drafts });
  } catch (error) {
    console.error("Error fetching draft orders:", error);
    return Response.json({ error: "Failed to fetch draft orders" }, { status: 500 });
  }
}
