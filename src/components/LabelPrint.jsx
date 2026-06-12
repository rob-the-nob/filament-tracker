export default function LabelPrint({ item }) {
  const barcode = String(item.barcode || "");

  return (
    <div
      style={{
        width: "50mm",
        height: "25mm",
        padding: "2mm",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
        overflow: "hidden",
      }}
    >
      {/* NAME */}
      <div
        style={{
          fontSize: "10px",
          fontWeight: "bold",
          textAlign: "center",
          maxHeight: "8mm",
          overflow: "hidden",
        }}
      >
        {item.name}
      </div>

      {/* SVG BARCODE (RELIABLE IN PRINT) */}
      <svg
        width="100%"
        height="14mm"
        viewBox="0 0 200 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="50%"
          y="30"
          textAnchor="middle"
          fontSize="14"
          fontFamily="monospace"
        >
          {barcode}
        </text>
      </svg>
    </div>
  );
}