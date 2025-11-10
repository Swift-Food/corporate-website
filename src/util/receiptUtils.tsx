// ...existing code...
export type ByMenuItemRow = {
  menuItemId?: string;
  item: string;
  quantitySold: number;
  unitPrice: number; // restaurant-side unit earning
  grossSales: number; // total gross for this item (restaurant-side)
  swiftCommission: number; // commission amount for this item
  totalNet: number; // net after proportional deductions
  [key: string]: any;
};

export type ByOrderRow = {
  orderRefNo: string;
  subOrderId?: string | null;
  employeeName?: string | null;
  dateTime?: string | Date | null;
  totalPortions: number;
  grossSales: number; // restaurant-side gross for this sub-order
  swiftCommission: number;
  totalNet: number; // net after proportional deductions
  orderStatus?: string | null;
  [key: string]: any;
};

export type ReceiptResponse = {
  summary?: {
    totalPortions?: number;
    averageOrderValue?: number;
    grossSales?: number;
    totalDeductions?: number;
    totalSwiftCommissions?: number;
    netEarnings?: number;
    [key: string]: any;
  };
  style?: "MENU_ITEM" | "BY_ORDER";
  byMenuItem?: ByMenuItemRow[];
  byOrder?: ByOrderRow[];
  meta?: {
    commissionRate?: number;
    restaurantName?: string | null;
    totalCustomerGross?: number;
    [key: string]: any;
  };
  // when BY_ORDER the controller may return subOrders with raw items
  subOrders?: Array<{ subOrderId: string | null; items: any[] }>;
  [key: string]: any;
};

export async function fetchCorporateReceiptJson(
  orderId: string,
  restaurantId: string,
  token?: string,
  style?: string
) {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  let url = `${base}/corporate-orders/${orderId}/restaurant/${restaurantId}/receipt-calc`;

  if (style) {
    const params = new URLSearchParams({ style });
    url = `${url}?${params.toString()}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch corporate receipt: ${res.status} ${text}`);
  }
  return res.json();
}

/**
 * Builds a printable HTML receipt from receipt data
 */
export function buildReceiptHTML(
  data: ReceiptResponse,
  orderId?: string,
  eventDate?: string,
  branchName?: string
): string {
  const fmt = (n: number) => `£${Number(n || 0).toFixed(2)}`;
  const summary = data.summary || {};
  const meta = data.meta || {};
  const style = (data.style || "BY_ORDER") as "MENU_ITEM" | "BY_ORDER";

  const formattedOrderId = (orderId || "").slice(0, 4).toUpperCase();

  // header (corporate wording)
  const header = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:32px 48px;border-bottom:2px solid #e0e0e0;background:#fafafa;">
      <div style="display:flex;gap:20px;align-items:center;">
        <img src="/logo.png" alt="Swift Food" style="width:90px;height:auto;display:block;" />
        <div style="font-size:13px;color:#333;line-height:1.6;">
          <strong style="display:block;font-size:15px;color:#000;margin-bottom:4px;">Swift Food Services Limited</strong>
          251 Gray's Inn Road<br/>
          Camden, WC1X 8QT<br/>
          United Kingdom
        </div>
      </div>

      <div style="text-align:right;">
        <div style="margin-bottom:12px;">
          <div style="font-size:14px;color:#666;margin-top:4px;">Corporate Order Receipt</div>
        </div>

        ${branchName ? `<div style="font-size:13px;color:#555;margin-top:6px;"><strong>Branch:</strong> ${String(branchName)}</div>` : ""}
        ${eventDate ? `<div style="font-size:13px;color:#555;margin-top:4px;"><strong>Event:</strong> ${new Date(eventDate).toLocaleDateString('en-GB')}</div>` : ""}
        <div style="margin-top:12px;font-size:13px;color:#333;"><strong>Reference:</strong> ${formattedOrderId}</div>
      </div>
    </div>
  `;

  // download button - separate section
  const downloadButton = `
    <div class="no-print" style="padding:20px 48px;background:#fff;border-bottom:1px solid #e0e0e0;text-align:center;">
      <button id="download-receipt-btn" style="background:#0b66ff;color:#fff;border:none;padding:12px 24px;border-radius:6px;font-weight:600;cursor:pointer;font-size:14px;box-shadow:0 2px 4px rgba(0,0,0,0.1);transition:all 0.2s;">
        Download / Save as PDF
      </button>
    </div>
  `;

  // summary - FIXED: Extract values first, then build string
  const grossSales = fmt(summary.grossSales ?? 0);
  const totalSwiftCommissions = fmt(summary.totalSwiftCommissions ?? 0);
  const netEarnings = fmt(summary.netEarnings ?? 0);
  const deductionsRow = summary.totalDeductions 
    ? `<tr><td style="padding:8px 0;color:#666;">Promo / Deductions:</td><td style="text-align:right;font-weight:600;">-${fmt(summary.totalDeductions)}</td></tr>`
    : "";

  const financialSummary = `
    <div style="padding:32px 48px;background:#fff;">
      <h3 style="margin:0 0 16px 0;font-size:16px;color:#111;font-weight:700;">Financial Summary</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
        <tr><td style="padding:8px 0;color:#666;">Gross Sales:</td><td style="text-align:right;font-weight:600;font-size:15px;">${grossSales}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Swift Commission:</td><td style="text-align:right;font-weight:600;">-${totalSwiftCommissions}</td></tr>
        ${deductionsRow}
        <tr style="border-top:2px solid #e0e0e0;"><td style="padding:14px 0;font-weight:700;font-size:15px;">Net Earnings:</td><td style="text-align:right;font-weight:700;font-size:18px;">${netEarnings}</td></tr>
      </table>
    </div>
  `;

  // items / orders breakdown
  const itemsBreakdown = (() => {
    if (style === "MENU_ITEM" && Array.isArray(data.byMenuItem) && data.byMenuItem.length) {
      const rows = data.byMenuItem.map((r: ByMenuItemRow) => {
        // Safe access with fallbacks per backend spec
        const itemName = r.item || r.name || r.menuItemName || 'Item';
        const qty = r.quantitySold ?? r.quantity ?? r.qty ?? 0;
        const unit = r.unitPrice ?? r.priceForRestaurant ?? 0;
        const gross = r.grossSales ?? r.totalPrice ?? 0;
        const commission = r.swiftCommission ?? 0;
        const net = r.totalNet ?? (gross - commission);
        
        return `
          <tr>
            <td style="padding:14px 12px;border-bottom:1px solid #f0f0f0;">${itemName}</td>
            <td style="padding:14px 12px;text-align:center;border-bottom:1px solid #f0f0f0;">${qty}</td>
            <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(unit)}</td>
            <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(gross)}</td>
            <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(commission)}</td>
            <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;font-weight:700;color:#2e7d32;">${fmt(net)}</td>
          </tr>
        `;
      }).join("");
      
      return `
        <div style="padding:32px 48px;background:#fff;flex:1;">
          <h3 style="margin:0 0 16px 0;font-size:16px;color:#111;font-weight:700;">Items Breakdown</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="text-align:left;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Item</th>
                <th style="text-align:center;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Qty</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Unit</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Gross</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Commission</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Net</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    if (style === "BY_ORDER" && Array.isArray(data.byOrder) && data.byOrder.length) {
      // Table rows with safe access patterns
      const rows = data.byOrder.map((r: ByOrderRow) => {
        const orderRef = ((r.orderRefNo || r.subOrderId || '').slice(0,4) || '').toUpperCase();
        const empName = r.employeeName ?? r.customerName ?? '';
        const portions = r.totalPortions ?? 0;
        const gross = r.grossSales ?? 0;
        const commission = r.swiftCommission ?? 0;
        const net = r.totalNet ?? (gross - commission);
        
        return `
          <tr>
            <td style="padding:14px 12px;border-bottom:1px solid #f0f0f0;text-align:left;">${orderRef}</td>
            <td style="padding:14px 12px;text-align:left;border-bottom:1px solid #f0f0f0;">${empName}</td>
            <td style="padding:14px 12px;text-align:center;border-bottom:1px solid #f0f0f0;">${portions}</td>
            <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(gross)}</td>
            <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(commission)}</td>
            <td style="padding:14px 12px;text-align:right;border-bottom:1px solid #f0f0f0;font-weight:700;color:#2e7d32;">${fmt(net)}</td>
          </tr>
        `;
      }).join("");

    //   // SubOrders detail with safe fallbacks per backend spec
    //   const subOrderDetails = Array.isArray(data.subOrders) && data.subOrders.length 
    //     ? data.subOrders.map((s) => {
    //         const itemsHtml = (s.items || []).map((it: any) => {
    //           const name = it.name || it.itemName || it.item || 'Item';
    //           const qty = it.quantity ?? it.qty ?? 1;
    //           const price = it.totalPrice ?? it.preTotal ?? it.priceForRestaurant ?? it.unitPrice ?? 0;
    //           return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #eee;"><div style="color:#333;">${name} x${qty}</div><div style="color:#333;">${fmt(Number(price))}</div></div>`;
    //         }).join('');
            
    //         return `
    //           <div style="margin-top:12px;padding:16px;border:1px solid #f0f0f0;border-radius:8px;background:#fff;">
    //             <div style="font-size:13px;color:#555;margin-bottom:8px;"><strong>SubOrder:</strong> ${s.subOrderId ?? '—'}</div>
    //             ${itemsHtml || '<div style="color:#999;">No items listed</div>'}
    //           </div>
    //         `;
    //       }).join('') 
    //     : '';

      return `
        <div style="padding:32px 48px;background:#fff;flex:1;">
          <h3 style="margin:0 0 16px 0;font-size:16px;color:#111;font-weight:700;">Orders Breakdown</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="text-align:left;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Order</th>
                <th style="text-align:left;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Employee</th>
                <th style="text-align:center;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Portions</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Gross</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Commission</th>
                <th style="text-align:right;padding:12px;border-bottom:2px solid #ddd;font-weight:700;">Net</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          </div>
          `;
        }
        
        return `<div style="padding:32px 48px;color:#666;flex:1;">No items to display.</div>`;
    })();
    //   ${subOrderDetails}

  // footer - fixed at bottom
  const footer = `
    <div style="padding:28px 48px;border-top:2px solid #e0e0e0;font-size:13px;color:#666;background:#fafafa;">
      <div style="margin-top:10px;color:#999;font-size:12px;">This receipt is for your records. All amounts are GBP (£).</div>
    </div>
  `;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${formattedOrderId}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            color: #222; 
            background: #fff; 
            line-height: 1.5;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          .container { 
            max-width: 900px; 
            margin: 0 auto; 
            background: #fff; 
            width: 100%;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .content-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          #download-receipt-btn:hover {
            background: #0952cc;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          @media print {
            .no-print { display: none !important; }
            body { background: #fff; }
            .container { 
              box-shadow: none; 
              max-width: 100%;
            }
          }
          @page {
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${header}
          ${downloadButton}
          <div class="content-wrapper">
            ${financialSummary}
            ${itemsBreakdown}
          </div>
          ${footer}
        </div>
        <script>
          (function () {
            const btn = document.getElementById('download-receipt-btn');
            if (!btn) return;
            btn.addEventListener('click', function () {
              try { 
                window.print(); 
              } catch (e) {
                console.error('Print failed', e);
                alert('Unable to open print dialog.');
              }
            });
          })();
        </script>
      </body>
    </html>
  `;
}