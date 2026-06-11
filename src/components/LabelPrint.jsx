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
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontSize: "12px",
          fontWeight: "bold",
          overflow: "hidden",
        }}
      >
        {item.name}
      </div>

      <Barcode
        value={String(item.barcode)}
        format="CODE128"
        width={1}
        height={30}
        displayValue={true}
      />
    </div>
  );
}