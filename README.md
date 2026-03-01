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

Common pattern across MCP server repos: CLI install commands usually register the server command, while credentials are supplied either via `--env` flags (if supported) or an `env` block in the client config file.

<details>
  <summary>Amp</summary>
  Follow https://ampcode.com/manual#mcp and use the config provided above. You can also install the server using the CLI:

```bash
amp mcp add auspost -- npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

</details>

<details>
  <summary>Antigravity</summary>

To use this server, follow the instructions from <a href="https://antigravity.google/docs/mcp">Antigravity docs</a> to install a custom MCP server. Add the following config:

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

Use the Claude Code CLI to add this MCP server (<a href="https://code.claude.com/docs/en/mcp">guide</a>):

```bash
claude mcp add --scope user --transport stdio \
  --env AUSPOST_API_KEY=your-key \
  --env AUSPOST_API_PASSWORD=your-password \
  --env AUSPOST_ACCOUNT_NUMBER=0XXXXXXXXX \
  --env AUSPOST_BASE_URL=https://digitalapi.auspost.com.au/test/shipping/v1 \
  auspost -- npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

Or set environment variable expansion in `.mcp.json`:

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
  Follow https://docs.cline.bot/mcp/configuring-mcp-servers and use the config provided above.
</details>

<details>
  <summary>Codex</summary>
  Follow the <a href="https://developers.openai.com/codex/mcp/#configure-with-the-cli">configure MCP guide</a>
  using the standard config from above. You can also install using the Codex CLI:

```bash
codex mcp add \
  --env AUSPOST_API_KEY=your-key \
  --env AUSPOST_API_PASSWORD=your-password \
  --env AUSPOST_ACCOUNT_NUMBER=0XXXXXXXXX \
  --env AUSPOST_BASE_URL=https://digitalapi.auspost.com.au/test/shipping/v1 \
  auspost -- npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

**On Windows 11**

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

Start Copilot CLI:

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

</details>

<details>
  <summary>Copilot / VS Code</summary>

Follow the MCP install <a href="https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server">guide</a>,
with the standard config from above. You can also install using the VS Code CLI:

```bash
code --add-mcp '{"name":"auspost","command":"npx","args":["-y","auspost-shipping-and-tracking-api-mcp-server@latest"],"env":{"AUSPOST_API_KEY":"...","AUSPOST_API_PASSWORD":"...","AUSPOST_ACCOUNT_NUMBER":"...","AUSPOST_BASE_URL":"https://digitalapi.auspost.com.au/test/shipping/v1"}}'
```

</details>

<details>
  <summary>Cursor</summary>

Go to `Cursor Settings` -> `MCP` -> `New MCP Server`. Use the config provided above.

</details>

<details>
  <summary>Factory CLI</summary>
Use the Factory CLI to add the server (<a href="https://docs.factory.ai/cli/configuration/mcp">guide</a>):

```bash
droid mcp add auspost "npx -y auspost-shipping-and-tracking-api-mcp-server@latest"
```

</details>

<details>
  <summary>Gemini CLI</summary>
Install using the Gemini CLI.

**Project wide:**

```bash
gemini mcp add auspost npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

**Globally:**

```bash
gemini mcp add -s user auspost npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

Alternatively, follow the <a href="https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md#how-to-set-up-your-mcp-server">MCP guide</a> and use the standard config from above.

</details>

<details>
  <summary>Gemini Code Assist</summary>
  Follow the <a href="https://cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer#configure-mcp-servers">configure MCP guide</a>
  using the standard config from above.
</details>

<details>
  <summary>JetBrains AI Assistant & Junie</summary>

Go to `Settings | Tools | AI Assistant | Model Context Protocol (MCP)` -> `Add`. Use the config provided above.
The same way this server can be configured for JetBrains Junie in `Settings | Tools | Junie | MCP Settings` -> `Add`.

</details>

<details>
  <summary>Kiro</summary>

In **Kiro Settings**, go to `Configure MCP` > `Open Workspace or User MCP Config` > Use the configuration snippet provided above.

Or, from the IDE **Activity Bar** > `Kiro` > `MCP Servers` > `Open MCP Config`.

</details>

<details>
  <summary>Katalon Studio</summary>

This MCP server can be used with <a href="https://docs.katalon.com/katalon-studio/studioassist/mcp-servers/setting-up-mcp-proxy-for-stdio-mcp-servers">Katalon MCP proxy</a>.

Start with proxy:

```bash
mcp-proxy --transport streamablehttp --port 8080 -- npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

Then in Katalon Studio:

- **Connection URL:** `http://127.0.0.1:8080/mcp`
- **Transport type:** `HTTP`

</details>

<details>
  <summary>OpenCode</summary>

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

In **Qoder Settings**, go to `MCP Server` > `+ Add` > Use the configuration snippet provided above.

Alternatively, follow the <a href="https://docs.qoder.com/user-guide/chat/model-context-protocol">MCP guide</a>.

</details>

<details>
  <summary>Qoder CLI</summary>

Install using the Qoder CLI (<a href="https://docs.qoder.com/cli/using-cli#mcp-servers">guide</a>):

**Project wide:**

```bash
qodercli mcp add auspost -- npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

**Globally:**

```bash
qodercli mcp add -s user auspost -- npx -y auspost-shipping-and-tracking-api-mcp-server@latest
```

</details>

<details>
  <summary>Visual Studio</summary>
  Follow Visual Studio MCP setup and add a local server using the standard config above.
</details>

<details>
  <summary>Warp</summary>

Go to `Settings | AI | Manage MCP Servers` -> `+ Add` to [add an MCP Server](https://docs.warp.dev/knowledge-and-collaboration/mcp#adding-an-mcp-server). Use the config provided above.

</details>

<details>
  <summary>Windsurf</summary>
  Follow the <a href="https://docs.windsurf.com/windsurf/cascade/mcp#mcp-config-json">configure MCP guide</a>
  using the standard config from above.
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
