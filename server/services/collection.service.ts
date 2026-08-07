import Collection, { ICollection } from "../models/collection.model";
import Folder from "../models/folder.model";
import Endpoint from "../models/endpoint.model";

export class CollectionService {
  static async createCollection(
    ownerId: string,
    data: { projectId: string; name: string; description?: string }
  ): Promise<ICollection> {
    const collection = new Collection({
      ownerId,
      projectId: data.projectId,
      name: data.name,
      description: data.description || "",
    });
    return await collection.save();
  }

  static async getCollections(
    ownerId: string,
    projectId?: string,
    favoriteOnly?: boolean
  ) {
    const filter: any = { ownerId };
    if (projectId) {
      filter.projectId = projectId;
    }
    if (favoriteOnly) {
      filter.favorite = true;
    }
    const collections = await Collection.find(filter).populate("projectId", "name color icon").sort({ updatedAt: -1 });

    const enriched = await Promise.all(
      collections.map(async (col) => {
        const foldersCount = await Folder.countDocuments({ collectionId: col._id });
        const endpointsCount = await Endpoint.countDocuments({ collectionId: col._id });
        return {
          ...col.toObject(),
          foldersCount,
          endpointsCount,
        };
      })
    );

    return enriched;
  }

  static async getCollectionById(collectionId: string, ownerId: string) {
    const collection = await Collection.findOne({ _id: collectionId, ownerId }).populate("projectId", "name color icon");
    if (!collection) {
      throw new Error("Collection not found");
    }

    const foldersCount = await Folder.countDocuments({ collectionId: collection._id });
    const endpointsCount = await Endpoint.countDocuments({ collectionId: collection._id });

    return {
      ...collection.toObject(),
      foldersCount,
      endpointsCount,
    };
  }

  static async updateCollection(
    collectionId: string,
    ownerId: string,
    data: Partial<ICollection>
  ): Promise<ICollection> {
    const collection = await Collection.findOneAndUpdate(
      { _id: collectionId, ownerId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!collection) {
      throw new Error("Collection not found or unauthorized");
    }
    return collection;
  }

  static async toggleFavorite(collectionId: string, ownerId: string) {
    const collection = await Collection.findOne({ _id: collectionId, ownerId });
    if (!collection) {
      throw new Error("Collection not found");
    }
    collection.favorite = !collection.favorite;
    return await collection.save();
  }

  static async deleteCollection(collectionId: string, ownerId: string) {
    const collection = await Collection.findOneAndDelete({ _id: collectionId, ownerId });
    if (!collection) {
      throw new Error("Collection not found or unauthorized");
    }

    await Folder.deleteMany({ collectionId: collection._id });
    await Endpoint.deleteMany({ collectionId: collection._id });

    return { success: true, id: collectionId };
  }
}
