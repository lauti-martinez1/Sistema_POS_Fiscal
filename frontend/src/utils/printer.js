// ACÁ AGREGAMOS "saleId" COMO TERCER PARÁMETRO
export function printTicket(cart, total, saleId = "OFFLINE", forPreview = false) {
  const now = new Date()
  const timestamp = now.toLocaleString("es-AR")
  
  // Si es offline, avisa. Si es online, le pone ceros a la izquierda (ej: 00000015)
  const nroTicket = saleId === "OFFLINE" ? "PENDIENTE DE SYNC" : String(saleId).padStart(8, '0');

  const content = `
╔════════════════════════════╗
║      POS FISCAL TICKET     ║
╚════════════════════════════╝

ROTISERÍA UDA S.R.L.
CUIT: 30-71489632-9
IVA RESPONSABLE INSCRIPTO

Ticket Nro: ${nroTicket !== "PENDIENTE DE SYNC" ? `#0001-${nroTicket}` : nroTicket}
Fecha: ${timestamp}

─────────────────────────────
ITEMS:
${cart
  .map(
    (item) =>
      `${item.name.padEnd(20)} x${item.quantity}\n  $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`
  )
  .join("\n")}

─────────────────────────────
TOTAL: $${total.toFixed(2)}

Gracias por su compra!
  `

  const html = `
    <html>
      <head>
        <style>
          @page {
            size: 80mm auto;
            margin: 0mm; /* 👇 ESTO ELIMINA LA URL Y LA FECHA DEL NAVEGADOR 👇 */
          }
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 10mm 5mm; /* Le damos margen interno para que no quede pegado al corte del papel */
            display: flex;
            justify-content: center; 
          }
          .ticket-container {
            width: 350px; 
            font-size: 16px; 
            line-height: 1.2;
          }
          pre {
            white-space: pre-wrap;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <pre>${content}</pre>
        </div>
      </body>
    </html>
  `

  if (forPreview) {
    const printWindow = window.open("", "_blank")
    printWindow.document.write(html)
    printWindow.document.close()
  } else {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 300);
  }
}

export const printInvoice = (cart, total, customerName, customerDocument, paymentType, saleId, forPreview = false) => {
  const fecha = new Date().toLocaleDateString('es-AR');
  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  
  const nroFactura = String(saleId || 1).padStart(8, '0');
  const cuitLocal = '30-71489632-9'; 

  const invoiceWindow = window.open('', '_blank');

  const html = `
    <html>
      <head>
        <title>Factura #${nroFactura}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; border-bottom: 3px solid #111; padding-bottom: 20px; margin-bottom: 20px; }
          .business-info h1 { margin: 0; font-size: 26px; text-transform: uppercase; }
          .business-info p { margin: 5px 0; color: #555; }
          .invoice-info { text-align: right; }
          .invoice-info h2 { margin: 0; font-size: 32px; letter-spacing: 2px; }
          .letter-box { border: 2px solid #111; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 10px;}
          .customer-box { border: 1px solid #ccc; padding: 20px; border-radius: 8px; margin-bottom: 30px; background-color: #fcfcfc; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border-bottom: 1px solid #ddd; padding: 12px 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; text-transform: uppercase; font-size: 14px; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-section { text-align: right; font-size: 24px; font-weight: black; border-top: 3px solid #111; padding-top: 15px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="business-info">
            <h1>ROTISERIA UDA</h1>
            <p>Catamarca 147</p>
            <p><strong>CUIT:</strong> ${cuitLocal}</p>
            <p><strong>IVA:</strong> Responsable Inscripto</p>
          </div>
          <div class="invoice-info">
            <div class="letter-box">B</div>
            <h2>FACTURA</h2>
            <p><strong>Comp. Nro:</strong> 0001-${nroFactura}</p>
            <p><strong>Fecha:</strong> ${fecha} - ${hora}</p>
            <p><strong>Condición Venta:</strong> ${paymentType}</p>
          </div>
        </div>

        <div class="customer-box">
          <p style="margin: 0 0 10px 0;"><strong>Cliente:</strong> ${customerName || 'Consumidor Final'}</p>
          <p style="margin: 0;"><strong>DNI:</strong> ${customerDocument || '00000000'}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th class="text-center" style="width: 10%">Cant.</th>
              <th style="width: 50%">Descripción</th>
              <th class="text-right" style="width: 20%">Precio Unit.</th>
              <th class="text-right" style="width: 20%">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${cart.map(item => `
              <tr>
                <td class="text-center">${item.quantity}</td>
                <td>${item.name}</td>
                <td class="text-right">$${item.price.toFixed(2)}</td>
                <td class="text-right">$${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <p style="margin: 0;">TOTAL: $${total.toFixed(2)}</p>
        </div>

        <p style="text-align: center; margin-top: 50px; font-size: 12px; color: #888;">
          Documento generado con fines de demostración. No válido como factura legal.
        </p>
      </body>
    </html>
  `;

  invoiceWindow.document.write(html);
  invoiceWindow.document.close();

  if (!forPreview) {
    setTimeout(() => {
      invoiceWindow.print();
    }, 250);
  }
};