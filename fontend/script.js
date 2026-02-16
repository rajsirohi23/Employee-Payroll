const API = "https://employee-payroll-1msv.onrender.com/employees";

let employees = [];
let editId = null;

let salaryChart, deptChart;

// 🚀 LOAD EMPLOYEES
async function getEmployees() {
  try {
    const res = await fetch(API);
    employees = await res.json();
    displayEmployees(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
  }
}

// 🖥 DISPLAY EMPLOYEES IN TABLE
function displayEmployees(data) {
  const table = document.getElementById("employeeTable");
  table.innerHTML = "";

  let totalPayroll = 0;

  data.forEach((emp) => {
    const basic = Number(emp.basicSalary);

    const hra = basic * 0.2;
    const da = basic * 0.1;
    const pf = basic * 0.05;

    const netSalary = basic + hra + da - pf;

    totalPayroll += netSalary;

    table.innerHTML += `
      <tr>
        <td>${emp.id}</td>
        <td>${emp.name}</td>
        <td>${emp.department}</td>
        <td>${basic}</td>
        <td>${hra.toFixed(2)}</td>
        <td>${da.toFixed(2)}</td>
        <td>${pf.toFixed(2)}</td>
        <td>${netSalary.toFixed(2)}</td>
        <td>
          <button onclick="editEmployee(${emp.id})">Edit</button>
          <button onclick="deleteEmployee(${emp.id})">Delete</button>
          <button onclick="generateSlip(${emp.id})">Slip</button>
        </td>
      </tr>
    `;
  });

  // 📊 STATS
  document.getElementById("totalEmployees").innerText = data.length;

  document.getElementById("totalPayroll").innerText =
    "₹" + totalPayroll.toFixed(2);

  const highest = Math.max(...data.map((e) => Number(e.basicSalary) || 0));
  document.getElementById("highestSalary").innerText = "₹" + highest;

  renderCharts(data);
}

// ➕ ADD / ✏️ UPDATE EMPLOYEE
document
  .getElementById("employeeForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const employee = {
      name: document.getElementById("name").value,
      department: document.getElementById("department").value,
      basicSalary: document.getElementById("salary").value,
    };

    try {
      if (editId) {
        // ✏️ UPDATE
        await fetch(`${API}/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(employee),
        });

        editId = null;
      } else {
        // ➕ ADD
        await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(employee),
        });
      }

      document.getElementById("employeeForm").reset();
      getEmployees();
    } catch (err) {
      console.error("Error saving employee:", err);
    }
  });

// ❌ DELETE
async function deleteEmployee(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  getEmployees();
}

// ✏️ EDIT
function editEmployee(id) {
  const emp = employees.find((e) => e.id == id);

  document.getElementById("name").value = emp.name;
  document.getElementById("department").value = emp.department;
  document.getElementById("salary").value = emp.basicSalary;

  editId = id;
}

// 🔍 SEARCH
document.getElementById("searchInput").addEventListener("input", function () {
  const value = this.value.toLowerCase();

  const filtered = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(value) ||
      emp.department.toLowerCase().includes(value) ||
      emp.id.toString().includes(value),
  );

  displayEmployees(filtered);
});

// 📄 GENERATE SALARY SLIP
function generateSlip(id) {
  const emp = employees.find((e) => e.id == id);

  const basic = Number(emp.basicSalary);
  const hra = basic * 0.2;
  const da = basic * 0.1;
  const pf = basic * 0.05;
  const net = basic + hra + da - pf;

  document.getElementById("salarySlip").innerHTML = `
    <div id="slipContent">
      <h2>Salary Slip</h2>
      <p><strong>ID:</strong> ${emp.id}</p>
      <p><strong>Name:</strong> ${emp.name}</p>
      <p><strong>Department:</strong> ${emp.department}</p>
      <hr>
      <p>Basic Salary: ₹${basic}</p>
      <p>HRA: ₹${hra.toFixed(2)}</p>
      <p>DA: ₹${da.toFixed(2)}</p>
      <p>PF: ₹${pf.toFixed(2)}</p>
      <hr>
      <h3>Net Salary: ₹${net.toFixed(2)}</h3>
    </div>

    <button onclick="downloadPDF()">Download PDF</button>
  `;

  document.getElementById("salarySlipModal").style.display = "block";
}

// ❌ CLOSE MODAL
document.getElementById("closeModal").onclick = () => {
  document.getElementById("salarySlipModal").style.display = "none";
};

window.onclick = (e) => {
  if (e.target === document.getElementById("salarySlipModal")) {
    document.getElementById("salarySlipModal").style.display = "none";
  }
};

// 📄 DOWNLOAD PDF
function downloadPDF() {
  const element = document.getElementById("slipContent");
  html2pdf().from(element).save("salary-slip.pdf");
}

function renderCharts(data) {
  const names = data.map((emp) => emp.name);
  const salaries = data.map((emp) => Number(emp.basicSalary));

  // 🧹 destroy old chart
  if (salaryChart) salaryChart.destroy();

  salaryChart = new Chart(document.getElementById("salaryChart"), {
    type: "bar",
    data: {
      labels: names,
      datasets: [
        {
          label: "Salary",
          data: salaries,
        },
      ],
    },
  });

  // 🏢 Department count
  const deptCount = {};

  data.forEach((emp) => {
    deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
  });

  if (deptChart) deptChart.destroy();

  deptChart = new Chart(document.getElementById("deptChart"), {
    type: "pie",
    data: {
      labels: Object.keys(deptCount),
      datasets: [
        {
          data: Object.values(deptCount),
        },
      ],
    },
  });
}
// 🚀 INITIAL LOAD
getEmployees();
