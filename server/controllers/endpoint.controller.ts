import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { EndpointService } from "../services/endpoint.service";

export const createEndpoint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { projectId, collectionId } = req.body;
    if (!projectId || !collectionId) {
      res.status(400).json({ success: false, message: "projectId and collectionId are required" });
      return;
    }

    const endpoint = await EndpointService.createEndpoint(ownerId, req.body);

    res.status(201).json({
      success: true,
      message: "Endpoint created successfully",
      data: endpoint,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create endpoint" });
  }
};

export const getEndpoints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const opts = {
      projectId: req.query.projectId as string,
      collectionId: req.query.collectionId as string,
      folderId: req.query.folderId as string,
      favoriteOnly: req.query.favorite === "true",
      search: req.query.search as string,
      tag: req.query.tag as string,
    };

    const endpoints = await EndpointService.getEndpoints(ownerId, opts);

    res.status(200).json({
      success: true,
      count: endpoints.length,
      data: endpoints,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch endpoints" });
  }
};

export const getEndpointById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const endpoint = await EndpointService.getEndpointById(id, ownerId);

    res.status(200).json({
      success: true,
      data: endpoint,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || "Endpoint not found" });
  }
};

export const updateEndpoint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const updated = await EndpointService.updateEndpoint(id, ownerId, req.body);

    res.status(200).json({
      success: true,
      message: "Endpoint updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to update endpoint" });
  }
};

export const toggleFavoriteEndpoint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const endpoint = await EndpointService.toggleFavorite(id, ownerId);

    res.status(200).json({
      success: true,
      message: endpoint.favorite ? "Added to favorites" : "Removed from favorites",
      data: endpoint,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to toggle favorite" });
  }
};

export const duplicateEndpoint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const duplicate = await EndpointService.duplicateEndpoint(id, ownerId);

    res.status(201).json({
      success: true,
      message: "Endpoint duplicated successfully",
      data: duplicate,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to duplicate endpoint" });
  }
};

export const deleteEndpoint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const result = await EndpointService.deleteEndpoint(id, ownerId);

    res.status(200).json({
      success: true,
      message: "Endpoint deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to delete endpoint" });
  }
};

export const executeEndpointRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const requestConfig = req.body;
    if (!requestConfig || !requestConfig.url) {
      res.status(400).json({ success: false, message: "Target URL is required" });
      return;
    }

    const response = await EndpointService.executeProxyRequest(requestConfig);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Execution error" });
  }
};
