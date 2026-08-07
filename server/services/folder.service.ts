import Folder, { IFolder } from "../models/folder.model";
import Endpoint from "../models/endpoint.model";

export class FolderService {
  static async createFolder(
    ownerId: string,
    data: { collectionId: string; parentFolderId?: string | null; name: string }
  ): Promise<IFolder> {
    const folder = new Folder({
      ownerId,
      collectionId: data.collectionId,
      parentFolderId: data.parentFolderId || null,
      name: data.name,
    });
    return await folder.save();
  }

  static async getFoldersByCollection(ownerId: string, collectionId: string) {
    return await Folder.find({ ownerId, collectionId }).sort({ name: 1 });
  }

  static async getFolderTree(ownerId: string, collectionId: string) {
    const folders = await Folder.find({ ownerId, collectionId }).lean();
    const endpoints = await Endpoint.find({ ownerId, collectionId }).lean();

    const buildTreeNode = (parentFolderId: string | null): any[] => {
      const currentLevelFolders = folders.filter(
        (f) => String(f.parentFolderId || null) === String(parentFolderId || null)
      );

      return currentLevelFolders.map((folder) => {
        const folderIdStr = String(folder._id);
        const childFolders = buildTreeNode(folderIdStr);
        const folderEndpoints = endpoints.filter(
          (ep) => String(ep.folderId || null) === folderIdStr
        );

        return {
          ...folder,
          folders: childFolders,
          endpoints: folderEndpoints,
        };
      });
    };

    const rootFolders = buildTreeNode(null);
    const rootEndpoints = endpoints.filter(
      (ep) => !ep.folderId || String(ep.folderId) === "null"
    );

    return {
      folders: rootFolders,
      endpoints: rootEndpoints,
    };
  }

  static async updateFolder(
    folderId: string,
    ownerId: string,
    data: { name: string }
  ): Promise<IFolder> {
    const folder = await Folder.findOneAndUpdate(
      { _id: folderId, ownerId },
      { $set: { name: data.name } },
      { new: true, runValidators: true }
    );
    if (!folder) {
      throw new Error("Folder not found or unauthorized");
    }
    return folder;
  }

  static async deleteFolder(folderId: string, ownerId: string) {
    const folder = await Folder.findOne({ _id: folderId, ownerId });
    if (!folder) {
      throw new Error("Folder not found or unauthorized");
    }

    // Recursively collect all child folder IDs
    const getAllChildFolderIds = async (parentIds: string[]): Promise<string[]> => {
      const children = await Folder.find({ parentFolderId: { $in: parentIds }, ownerId });
      if (children.length === 0) return [];
      const childIds = children.map((c) => String(c._id));
      const grandChildrenIds = await getAllChildFolderIds(childIds);
      return [...childIds, ...grandChildrenIds];
    };

    const childFolderIds = await getAllChildFolderIds([folderId]);
    const allFolderIds = [folderId, ...childFolderIds];

    await Endpoint.deleteMany({ folderId: { $in: allFolderIds }, ownerId });
    await Folder.deleteMany({ _id: { $in: allFolderIds }, ownerId });

    return { success: true, deletedFolderIds: allFolderIds };
  }
}
