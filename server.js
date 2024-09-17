const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const PORT = 3000;

// Read customers from JSON file
const getCustomers = () => {
  const data = fs.readFileSync('customers.json');
  return JSON.parse(data);
};

// List customers with search and pagination
app.get('/customers', (req, res) => {
  const { first_name, last_name, city, page = 1, limit = 10 } = req.query;
  let customers = getCustomers();

  // Search filters
  if (first_name) customers = customers.filter(c => c.first_name.toLowerCase().includes(first_name.toLowerCase()));
  if (last_name) customers = customers.filter(c => c.last_name.toLowerCase().includes(last_name.toLowerCase()));
  if (city) customers = customers.filter(c => c.city.toLowerCase().includes(city.toLowerCase()));

  // Pagination logic
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedResults = customers.slice(startIndex, endIndex);

  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    totalResults: customers.length,
    results: paginatedResults,
  });
});

// Get single customer by ID
app.get('/customers/:id', (req, res) => {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === parseInt(req.params.id));

  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
});

// List all unique cities with the number of customers
app.get('/cities', (req, res) => {
  const customers = getCustomers();
  const cityCount = {};

  customers.forEach(c => {
    if (cityCount[c.city]) {
      cityCount[c.city]++;
    } else {
      cityCount[c.city] = 1;
    }
  });

  res.json(cityCount);
});

// Add a customer with validations
app.post('/customers', (req, res) => {
  const { first_name, last_name, city, company } = req.body;
  if (!first_name || !last_name || !city || !company) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const customers = getCustomers();
  const newCustomer = {
    id: customers.length + 1,
    first_name,
    last_name,
    city,
    company,
  };

  customers.push(newCustomer);
  fs.writeFileSync('customers.json', JSON.stringify(customers, null, 2));

  res.status(201).json(newCustomer);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
