# auspost-shipping-and-tracking-api-mcp-server

MCP server (stdio) for Australia Post Shipping and Tracking APIs, with both atomic API tools and guided fulfillment workflow tools.

SDK documentation moved to [readme-sdk.me](./readme-sdk.me).

## Official Documentation

- [Australia Post Developer Portal](https://developers.auspost.com.au/)
- [Shipping & Tracking API Documentation](https://developers.auspost.com.au/apis/shipping-tracking)

## Requirements

- Node.js 18+ (recommended: Node.js 20 LTS or newer).
- npm.
- Environment variables:
  - `AUSPOST_API_KEY`
  - `AUSPOST_API_PASSWORD`
  - `AUSPOST_ACCOUNT_NUMBER`
  - Optional: `AUSPOST_BASE_URL`, `AUSPOST_TIMEOUT`

## Getting started

Add the config below to your MCP client.

### Testbed example

```json
{
  "mcpServers": {
    "auspost": {
      "command": "npx",
      "args": ["-y", "auspost-shipping-and-tracking-api-mcp-server@latest"],
      "env": {
        "AUSPOST_API_KEY": "testbed-key",
        "AUSPOST_API_PASSWORD": "testbed-password",
        "AUSPOST_ACCOUNT_NUMBER": "any-testbed-value",
        "AUSPOST_BASE_URL": "https://digitalapi.auspost.com.au/test/shipping/v1"
      }
    }
  }
}
```

### Production example

```json
{
  "mcpServers": {
    "auspost": {
      "command": "npx",
      "args": ["-y", "auspost-shipping-and-tracking-api-mcp-server@latest"],
      "env": {
        "AUSPOST_API_KEY": "your-live-key",
        "AUSPOST_API_PASSWORD": "your-live-password",
        "AUSPOST_ACCOUNT_NUMBER": "0XXXXXXXXX",
        "AUSPOST_BASE_URL": "https://digitalapi.auspost.com.au/shipping/v1"
      }
    }
  }
}
```

Credential guide:

- `AUSPOST_API_KEY`: provided by Australia Post/StarTrack for your account and environment.
- `AUSPOST_ACCOUNT_NUMBER`:
  - Australia Post customers: 10 digits, starts with `0`.
  - StarTrack customers: 8 digits.
  - Testbed: can be any format.

## MCP Client configuration

Use either the Testbed or Production config shown above.

Use `--env` flags where supported, or set `env` in the client config.
Each section follows: `Install` -> `Config location` -> `Env setup`.

Env block for all clients:

```json
"env": {
  "AUSPOST_API_KEY": "...",
  "AUSPOST_API_PASSWORD": "...",
  "AUSPOST_ACCOUNT_NUMBER": "...",
  "AUSPOST_BASE_URL": "https://digitalapi.auspost.com.au/test/shipping/v1"
}
```

<details>
  <summary>Amp</summary>

Install:

```bash
amp mcp add auspost -- npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

Config location:
- Amp settings (`amp.mcpServers`) in:
  - macOS/Linux: `~/.config/amp/settings.json`
  - Windows: `%USERPROFILE%\.config\amp\settings.json`

Env setup:
- Add the shared `env` block to `auspost`.

</details>

<details>
  <summary>Antigravity</summary>

Install:
- Add a custom MCP server in Antigravity using their MCP setup flow.

Config location:
- Antigravity MCP configuration in app settings.

Env setup:
- Use this config:

```json
{
  "mcpServers": {
    "auspost": {
      "command": "npx",
      "args": ["-y", "auspost-shipping-and-tracking-api-mcp-server@latest"],
      "env": {
        "AUSPOST_API_KEY": "...",
        "AUSPOST_API_PASSWORD": "...",
        "AUSPOST_ACCOUNT_NUMBER": "...",
        "AUSPOST_BASE_URL": "https://digitalapi.auspost.com.au/test/shipping/v1"
      }
    }
  }
}
```

</details>

<details>
  <summary>Claude Code</summary>

Install:
- CLI:

```bash
claude mcp add --scope user --transport stdio \
  --env AUSPOST_API_KEY=your-key \
  --env AUSPOST_API_PASSWORD=your-password \
  --env AUSPOST_ACCOUNT_NUMBER=0XXXXXXXXX \
  --env AUSPOST_BASE_URL=https://digitalapi.auspost.com.au/test/shipping/v1 \
  auspost -- npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

Config location:
- `--scope local` (default): local scope config
- `--scope project`: `.mcp.json`
- `--scope user`: user-level Claude config

Env setup:
- Use CLI `--env` flags above, or `.mcp.json` env expansion:

```json
{
  "mcpServers": {
    "auspost": {
      "command": "npx",
      "args": ["-y", "auspost-shipping-and-tracking-api-mcp-server@latest"],
      "env": {
        "AUSPOST_API_KEY": "${AUSPOST_API_KEY}",
        "AUSPOST_API_PASSWORD": "${AUSPOST_API_PASSWORD}",
        "AUSPOST_ACCOUNT_NUMBER": "${AUSPOST_ACCOUNT_NUMBER}",
        "AUSPOST_BASE_URL": "${AUSPOST_BASE_URL:-https://digitalapi.auspost.com.au/test/shipping/v1}"
      }
    }
  }
}
```

</details>

<details>
  <summary>Cline</summary>

Install:
- Add a new MCP server from Cline MCP settings.

Config location:
- `cline_mcp_settings.json`

Env setup:
- Add the shared `env` block.
</details>

<details>
  <summary>Codex</summary>

Install:
- CLI:

```bash
codex mcp add \
  --env AUSPOST_API_KEY=your-key \
  --env AUSPOST_API_PASSWORD=your-password \
  --env AUSPOST_ACCOUNT_NUMBER=0XXXXXXXXX \
  --env AUSPOST_BASE_URL=https://digitalapi.auspost.com.au/test/shipping/v1 \
  auspost -- npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

Config location:
- `config.toml`

Env setup:
- Use CLI `--env` flags above, or set `env` in `config.toml`.

**Windows 11 example**

Configure `.codex/config.toml`:

```toml
[mcp_servers.auspost]
command = "cmd"
args = [
    "/c",
    "npx",
    "-y",
    "auspost-shipping-and-tracking-api-mcp-server@latest",
]
env = { SystemRoot="C:\\Windows", PROGRAMFILES="C:\\Program Files" }
startup_timeout_ms = 20_000
```

If your Codex setup does not already inherit these from the shell, include required API variables in `env`:

```toml
env = {
  SystemRoot = "C:\\Windows",
  PROGRAMFILES = "C:\\Program Files",
  AUSPOST_API_KEY = "your-key",
  AUSPOST_API_PASSWORD = "your-password",
  AUSPOST_ACCOUNT_NUMBER = "0XXXXXXXXX",
  AUSPOST_BASE_URL = "https://digitalapi.auspost.com.au/test/shipping/v1"
}
```

</details>

<details>
  <summary>Copilot CLI</summary>

Install:
- Start Copilot CLI:

```bash
copilot
```

Run:

```bash
/mcp add
```

Configure:

- **Server name:** `auspost`
- **Server Type:** `[1] Local`
- **Command:** `npx -y auspost-shipping-and-tracking-api-mcp-server@latest`

Config location:
- `~/.copilot/mcp-config.json`

Env setup:
- Add AUSPOST variables in `env`.

</details>

<details>
  <summary>Copilot / VS Code</summary>

Install:
- Use VS Code MCP setup UI or CLI:

```bash
code --add-mcp '{"name":"auspost","command":"npx","args":["-y","auspost-shipping-and-tracking-api-mcp-server@latest"],"env":{"AUSPOST_API_KEY":"...","AUSPOST_API_PASSWORD":"...","AUSPOST_ACCOUNT_NUMBER":"...","AUSPOST_BASE_URL":"https://digitalapi.auspost.com.au/test/shipping/v1"}}'
```

Config location:
- User MCP config (`MCP: Open User Configuration`)
- Project MCP config: `.vscode/mcp.json`

Env setup:
- Ensure `env` includes AUSPOST variables.

</details>

<details>
  <summary>Cursor</summary>

Install:
- `Cursor Settings` -> `MCP` -> `New MCP Server`

Config location:
- Global: `~/.cursor/mcp.json`
- Project: `.cursor/mcp.json`

Env setup:
- Add the shared `env` block.

</details>

<details>
  <summary>Factory CLI</summary>

Install:
- CLI:

```bash
droid mcp add auspost "npx -y auspost-shipping-and-tracking-api-mcp-server@latest"
```

Config location:
- User: `~/.factory/mcp.json`
- Project: `.factory/mcp.json`

Env setup:
- After install, add the shared `env` block.

</details>

<details>
  <summary>Gemini CLI</summary>

Install:
- CLI:

**Project wide:**

```bash
gemini mcp add auspost npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

**Globally:**

```bash
gemini mcp add -s user auspost npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

Alternatively, follow the <a href="https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md#how-to-set-up-your-mcp-server">MCP guide</a> and use the standard config from above.

Config location:
- User: `~/.gemini/settings.json`
- Project: `.gemini/settings.json`

Env setup:
- For both scopes, ensure config includes the shared `env` block.
- Gemini CLI also supports `-e/--env` flags in `gemini mcp add`.

</details>

<details>
  <summary>Gemini Code Assist</summary>

Install:
- Use Gemini Code Assist MCP server setup in IDE settings.

Config location:
- Gemini Code Assist MCP configuration in IDE/workspace settings.

Env setup:
- Include the shared `env` block in local server config.
</details>

<details>
  <summary>JetBrains AI Assistant & Junie</summary>

Install:
- AI Assistant: `Settings | Tools | AI Assistant | Model Context Protocol (MCP)` -> `Add`
- Junie: `Settings | Tools | Junie | MCP Settings` -> `Add`

Config location:
- JetBrains MCP configuration from those settings panels.

Env setup:
- Ensure the server entry includes the shared `env` block.

</details>

<details>
  <summary>Kiro</summary>

Install:
- In **Kiro Settings**, go to `Configure MCP` -> `Open Workspace or User MCP Config`
- Or IDE **Activity Bar** -> `Kiro` -> `MCP Servers` -> `Open MCP Config`

Config location:
- Kiro workspace/user MCP config file.

Env setup:
- Ensure the server entry includes the shared `env` block.

</details>

<details>
  <summary>Katalon Studio</summary>

Install:
- Start proxy and configure Katalon to connect to the proxy.

Start with proxy (either export variables in your shell first, or set them inline):

```bash
AUSPOST_API_KEY=... AUSPOST_API_PASSWORD=... AUSPOST_ACCOUNT_NUMBER=... \
AUSPOST_BASE_URL=https://digitalapi.auspost.com.au/test/shipping/v1 \
mcp-proxy --transport streamablehttp --port 8080 -- npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

Then in Katalon Studio:

- **Connection URL:** `http://127.0.0.1:8080/mcp`
- **Transport type:** `HTTP`

Config location:
- Katalon MCP connection settings (URL + transport).

Env setup:
- Set AUSPOST env vars in the shell running `mcp-proxy` (as shown above) so they are inherited by the stdio server.

</details>

<details>
  <summary>OpenCode</summary>

Install:
- Add a local MCP server entry in OpenCode config.

Config location:
- `~/.config/opencode/opencode.json`

Env setup:
- Include the shared `env` block:

Add to `~/.config/opencode/opencode.json` (<a href="https://opencode.ai/docs/mcp-servers">guide</a>):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "auspost": {
      "type": "local",
      "command": ["npx", "-y", "auspost-shipping-and-tracking-api-mcp-server@latest"],
      "env": {
        "AUSPOST_API_KEY": "...",
        "AUSPOST_API_PASSWORD": "...",
        "AUSPOST_ACCOUNT_NUMBER": "...",
        "AUSPOST_BASE_URL": "https://digitalapi.auspost.com.au/test/shipping/v1"
      }
    }
  }
}
```

</details>

<details>
  <summary>Qoder</summary>

Install:
- In **Qoder Settings**, go to `MCP Server` -> `+ Add`

Config location:
- User: `~/.qoder.json`
- Project: `.mcp.json`
- Reference: <a href="https://docs.qoder.com/user-guide/chat/model-context-protocol">Qoder MCP guide</a>

Env setup:
- Ensure the server entry includes the shared `env` block.

</details>

<details>
  <summary>Qoder CLI</summary>

Install:
- Qoder CLI:

**Project wide:**

```bash
qodercli mcp add auspost -- npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

**Globally:**

```bash
qodercli mcp add -s user auspost -- npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

Config location:
- User: `~/.qoder.json`
- Project: `.mcp.json`
- Reference: <a href="https://docs.qoder.com/cli/using-cli#mcp-servers">Qoder CLI guide</a>

Env setup:
- After install, add the shared `env` block.

</details>

<details>
  <summary>Visual Studio</summary>

Install:
- Follow Visual Studio MCP setup and add a local server.

Config location:
- `.mcp.json` in the solution folder or `%USERPROFILE%`

Env setup:
- Include the required AUSPOST variables in the server `env` configuration.
</details>

<details>
  <summary>Warp</summary>

Install:
- `Settings | AI | Manage MCP Servers` -> `+ Add`

Config location:
- Warp MCP server configuration managed from Warp settings UI.

Env setup:
- Include the shared `env` block in the `auspost` server entry.

</details>

<details>
  <summary>Windsurf</summary>

Install:
- Configure in Windsurf MCP settings (`Cascade` -> MCP).

Config location:
- `~/.codeium/windsurf/mcp_config.json`

Env setup:
- Include the shared `env` block in the `auspost` server entry.
</details>

## Tools

Account and address (2 tools):

- `auspost_get_account_details`
- `auspost_validate_suburb`

Pricing (2 tools):

- `auspost_get_item_prices`
- `auspost_get_shipment_price`

Shipments (6 tools):

- `auspost_validate_shipment`
- `auspost_create_shipment`
- `auspost_get_shipment`
- `auspost_get_shipments`
- `auspost_update_shipment`
- `auspost_delete_shipment`

Labels (2 tools):

- `auspost_create_labels`
- `auspost_get_label`

Orders (3 tools):

- `auspost_create_order`
- `auspost_get_order`
- `auspost_get_order_summary`

Tracking (1 tool):

- `auspost_track_items`

Guided workflow (2 tools):

- `auspost_run_fulfillment_flow`
- `auspost_get_fulfillment_state`

Prompt (1 prompt):

- `auspost_fulfillment_assistant`

## Notes

- Tracking tool enforces max 10 IDs per request.
- ZPL labels enforce max 50 shipments.
- Order summary tool saves PDF to local disk and returns metadata (`path`, `bytes`, `sha256`), never base64 content.
- Workflow state is in-memory with 2-hour TTL and does not persist across restarts.
