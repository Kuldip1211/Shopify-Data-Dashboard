import { useEffect, useState } from "react";
import { Page, Card, Spinner, Text } from "@shopify/polaris";

export default function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const response = await fetch("/api/product", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        console.log("✅ Products fetched:", data.products);
      } else {
        console.error("❌ API Error:", data.message);
      }
    } catch (error) {
      console.error("❌ Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page title="📦 Product Inventory Overview">
      <Card>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px",
            }}
          >
            <Spinner accessibilityLabel="Loading products" size="large" />
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <Text as="p" variant="bodyMd">
              No products found.
            </Text>
          </div>
        ) : (
          <div
            style={{
              padding: "20px",
              overflowX: "auto",
              overflowY: "auto",
              whiteSpace: "nowrap",
              scrollbarWidth: "thin",
              maxHeight: "500px",
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <table
              style={{
                borderCollapse: "collapse",
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                borderRadius: "12px",
                minWidth: "600px",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <thead style={{ backgroundColor: "#f9fafb" }}>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 18px",
                      fontWeight: "600",
                      color: "#202223",
                      borderBottom: "1px solid #e1e3e5",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Product Name
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "14px 18px",
                      fontWeight: "600",
                      color: "#202223",
                      borderBottom: "1px solid #e1e3e5",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Total Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f6f6f7",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#eef6f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "#ffffff" : "#f6f6f7")
                    }
                  >
                    <td
                      style={{
                        padding: "14px 18px",
                        color: "#202223",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {product.title}
                    </td>
                    <td
                      style={{
                        padding: "14px 18px",
                        textAlign: "right",
                        fontWeight: "500",
                        color: "#008060",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {product.totalQuantity}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="2"
                    style={{
                      padding: "14px 18px",
                      textAlign: "right",
                      borderTop: "1px solid #e1e3e5",
                      fontWeight: "600",
                      color: "#202223",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Total Products: {products.length}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* ✅ Include Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* ✅ Custom Scrollbar Styles */}
      <style>
        {`
          div::-webkit-scrollbar {
            height: 8px;
            width: 8px;
          }
          div::-webkit-scrollbar-thumb {
            background-color: #c9c9c9;
            border-radius: 8px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background-color: #a8a8a8;
          }
        `}
      </style>
    </Page>
  );
}
