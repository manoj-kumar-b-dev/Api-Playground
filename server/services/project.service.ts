import { Types } from "mongoose";
import Project, { IProject } from "../models/project.model";
import Collection from "../models/collection.model";
import Folder from "../models/folder.model";
import Endpoint from "../models/endpoint.model";

export class ProjectService {
  static async createProject(
    ownerId: string,
    data: { name: string; description?: string; color?: string; icon?: string }
  ): Promise<IProject> {
    const project = new Project({
      ownerId: new Types.ObjectId(ownerId),
      name: data.name,
      description: data.description || "",
      color: data.color || "#6366f1",
      icon: data.icon || "FolderKanban",
    });
    return await project.save();
  }

  static async getUserProjects(
    ownerId: string,
    search?: string,
    favoriteOnly?: boolean
  ) {
    const filter: any = { ownerId: new Types.ObjectId(ownerId) };
    if (favoriteOnly) {
      filter.favorite = true;
    }
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Use aggregation pipeline to get counts in a single query instead of N+1 queries
    const enrichedProjects = await Project.aggregate([
      { $match: filter },
      { $sort: { updatedAt: -1 } },
      {
        $lookup: {
          from: "collections",
          let: { projectId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$projectId", "$$projectId"] } } },
            { $count: "count" },
          ],
          as: "collectionStats",
        },
      },
      {
        $lookup: {
          from: "endpoints",
          let: { projectId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$projectId", "$$projectId"] } } },
            { $count: "count" },
          ],
          as: "endpointStats",
        },
      },
      {
        $addFields: {
          collectionsCount: {
            $cond: [
              { $gt: [{ $size: "$collectionStats" }, 0] },
              { $arrayElemAt: ["$collectionStats.count", 0] },
              0,
            ],
          },
          endpointsCount: {
            $cond: [
              { $gt: [{ $size: "$endpointStats" }, 0] },
              { $arrayElemAt: ["$endpointStats.count", 0] },
              0,
            ],
          },
        },
      },
      {
        $project: {
          collectionStats: 0,
          endpointStats: 0,
        },
      },
    ]);

    return enrichedProjects;
  }

  static async getProjectById(projectId: string, ownerId: string) {
    // Use aggregation pipeline for consistency and performance
    const projects = await Project.aggregate([
      { $match: { _id: new Types.ObjectId(projectId), ownerId: new Types.ObjectId(ownerId) } },
      {
        $lookup: {
          from: "collections",
          let: { projectId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$projectId", "$$projectId"] } } },
            { $count: "count" },
          ],
          as: "collectionStats",
        },
      },
      {
        $lookup: {
          from: "endpoints",
          let: { projectId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$projectId", "$$projectId"] } } },
            { $count: "count" },
          ],
          as: "endpointStats",
        },
      },
      {
        $addFields: {
          collectionsCount: {
            $cond: [
              { $gt: [{ $size: "$collectionStats" }, 0] },
              { $arrayElemAt: ["$collectionStats.count", 0] },
              0,
            ],
          },
          endpointsCount: {
            $cond: [
              { $gt: [{ $size: "$endpointStats" }, 0] },
              { $arrayElemAt: ["$endpointStats.count", 0] },
              0,
            ],
          },
        },
      },
      {
        $project: {
          collectionStats: 0,
          endpointStats: 0,
        },
      },
    ]);

    if (!projects || projects.length === 0) {
      throw new Error("Project not found");
    }

    return projects[0];
  }

  static async updateProject(
    projectId: string,
    ownerId: string,
    data: Partial<IProject>
  ): Promise<IProject> {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, ownerId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!project) {
      throw new Error("Project not found or unauthorized");
    }
    return project;
  }

  static async toggleFavorite(projectId: string, ownerId: string) {
    const project = await Project.findOne({ _id: projectId, ownerId });
    if (!project) {
      throw new Error("Project not found");
    }
    project.favorite = !project.favorite;
    return await project.save();
  }

  static async deleteProject(projectId: string, ownerId: string) {
    const project = await Project.findOneAndDelete({ _id: projectId, ownerId });
    if (!project) {
      throw new Error("Project not found or unauthorized");
    }

    // Cascade deletion of collections, folders, and endpoints
    const collections = await Collection.find({ projectId: project._id });
    const collectionIds = collections.map((c) => c._id);

    await Endpoint.deleteMany({ projectId: project._id });
    await Folder.deleteMany({ collectionId: { $in: collectionIds } });
    await Collection.deleteMany({ projectId: project._id });

    return { success: true, id: projectId };
  }
}
