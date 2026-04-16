/**
 * Google Tag Manager API v2 client.
 *
 * Automatically refreshes the Google access token when it is within
 * 5 minutes of expiry (Google tokens expire after 1 hour).
 *
 * Base URL: https://tagmanager.googleapis.com/tagmanager/v2
 */
import { store } from "./store";

const GTM_BASE = "https://tagmanager.googleapis.com/tagmanager/v2";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FIVE_MIN = 5 * 60 * 1000;

export class GTMClient {
  constructor(private readonly userId: string) {}

  // ─── Token management ───────────────────────────────────────────────────────

  /** Returns a valid access token, refreshing if within 5 minutes of expiry. */
  private async getToken(): Promise<string> {
    const creds = await store.getCredentials(this.userId);
    if (!creds) {
      throw new Error(
        "No Google credentials found. Please reconnect via the /connect flow."
      );
    }

    // Refresh if expiring within 5 minutes
    if (creds.tokenExpiresAt - FIVE_MIN < Date.now()) {
      const resp = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: creds.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Token refresh failed: ${errText}`);
      }

      const refreshed = await resp.json() as {
        access_token: string;
        expires_in: number;
      };

      const updatedCreds = {
        ...creds,
        accessToken: refreshed.access_token,
        tokenExpiresAt: Date.now() + refreshed.expires_in * 1000,
      };

      await store.setCredentials(this.userId, updatedCreds);
      return refreshed.access_token;
    }

    return creds.accessToken;
  }

  // ─── HTTP request helper ────────────────────────────────────────────────────

  private async request<T>(
    method: string,
    path: string,
    params?: Record<string, string | string[]>,
    body?: unknown
  ): Promise<T> {
    const token = await this.getToken();
    const url = new URL(`${GTM_BASE}${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          for (const v of value) {
            url.searchParams.append(key, v);
          }
        } else {
          url.searchParams.set(key, value);
        }
      }
    }

    const res = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`GTM API error ${res.status}: ${errText}`);
    }

    // DELETE returns 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return res.json() as Promise<T>;
  }

  // ─── Accounts ───────────────────────────────────────────────────────────────

  listAccounts() {
    return this.request<unknown>("GET", "/accounts");
  }

  getAccount(accountId: string) {
    return this.request<unknown>("GET", `/accounts/${accountId}`);
  }

  updateAccount(accountId: string, data: { name: string; shareData?: boolean }) {
    return this.request<unknown>("PUT", `/accounts/${accountId}`, undefined, data);
  }

  // ─── Containers ─────────────────────────────────────────────────────────────

  listContainers(accountId: string) {
    return this.request<unknown>("GET", `/accounts/${accountId}/containers`);
  }

  getContainer(accountId: string, containerId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}`
    );
  }

  createContainer(
    accountId: string,
    data: {
      name: string;
      usageContext: string[];
      notes?: string;
      domainName?: string[];
    }
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers`,
      undefined,
      data
    );
  }

  updateContainer(
    accountId: string,
    containerId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "PUT",
      `/accounts/${accountId}/containers/${containerId}`,
      undefined,
      data
    );
  }

  deleteContainer(accountId: string, containerId: string) {
    return this.request<unknown>(
      "DELETE",
      `/accounts/${accountId}/containers/${containerId}`
    );
  }

  // ─── Workspaces ─────────────────────────────────────────────────────────────

  listWorkspaces(accountId: string, containerId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces`
    );
  }

  getWorkspace(accountId: string, containerId: string, workspaceId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`
    );
  }

  createWorkspace(
    accountId: string,
    containerId: string,
    data: { name: string; description?: string }
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces`,
      undefined,
      data
    );
  }

  updateWorkspace(
    accountId: string,
    containerId: string,
    workspaceId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "PUT",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`,
      undefined,
      data
    );
  }

  deleteWorkspace(accountId: string, containerId: string, workspaceId: string) {
    return this.request<unknown>(
      "DELETE",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`
    );
  }

  getWorkspaceStatus(
    accountId: string,
    containerId: string,
    workspaceId: string
  ) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/status`
    );
  }

  createVersion(
    accountId: string,
    containerId: string,
    workspaceId: string,
    data: { name?: string; notes?: string }
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}:create_version`,
      undefined,
      data
    );
  }

  quickPreview(accountId: string, containerId: string, workspaceId: string) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}:quick_preview`
    );
  }

  syncWorkspace(accountId: string, containerId: string, workspaceId: string) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}:sync`
    );
  }

  // ─── Tags ────────────────────────────────────────────────────────────────────

  listTags(accountId: string, containerId: string, workspaceId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags`
    );
  }

  getTag(
    accountId: string,
    containerId: string,
    workspaceId: string,
    tagId: string
  ) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`
    );
  }

  createTag(
    accountId: string,
    containerId: string,
    workspaceId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags`,
      undefined,
      data
    );
  }

  updateTag(
    accountId: string,
    containerId: string,
    workspaceId: string,
    tagId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "PUT",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`,
      undefined,
      data
    );
  }

  deleteTag(
    accountId: string,
    containerId: string,
    workspaceId: string,
    tagId: string
  ) {
    return this.request<unknown>(
      "DELETE",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}`
    );
  }

  revertTag(
    accountId: string,
    containerId: string,
    workspaceId: string,
    tagId: string
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags/${tagId}:revert`
    );
  }

  // ─── Triggers ────────────────────────────────────────────────────────────────

  listTriggers(accountId: string, containerId: string, workspaceId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers`
    );
  }

  getTrigger(
    accountId: string,
    containerId: string,
    workspaceId: string,
    triggerId: string
  ) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`
    );
  }

  createTrigger(
    accountId: string,
    containerId: string,
    workspaceId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers`,
      undefined,
      data
    );
  }

  updateTrigger(
    accountId: string,
    containerId: string,
    workspaceId: string,
    triggerId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "PUT",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`,
      undefined,
      data
    );
  }

  deleteTrigger(
    accountId: string,
    containerId: string,
    workspaceId: string,
    triggerId: string
  ) {
    return this.request<unknown>(
      "DELETE",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}`
    );
  }

  revertTrigger(
    accountId: string,
    containerId: string,
    workspaceId: string,
    triggerId: string
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers/${triggerId}:revert`
    );
  }

  // ─── Variables ───────────────────────────────────────────────────────────────

  listVariables(accountId: string, containerId: string, workspaceId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables`
    );
  }

  getVariable(
    accountId: string,
    containerId: string,
    workspaceId: string,
    variableId: string
  ) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`
    );
  }

  createVariable(
    accountId: string,
    containerId: string,
    workspaceId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables`,
      undefined,
      data
    );
  }

  updateVariable(
    accountId: string,
    containerId: string,
    workspaceId: string,
    variableId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "PUT",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`,
      undefined,
      data
    );
  }

  deleteVariable(
    accountId: string,
    containerId: string,
    workspaceId: string,
    variableId: string
  ) {
    return this.request<unknown>(
      "DELETE",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}`
    );
  }

  revertVariable(
    accountId: string,
    containerId: string,
    workspaceId: string,
    variableId: string
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables/${variableId}:revert`
    );
  }

  // ─── Built-In Variables ──────────────────────────────────────────────────────

  listBuiltInVariables(
    accountId: string,
    containerId: string,
    workspaceId: string
  ) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/built_in_variables`
    );
  }

  enableBuiltInVariable(
    accountId: string,
    containerId: string,
    workspaceId: string,
    types: string[]
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/built_in_variables`,
      { type: types }
    );
  }

  disableBuiltInVariable(
    accountId: string,
    containerId: string,
    workspaceId: string,
    path: string
  ) {
    return this.request<unknown>(
      "DELETE",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/built_in_variables`,
      { path }
    );
  }

  revertBuiltInVariable(
    accountId: string,
    containerId: string,
    workspaceId: string,
    type: string
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/built_in_variables:revert`,
      { type }
    );
  }

  // ─── Environments ────────────────────────────────────────────────────────────

  listEnvironments(accountId: string, containerId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/environments`
    );
  }

  getEnvironment(accountId: string, containerId: string, environmentId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/environments/${environmentId}`
    );
  }

  createEnvironment(
    accountId: string,
    containerId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/environments`,
      undefined,
      data
    );
  }

  updateEnvironment(
    accountId: string,
    containerId: string,
    environmentId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "PUT",
      `/accounts/${accountId}/containers/${containerId}/environments/${environmentId}`,
      undefined,
      data
    );
  }

  deleteEnvironment(
    accountId: string,
    containerId: string,
    environmentId: string
  ) {
    return this.request<unknown>(
      "DELETE",
      `/accounts/${accountId}/containers/${containerId}/environments/${environmentId}`
    );
  }

  reauthorizeEnvironment(
    accountId: string,
    containerId: string,
    environmentId: string
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/environments/${environmentId}:reauthorize`
    );
  }

  // ─── Versions ────────────────────────────────────────────────────────────────

  listVersionHeaders(accountId: string, containerId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/version_headers`
    );
  }

  getLiveVersion(accountId: string, containerId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/versions:live`
    );
  }

  getLatestVersion(accountId: string, containerId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/versions:latest`
    );
  }

  getVersion(
    accountId: string,
    containerId: string,
    containerVersionId: string
  ) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/versions/${containerVersionId}`
    );
  }

  publishVersion(
    accountId: string,
    containerId: string,
    containerVersionId: string,
    fingerprint?: string
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/versions/${containerVersionId}:publish`,
      fingerprint ? { fingerprint } : undefined
    );
  }

  setLatestVersion(
    accountId: string,
    containerId: string,
    containerVersionId: string
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/versions/${containerVersionId}:set_latest`
    );
  }

  undeleteVersion(
    accountId: string,
    containerId: string,
    containerVersionId: string
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/versions/${containerVersionId}:undelete`
    );
  }

  updateVersion(
    accountId: string,
    containerId: string,
    containerVersionId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "PUT",
      `/accounts/${accountId}/containers/${containerId}/versions/${containerVersionId}`,
      undefined,
      data
    );
  }

  deleteVersion(
    accountId: string,
    containerId: string,
    containerVersionId: string
  ) {
    return this.request<unknown>(
      "DELETE",
      `/accounts/${accountId}/containers/${containerId}/versions/${containerVersionId}`
    );
  }

  // ─── Folders ─────────────────────────────────────────────────────────────────

  listFolders(accountId: string, containerId: string, workspaceId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders`
    );
  }

  getFolder(
    accountId: string,
    containerId: string,
    workspaceId: string,
    folderId: string
  ) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}`
    );
  }

  createFolder(
    accountId: string,
    containerId: string,
    workspaceId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders`,
      undefined,
      data
    );
  }

  updateFolder(
    accountId: string,
    containerId: string,
    workspaceId: string,
    folderId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "PUT",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}`,
      undefined,
      data
    );
  }

  deleteFolder(
    accountId: string,
    containerId: string,
    workspaceId: string,
    folderId: string
  ) {
    return this.request<unknown>(
      "DELETE",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}`
    );
  }

  revertFolder(
    accountId: string,
    containerId: string,
    workspaceId: string,
    folderId: string
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}:revert`
    );
  }

  listFolderEntities(
    accountId: string,
    containerId: string,
    workspaceId: string,
    folderId: string
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}:entities`
    );
  }

  moveEntitiesToFolder(
    accountId: string,
    containerId: string,
    workspaceId: string,
    folderId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/folders/${folderId}:move_entities_to_folder`,
      undefined,
      data
    );
  }

  // ─── Templates (Custom Templates) ────────────────────────────────────────────

  listTemplates(accountId: string, containerId: string, workspaceId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/templates`
    );
  }

  getTemplate(
    accountId: string,
    containerId: string,
    workspaceId: string,
    templateId: string
  ) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/templates/${templateId}`
    );
  }

  createTemplate(
    accountId: string,
    containerId: string,
    workspaceId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/templates`,
      undefined,
      data
    );
  }

  updateTemplate(
    accountId: string,
    containerId: string,
    workspaceId: string,
    templateId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "PUT",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/templates/${templateId}`,
      undefined,
      data
    );
  }

  deleteTemplate(
    accountId: string,
    containerId: string,
    workspaceId: string,
    templateId: string
  ) {
    return this.request<unknown>(
      "DELETE",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/templates/${templateId}`
    );
  }

  revertTemplate(
    accountId: string,
    containerId: string,
    workspaceId: string,
    templateId: string
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/templates/${templateId}:revert`
    );
  }

  // ─── Zones ───────────────────────────────────────────────────────────────────

  listZones(accountId: string, containerId: string, workspaceId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/zones`
    );
  }

  getZone(
    accountId: string,
    containerId: string,
    workspaceId: string,
    zoneId: string
  ) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/zones/${zoneId}`
    );
  }

  createZone(
    accountId: string,
    containerId: string,
    workspaceId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/zones`,
      undefined,
      data
    );
  }

  updateZone(
    accountId: string,
    containerId: string,
    workspaceId: string,
    zoneId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "PUT",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/zones/${zoneId}`,
      undefined,
      data
    );
  }

  deleteZone(
    accountId: string,
    containerId: string,
    workspaceId: string,
    zoneId: string
  ) {
    return this.request<unknown>(
      "DELETE",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/zones/${zoneId}`
    );
  }

  revertZone(
    accountId: string,
    containerId: string,
    workspaceId: string,
    zoneId: string
  ) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/zones/${zoneId}:revert`
    );
  }

  // ─── User Permissions ────────────────────────────────────────────────────────

  listUserPermissions(accountId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/user_permissions`
    );
  }

  getUserPermission(accountId: string, userPermissionId: string) {
    return this.request<unknown>(
      "GET",
      `/accounts/${accountId}/user_permissions/${userPermissionId}`
    );
  }

  createUserPermission(accountId: string, data: Record<string, unknown>) {
    return this.request<unknown>(
      "POST",
      `/accounts/${accountId}/user_permissions`,
      undefined,
      data
    );
  }

  updateUserPermission(
    accountId: string,
    userPermissionId: string,
    data: Record<string, unknown>
  ) {
    return this.request<unknown>(
      "PUT",
      `/accounts/${accountId}/user_permissions/${userPermissionId}`,
      undefined,
      data
    );
  }

  deleteUserPermission(accountId: string, userPermissionId: string) {
    return this.request<unknown>(
      "DELETE",
      `/accounts/${accountId}/user_permissions/${userPermissionId}`
    );
  }
}
