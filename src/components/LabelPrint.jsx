const printLabel = (item) => {
  const barcode = String(item.barcode);

  const printWindow = window.open("", "_blank", "width=400,height=200");

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Label</title>

        <style>
          @page {
            size: 50mm 25mm;
            margin: 0;
          }

          body {
            margin: 0;
            width: 50mm;
            height: 25mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: Arial;
          }

          .name {
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            max-height: 8mm;
            overflow: hidden;
          }

          .barcode {
            font-family: monospace;
            font-size: 14px;
            margin-top: 2mm;
          }
        </style>
      </head>

      <body>
        <div class="name">${item.name || ""}</div>
        <div class="barcode">${barcode}</div>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
};