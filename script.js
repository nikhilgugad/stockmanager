let products = JSON.parse(localStorage.getItem("inventory")) || [];
const form = document.getElementById("productForm");
const inventoryBody = document.getElementById("inventoryBody");
const sellModal = document.getElementById("sellModal");
const sellForm = document.getElementById("sellForm");
const downPaymentField = document.getElementById("downPayment");

let selectedProductIndex = null;

document.addEventListener("DOMContentLoaded", () => {
  renderInventory();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const model = document.getElementById("model").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("price").value);
  const category = document.getElementById("category").value.trim();

  if (!name || !model || quantity < 1 || price < 0) return;

  const newProduct = {
    name,
    model,
    quantity,
    price,
    category,
    sales: []
  };

  products.push(newProduct);
  localStorage.setItem("inventory", JSON.stringify(products));
  renderInventory();
  form.reset();
});

function renderInventory() {
    inventoryBody.innerHTML = "";
  
    if (!products || products.length === 0) {
      inventoryBody.innerHTML = `<tr><td colspan="5" class="p-2 border text-center text-gray-500">No products in inventory</td></tr>`;
      return;
    }
  
    products.forEach((product, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="p-2 border">${product.name}</td>
        <td class="p-2 border">${product.model}</td>
        <td class="p-2 border">${product.quantity}</td>
        <td class="p-2 border">₹${product.price}</td>
        <td class="p-2 border">
          <div class="action-buttons">
            <button onclick="openSellModal(${index})" class="action-btn sell-btn" ${product.quantity <= 0 ? 'disabled' : ''}>
              Sell
            </button>
            <button onclick="deleteProduct(${index})" class="action-btn delete-btn">
              Delete
            </button>
            <button onclick="viewSales(${index})" class="action-btn sales-btn">
              View Sales
            </button>
          </div>
        </td>
      `;
      inventoryBody.appendChild(tr);
    });
  }

function openSellModal(index) {
  selectedProductIndex = index;
  sellModal.classList.remove("hidden");
}

function closeSellModal() {
  sellModal.classList.add("hidden");
  sellForm.reset();
  downPaymentField.classList.add("hidden");
}

function deleteProduct(index) {
  if (confirm("Are you sure you want to delete this product?")) {
    products.splice(index, 1);
    localStorage.setItem("inventory", JSON.stringify(products));
    renderInventory();
  }
}

document.getElementById("paymentType").addEventListener("change", (e) => {
  if (e.target.value === "EMI") {
    downPaymentField.classList.remove("hidden");
  } else {
    downPaymentField.classList.add("hidden");
  }
});

sellForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const customerName = document.getElementById("customerName").value.trim();
  const customerAddress = document.getElementById("customerAddress").value.trim();
  const paymentType = document.getElementById("paymentType").value;
  const downPayment = document.getElementById("downPayment").value;
  const date = new Date().toLocaleString();

  if (!customerName || !customerAddress || !paymentType) return;

  const sale = {
    customerName,
    customerAddress,
    paymentType,
    downPayment: paymentType === "EMI" ? downPayment : null,
    date
  };

  products[selectedProductIndex].sales.push(sale);
  products[selectedProductIndex].quantity -= 1;
  localStorage.setItem("inventory", JSON.stringify(products));

  renderInventory();
  closeSellModal();
});

function viewSales(index) {
    const product = products[index];
    let salesHTML = `
      <div class="max-w-5xl mx-auto p-6">
        <button onclick="window.history.back()" class="bg-blue-600 text-white px-4 py-2 rounded mb-4">Back to Inventory</button>
        <h2 class="text-xl font-bold mb-2">Sales for ${product.name} (${product.model})</h2>
        <button onclick="downloadSalesPDF()" class="bg-green-600 text-white px-4 py-2 rounded mb-2">Download Sales PDF</button>
    `;
  
    if (product.sales.length === 0) {
      salesHTML += `<p>No sales yet.</p>`;
    } else {
      salesHTML += `
        <table id="salesTable" class="w-full text-sm border mt-2">
          <thead class="bg-gray-200">
            <tr>
              <th class="p-2 border">Customer</th>
              <th class="p-2 border">Address</th>
              <th class="p-2 border">Payment</th>
              <th class="p-2 border">Down Payment</th>
              <th class="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            ${product.sales.map(sale => `
              <tr>
                <td class="p-2 border">${sale.customerName}</td>
                <td class="p-2 border">${sale.customerAddress}</td>
                <td class="p-2 border">${sale.paymentType}</td>
                <td class="p-2 border">${sale.downPayment || '-'}</td>
                <td class="p-2 border">${sale.date}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  
    salesHTML += `</div>`;
    
    // Replace the current page content instead of opening new tab
    document.body.innerHTML = salesHTML;
    
    // Re-inject the download functionality
    const downloadSalesPDF = () => {
      const salesTable = document.getElementById("salesTable");
      if (salesTable) {
        html2pdf().from(salesTable).save(`Sales_Report_${product.name}_${product.model}.pdf`);
      }
    };
    window.downloadSalesPDF = downloadSalesPDF;
  }

function downloadInventoryPDF() {
  const wrapper = document.createElement("div");

  const heading = document.createElement("h2");
  heading.textContent = "Inventory Report";
  heading.className = "text-xl font-bold mb-2";

  const table = document.createElement("table");
  table.className = "w-full text-sm border mt-2";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr class="bg-gray-200">
      <th class="p-2 border">Name</th>
      <th class="p-2 border">Model</th>
      <th class="p-2 border">Quantity</th>
      <th class="p-2 border">Price</th>
    </tr>
  `;

  const tbody = document.createElement("tbody");

  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="p-2 border">${p.name}</td>
      <td class="p-2 border">${p.model}</td>
      <td class="p-2 border">${p.quantity}</td>
      <td class="p-2 border">₹${p.price}</td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  wrapper.appendChild(heading);
  wrapper.appendChild(table);

  html2pdf().from(wrapper).save("Inventory_Report.pdf");
}