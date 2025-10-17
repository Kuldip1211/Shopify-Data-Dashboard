import { useEffect, useState } from "react";
import {
  Page,
  Card,
  Spinner,
  Text,
  DataTable,
  Scrollable,
  Box,
} from "@shopify/polaris";
import { PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "@shopify/polaris/build/esm/styles.css";
import "./style/orders.css";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  // 🔹 Fetch Orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/order");
        const data = await response.json();
        if (data && data.orders) setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, []);

  // 🔹 Fetch Draft Orders
  useEffect(() => {
    async function fetchDrafts() {
      try {
        const res = await fetch("/api/draftsOrders");
        const data = await res.json();
        setDrafts(data.drafts || []);
      } catch (error) {
        console.error("Error fetching drafts:", error);
      } finally {
        setLoadingDrafts(false);
      }
    }
    fetchDrafts();
  }, []);

  // 🔸 Prepare Chart Data
  const paymentStatusCounts = orders.reduce((acc, order) => {
    const status = order.paymentStatus?.toUpperCase() || "UNKNOWN";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(paymentStatusCounts),
    datasets: [
      {
        label: "Orders by Payment Status",
        data: Object.values(paymentStatusCounts),
        backgroundColor: ["#36A2EB", "#4BC0C0", "#FFCE56", "#FF6384", "#9966FF"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { family: "Poppins" },
        },
      },
    },
  };

  return (
    <Page fullWidth>
      <div className="dashboard-header">
        <h1>📦 Shopify Orders Dashboard</h1>
        <p>Track your orders, payment statuses, and draft orders in real time.</p>
      </div>

      {/* ================= ORDERS SECTION ================= */}
      {loadingOrders ? (
        <div className="orders-loader">
          <Spinner accessibilityLabel="Loading orders" size="large" />
          <Text variant="headingMd" as="p" tone="subdued">
            Fetching latest orders...
          </Text>
        </div>
      ) : (
        <Card>
          <div className="orders-container">
            {/* 🧾 Left: Orders Table */}
            <div className="orders-table-section">
              <h2 className="section-title">🧾 Orders Overview</h2>
              {orders.length === 0 ? (
                <Box padding="8" align="center" textAlign="center">
                  <Text variant="bodyLg" as="p" tone="subdued">
                    No orders found.
                  </Text>
                </Box>
              ) : (
                <Scrollable
                  shadow
                  style={{
                    maxHeight: "70vh",
                    overflowX: "auto",
                    overflowY: "auto",
                    borderRadius: "10px",
                  }}
                >
                  <Box padding="4" minWidth="100%">
                    <DataTable
                      columnContentTypes={["text", "text", "numeric", "text"]}
                      headings={[
                        "Order ID",
                        "Order Name",
                        "Total Quantity",
                        "Payment Status",
                      ]}
                      rows={orders.map((order) => [
                        order.id.split("/").pop(),
                        order.name,
                        order.totalQuantity,
                        order.paymentStatus,
                      ])}
                      increasedTableDensity
                      hoverable
                    />
                  </Box>
                </Scrollable>
              )}
            </div>

            {/* 📊 Right: Chart Section */}
            <div className="chart-section">
              <h2 className="section-title">📊 Payment Status Summary</h2>
              {orders.length === 0 ? (
                <Text variant="bodyLg" as="p" tone="subdued">
                  No orders found to display chart.
                </Text>
              ) : (
                <div className="chart-container">
                  <PolarArea data={chartData} options={chartOptions} />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ================= DRAFT ORDERS SECTION ================= */}
      <div className="draft-orders-wrapper">
        <Card>
          <h2 className="section-title">📝 Draft Orders</h2>
          {loadingDrafts ? (
            <Box padding="600" alignment="center">
              <Spinner accessibilityLabel="Loading draft orders" size="large" />
            </Box>
          ) : drafts.length === 0 ? (
            <Box padding="8" align="center" textAlign="center">
              <Text variant="bodyLg" as="p" tone="subdued">
                No draft orders found.
              </Text>
            </Box>
          ) : (
            <Scrollable shadow style={{ maxHeight: "65vh", overflowX: "hidden" }}>
              <div className="draft-table-container">
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                  ]}
                  headings={[
                    "ID",
                    "Name",
                    "Email",
                    "Total",
                    "Status",
                    "Created At",
                  ]}
                  rows={drafts.map((order) => [
                    order.id,
                    order.name,
                    order.email || "N/A",
                    order.total_price ? `$${order.total_price}` : "—",
                    order.status,
                    new Date(order.created_at).toLocaleDateString(),
                  ])}
                  hoverable
                />
              </div>
            </Scrollable>
          )}
        </Card>
      </div>
    </Page>
  );
}
