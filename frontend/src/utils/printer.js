export function printTicket(cart, total, saleId = "OFFLINE", forPreview = false) {
  const now = new Date();
  const timestamp = now.toLocaleString("es-AR");
  
  // Si viene "OFFLINE" o está vacío, forzamos el número 1 para que siempre muestre un número real de prueba
  const cleanId = (saleId === "OFFLINE" || !saleId) ? 1 : saleId;
  const nroTicket = String(cleanId).padStart(8, '0');
  const caeText = "74125896321458 (Simulado)";

  const content = `
╔════════════════════════════╗
║      POS FISCAL TICKET     ║
╚════════════════════════════╝

ROTISERÍA UDA S.R.L.
CUIT: 30-71489632-9
IVA RESPONSABLE INSCRIPTO

Ticket Nro: #0001-${nroTicket}
Fecha: ${timestamp}

─────────────────────────────
ITEMS:
${cart.map(item => `${item.name.padEnd(20)} x${item.quantity}\n  $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`).join("\n")}

─────────────────────────────
TOTAL: $${total.toFixed(2)}

CAE N°: ${caeText}
Gracias por su compra!
  `;

  const html = `
    <html>
      <head>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Courier New', monospace; margin: 0; padding: 10mm 5mm; display: flex; justify-content: center; }
          .ticket-container { width: 350px; font-size: 16px; line-height: 1.2; }
          pre { white-space: pre-wrap; margin: 0; }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <pre>${content}</pre>
        </div>
      </body>
    </html>
  `;

  if (forPreview) {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(html);
    printWindow.document.close();
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
  // Fechas
  const fechaObj = new Date();
  const dia = String(fechaObj.getDate()).padStart(2, '0');
  const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
  const anio = fechaObj.getFullYear();
  const fechaEmision = `${dia}/${mes}/${anio}`;

  // Vencimiento CAE (+10 días)
  const vtoCaeDate = new Date(fechaObj);
  vtoCaeDate.setDate(vtoCaeDate.getDate() + 10);
  const vtoDia = String(vtoCaeDate.getDate()).padStart(2, '0');
  const vtoMes = String(vtoCaeDate.getMonth() + 1).padStart(2, '0');
  const vtoAnio = vtoCaeDate.getFullYear();
  const fechaVto = `${vtoDia}/${vtoMes}/${vtoAnio}`;
  
  const cleanId = (saleId === "OFFLINE" || !saleId) ? 1 : saleId;
  const nroFactura = String(cleanId).padStart(8, '0');
  const cuitLocal = '30-71489632-9';
  const caeNum = "74125896321458";

  // Simulador de QR
  const qrPlaceholder = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=cuit=${cuitLocal}|comp=6|ptov=1|num=${nroFactura}|total=${total.toFixed(2)}`;

  const invoiceWindow = window.open('', '_blank');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Factura #${nroFactura}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; color: #000; font-size: 11px; line-height: 1.4; }
          .factura-container { max-width: 800px; margin: 0 auto; position: relative; }
          
          /* HEADER A PRUEBA DE BALAS */
          .top-box { border: 1px solid #000; margin-bottom: 5px; }
          .row-header { display: flex; border-bottom: 1px solid #000; position: relative; min-height: 140px;}
          .col-left, .col-right { width: 50%; padding: 15px 20px; }
          .col-left { border-right: 1px solid #000; }
          .row-header .col-right { padding-left: 45px; }
          
          /* LA CAJITA DE LA LETRA B */
          .box-letra { position: absolute; left: 50%; top: 0; transform: translateX(-50%); width: 50px; height: 50px; border: 1px solid #000; border-top: none; background: #fff; text-align: center; display: flex; flex-direction: column; justify-content: center; }
          .box-letra h1 { margin: 0; font-size: 32px; line-height: 1; }
          .box-letra p { margin: 2px 0 0 0; font-size: 8px; font-weight: bold; }
          
          .text-title { font-size: 26px; font-weight: bold; margin: 0 0 10px 0; }
          .text-factura { font-size: 28px; font-weight: bold; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px; }
          
          .info-line { display: flex; margin-bottom: 4px; }
          .info-line .bold { font-weight: bold; margin-right: 5px; }

          /* DATOS RECEPTOR */
          .row-receptor { display: flex; }
          .row-receptor .col-left { padding: 10px 20px; border-right: 1px solid #000; }
          .row-receptor .col-right { padding: 10px 20px; }

          /* TABLA ITEMS */
          .table-items { width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 10px;}
          .table-items th { background-color: #d8d8d8; padding: 6px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 10px; text-transform: uppercase; font-weight: bold; }
          .table-items td { padding: 8px 6px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; }
          .table-items th:last-child, .table-items td:last-child { border-right: none; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }

          /* TOTALES SIMPLES ESTILO ARCA */
          .box-totales { border: 1px solid #000; padding: 15px 20px; display: flex; justify-content: flex-end; margin-bottom: 30px;}
          .totales-grid { display: grid; grid-template-columns: 200px 100px; row-gap: 8px; font-size: 14px; font-weight: bold; }
          .totales-grid .label { text-align: right; padding-right: 10px;}
          .totales-grid .value { text-align: right; }
          .totales-grid .total-row { font-size: 16px; margin-top: 5px; }

          /* FOOTER ARCA */
          .footer-arca { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; }
          .footer-left { display: flex; align-items: center; gap: 20px; }
          .qr-img { width: 110px; height: 110px; }
          .arca-text { display: flex; flex-direction: column; }
          .arca-logo { font-size: 32px; font-weight: 900; letter-spacing: -1px; margin: 0; line-height: 1; color: #333;}
          .arca-sub { font-size: 8px; margin: 4px 0 12px 0; font-weight: bold; color: #666; letter-spacing: 0.5px;}
          .arca-auth { font-size: 14px; font-weight: bold; font-style: italic; margin: 0 0 8px 0; }
          .arca-disc { font-size: 10px; font-style: italic; font-weight: bold; margin: 0; color: #111;}
          
          .footer-right { text-align: right; font-size: 16px; }
          .footer-right p { margin: 8px 0; }
          
          .demo-text { color: red; font-size: 11px; font-weight: bold; text-align: center; margin-top: 40px; text-transform: uppercase; }

          @media print {
            body { padding: 0; }
            .table-items th { background-color: #d8d8d8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .demo-text { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="factura-container">
          
          <div class="top-box">
            <div class="row-header">
              <div class="box-letra">
                <h1>B</h1>
                <p>COD. 006</p>
              </div>
              
              <div class="col-left">
                <h2 class="text-title">ROTISERÍA UDA</h2>
                <div class="info-line"><span class="bold">Razón Social:</span> UDA S.R.L.</div>
                <div class="info-line"><span class="bold">Domicilio Comercial:</span> Av. Civit 450 - Mendoza</div>
                <div class="info-line"><span class="bold">Condición frente al IVA:</span> IVA Responsable Inscripto</div>
              </div>
              
              <div class="col-right">
                <h2 class="text-factura">FACTURA</h2>
                <div class="info-line"><span class="bold">Punto de Venta:</span> 0001 <span style="margin: 0 15px;"></span> <span class="bold">Comp. Nro:</span> 0001-${nroFactura}</div>
                <div class="info-line"><span class="bold">Fecha de Emisión:</span> ${fechaEmision}</div>
                <div class="info-line"><span class="bold">CUIT:</span> ${cuitLocal}</div>
                <div class="info-line"><span class="bold">Ingresos Brutos:</span> 30-71489632-9</div>
                <div class="info-line"><span class="bold">Fecha de Inicio de Actividades:</span> 01/01/2023</div>
              </div>
            </div>

            <div class="row-receptor">
              <div class="col-left">
                <div class="info-line"><span class="bold">CUIT/DNI:</span> ${customerDocument || '00000000'}</div>
                <div class="info-line"><span class="bold">Condición frente al IVA:</span> Consumidor Final</div>
                <div class="info-line"><span class="bold">Condición de venta:</span> ${paymentType}</div>
              </div>
              <div class="col-right">
                <div class="info-line"><span class="bold">Apellido y Nombre / Razón Social:</span> ${customerName || 'Consumidor Final'}</div>
                <div class="info-line"><span class="bold">Domicilio:</span> Mendoza</div>
              </div>
            </div>
          </div>

          <table class="table-items">
            <thead>
              <tr>
                <th class="text-center" style="width: 10%">Cant.</th>
                <th class="text-center" style="width: 15%">U. Medida</th>
                <th style="width: 45%">Producto / Servicio</th>
                <th class="text-right" style="width: 15%">Precio Unit.</th>
                <th class="text-right" style="width: 15%">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-center">unidades</td>
                  <td>${item.name}</td>
                  <td class="text-right">${item.price.toFixed(2)}</td>
                  <td class="text-right">${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="box-totales">
            <div class="totales-grid">
              <div class="label">Subtotal: $</div><div class="value">${total.toFixed(2)}</div>
              <div class="label">Importe Otros Tributos: $</div><div class="value">0.00</div>
              <div class="label total-row">Importe Total: $</div><div class="value total-row">${total.toFixed(2)}</div>
            </div>
          </div>

          <div class="footer-arca">
            <div class="footer-left">
              <img src="${qrPlaceholder}" alt="QR" class="qr-img" />
              <div class="arca-text">
                <h2 class="arca-logo">ARCA</h2>
                <p class="arca-sub">AGENCIA DE RECAUDACIÓN<br>Y CONTROL ADUANERO</p>
                <p class="arca-auth">Comprobante Autorizado</p>
                <p class="arca-disc">Esta Agencia no se responsabiliza por los datos ingresados en el detalle de la operación</p>
              </div>
            </div>
            
            <div class="footer-right">
              <p><span class="bold">CAE N°:</span> ${caeNum}</p>
              <p><span class="bold">Fecha de Vto. de CAE:</span> ${fechaVto}</p>
            </div>
          </div>

          <p class="demo-text">Comprobante de demostración. No válido como factura legal.</p>

        </div>
      </body>
    </html>
  `;

  invoiceWindow.document.write(html);
  invoiceWindow.document.close();

  if (!forPreview) {
    setTimeout(() => invoiceWindow.print(), 250);
  }
};