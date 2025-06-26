const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB');
  };
  
 const generateHtml = (data) => {
    const {
      po_id,
      invoice_number,
      date,
      total_amount,
      status,
      created_at,
      notes,
      terms_conditions,
      items,
      customer,
    } = data;
  
    const customerSince = formatDate(customer?.created_at);
    const invoiceDate = formatDate(date);
    const createdAt = formatDate(created_at);
    const finalNotes = notes || terms_conditions || '<span style="color:#888;">No notes or terms provided.</span>';
  
    const itemHtml = items.map((item) => `
      <div class="item-card">
        <div class="item-top">
          <span class="item-name"><b>${item.item_name || ''}</b></span>
          <span class="item-desc">${item.description ? '- ' + item.description : '-'}</span>
          <span class="item-qty">Qty: ${item.quantity}</span>
          <span class="item-container">Container: ${item.container}</span>
        </div>
        <div class="item-details">
          <div class="item-group"><b>Gross:</b> ${item.gross_weight}</div>
          <div class="item-group"><b>Tare:</b> ${item.tare_weight}</div>
          <div class="item-group"><b>Net:</b> ${item.net_weight}</div>
          <div class="item-group"><b>Weighing Loss:</b> ${item.weighing_loss}</div>
          <div class="item-group"><b>Clean:</b> ${item.clean_weight}</div>
          <div class="item-group"><b>Price:</b> ${item.price}</div>
          <div class="item-group"><b>Labor Charges:</b> ${item.labor_charges}</div>
          <div class="item-group"><b>Deduction:</b> ${item.deduction}</div>
          <div class="item-group"><b>Air Loss:</b> ${item.air_loss}</div>
          <div class="item-group"><b>Net Deduction:</b> ${item.net_deduction}</div>
        </div>
        <div class="item-bottom">
          <span class="item-total"><b>Total:</b> ₹${item.total_amount}</span>
        </div>
      </div>
    `).join('');
  
    return `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Roboto', Arial, sans-serif;
      background: #f8f9fa;
      margin: 0;
      padding: 0;
      color: #22223b;
    }
    .invoice-box {
      background: #fff;
      max-width: 900px;
      margin: 40px auto;
      box-shadow: 0 6px 24px rgba(34,34,59,0.09);
      border-radius: 16px;
      padding: 38px 48px 32px 48px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #4a4e69;
      padding-bottom: 18px;
      margin-bottom: 28px;
    }
    .company {
      font-size: 2.1rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: #4a4e69;
    }
    .invoice-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #22223b;
      text-align: right;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 28px;
      gap: 24px;
    }
    .info-box {
      background: #f4f4fa;
      border-radius: 10px;
      padding: 18px 26px;
      width: 48%;
      box-sizing: border-box;
      border: 1.5px solid #e0e0e0;
    }
    .info-box h4 {
      margin: 0 0 10px 0;
      font-size: 1.05rem;
      color: #4a4e69;
      font-weight: 700;
    }
    .info-box p {
      margin: 4px 0;
      font-size: 1rem;
    }
    .invoice-meta {
      margin-bottom: 28px;
      display: flex;
      flex-wrap: wrap;
      gap: 30px;
    }
    .meta-item {
      min-width: 140px;
      font-size: 1rem;
      color: #4a4e69;
    }
    .items-list {
      margin-bottom: 24px;
    }
    .item-card {
      border: 1.5px solid #e0e0e0;
      border-radius: 10px;
      padding: 18px 20px 12px 20px;
      margin-bottom: 18px;
      background: #f8f7fa;
      box-shadow: 0 2px 10px rgba(34,34,59,0.03);
    }
    .item-top {
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      align-items: baseline;
      font-size: 1.08rem;
      margin-bottom: 10px;
    }
    .item-name {
      color: #22223b;
      font-weight: 700;
      font-size: 1.08rem;
    }
    .item-desc {
      color: #6c757d;
      font-size: 1.01rem;
      font-style: italic;
    }
    .item-qty, .item-container {
      color: #4a4e69;
      font-size: 0.98rem;
    }
    .item-details {
      display: flex;
      flex-wrap: wrap;
      gap: 18px 32px;
      margin-bottom: 8px;
      font-size: 0.98rem;
    }
    .item-group {
      min-width: 120px;
      margin-bottom: 4px;
    }
    .item-bottom {
      margin-top: 10px;
      text-align: right;
    }
    .item-total {
      color: #22223b;
      font-size: 1.08rem;
      font-weight: 700;
      background: #e9ecef;
      padding: 4px 18px;
      border-radius: 6px;
    }
    .total-row-block {
      margin-top: 18px;
      text-align: right;
      font-size: 1.13rem;
      font-weight: 700;
      color: #fff;
      background: #4a4e69;
      padding: 10px 0 10px 0;
      border-radius: 8px;
      letter-spacing: 1px;
    }
    .notes {
      background: #f4f4fa;
      border-radius: 8px;
      padding: 14px 22px;
      margin-top: 22px;
      color: #22223b;
      border: 1.5px solid #e0e0e0;
    }
    .footer {
      text-align: center;
      color: #adb5bd;
      font-size: 1.01rem;
      margin-top: 38px;
      border-top: 1.5px solid #e0e0e0;
      padding-top: 14px;
    }
    @media (max-width: 700px) {
      .invoice-box {
        padding: 16px 4px;
      }
      .info-row {
        flex-direction: column;
        gap: 14px;
      }
      .info-box {
        width: 100%;
      }
      .item-details {
        gap: 10px 12px;
      }
    }
  </style>
</head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="company">Your Company Name</div>
            <div class="invoice-title">
              INVOICE<br />
              <span style="font-size:1rem;font-weight:400;">#${invoice_number}</span>
            </div>
          </div>
  
          <div class="info-row">
            <div class="info-box">
              <h4>Bill To</h4>
              <p><b>Name:</b> ${customer?.name}</p>
              <p><b>Address:</b> ${customer?.address}</p>
              <p><b>City/State:</b> ${customer?.city}, ${customer?.state} ${customer?.pincode}</p>
              <p><b>GST:</b> ${customer?.gst_number}</p>
              <p><b>Email:</b> ${customer?.email}</p>
              <p><b>Phone:</b> ${customer?.phone}</p>
            </div>
            <div class="info-box">
              <h4>Invoice Info</h4>
              <p><b>Invoice #:</b> ${invoice_number}</p>
              <p><b>PO #:</b> ${po_id}</p>
              <p><b>Date:</b> ${invoiceDate}</p>
              <p><b>Status:</b> ${status?.charAt(0).toUpperCase() + status?.slice(1)}</p>
              <p><b>Total:</b> ₹${total_amount}</p>
            </div>
          </div>
  
          <div class="invoice-meta">
            <div class="meta-item"><b>Created At:</b> ${createdAt}</div>
            <div class="meta-item"><b>Customer Since:</b> ${customerSince}</div>
          </div>
  
          <div class="items-list">
            <h3 style="margin-top:0; margin-bottom:10px; color:#4a4e69; font-size:1.15rem;">Invoice Items</h3>
            ${itemHtml}
            <div class="total-row-block">
              Grand Total: ₹${total_amount}
            </div>
          </div>
  
          <div class="notes">
            <b>Notes / Terms:</b> <br />
            ${finalNotes}
          </div>
  
          <div class="footer">
            Thank you for your business!<br />
            Generated on ${formatDate(new Date())} &nbsp; | &nbsp; Page 1 of 1
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  module.exports = generateHtml;
  