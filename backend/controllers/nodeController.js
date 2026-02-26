import ContainerNode from "../models/ContainerNode.js";
import LearningNode from "../models/LearningNode.js";

// ==================== CONTAINER NODES ====================

export const createContainerNode = async (req, res) => {
  try {
    const { title, description, category, parentId } = req.body;
    const { userId } = req;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const node = new ContainerNode({
      title,
      description,
      category,
      parentId,
      createdByUser: userId,
    });

    await node.save();

    // If it has a parent, add it to parent's childIds
    if (parentId) {
      const parent = await ContainerNode.findById(parentId);
      if (parent && parent.createdByUser.toString() === userId) {
        parent.childIds.push(node._id);
        await parent.save();
      }
    }

    res.status(201).json(node);
  } catch (error) {
    console.error("Error creating container node:", error);
    res.status(500).json({ message: "Failed to create container node" });
  }
};

export const getContainerNodes = async (req, res) => {
  try {
    const { userId } = req;
    const { parentId } = req.query;

    const query = { createdByUser: userId };
    if (parentId) {
      query.parentId = parentId;
    } else {
      query.parentId = null; // Only root nodes if parentId not specified
    }

    const nodes = await ContainerNode.find(query).sort("orderIndex");
    res.json(nodes);
  } catch (error) {
    console.error("Error fetching container nodes:", error);
    res.status(500).json({ message: "Failed to fetch container nodes" });
  }
};

export const getContainerNodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const node = await ContainerNode.findOne({
      _id: id,
      createdByUser: userId,
    }).populate("childIds");

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    // Get aggregated progress from children
    const progress = await node.getAggregatedProgress();

    res.json({ ...node.toObject(), progress });
  } catch (error) {
    console.error("Error fetching container node:", error);
    res.status(500).json({ message: "Failed to fetch container node" });
  }
};

export const updateContainerNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { title, description, category } = req.body;

    const node = await ContainerNode.findOne({
      _id: id,
      createdByUser: userId,
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    if (title) node.title = title;
    if (description) node.description = description;
    if (category) node.category = category;

    await node.save();
    res.json(node);
  } catch (error) {
    console.error("Error updating container node:", error);
    res.status(500).json({ message: "Failed to update container node" });
  }
};

export const deleteContainerNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const node = await ContainerNode.findOne({
      _id: id,
      createdByUser: userId,
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    // Remove from parent's childIds
    if (node.parentId) {
      const parent = await ContainerNode.findById(node.parentId);
      if (parent) {
        parent.childIds = parent.childIds.filter(
          (childId) => childId.toString() !== id,
        );
        await parent.save();
      }
    }

    // Delete all child learning nodes
    await LearningNode.deleteMany({ parentContainerId: id });

    // Delete all child container nodes (recursive)
    const childContainers = await ContainerNode.find({ parentId: id });
    for (const child of childContainers) {
      await deleteContainerNode({ params: { id: child._id }, userId }, res);
    }

    await ContainerNode.findByIdAndDelete(id);
    res.json({ message: "Node deleted successfully" });
  } catch (error) {
    console.error("Error deleting container node:", error);
    res.status(500).json({ message: "Failed to delete container node" });
  }
};

export const reorderContainerNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { orderIndex, newParentId } = req.body;

    const node = await ContainerNode.findOne({
      _id: id,
      createdByUser: userId,
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    // Handle parent change
    if (newParentId !== undefined && newParentId !== node.parentId) {
      // Remove from old parent
      if (node.parentId) {
        const oldParent = await ContainerNode.findById(node.parentId);
        if (oldParent) {
          oldParent.childIds = oldParent.childIds.filter(
            (childId) => childId.toString() !== id,
          );
          await oldParent.save();
        }
      }

      // Add to new parent
      if (newParentId) {
        const newParent = await ContainerNode.findById(newParentId);
        if (newParent) {
          newParent.childIds.push(node._id);
          await newParent.save();
        }
      }

      node.parentId = newParentId;
    }

    // Update order index if provided
    if (orderIndex !== undefined) {
      node.orderIndex = orderIndex;
    }

    await node.save();
    res.json(node);
  } catch (error) {
    console.error("Error reordering container node:", error);
    res.status(500).json({ message: "Failed to reorder container node" });
  }
};

// ==================== LEARNING NODES ====================

export const createLearningNode = async (req, res) => {
  try {
    const { title, description, parentContainerId, reviewRubric } = req.body;
    const { userId } = req;

    if (!title || !parentContainerId) {
      return res
        .status(400)
        .json({ message: "Title and parentContainerId are required" });
    }

    // Verify parent exists
    const parent = await ContainerNode.findOne({
      _id: parentContainerId,
      createdByUser: userId,
    });

    if (!parent) {
      return res.status(400).json({ message: "Invalid parent container" });
    }

    const node = new LearningNode({
      title,
      description,
      parentContainerId,
      reviewRubric,
      createdByUser: userId,
    });

    await node.save();

    // Add to parent's childIds
    parent.childIds.push(node._id);
    await parent.save();

    res.status(201).json(node);
  } catch (error) {
    console.error("Error creating learning node:", error);
    res.status(500).json({ message: "Failed to create learning node" });
  }
};

export const getLearningNodes = async (req, res) => {
  try {
    const { userId } = req;
    const { parentContainerId } = req.query;

    const query = { createdByUser: userId };
    if (parentContainerId) {
      query.parentContainerId = parentContainerId;
    }

    const nodes = await LearningNode.find(query);
    res.json(nodes);
  } catch (error) {
    console.error("Error fetching learning nodes:", error);
    res.status(500).json({ message: "Failed to fetch learning nodes" });
  }
};

export const getLearningNodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const node = await LearningNode.findOne({
      _id: id,
      createdByUser: userId,
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    res.json(node);
  } catch (error) {
    console.error("Error fetching learning node:", error);
    res.status(500).json({ message: "Failed to fetch learning node" });
  }
};

export const updateLearningNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { title, description, reviewRubric } = req.body;

    const node = await LearningNode.findOne({
      _id: id,
      createdByUser: userId,
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    if (title) node.title = title;
    if (description) node.description = description;
    if (reviewRubric) node.reviewRubric = reviewRubric;

    await node.save();
    res.json(node);
  } catch (error) {
    console.error("Error updating learning node:", error);
    res.status(500).json({ message: "Failed to update learning node" });
  }
};

export const deleteLearningNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const node = await LearningNode.findOne({
      _id: id,
      createdByUser: userId,
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    // Remove from parent's childIds
    const parent = await ContainerNode.findById(node.parentContainerId);
    if (parent) {
      parent.childIds = parent.childIds.filter(
        (childId) => childId.toString() !== id,
      );
      await parent.save();
    }

    await LearningNode.findByIdAndDelete(id);
    res.json({ message: "Node deleted successfully" });
  } catch (error) {
    console.error("Error deleting learning node:", error);
    res.status(500).json({ message: "Failed to delete learning node" });
  }
};

export const addXpToLearningNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    const node = await LearningNode.findOne({
      _id: id,
      createdByUser: userId,
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    node.addXp(amount);
    await node.save();

    res.json(node);
  } catch (error) {
    console.error("Error adding XP to learning node:", error);
    res.status(500).json({ message: "Failed to add XP to learning node" });
  }
};

// ==================== GENERIC NODE OPERATIONS ====================

export const getAllNodes = async (req, res) => {
  try {
    const { userId } = req;

    // Get all container and learning nodes for the user
    const [containerNodes, learningNodes] = await Promise.all([
      ContainerNode.find({ createdByUser: userId }),
      LearningNode.find({ createdByUser: userId }),
    ]);

    // Combine and sort by type and title
    const allNodes = [
      ...containerNodes.map((n) => ({ ...n.toObject(), type: "container" })),
      ...learningNodes.map((n) => ({ ...n.toObject(), type: "learning" })),
    ].sort((a, b) => a.title.localeCompare(b.title));

    res.json({ nodes: allNodes });
  } catch (error) {
    console.error("Error getting all nodes:", error);
    res.status(500).json({ message: "Failed to get all nodes" });
  }
};

export const deleteNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Try to delete as container node first
    let node = await ContainerNode.findByIdAndDelete(id);
    if (node && node.createdByUser.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this node" });
    }

    // If not found, try learning node
    if (!node) {
      node = await LearningNode.findByIdAndDelete(id);
      if (node && node.createdByUser.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this node" });
      }
    }

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    res.json({ message: "Node deleted successfully" });
  } catch (error) {
    console.error("Error deleting node:", error);
    res.status(500).json({ message: "Failed to delete node" });
  }
};
