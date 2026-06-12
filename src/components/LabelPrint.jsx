import Barcode from "react-barcode";

export default function LabelPrint({ item }) {
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
      {/* PRODUCT NAME */}
      <div
        style={{
          textAlign: "center",
          fontSize: "10px",
          fontWeight: "bold",
          lineHeight: "1.1",
          maxHeight: "8mm",
          overflow: "hidden",
        }}
      >
        {item.name}
      </div>

      {/* BARCODE */}
      <div style={{ transform: "scale(0.85)", transformOrigin: "center" }}>
        <Barcode
          value={String(item.barcode)}
          format="CODE128"
          width={1}
          height={35}
          displayValue={true}
          fontSize={10}
          margin={0}
        />
      </div>
    </div>
  );
}