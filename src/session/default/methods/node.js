module.exports = function(Session)
{
    var Helper = require("../../../helper");
    var FormData = require("form-data");

    class NodeSession extends Session
    {
        /**
         * Reads a node.
         *
         * @param repository
         * @param branch
         * @param nodeId
         * @returns {*}
         */
        readNode(repository, branch, nodeId, path)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var callback = this.extractOptionalCallback(arguments);

            var qs = {};
            if (path) {
                qs["path"] = path;
            }

            return this.get("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId, qs, callback);
        }

        /**
         * Queries for nodes.
         *
         * @param repository
         * @param branch
         * @param query
         * @param pagination
         * @returns {*}
         */
        queryNodes(repository, branch, query, pagination)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var callback = this.extractOptionalCallback(arguments);

            if (pagination)
            {
                if (pagination.fields) {
                    query["_fields"] = pagination.fields;
                    delete pagination.fields;
                }
            }

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/query", pagination, query, callback);
        }

        async queryOneNode(repository, branch, query, pagination)
        {
            const result = await this.queryNodes(repository, branch, query, {...pagination, limit: 1});
            if (result.rows && result.rows.length > 0)
            {
                return result.rows[0];
            }

            return null;
        }

        /**
         * Queries/Searches for nodes.
         *
         * @param repository
         * @param branch
         * @param query
         * @param pagination
         * @returns {*}
         */
        searchNodes(repository, branch, search, pagination)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var callback = this.extractOptionalCallback(arguments);

            if (Helper.isString(search))
            {
                search = {
                    "search": search
                };
            }
            

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/search", pagination, search, callback);
        }
        
        /**
         * Queries/Searches for nodes.
         *
         * @param repository
         * @param branch
         * @param query
         * @param pagination
         * @returns {*}
         */
        findNodes(repository, branch, config, pagination)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var callback = this.extractOptionalCallback(arguments);

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/find", pagination, config, callback);
        }
        

        /**
         * Creates a node.
         *
         * @param repository
         * @param branch
         * @param obj
         * @param options
         * @returns {*}
         */
        createNode(repository, branch, obj, options)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var callback = this.extractOptionalCallback(arguments);

            var qs = {};

            if (options)
            {
                if (options["rootNodeId"]) {
                    qs["rootNodeId"] = options["rootNodeId"]
                }
                if (options["parentFolderPath"]) {
                    qs["parentFolderPath"] = options["parentFolderPath"]
                }
                if (options["filePath"]) {
                    qs["filePath"] = options["filePath"]
                }
                if (options["fileName"]) {
                    qs["fileName"] = options["fileName"]
                }
                if (options["associationTypeString"]) {
                    qs["associationTypeString"] = options["associationTypeString"]
                }

                // some others for compatibility
                if (options["filename"]) {
                    qs["fileName"] = options["filename"]
                }
                if (options["filepath"]) {
                    qs["fileName"] = options["filepath"]
                }
                if (options["parentPath"]) {
                    qs["parentFolderPath"] = options["parentPath"]
                }
            }

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes", qs, obj, callback);
        }

        queryNodeRelatives(repository, branch, node, associationTypeQName, associationDirection, query, pagination)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            var qs = {};

            if (pagination)
            {
                for (var k in pagination)
                {
                    qs[k] = pagination[k];
                }
            }

            qs.type = associationTypeQName;
            qs.direction = associationDirection;

            if (!query) {
                query = {};
            }

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/relatives/query", qs, query, callback);
        };

        queryNodeChildren(repository, branch, node, query, pagination)
        {
            var callback = this.extractOptionalCallback(arguments);

            return this.queryNodeRelatives(repository, branch, node, "a:child", "OUTGOING", query, pagination, callback);
        };

        listNodeAssociations(repository, branch, node, associationType, associationDirection, pagination)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            var qs = {};

            if (pagination)
            {
                for (var k in pagination)
                {
                    qs[k] = pagination[k];
                }
            }

            if (associationType)
            {
                qs.type = associationType;
            }

            if (associationDirection)
            {
                qs.direction = associationDirection;
            }

            return this.get("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/associations", qs, callback);
        };

        listOutgoingAssociations(repository, branch, node, associationType, pagination)
        {
            var callback = this.extractOptionalCallback(arguments);

            return this.listNodeAssociations(repository, branch, node, associationType, "OUTGOING", pagination, callback);
        };

        listIncomingAssociations(repository, branch, node, associationType, pagination)
        {
            var callback = this.extractOptionalCallback(arguments);

            return this.listNodeAssociations(repository, branch, node, associationType, "INCOMING", pagination, callback);
        };

        associate(repository, branch, node, otherNode, associationType, associationDirectionality)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var otherNodeId = this.acquireId(otherNode);
            var callback = this.extractOptionalCallback(arguments);

            var qs = {};
            qs.node = otherNodeId;

            if (associationType)
            {
                qs.type = associationType;
            }

            if (associationDirectionality)
            {
                qs.directionality = associationDirectionality;
            }

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/associate", qs, {}, callback);
        }

        unassociate(repository, branch, node, otherNode, associationType, associationDirectionality)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var otherNodeId = this.acquireId(otherNode);
            var callback = this.extractOptionalCallback(arguments);

            var qs = {};
            qs.node = otherNodeId;

            if (associationType)
            {
                qs.type = associationType;
            }

            if (associationDirectionality)
            {
                qs.directionality = associationDirectionality;
            }

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/unassociate", qs, {}, callback);
        }

        associateChild(repository, branch, node, childNode)
        {
            var callback = this.extractOptionalCallback(arguments);

            return this.associate(repository, branch, node, childNode, "a:child", "DIRECTED", callback);
        }

        unassociateChild(repository, branch, node, childNode)
        {
            var callback = this.extractOptionalCallback(arguments);

            return this.unassociate(repository, branch, node, childNode, "a:child", "DIRECTED", callback);
        }

        deleteNode(repository, branch, node)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            return this.del("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId, {}, callback);
        }

        deleteNodes(repository, branch, nodes)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var callback = this.extractOptionalCallback(arguments);

            var payload = {};
            payload._docs = this.acquireIds(nodes);

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/delete", {}, payload, callback);
        }

        updateNode(repository, branch, node)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            // var obj = this.cleanNodeBeforeWrite(node);

            return this.put("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId, {}, node, callback);
        }

        patchNode(repository, branch, node, patchObject)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            return this.patch("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId, {}, patchObject, callback);
        }

        addNodeFeature(repository, branch, node, featureId, config)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/features/" + featureId, {}, config, callback);
        }

        removeNodeFeature(repository, branch, node, featureId)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            return this.del("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/features/" + featureId, {}, callback);
        }

        refreshNode(repository, branch, node)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/refresh", {}, callback);
        }

        changeNodeQName(repository, branch, node, newQName)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            var params = {
                "qname": newQName
            };

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/change_qname", params, callback);
        }

        /*
        moveNodesTo(repository, branch, sourceNodes, targetNode, targetPath)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var callback = this.extractOptionalCallback(arguments);

            var qs = {};

            var payload = {};

            var sourceNodeIds = [];
            for (var i = 0; i < sourceNodes.length; i++)
            {
                var sourceNodeId = this.acquireId(sourceNodes[i]);
                sourceNodeIds.push(sourceNodeId);
            }
            payload.sourceNodeIds = sourceNodeIds;

            payload.targetNodeId = this.acquireId(targetNode);

            if (targetPath)
            {
                payload.targetPath = targetPath;
            }

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/move/start", qs, payload, callback);
        }
        */

        /**
         * @param repository
         * @param branch
         * @param node
         * @param config { "leafPath": "<leafPath>", "basePath": "<basePath>", "containers": true, "depth": integer, "properties": true|false, "query": {}, "search": {} }
         * @returns {*}
         */
        nodeTree(repository, branch, node, config)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            var qs = {};

            if (!config)
            {
                config = {};
            }

            // "leaf"
            if (config.leafPath)
            {
                qs["leaf"] = config.leafPath;
            }
            else if (config.leaf)
            {
                qs["leaf"] = config.leaf;
            }

            // "base"
            if (config.basePath)
            {
                qs["base"] = config.basePath;
            }
            else if (config.base)
            {
                qs["base"] = config.base;
            }

            // "containers"
            if (config.containers)
            {
                qs["containers"] = true;
            }

            // "properties"
            if (config.properties)
            {
                qs["properties"] = true;
            }

            // "object"
            if (config.object)
            {
                qs["object"] = true;
            }

            // "depth"
            qs.depth = 1;
            if (config.depth)
            {
                qs["depth"] = config.depth;
            }

            // payload
            var payload = {};
            if (config.query) {
                payload.query = config.query;
            }

            if(config.search) {
                payload.search = config.search;
            }

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/tree", qs, payload, callback);
        };

        /**
         * Resolves the path for the node relative to the root directory.
         *
         * @param repository
         * @param branch
         * @param node
         * @returns {*}
         */
        async resolveNodePath(repository, branch, node)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            var qs = {};

            var result = await this.get("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/path", qs, callback);
            return result.path;
        };

        /**
         * Resolves all of the paths for the node.
         * Hands back a map keyed by root identifier.
         *
         * @param repository
         * @param branch
         * @param node
         * @returns {*}
         */
        async resolveNodePaths(repository, branch, node)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            var result = await this.get("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/paths", {}, callback);
            return result.paths;
        };

        /**
         * Moves a list of nodes to the container targetNodeId.
         *
         * @param repository
         * @param branch
         * @param sourceNodeIds
         * @param targetNodeId id of target folder, default is "root" for top folder
         * @param targetPath optional relative path to apply to targetNodeId for determining move target
         * @returns {*}
         */
        async moveNodes(repository, branch, sourceNodeIds, targetNodeId, targetPath)
        {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var callback = this.extractOptionalCallback(arguments);

            if (!targetNodeId) targetNodeId = "root"

            var payload = {};
            if (targetPath)
            {
                payload.targetPath = targetPath;
            }

            payload.sourceNodeIds = sourceNodeIds;
            payload.targetNodeId = targetNodeId;

            var result = await this.post(`/repositories/${repositoryId}/branches/${branchId}/movenodes`, {}, payload, callback);
            return;
        }
        
        /**
         * Traverses around the node and returns any nodes found to be connected on the graph.
         *
         * Example config:
         *
         * {
         *    "associations": {
         *       "a:child": "MUTUAL",
         *       "a:knows": "INCOMING",
         *       "a:related": "OUTGOING"
         *    },
         *    "depth": 1,
         *    "types": [ "custom:type1", "custom:type2" ]
         * }
         *
         * @param repository
         * @param branch
         * @param node
         * @param config
         * @returns {*}
         */
        traverseNode(repository, branch, node, config) {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            return this.post("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/traverse", {}, {traverse: config}, callback);
        };

        uploadAttachment(repository, branch, node, attachmentId, file, mimeType, filename) {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            if (!attachmentId) {
                attachmentId = "default";
            }

            var uri = "/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/attachments/" + attachmentId;

            if (filename === null)
            {
                filename = attachmentId;
            }

            var formData = new FormData();
            formData.append(attachmentId, file, {contentType: mimeType, filename: filename});

            return this.multipartPost(uri, null, formData, callback);
        };

        downloadAttachment(repository, branch, node, attachmentId) {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            if (!attachmentId) {
                attachmentId = "default";
            }

            return this.download("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/attachments/" + attachmentId, {}, callback);
        };

        listAttachments(repository, branch, node) {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            return this.get("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/attachments", {}, callback);
        };

        deleteAttachment(repository, branch, node, attachmentId) {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            if (!attachmentId)
            {
                attachmentId = "default";
            }

            return this.del("/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/attachments/" + attachmentId, {}, callback);
        }

        listVersions(repository, branch, node, options, pagination, callback) {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            var uri = "/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/versions";
            var qs = {}

            if (options)
            {
                qs = options
            }

            if (pagination)
            {
                qs = {
                    ...qs,
                    ...pagination
                }
            }

            return this.get(uri, qs, callback);
        }

        readVersion(repository, branch, node, changesetId, options, callback) {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            var uri = "/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/versions/" + changesetId;
            var qs = {}

            if (options)
            {
                qs = options
            }
            
            return this.get(uri, qs, callback);
        }

        restoreVersion(repository, branch, node, changesetId, callback) {
            var repositoryId = this.acquireId(repository);
            var branchId = this.acquireId(branch);
            var nodeId = this.acquireId(node);
            var callback = this.extractOptionalCallback(arguments);

            var uri = "/repositories/" + repositoryId + "/branches/" + branchId + "/nodes/" + nodeId + "/versions/" + changesetId + "/restore";

            return this.post(uri, {}, {}, callback);
        }
    }

    return NodeSession;
};