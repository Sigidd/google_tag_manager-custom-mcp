/**
 * MCP tool definitions for Google Tag Manager API v2.
 *
 * All 75 tools are registered here. Each tool maps 1:1 to a method
 * on GTMClient and returns JSON.stringify(result, null, 2).
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GTMClient } from "./google-tagmanager";

export function registerTools(server: McpServer, client: GTMClient) {
  // ─── Accounts ─────────────────────────────────────────────────────────────

  server.tool(
    "gtm_list_accounts",
    "List all GTM accounts accessible to the authenticated user",
    {},
    async () => {
      const result = await client.listAccounts();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_account",
    "Get a single GTM account by ID",
    { accountId: z.string().describe("GTM account ID") },
    async ({ accountId }) => {
      const result = await client.getAccount(accountId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_update_account",
    "Update a GTM account's name or shareData setting",
    {
      accountId: z.string().describe("GTM account ID"),
      name: z.string().describe("New account name"),
      shareData: z.boolean().optional().describe("Whether to share data with Google"),
    },
    async ({ accountId, name, shareData }) => {
      const result = await client.updateAccount(accountId, { name, shareData });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── Containers ───────────────────────────────────────────────────────────

  server.tool(
    "gtm_list_containers",
    "List all containers in a GTM account",
    { accountId: z.string().describe("GTM account ID") },
    async ({ accountId }) => {
      const result = await client.listContainers(accountId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_container",
    "Get a single GTM container by ID",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
    },
    async ({ accountId, containerId }) => {
      const result = await client.getContainer(accountId, containerId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_create_container",
    "Create a new GTM container",
    {
      accountId: z.string().describe("GTM account ID"),
      name: z.string().describe("Container name"),
      usageContext: z
        .array(z.string())
        .describe("Usage contexts (e.g. ['web'], ['android'], ['ios'])"),
      notes: z.string().optional().describe("Container notes"),
      domainName: z.array(z.string()).optional().describe("Associated domain names"),
    },
    async ({ accountId, name, usageContext, notes, domainName }) => {
      const result = await client.createContainer(accountId, {
        name,
        usageContext,
        notes,
        domainName,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_update_container",
    "Update an existing GTM container",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      data: z.record(z.unknown()).describe("Container fields to update"),
    },
    async ({ accountId, containerId, data }) => {
      const result = await client.updateContainer(accountId, containerId, data);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_delete_container",
    "Delete a GTM container",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
    },
    async ({ accountId, containerId }) => {
      const result = await client.deleteContainer(accountId, containerId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── Workspaces ───────────────────────────────────────────────────────────

  server.tool(
    "gtm_list_workspaces",
    "List all workspaces in a GTM container",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
    },
    async ({ accountId, containerId }) => {
      const result = await client.listWorkspaces(accountId, containerId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_workspace",
    "Get a single GTM workspace by ID",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
    },
    async ({ accountId, containerId, workspaceId }) => {
      const result = await client.getWorkspace(accountId, containerId, workspaceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_create_workspace",
    "Create a new workspace in a GTM container",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      name: z.string().describe("Workspace name"),
      description: z.string().optional().describe("Workspace description"),
    },
    async ({ accountId, containerId, name, description }) => {
      const result = await client.createWorkspace(accountId, containerId, {
        name,
        description,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_update_workspace",
    "Update an existing GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      data: z.record(z.unknown()).describe("Workspace fields to update"),
    },
    async ({ accountId, containerId, workspaceId, data }) => {
      const result = await client.updateWorkspace(accountId, containerId, workspaceId, data);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_delete_workspace",
    "Delete a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
    },
    async ({ accountId, containerId, workspaceId }) => {
      const result = await client.deleteWorkspace(accountId, containerId, workspaceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_workspace_status",
    "Get the status of changes in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
    },
    async ({ accountId, containerId, workspaceId }) => {
      const result = await client.getWorkspaceStatus(accountId, containerId, workspaceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_create_version",
    "Create a container version from a workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      name: z.string().optional().describe("Version name"),
      notes: z.string().optional().describe("Version notes"),
    },
    async ({ accountId, containerId, workspaceId, name, notes }) => {
      const result = await client.createVersion(accountId, containerId, workspaceId, {
        name,
        notes,
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_quick_preview",
    "Quick preview a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
    },
    async ({ accountId, containerId, workspaceId }) => {
      const result = await client.quickPreview(accountId, containerId, workspaceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_sync_workspace",
    "Sync a GTM workspace to the latest container version",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
    },
    async ({ accountId, containerId, workspaceId }) => {
      const result = await client.syncWorkspace(accountId, containerId, workspaceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── Tags ─────────────────────────────────────────────────────────────────

  server.tool(
    "gtm_list_tags",
    "List all tags in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
    },
    async ({ accountId, containerId, workspaceId }) => {
      const result = await client.listTags(accountId, containerId, workspaceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_tag",
    "Get a single GTM tag by ID",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      tagId: z.string().describe("GTM tag ID"),
    },
    async ({ accountId, containerId, workspaceId, tagId }) => {
      const result = await client.getTag(accountId, containerId, workspaceId, tagId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_create_tag",
    "Create a new tag in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      data: z.record(z.unknown()).describe("Tag configuration object"),
    },
    async ({ accountId, containerId, workspaceId, data }) => {
      const result = await client.createTag(accountId, containerId, workspaceId, data);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_update_tag",
    "Update an existing GTM tag",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      tagId: z.string().describe("GTM tag ID"),
      data: z.record(z.unknown()).describe("Tag fields to update"),
    },
    async ({ accountId, containerId, workspaceId, tagId, data }) => {
      const result = await client.updateTag(accountId, containerId, workspaceId, tagId, data);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_delete_tag",
    "Delete a GTM tag",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      tagId: z.string().describe("GTM tag ID"),
    },
    async ({ accountId, containerId, workspaceId, tagId }) => {
      const result = await client.deleteTag(accountId, containerId, workspaceId, tagId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_revert_tag",
    "Revert a GTM tag to its last published state",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      tagId: z.string().describe("GTM tag ID"),
    },
    async ({ accountId, containerId, workspaceId, tagId }) => {
      const result = await client.revertTag(accountId, containerId, workspaceId, tagId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── Triggers ─────────────────────────────────────────────────────────────

  server.tool(
    "gtm_list_triggers",
    "List all triggers in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
    },
    async ({ accountId, containerId, workspaceId }) => {
      const result = await client.listTriggers(accountId, containerId, workspaceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_trigger",
    "Get a single GTM trigger by ID",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      triggerId: z.string().describe("GTM trigger ID"),
    },
    async ({ accountId, containerId, workspaceId, triggerId }) => {
      const result = await client.getTrigger(accountId, containerId, workspaceId, triggerId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_create_trigger",
    "Create a new trigger in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      data: z.record(z.unknown()).describe("Trigger configuration object"),
    },
    async ({ accountId, containerId, workspaceId, data }) => {
      const result = await client.createTrigger(accountId, containerId, workspaceId, data);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_update_trigger",
    "Update an existing GTM trigger",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      triggerId: z.string().describe("GTM trigger ID"),
      data: z.record(z.unknown()).describe("Trigger fields to update"),
    },
    async ({ accountId, containerId, workspaceId, triggerId, data }) => {
      const result = await client.updateTrigger(
        accountId, containerId, workspaceId, triggerId, data
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_delete_trigger",
    "Delete a GTM trigger",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      triggerId: z.string().describe("GTM trigger ID"),
    },
    async ({ accountId, containerId, workspaceId, triggerId }) => {
      const result = await client.deleteTrigger(
        accountId, containerId, workspaceId, triggerId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_revert_trigger",
    "Revert a GTM trigger to its last published state",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      triggerId: z.string().describe("GTM trigger ID"),
    },
    async ({ accountId, containerId, workspaceId, triggerId }) => {
      const result = await client.revertTrigger(
        accountId, containerId, workspaceId, triggerId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── Variables ────────────────────────────────────────────────────────────

  server.tool(
    "gtm_list_variables",
    "List all variables in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
    },
    async ({ accountId, containerId, workspaceId }) => {
      const result = await client.listVariables(accountId, containerId, workspaceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_variable",
    "Get a single GTM variable by ID",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      variableId: z.string().describe("GTM variable ID"),
    },
    async ({ accountId, containerId, workspaceId, variableId }) => {
      const result = await client.getVariable(
        accountId, containerId, workspaceId, variableId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_create_variable",
    "Create a new variable in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      data: z.record(z.unknown()).describe("Variable configuration object"),
    },
    async ({ accountId, containerId, workspaceId, data }) => {
      const result = await client.createVariable(accountId, containerId, workspaceId, data);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_update_variable",
    "Update an existing GTM variable",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      variableId: z.string().describe("GTM variable ID"),
      data: z.record(z.unknown()).describe("Variable fields to update"),
    },
    async ({ accountId, containerId, workspaceId, variableId, data }) => {
      const result = await client.updateVariable(
        accountId, containerId, workspaceId, variableId, data
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_delete_variable",
    "Delete a GTM variable",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      variableId: z.string().describe("GTM variable ID"),
    },
    async ({ accountId, containerId, workspaceId, variableId }) => {
      const result = await client.deleteVariable(
        accountId, containerId, workspaceId, variableId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_revert_variable",
    "Revert a GTM variable to its last published state",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      variableId: z.string().describe("GTM variable ID"),
    },
    async ({ accountId, containerId, workspaceId, variableId }) => {
      const result = await client.revertVariable(
        accountId, containerId, workspaceId, variableId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── Built-In Variables ───────────────────────────────────────────────────

  server.tool(
    "gtm_list_builtin_variables",
    "List all enabled built-in variables in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
    },
    async ({ accountId, containerId, workspaceId }) => {
      const result = await client.listBuiltInVariables(
        accountId, containerId, workspaceId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_enable_builtin_variable",
    "Enable one or more built-in variables in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      types: z
        .array(z.string())
        .describe("Built-in variable types to enable (e.g. ['pageUrl', 'clickText'])"),
    },
    async ({ accountId, containerId, workspaceId, types }) => {
      const result = await client.enableBuiltInVariable(
        accountId, containerId, workspaceId, types
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_disable_builtin_variable",
    "Disable a built-in variable in a GTM workspace by path",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      path: z.string().describe("The path of the built-in variable to disable"),
    },
    async ({ accountId, containerId, workspaceId, path }) => {
      const result = await client.disableBuiltInVariable(
        accountId, containerId, workspaceId, path
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── Environments ─────────────────────────────────────────────────────────

  server.tool(
    "gtm_list_environments",
    "List all environments in a GTM container",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
    },
    async ({ accountId, containerId }) => {
      const result = await client.listEnvironments(accountId, containerId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_environment",
    "Get a single GTM environment by ID",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      environmentId: z.string().describe("GTM environment ID"),
    },
    async ({ accountId, containerId, environmentId }) => {
      const result = await client.getEnvironment(accountId, containerId, environmentId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_create_environment",
    "Create a new GTM environment",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      data: z.record(z.unknown()).describe("Environment configuration object"),
    },
    async ({ accountId, containerId, data }) => {
      const result = await client.createEnvironment(accountId, containerId, data);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_update_environment",
    "Update an existing GTM environment",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      environmentId: z.string().describe("GTM environment ID"),
      data: z.record(z.unknown()).describe("Environment fields to update"),
    },
    async ({ accountId, containerId, environmentId, data }) => {
      const result = await client.updateEnvironment(
        accountId, containerId, environmentId, data
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_delete_environment",
    "Delete a GTM environment",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      environmentId: z.string().describe("GTM environment ID"),
    },
    async ({ accountId, containerId, environmentId }) => {
      const result = await client.deleteEnvironment(
        accountId, containerId, environmentId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_reauthorize_environment",
    "Re-generate the authorization code for a GTM environment",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      environmentId: z.string().describe("GTM environment ID"),
    },
    async ({ accountId, containerId, environmentId }) => {
      const result = await client.reauthorizeEnvironment(
        accountId, containerId, environmentId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── Versions ─────────────────────────────────────────────────────────────

  server.tool(
    "gtm_list_version_headers",
    "List all version headers for a GTM container",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
    },
    async ({ accountId, containerId }) => {
      const result = await client.listVersionHeaders(accountId, containerId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_live_version",
    "Get the currently published (live) version of a GTM container",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
    },
    async ({ accountId, containerId }) => {
      const result = await client.getLiveVersion(accountId, containerId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_latest_version",
    "Get the latest container version of a GTM container",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
    },
    async ({ accountId, containerId }) => {
      const result = await client.getLatestVersion(accountId, containerId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_version",
    "Get a specific GTM container version by version ID",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      containerVersionId: z.string().describe("Container version ID"),
    },
    async ({ accountId, containerId, containerVersionId }) => {
      const result = await client.getVersion(accountId, containerId, containerVersionId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_publish_version",
    "Publish a GTM container version",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      containerVersionId: z.string().describe("Container version ID"),
      fingerprint: z.string().optional().describe("Version fingerprint for conflict detection"),
    },
    async ({ accountId, containerId, containerVersionId, fingerprint }) => {
      const result = await client.publishVersion(
        accountId, containerId, containerVersionId, fingerprint
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_set_latest_version",
    "Set a specific container version as the latest",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      containerVersionId: z.string().describe("Container version ID"),
    },
    async ({ accountId, containerId, containerVersionId }) => {
      const result = await client.setLatestVersion(
        accountId, containerId, containerVersionId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_undelete_version",
    "Undelete a previously deleted GTM container version",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      containerVersionId: z.string().describe("Container version ID"),
    },
    async ({ accountId, containerId, containerVersionId }) => {
      const result = await client.undeleteVersion(
        accountId, containerId, containerVersionId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_update_version",
    "Update a GTM container version's name or notes",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      containerVersionId: z.string().describe("Container version ID"),
      data: z.record(z.unknown()).describe("Version fields to update"),
    },
    async ({ accountId, containerId, containerVersionId, data }) => {
      const result = await client.updateVersion(
        accountId, containerId, containerVersionId, data
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_delete_version",
    "Delete a GTM container version",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      containerVersionId: z.string().describe("Container version ID"),
    },
    async ({ accountId, containerId, containerVersionId }) => {
      const result = await client.deleteVersion(
        accountId, containerId, containerVersionId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── Folders ──────────────────────────────────────────────────────────────

  server.tool(
    "gtm_list_folders",
    "List all folders in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
    },
    async ({ accountId, containerId, workspaceId }) => {
      const result = await client.listFolders(accountId, containerId, workspaceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_folder",
    "Get a single GTM folder by ID",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      folderId: z.string().describe("GTM folder ID"),
    },
    async ({ accountId, containerId, workspaceId, folderId }) => {
      const result = await client.getFolder(accountId, containerId, workspaceId, folderId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_create_folder",
    "Create a new folder in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      data: z.record(z.unknown()).describe("Folder configuration (e.g. { name: 'My Folder' })"),
    },
    async ({ accountId, containerId, workspaceId, data }) => {
      const result = await client.createFolder(accountId, containerId, workspaceId, data);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_update_folder",
    "Update an existing GTM folder",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      folderId: z.string().describe("GTM folder ID"),
      data: z.record(z.unknown()).describe("Folder fields to update"),
    },
    async ({ accountId, containerId, workspaceId, folderId, data }) => {
      const result = await client.updateFolder(
        accountId, containerId, workspaceId, folderId, data
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_delete_folder",
    "Delete a GTM folder",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      folderId: z.string().describe("GTM folder ID"),
    },
    async ({ accountId, containerId, workspaceId, folderId }) => {
      const result = await client.deleteFolder(
        accountId, containerId, workspaceId, folderId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_revert_folder",
    "Revert a GTM folder to its last published state",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      folderId: z.string().describe("GTM folder ID"),
    },
    async ({ accountId, containerId, workspaceId, folderId }) => {
      const result = await client.revertFolder(
        accountId, containerId, workspaceId, folderId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_list_folder_entities",
    "List all entities (tags, triggers, variables) in a GTM folder",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      folderId: z.string().describe("GTM folder ID"),
    },
    async ({ accountId, containerId, workspaceId, folderId }) => {
      const result = await client.listFolderEntities(
        accountId, containerId, workspaceId, folderId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_move_entities_to_folder",
    "Move tags, triggers, or variables into a GTM folder",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      folderId: z.string().describe("Target GTM folder ID"),
      data: z
        .record(z.unknown())
        .describe(
          "Object with arrays of entity IDs to move (e.g. { tagId: ['1','2'], triggerId: ['3'] })"
        ),
    },
    async ({ accountId, containerId, workspaceId, folderId, data }) => {
      const result = await client.moveEntitiesToFolder(
        accountId, containerId, workspaceId, folderId, data
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── Templates ────────────────────────────────────────────────────────────

  server.tool(
    "gtm_list_templates",
    "List all custom templates in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
    },
    async ({ accountId, containerId, workspaceId }) => {
      const result = await client.listTemplates(accountId, containerId, workspaceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_template",
    "Get a single GTM custom template by ID",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      templateId: z.string().describe("GTM template ID"),
    },
    async ({ accountId, containerId, workspaceId, templateId }) => {
      const result = await client.getTemplate(
        accountId, containerId, workspaceId, templateId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_create_template",
    "Create a new custom template in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      data: z.record(z.unknown()).describe("Template configuration object"),
    },
    async ({ accountId, containerId, workspaceId, data }) => {
      const result = await client.createTemplate(
        accountId, containerId, workspaceId, data
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_update_template",
    "Update an existing GTM custom template",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      templateId: z.string().describe("GTM template ID"),
      data: z.record(z.unknown()).describe("Template fields to update"),
    },
    async ({ accountId, containerId, workspaceId, templateId, data }) => {
      const result = await client.updateTemplate(
        accountId, containerId, workspaceId, templateId, data
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_delete_template",
    "Delete a GTM custom template",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      templateId: z.string().describe("GTM template ID"),
    },
    async ({ accountId, containerId, workspaceId, templateId }) => {
      const result = await client.deleteTemplate(
        accountId, containerId, workspaceId, templateId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_revert_template",
    "Revert a GTM custom template to its last published state",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      templateId: z.string().describe("GTM template ID"),
    },
    async ({ accountId, containerId, workspaceId, templateId }) => {
      const result = await client.revertTemplate(
        accountId, containerId, workspaceId, templateId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── Zones ────────────────────────────────────────────────────────────────

  server.tool(
    "gtm_list_zones",
    "List all zones in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
    },
    async ({ accountId, containerId, workspaceId }) => {
      const result = await client.listZones(accountId, containerId, workspaceId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_zone",
    "Get a single GTM zone by ID",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      zoneId: z.string().describe("GTM zone ID"),
    },
    async ({ accountId, containerId, workspaceId, zoneId }) => {
      const result = await client.getZone(accountId, containerId, workspaceId, zoneId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_create_zone",
    "Create a new zone in a GTM workspace",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      data: z.record(z.unknown()).describe("Zone configuration object"),
    },
    async ({ accountId, containerId, workspaceId, data }) => {
      const result = await client.createZone(accountId, containerId, workspaceId, data);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_update_zone",
    "Update an existing GTM zone",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      zoneId: z.string().describe("GTM zone ID"),
      data: z.record(z.unknown()).describe("Zone fields to update"),
    },
    async ({ accountId, containerId, workspaceId, zoneId, data }) => {
      const result = await client.updateZone(
        accountId, containerId, workspaceId, zoneId, data
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_delete_zone",
    "Delete a GTM zone",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      zoneId: z.string().describe("GTM zone ID"),
    },
    async ({ accountId, containerId, workspaceId, zoneId }) => {
      const result = await client.deleteZone(
        accountId, containerId, workspaceId, zoneId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_revert_zone",
    "Revert a GTM zone to its last published state",
    {
      accountId: z.string().describe("GTM account ID"),
      containerId: z.string().describe("GTM container ID"),
      workspaceId: z.string().describe("GTM workspace ID"),
      zoneId: z.string().describe("GTM zone ID"),
    },
    async ({ accountId, containerId, workspaceId, zoneId }) => {
      const result = await client.revertZone(
        accountId, containerId, workspaceId, zoneId
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ─── User Permissions ─────────────────────────────────────────────────────

  server.tool(
    "gtm_list_user_permissions",
    "List all user permissions for a GTM account",
    { accountId: z.string().describe("GTM account ID") },
    async ({ accountId }) => {
      const result = await client.listUserPermissions(accountId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_get_user_permission",
    "Get a single user permission by ID",
    {
      accountId: z.string().describe("GTM account ID"),
      userPermissionId: z.string().describe("User permission ID"),
    },
    async ({ accountId, userPermissionId }) => {
      const result = await client.getUserPermission(accountId, userPermissionId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_create_user_permission",
    "Create a new user permission for a GTM account",
    {
      accountId: z.string().describe("GTM account ID"),
      data: z.record(z.unknown()).describe("User permission configuration object"),
    },
    async ({ accountId, data }) => {
      const result = await client.createUserPermission(accountId, data);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_update_user_permission",
    "Update an existing user permission",
    {
      accountId: z.string().describe("GTM account ID"),
      userPermissionId: z.string().describe("User permission ID"),
      data: z.record(z.unknown()).describe("User permission fields to update"),
    },
    async ({ accountId, userPermissionId, data }) => {
      const result = await client.updateUserPermission(
        accountId, userPermissionId, data
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "gtm_delete_user_permission",
    "Delete a user permission from a GTM account",
    {
      accountId: z.string().describe("GTM account ID"),
      userPermissionId: z.string().describe("User permission ID"),
    },
    async ({ accountId, userPermissionId }) => {
      const result = await client.deleteUserPermission(accountId, userPermissionId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
