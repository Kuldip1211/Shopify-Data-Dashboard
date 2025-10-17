import { useEffect, useState } from "react";
import { Page, Card, Spinner, DataTable, Scrollable, Box } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import "./style/drafts.css";

export default function DraftOrders() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧩 Fetch data on load
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await fetch("/api/draftsOrders");
        const data = await res.json();
        setDrafts(data.drafts || []);
      } catch (error) {
        console.error("Error fetching drafts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  // 🧮 Table data
  const rows = drafts.map((order) => [
    order.id,
    order.name,
    order.email || "N/A",
    order.total_price ? `$${order.total_price}` : "—",
    order.status,
    new Date(order.created_at).toLocaleDateString(),
  ]);

  return (
    <Page title="Draft Orders">
      {loading ? (
        <Box padding="600" alignment="center">
          <Spinner accessibilityLabel="Loading draft orders" size="large" />
        </Box>
      ) : (
        <Card sectioned>
          {/* ✅ Only vertical scroll */}
          <Scrollable shadow style={{ maxHeight: "65vh", overflowX: "hidden" }}>
            <div className="draft-table-container">
              <DataTable
                columnContentTypes={["text", "text", "text", "text", "text", "text"]}
                headings={["ID", "Name", "Email", "Total", "Status", "Created At"]}
                rows={rows}
                hoverable
              />
            </div>
          </Scrollable>
        </Card>
      )}
    </Page>
  );
}
