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
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/order");
        const data = await response.json();
        if (data && data.orders) setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // 🔸 Prepare data for Polar Area Chart
  const paymentStatusCounts = orders.reduce(
    (acc, order) => {
      const status = order.paymentStatus?.toUpperCase() || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

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
        <p>Track your order quantities and payment statuses in real time.</p>
      </div>

      {loading ? (
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
              <h2>🧾 Orders Overview</h2>
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

            {/* 📊 Right: Payment Status Chart */}
            <div className="chart-section">
              <h2>📊 Payment Status Summary</h2>
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
    </Page>
  );
}
