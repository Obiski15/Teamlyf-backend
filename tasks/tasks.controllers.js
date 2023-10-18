import { Priority, PrismaClient, Status, TaskAction } from "@prisma/client";
import asyncHandler from "express-async-handler";
const prisma = new PrismaClient();

// TODO: develop CRUD tasks endpoints for inside a folder
// TODO: develop CRUD tasks endpoints for inside a folder/projects
// you can use if statement for the above statement

// TODO: develop CRUD for tasks status and tasks priority

// Create a new task
const createTask = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const { orgId: organizationId } = req.params;
  const {
    title,
    description,
    labels,
    startDate,
    endDate,
    reminderDate,
    projectId,
    collaboratorsId,
  } = req.body;
  try {
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const projectConnect = projectId ? { connect: { id: projectId } } : null;

    const collaboratorsConnect = collaboratorsId
      ? { connect: { id: collaboratorsId } }
      : null;

    const newTask = await prisma.task.create({
      data: {
        ...req.body,
        title,
        description: description || null,
        labels: labels || null,
        startDate: startDate || new Date(),
        endDate: endDate || new Date(),
        reminderDate: reminderDate || new Date(),
        user: { connect: { id: userId } },
        priority: Priority.NORMAL,
        status: Status.TODO,
        organization: { connect: { id: organizationId } },
        // project: projectConnect,
        // collaborators: collaboratorsConnect,
      },
    });

    // Log task addition in history using Prisma
    await prisma.taskHistory.create({
      data: {
        tasks: { connect: { id: newTask.id } },
        user: { connect: { id: userId } },
        action: TaskAction.ADDED_TASKS,
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get all tasks in the organization
const getAllTasks = asyncHandler(async (req, res) => {
  const { orgId: organizationId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        organizationId: organizationId,
      },
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get task by ID
const getTaskById = asyncHandler(async (req, res) => {
  const { id, orgId: organizationId } = req.params;
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        organizationId,
      },
    });
    if (!task) {
      return res.status(404).json({ message: `Task  ${id} not found` });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update task by ID
const updateTask = asyncHandler(async (req, res) => {
  const { orgId: organizationId } = req.params;
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        organizationId,
      },
    });
    if (!task) {
      return res.status(404).json({ message: `Task  ${id} not found` });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: id,
      },
      data: req.body,
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task by ID
const deleteTask = asyncHandler(async (req, res) => {
  const { orgId: organizationId } = req.params;
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: id,
        organizationId,
      },
    });
    if (!task) {
      return res.status(404).json({ message: `Task  ${id} not found` });
    }
    // Delete the task if it exists
    await prisma.task.delete({
      where: {
        id: id,
      },
    });

    res.status(204).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { createTask, deleteTask, getAllTasks, getTaskById, updateTask };
