import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  addEmployeeToTeam,
  removeEmployeeFromTeam,

} from "./employees.controllers.js";

const employeeRouter = express.Router();

// Routes for managing employees within an organization
employeeRouter.get("/:organizationId/employees", getAllEmployees);
employeeRouter.get("/:organizationId/employees/:employeeId", getEmployeeById);
employeeRouter.patch("/:organizationId/employees/:employeeId", updateEmployee);
employeeRouter.delete("/:organizationId/employees/:employeeId", deleteEmployee);

employeeRouter.post(
  "/:organizationId/teams/:teamId/add-member",
  addEmployeeToTeam
);
employeeRouter.post(
  "/:organizationId/teams/:teamId/remove-member",
  removeEmployeeFromTeam
);


export default employeeRouter;
