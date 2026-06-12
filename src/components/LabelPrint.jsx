const printLabel = (item) => {
  const barcode = String(item.barcode || "");

  const frame = document.createElement("iframe");

  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";

  document.body.appendChild(frame);

  const doc = frame.contentWindow.document;

  doc.open();
  doc.write(`
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
      </body>
    </html>
  `);

  doc.close();

  setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();

    document.body.removeChild(frame);
  }, 300);
};