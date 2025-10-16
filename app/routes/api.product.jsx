import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  try {
    const { admin } = await authenticate.admin(request);

    const query = `
            query getProducts {
                products(first: 100){
                    edges{
                        node{
                            id
                            title
                            variants(first: 100){
                                edges{
                                    node{
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

    const response = await admin.graphql(query);
    const data = await response.json();

    // Calculate total quntity per product
    const products = [];

    const productedges = data?.data?.products?.edges || [];
    
    for (const product of productedges) {
      const node = product.node;

      let totalQuantity = 0;

      for (const variants of node.variants.edges) {
        const variant = variants.node;
        totalQuantity += variant.inventoryQuantity || 0;
      }

      // add in product Data
      products.push({
        id: node.id,
        title: node.title,
        totalQuantity,
      });
    }

    return Response.json({
      success: true,
      count: products?.length || 0,
      products,
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      error: error,
    });
  }
}
