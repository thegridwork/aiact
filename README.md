# gridwork-aiact

MCP server that scans codebases for AI system usage and generates EU AI Act compliance reports.

**EU AI Act high-risk deadline: August 2, 2026.**

## What it does

- Scans project files for AI libraries, APIs, and frameworks
- Detects 30+ AI systems: OpenAI, Anthropic, Google, PyTorch, TensorFlow, HuggingFace, LangChain, and more
- Classifies risk level per EU AI Act (unacceptable / high / limited / minimal)
- Identifies compliance gaps against Annex III categories
- Generates formal inventory documents for compliance records
- Counts days until the August 2, 2026 deadline

## Install

```bash
npx gridwork-aiact
```

## MCP tools

| Tool | Description |
|------|-------------|
| `scan_project` | Full scan with risk classification and compliance gap analysis |
| `quick_check` | Fast count of AI systems without full analysis |
| `generate_inventory` | Formal EU AI Act inventory document |
| `classify_system` | Classify risk for a specific AI system by use case |

## Claude Desktop config

```json
{
  "mcpServers": {
    "gridwork-aiact": {
      "command": "npx",
      "args": ["-y", "gridwork-aiact"]
    }
  }
}
```

## License

MIT — [Gridwork](https://thegridwork.space)
