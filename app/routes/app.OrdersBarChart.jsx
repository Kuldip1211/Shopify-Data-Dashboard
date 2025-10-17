import { useEffect, useState } from "react";
import { Card, Spinner, Text } from "@shopify/polaris";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import "@shopify/polaris/build/esm/styles.css";
import "./style/ordersstatus.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function OrdersBarChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/order");
      const data = await res.json();

      if (data && data.orders) {
        const orders = data.orders;

        // 🧠 Group totals by payment status
        const totalsByStatus = orders.reduce((acc, order) => {
          const status = order.paymentStatus?.toUpperCase() || "UNKNOWN";
          const priceValue = parseFloat(order.totalPrice?.replace(/[^\d.-]/g, "")) || 0;
          acc[status] = (acc[status] || 0) + priceValue;
          return acc;
        }, {});

        const labels = Object.keys(totalsByStatus);
        const totals = Object.values(totalsByStatus);

        setChartData({
          labels,
          datasets: [
            {
              label: "Total Order Value by Status",
              data: totals,
              backgroundColor: [
                "#36A2EB", // Paid
                "#FFCE56", // Pending
                "#FF6384", // Refunded
                "#4BC0C0", // Others
              ],
              borderWidth: 1,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card sectioned>
      <h2 className="section-title">💰 Orders by Payment Status</h2>

      {loading ? (
        <div className="chart-loader">
          <Spinner accessibilityLabel="Loading chart" size="large" />
          <Text variant="bodyMd" tone="subdued">
            Calculating totals by payment status...
          </Text>
        </div>
      ) : chartData ? (
        <div className="bar-chart-container">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Total Value of Orders by Payment Status",
                  font: { size: 16 },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `₹${value.toLocaleString()}`,
                  },
                  title: {
                    display: true,
                    text: "Total Amount",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Payment Status",
                  },
                },
              },
            }}
          />
        </div>
      ) : (
        <Text variant="bodyMd" tone="subdued">
          No data available to display.
        </Text>
      )}
    </Card>
  );
}
