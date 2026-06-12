import Barcode from "react-barcode";

export default function LabelPrint({ item }) {
  return (
    <div
      style={{
        width: "50mm",
        height: "25mm",
        padding: "1mm",
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
          fontSize: "9px",
          fontWeight: "bold",
          textAlign: "center",
          maxHeight: "6mm",
          overflow: "hidden",
        }}
      >
        {item.name}
      </div>

      {/* REAL BARCODE */}
      <div style={{ transform: "scale(0.85)" }}>
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