const express = require('express')
const router = express.Router()
const fetchuser = require('../middlewares/fetchUser')
const { body } = require('express-validator');
const Employee = require('../models/Employee')

// ROUTE 1: Get employee with id using: GET "/employees/:id". login required
router.get('/:id', fetchuser, async (req, res) => {
    try {
        const employees = await Employee.find({emp_id: req.params.id})
        res.json(employees)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 2: Add new employee record using: POST "/employees". login required
router.post('/', fetchuser, [
    body("firstName", 'Enter a valid first name').isLength({ min: 3 }),
    body("lastName", 'Enter a valid last name').isLength({ min: 3 }),
    body("email", 'Enter a valid last name').isEmail(),
    body("department", "Enter a department of atleast 3 characters").isLength({ min: 3 }),
], async (req, res) => {
    try {
        const { firstName, lastName, email, department, position, emp_id } = req.body;
        // Creating new employees object and saving the details
        const employee = new Employee({
            firstName, lastName, email, department, position, emp_id
        });
        const savedEmployee = await employee.save();
        res.send(savedEmployee);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 3: Update employee details with id using: PUT "/employees/:id". login required
router.put('/:id', fetchuser, async (req, res) => {
    try {
        const { firstName, lastName, email, department, position, emp_id } = req.body;
        // Create a newEmployee object to store updated contents
        let newEmployee = {};
        if (firstName) { newEmployee.firstName = firstName }
        if (lastName) { newEmployee.lastName = lastName }
        if (email) { newEmployee.email = email }
        if (department) { newEmployee.department = department }
        if (position) { newEmployee.position = position }
        if (emp_id) { newEmployee.emp_id = emp_id }

        // Check if the employee exists
        let employee = await Employee.findOne(req.params.emp_id);
        if (!employee) { return res.status(404).send("Not found") }

        employee = await Employee.findOneAndUpdate(req.params.emp_id, { $set: newEmployee }, { new: true });
        res.json({ employee });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 4: Delete details of the employee using: DELEtE "/employees/:id". login required
router.delete('/:id', fetchuser, async (req, res) => {
    try {
        // Check if the employee details exist
        let employee = await Employee.findOne({emp_id:req.params.id});
        if (!employee) { return res.status(404).send("Not found") }

        employee = await Employee.findOneAndDelete({emp_id:req.params.id});

        res.json({ "Success": "Employee detail has been deleted", employee: employee });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})



module.exports = router

