const printLabel = (item) => {
  const barcode = String(item.barcode || "");

  const win = window.open("", "_blank");

  if (!win) {
    alert("Popup blocked. Allow popups to print.");
    return;
  }

  win.document.write(`
    <html>
      <head>
        <title>Print</title>

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
            font-size: 16px;
            letter-spacing: 2px;
            margin-top: 2mm;
          }
        </style>
      </head>

      <body>
        <div class="name">${item.name || ""}</div>
        <div class="barcode">${barcode}</div>

        <script>
          window.onload = function () {
            window.focus();
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);

  win.document.close();
};