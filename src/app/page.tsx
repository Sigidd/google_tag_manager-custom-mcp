/**
 * Homepage — shows available tools and connection instructions.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://your-deployment.vercel.app";

const ACCENT = "#4285F4"; // Google blue

type ToolCategory = {
  category: string;
  tools: { name: string; description: string }[];
};

const toolCategories: ToolCategory[] = [
  {
    category: "Accounts (3 tools)",
    tools: [
      { name: "gtm_list_accounts", description: "List all accessible GTM accounts" },
      { name: "gtm_get_account", description: "Get a single account by ID" },
      { name: "gtm_update_account", description: "Update account name or shareData setting" },
    ],
  },
  {
    category: "Containers (5 tools)",
    tools: [
      { name: "gtm_list_containers", description: "List all containers in an account" },
      { name: "gtm_get_container", description: "Get a container by ID" },
      { name: "gtm_create_container", description: "Create a new container" },
      { name: "gtm_update_container", description: "Update a container" },
      { name: "gtm_delete_container", description: "Delete a container" },
    ],
  },
  {
    category: "Workspaces (9 tools)",
    tools: [
      { name: "gtm_list_workspaces", description: "List all workspaces in a container" },
      { name: "gtm_get_workspace", description: "Get a workspace by ID" },
      { name: "gtm_create_workspace", description: "Create a workspace" },
      { name: "gtm_update_workspace", description: "Update a workspace" },
      { name: "gtm_delete_workspace", description: "Delete a workspace" },
      { name: "gtm_get_workspace_status", description: "Get workspace change status" },
      { name: "gtm_create_version", description: "Create a container version from a workspace" },
      { name: "gtm_quick_preview", description: "Quick preview a workspace" },
      { name: "gtm_sync_workspace", description: "Sync workspace to latest version" },
    ],
  },
  {
    category: "Tags (6 tools)",
    tools: [
      { name: "gtm_list_tags", description: "List all tags in a workspace" },
      { name: "gtm_get_tag", description: "Get a tag by ID" },
      { name: "gtm_create_tag", description: "Create a new tag" },
      { name: "gtm_update_tag", description: "Update a tag" },
      { name: "gtm_delete_tag", description: "Delete a tag" },
      { name: "gtm_revert_tag", description: "Revert tag to last published state" },
    ],
  },
  {
    category: "Triggers (6 tools)",
    tools: [
      { name: "gtm_list_triggers", description: "List all triggers in a workspace" },
      { name: "gtm_get_trigger", description: "Get a trigger by ID" },
      { name: "gtm_create_trigger", description: "Create a new trigger" },
      { name: "gtm_update_trigger", description: "Update a trigger" },
      { name: "gtm_delete_trigger", description: "Delete a trigger" },
      { name: "gtm_revert_trigger", description: "Revert trigger to last published state" },
    ],
  },
  {
    category: "Variables (6 tools)",
    tools: [
      { name: "gtm_list_variables", description: "List all variables in a workspace" },
      { name: "gtm_get_variable", description: "Get a variable by ID" },
      { name: "gtm_create_variable", description: "Create a new variable" },
      { name: "gtm_update_variable", description: "Update a variable" },
      { name: "gtm_delete_variable", description: "Delete a variable" },
      { name: "gtm_revert_variable", description: "Revert variable to last published state" },
    ],
  },
  {
    category: "Built-In Variables (3 tools)",
    tools: [
      { name: "gtm_list_builtin_variables", description: "List enabled built-in variables" },
      { name: "gtm_enable_builtin_variable", description: "Enable built-in variable types" },
      { name: "gtm_disable_builtin_variable", description: "Disable a built-in variable" },
    ],
  },
  {
    category: "Environments (6 tools)",
    tools: [
      { name: "gtm_list_environments", description: "List all environments in a container" },
      { name: "gtm_get_environment", description: "Get an environment by ID" },
      { name: "gtm_create_environment", description: "Create a new environment" },
      { name: "gtm_update_environment", description: "Update an environment" },
      { name: "gtm_delete_environment", description: "Delete an environment" },
      { name: "gtm_reauthorize_environment", description: "Re-generate environment auth code" },
    ],
  },
  {
    category: "Versions (9 tools)",
    tools: [
      { name: "gtm_list_version_headers", description: "List all version headers" },
      { name: "gtm_get_live_version", description: "Get the currently published version" },
      { name: "gtm_get_latest_version", description: "Get the latest container version" },
      { name: "gtm_get_version", description: "Get a version by ID" },
      { name: "gtm_publish_version", description: "Publish a container version" },
      { name: "gtm_set_latest_version", description: "Set a version as latest" },
      { name: "gtm_undelete_version", description: "Restore a deleted version" },
      { name: "gtm_update_version", description: "Update version name/notes" },
      { name: "gtm_delete_version", description: "Delete a version" },
    ],
  },
  {
    category: "Folders (8 tools)",
    tools: [
      { name: "gtm_list_folders", description: "List all folders in a workspace" },
      { name: "gtm_get_folder", description: "Get a folder by ID" },
      { name: "gtm_create_folder", description: "Create a folder" },
      { name: "gtm_update_folder", description: "Update a folder" },
      { name: "gtm_delete_folder", description: "Delete a folder" },
      { name: "gtm_revert_folder", description: "Revert folder to last published state" },
      { name: "gtm_list_folder_entities", description: "List all entities in a folder" },
      { name: "gtm_move_entities_to_folder", description: "Move entities into a folder" },
    ],
  },
  {
    category: "Templates (6 tools)",
    tools: [
      { name: "gtm_list_templates", description: "List all custom templates" },
      { name: "gtm_get_template", description: "Get a template by ID" },
      { name: "gtm_create_template", description: "Create a custom template" },
      { name: "gtm_update_template", description: "Update a custom template" },
      { name: "gtm_delete_template", description: "Delete a custom template" },
      { name: "gtm_revert_template", description: "Revert template to last published state" },
    ],
  },
  {
    category: "Zones (6 tools)",
    tools: [
      { name: "gtm_list_zones", description: "List all zones in a workspace" },
      { name: "gtm_get_zone", description: "Get a zone by ID" },
      { name: "gtm_create_zone", description: "Create a zone" },
      { name: "gtm_update_zone", description: "Update a zone" },
      { name: "gtm_delete_zone", description: "Delete a zone" },
      { name: "gtm_revert_zone", description: "Revert zone to last published state" },
    ],
  },
  {
    category: "User Permissions (5 tools)",
    tools: [
      { name: "gtm_list_user_permissions", description: "List user permissions for an account" },
      { name: "gtm_get_user_permission", description: "Get a user permission by ID" },
      { name: "gtm_create_user_permission", description: "Grant user access to an account" },
      { name: "gtm_update_user_permission", description: "Update a user permission" },
      { name: "gtm_delete_user_permission", description: "Revoke user access" },
    ],
  },
];

const totalTools = toolCategories.reduce((sum, c) => sum + c.tools.length, 0);

export default function HomePage() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 860,
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon.png"
          alt="Google Tag Manager MCP"
          width={64}
          height={64}
          style={{ borderRadius: 12 }}
        />
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem" }}>
            Google Tag Manager MCP
          </h1>
          <p style={{ margin: "0.25rem 0 0", color: "#666" }}>
            Connect Claude to Google Tag Manager — manage tags, triggers,
            variables, and more
          </p>
        </div>
      </div>

      {/* Quick Install */}
      <section
        style={{
          background: "#f0f7ff",
          border: "1px solid #c7deff",
          borderRadius: 8,
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem", color: "#1a56db" }}>
          Quick Install
        </h2>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
          Add this MCP server to Claude using the URL below:
        </p>
        <code
          style={{
            display: "block",
            background: "#dbeafe",
            padding: "0.5rem 0.75rem",
            borderRadius: 6,
            fontFamily: "monospace",
            fontSize: "0.9rem",
            wordBreak: "break-all",
          }}
        >
          {BASE_URL}/mcp
        </code>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#1a56db" }}>
          The connector URL must end with <strong>/mcp</strong>
        </p>
      </section>

      {/* How it works */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>
          How it works
        </h2>
        <ol
          style={{ paddingLeft: "1.25rem", lineHeight: 1.7, color: "#374151" }}
        >
          <li>Add the MCP server URL to Claude</li>
          <li>
            Claude triggers the OAuth 2.1 flow — you are redirected to the
            connection page
          </li>
          <li>
            Click <strong>Sign in with Google</strong> and grant the requested
            GTM scopes
          </li>
          <li>
            Google tokens are stored securely — Claude can now manage your GTM
            account
          </li>
          <li>
            Future sessions use silent re-auth (no sign-in needed again for 30
            days)
          </li>
        </ol>
      </section>

      {/* Tools list */}
      <section>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>
          Available Tools ({totalTools} total)
        </h2>
        <div style={{ display: "grid", gap: "1.25rem" }}>
          {toolCategories.map((cat) => (
            <div key={cat.category}>
              <h3
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.95rem",
                  color: ACCENT,
                  fontWeight: 600,
                }}
              >
                {cat.category}
              </h3>
              <div style={{ display: "grid", gap: "0.35rem" }}>
                {cat.tools.map((tool) => (
                  <div
                    key={tool.name}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "0.5rem 0.75rem",
                      background: "#f9fafb",
                      borderRadius: 6,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <code
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.82rem",
                        color: ACCENT,
                        flexShrink: 0,
                        minWidth: 280,
                      }}
                    >
                      {tool.name}
                    </code>
                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                      {tool.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          marginTop: "3rem",
          paddingTop: "1rem",
          borderTop: "1px solid #e5e7eb",
          fontSize: "0.8rem",
          color: "#9ca3af",
        }}
      >
        <p>
          Powered by the{" "}
          <a href="https://modelcontextprotocol.io" style={{ color: ACCENT }}>
            Model Context Protocol
          </a>{" "}
          and{" "}
          <a href="https://vercel.com" style={{ color: ACCENT }}>
            Vercel
          </a>
        </p>
      </footer>
    </main>
  );
}
