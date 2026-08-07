import Project from "../models/project.model";
import Collection from "../models/collection.model";
import Folder from "../models/folder.model";
import Endpoint from "../models/endpoint.model";

export class SearchService {
  static async globalSearch(ownerId: string, query: string) {
    if (!query || query.trim().length === 0) {
      return { projects: [], collections: [], folders: [], endpoints: [] };
    }

    const regex = new RegExp(query.trim(), "i");

    const projectsPromise = Project.find({
      ownerId,
      $or: [{ name: regex }, { description: regex }],
    })
      .limit(10)
      .lean();

    const collectionsPromise = Collection.find({
      ownerId,
      $or: [{ name: regex }, { description: regex }],
    })
      .populate("projectId", "name color")
      .limit(10)
      .lean();

    const foldersPromise = Folder.find({
      ownerId,
      name: regex,
    })
      .limit(10)
      .lean();

    const endpointsPromise = Endpoint.find({
      ownerId,
      $or: [
        { name: regex },
        { "request.url": regex },
        { tags: regex },
      ],
    })
      .populate("projectId", "name color")
      .populate("collectionId", "name")
      .limit(15)
      .lean();

    const [projects, collections, folders, endpoints] = await Promise.all([
      projectsPromise,
      collectionsPromise,
      foldersPromise,
      endpointsPromise,
    ]);

    return {
      projects,
      collections,
      folders,
      endpoints,
    };
  }
}
