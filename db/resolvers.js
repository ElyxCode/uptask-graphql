const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Project = require("../models/project");
const Task = require("../models/task");
require("dotenv").config({ path: ".env" });

// create and sign a JWT.
const createToken = (user, secret, expiresIn) => {
  const { id, email, name } = user;

  return jwt.sign({ id, email, name }, secret, { expiresIn });
};

const resolvers = {
  Query: {
    getProjects: async (_, {}, ctx) => {
      const projects = await Project.find({ createBy: ctx.user.id });

      return projects;
    },
    getTasks: async (_, { input }, ctx) => {
      const tasks = await Task.find({ createBy: ctx.user.id })
        .where("project")
        .equals(input.project);
      return tasks;
    },
  },
  Mutation: {
    createUser: async (_, { input }) => {
      const { email, password } = input;

      // if user exists
      const existUser = await User.findOne({ email });

      if (existUser) {
        throw new Error("The user already register");
      }

      try {
        // hashear password
        const salt = await bcryptjs.genSalt(10);
        input.password = await bcryptjs.hash(password, salt);

        // create new user
        const newUser = new User(input);

        newUser.save();
        return "User create sucessfull!";
      } catch (error) {
        console.log(error);
      }
    },
    authUser: async (_, { input }) => {
      const { email, password } = input;

      // if user exists
      const existUser = await User.findOne({ email });

      if (!existUser) {
        throw new Error("The user no exists");
      }

      // if password is correct
      const passwordCorrect = await bcryptjs.compare(
        password,
        existUser.password
      );

      if (!passwordCorrect) {
        throw new Error("Incorrect password");
      }

      // Access app!
      return {
        token: createToken(existUser, process.env.SECRET_WORD, "72hr"),
      };
    },
    newProject: async (_, { input }, ctx) => {
      try {
        const project = new Project(input);

        // createBy
        project.createBy = ctx.user.id;

        // save project
        const result = await project.save();

        return result;
      } catch (error) {
        console.log(error);
      }
    },
    updateProject: async (_, { id, input }, ctx) => {
      try {
        // check project exists
        let project = await Project.findById(id);

        if (!project) {
          throw new Error("Project not found!");
        }
        // check if project created by author
        if (project.createBy.toString() !== ctx.user.id) {
          throw new Error(
            "you don't have the credentials to edit this project"
          );
        }
        // save project
        project = await Project.findOneAndUpdate({ _id: id }, input, {
          new: true,
        });
        return project;
      } catch (error) {
        console.log(error);
      }
    },
    deleteProject: async (_, { id }, ctx) => {
      try {
        // check project exists
        let project = await Project.findById(id);

        if (!project) {
          throw new Error("Project not found");
        }
        // check if project created by author
        if (project.createBy.toString() !== ctx.user.id) {
          throw new Error(
            "you don't have the credentials to delete this project"
          );
        }

        // delete project
        await Project.findOneAndDelete({ _id: id });

        return "Project deleted";
      } catch (error) {
        console.log(error);
      }
    },
    newTask: async (_, { input }, ctx) => {
      try {
        const task = new Task(input);

        task.createBy = ctx.user.id;

        const result = await task.save();

        return result;
      } catch (error) {
        console.log(error);
      }
    },
    updateTask: async (_, { id, input, status }, ctx) => {
      // if task exists
      let task = await Task.findById(id);

      if (!task) {
        throw new Error("Task not found");
      }
      // if the person who edit is the creator
      if (task.createBy.toString() !== ctx.user.id) {
        throw new Error("you don't have the credentials to update this task");
      }

      // asigne status
      input.status = status;

      // save the task
      task = await Task.findOneAndUpdate({ _id: id }, input, { new: true });

      return task;
    },
    deleteTask: async (_, { id }, ctx) => {
      // if task exists
      let task = await Task.findById(id);

      if (!task) {
        throw new Error("Task not found");
      }
      // if the person who edit is the creator
      if (task.createBy.toString() !== ctx.user.id) {
        throw new Error("you don't have the credentials to delete this task");
      }

      await Task.findOneAndDelete({ _id: id });

      return "Task deleted";
    },
  },
};

module.exports = resolvers;
