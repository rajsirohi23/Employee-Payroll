const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

const filePath = path.join(__dirname, "employee.json");


//  Helper function
const readEmployees = () => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath);
  return data.length ? JSON.parse(data) : [];
};

const writeEmployees = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};


//  GET all employees
app.get("/employees", (req, res) => {
  res.json(readEmployees());
});


//  POST new employee
app.post("/employees", (req, res) => {
  const employees = readEmployees();

  const newEmployee = {
    id: Date.now(),
    name: req.body.name,
    department: req.body.department,
    basicSalary: Number(req.body.basicSalary)
  };

  employees.push(newEmployee);
  writeEmployees(employees);

  res.status(201).json(newEmployee);
});


//  DELETE employee
app.delete("/employees/:id", (req, res) => {
  const id = req.params.id;

  const employees = readEmployees();
  const updatedEmployees = employees.filter(emp => emp.id != id);

  writeEmployees(updatedEmployees);

  res.json({ message: "Employee deleted" });
});


//  UPDATE employee
app.put("/employees/:id", (req, res) => {
  const id = req.params.id;

  const employees = readEmployees();
  const index = employees.findIndex(emp => emp.id == id);

  if (index === -1) {
    return res.status(404).json({ message: "Employee not found" });
  }

  employees[index] = {
    ...employees[index],
    name: req.body.name,
    department: req.body.department,
    basicSalary: Number(req.body.basicSalary)
  };

  writeEmployees(employees);

  res.json({ message: "Employee updated" });
});


//  Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
