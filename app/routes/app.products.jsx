import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

export default function ProductsChart() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 🧠 Fetch products on load
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

  // 🧩 Render chart after data is loaded
  useEffect(() => {
    if (!loading && products.length > 0) {
      const ctx = chartRef.current.getContext("2d");

      // Destroy old chart before creating a new one (important for re-renders)
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: products.map((p) => p.title),
          datasets: [
            {
              label: "Total Quantity",
              data: products.map((p) => p.totalQuantity),
              backgroundColor: "rgba(0, 128, 96, 0.7)",
              borderColor: "#008060",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            title: {
              display: true,
              text: "🛍 Product Inventory Overview",
              font: { size: 18 },
            },
          },
          scales: {
            x: {
              title: { display: true, text: "Product Name", font: { size: 14 } },
              ticks: { maxRotation: 45, minRotation: 45 },
            },
            y: {
              title: { display: true, text: "Total Quantity", font: { size: 14 } },
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [products, loading]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 Shopify Products Quantity Chart</h2>

      {loading ? (
        <p style={styles.loading}>Fetching products...</p>
      ) : products.length === 0 ? (
        <p style={styles.noData}>No products found.</p>
      ) : (
        <div style={styles.chartContainer}>
          <canvas ref={chartRef} width="800" height="400"></canvas>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#202223",
  },
  loading: {
    fontSize: "18px",
    color: "#6b7280",
  },
  noData: {
    fontSize: "18px",
    color: "#9ca3af",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    height: "450px",
  },
};
