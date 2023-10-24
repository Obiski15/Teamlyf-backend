import { EmployeeRole, PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import ShortUniqueId from "short-unique-id";

const prisma = new PrismaClient();
// TODO: transfer ownership of workspaces to employee within the organization

const { randomUUID } = new ShortUniqueId({ length: 10 });

// Create a new workspace
const createWorkspace = asyncHandler(async (req, res) => {
  const { name, logo, address } = req.body;
  const { id: userId, email } = req.user;

  try {
    // Check if an workspace with the same name already exists
    const existingWorkspace = await prisma.workspace.findFirst({
      where: { name },
    });

    if (existingWorkspace) {
      return res
        .status(400)
        .json({ error: `workspace name ${name} already exists.` });
    }

    // Check if a user with the provided email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Create a new workspace with the provided data
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: name,
        logo: logo || null,
        address: address || null,
        inviteCode: randomUUID(),
        userId,
      },
    });

    // Create a new employee associated with the user who created the workspace
    const newEmployee = await prisma.employee.create({
      data: {
        email: email,
        role: EmployeeRole.OWNER,
        user: { connect: { id: userId } },
        workspace: { connect: { id: newWorkspace.id } },
      },
    });

    res.status(201).json(newWorkspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all workspaces
const getAllWorkspaces = asyncHandler(async (req, res) => {
  const { email, id } = req.user;
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [{ userId: id }, { employees: { some: { email } } }],
      },
      include: {
        employees: {
          select: {
            id: true,
          },
        },
      },
    });

    // Check if the user is not part of any workspaces
    if (workspaces.length === 0) {
      return res
        .status(200)
        .json({ message: "You're not a part of any workspace" });
    }
    res.status(200).json(workspaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Get an workspace by ID
const getWorkspaceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!workspace) {
      res.status(404).json(`workspace ${id} not found`);
    }

    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update an workspace by ID
const updateWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the workspace with the specified ID exists
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!existingWorkspace) {
      return res
        .status(404)
        .json({ error: `workspace with ID ${id} not found.` });
    }

    // Update the workspace data
    const updatedWorkspace = await prisma.workspace.update({
      where: { id },
      data: req.body,
    });

    res.status(202).json(updatedWorkspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TODO: handle delete error correctly
// Delete an workspace by ID
const deleteWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the workspace with the specified ID exists
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!existingWorkspace) {
      return res
        .status(404)
        .json({ error: `workspace with ID ${id} not found.` });
    }

    await prisma.workspace.delete({
      where: { id },
    });

    res.status(204).json(`workspace ${id} deleted`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const getWorkspaceOwners = asyncHandler(async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        role: EmployeeRole.OWNER, // Filter by the role "OWNER"
      },
    });
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  getWorkspaceOwners
};
