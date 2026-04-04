import type { AICategory } from "../types.js";

export interface DetectionPattern {
  name: string;
  provider: string;
  category: AICategory;
  patterns: RegExp[];
  fileGlobs: string[];
  confidence: "high" | "medium" | "low";
}

export const AI_PATTERNS: DetectionPattern[] = [
  // ── LLM APIs (high risk potential) ──
  {
    name: "OpenAI",
    provider: "OpenAI",
    category: "llm-api",
    patterns: [
      /import\s+(?:OpenAI|{[^}]*OpenAI[^}]*})\s+from\s+["']openai["']/,
      /from\s+openai\s+import/,
      /require\s*\(\s*["']openai["']\s*\)/,
      /new\s+OpenAI\s*\(/,
      /openai\.ChatCompletion/,
      /openai\.chat\.completions/,
      /OPENAI_API_KEY/,
      /api\.openai\.com/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*", "*.yaml", "*.yml", "*.toml"],
    confidence: "high",
  },
  {
    name: "Anthropic Claude",
    provider: "Anthropic",
    category: "llm-api",
    patterns: [
      /import\s+Anthropic\s+from\s+["']@anthropic-ai\/sdk["']/,
      /from\s+anthropic\s+import/,
      /require\s*\(\s*["']@anthropic-ai\/sdk["']\s*\)/,
      /new\s+Anthropic\s*\(/,
      /ANTHROPIC_API_KEY/,
      /api\.anthropic\.com/,
      /claude-\d/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*", "*.yaml", "*.yml"],
    confidence: "high",
  },
  {
    name: "Google Gemini",
    provider: "Google",
    category: "llm-api",
    patterns: [
      /import\s+.*from\s+["']@google\/generative-ai["']/,
      /from\s+google\.generativeai\s+import/,
      /generativelanguage\.googleapis\.com/,
      /GOOGLE_AI_API_KEY/,
      /GEMINI_API_KEY/,
      /gemini-\d/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },
  {
    name: "Azure OpenAI",
    provider: "Microsoft",
    category: "llm-api",
    patterns: [
      /AZURE_OPENAI/,
      /azure\.openai/i,
      /openai\.azure\.com/,
      /AzureOpenAI/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*", "*.yaml", "*.yml"],
    confidence: "high",
  },
  {
    name: "Mistral",
    provider: "Mistral AI",
    category: "llm-api",
    patterns: [
      /from\s+mistralai\s+import/,
      /import\s+.*from\s+["']@mistralai\/client["']/,
      /MISTRAL_API_KEY/,
      /mistral-\w+/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },
  {
    name: "Cohere",
    provider: "Cohere",
    category: "llm-api",
    patterns: [
      /from\s+cohere\s+import/,
      /import\s+.*from\s+["']cohere-ai["']/,
      /COHERE_API_KEY/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },
  {
    name: "Replicate",
    provider: "Replicate",
    category: "llm-api",
    patterns: [
      /from\s+replicate\s+import/,
      /import\s+Replicate\s+from\s+["']replicate["']/,
      /REPLICATE_API_TOKEN/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },
  {
    name: "Together AI",
    provider: "Together AI",
    category: "llm-api",
    patterns: [
      /TOGETHER_API_KEY/,
      /api\.together\.xyz/,
      /together\.ai/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "medium",
  },

  // ── Additional LLM APIs ──
  {
    name: "Groq",
    provider: "Groq",
    category: "llm-api",
    patterns: [
      /from\s+groq\s+import/,
      /import\s+Groq\s+from\s+["']groq["']/,
      /GROQ_API_KEY/,
      /api\.groq\.com/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },
  {
    name: "AWS Bedrock",
    provider: "Amazon",
    category: "llm-api",
    patterns: [
      /bedrock-runtime/,
      /BedrockRuntime/,
      /invoke_model/,
      /bedrock\.amazonaws\.com/,
      /AWS_BEDROCK/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*", "*.yaml", "*.yml"],
    confidence: "high",
  },
  {
    name: "Deepseek",
    provider: "Deepseek",
    category: "llm-api",
    patterns: [
      /DEEPSEEK_API_KEY/,
      /api\.deepseek\.com/,
      /deepseek-chat/,
      /deepseek-coder/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },
  {
    name: "Claude Agent SDK",
    provider: "Anthropic",
    category: "llm-api",
    patterns: [
      /from\s+claude_agent_sdk\s+import/,
      /import\s+.*from\s+["']claude_agent_sdk["']/,
      /import\s+.*from\s+["']@anthropic-ai\/agent["']/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py"],
    confidence: "high",
  },
  {
    name: "Cerebras",
    provider: "Cerebras",
    category: "llm-api",
    patterns: [
      /CEREBRAS_API_KEY/,
      /api\.cerebras\.ai/,
      /from\s+cerebras\s+import/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },
  {
    name: "Fireworks AI",
    provider: "Fireworks",
    category: "llm-api",
    patterns: [
      /FIREWORKS_API_KEY/,
      /api\.fireworks\.ai/,
      /fireworks\.ai/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "medium",
  },
  {
    name: "Perplexity",
    provider: "Perplexity",
    category: "llm-api",
    patterns: [
      /PERPLEXITY_API_KEY/,
      /api\.perplexity\.ai/,
      /pplx-api/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },

  // ── Image/Media Generation ──
  {
    name: "DALL-E",
    provider: "OpenAI",
    category: "computer-vision",
    patterns: [
      /openai\.images/,
      /dall-e/i,
      /images\.generate/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py"],
    confidence: "high",
  },
  {
    name: "Stability AI",
    provider: "Stability AI",
    category: "computer-vision",
    patterns: [
      /STABILITY_API_KEY/,
      /api\.stability\.ai/,
      /stable-diffusion/i,
      /from\s+stability_sdk\s+import/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },
  {
    name: "ElevenLabs",
    provider: "ElevenLabs",
    category: "speech",
    patterns: [
      /ELEVENLABS_API_KEY/,
      /api\.elevenlabs\.io/,
      /from\s+elevenlabs\s+import/,
      /import\s+.*from\s+["']elevenlabs["']/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },

  // ── Additional NLP ──
  {
    name: "spaCy",
    provider: "Explosion",
    category: "nlp",
    patterns: [
      /import\s+spacy/,
      /from\s+spacy\s+import/,
      /spacy\.load\s*\(/,
    ],
    fileGlobs: ["*.py"],
    confidence: "high",
  },

  // ── Additional Computer Vision ──
  {
    name: "Detectron2",
    provider: "Meta",
    category: "computer-vision",
    patterns: [
      /from\s+detectron2\s+import/,
      /import\s+detectron2/,
    ],
    fileGlobs: ["*.py"],
    confidence: "high",
  },

  // ── Additional Vector DBs ──
  {
    name: "Qdrant",
    provider: "Qdrant",
    category: "embedding",
    patterns: [
      /from\s+qdrant_client\s+import/,
      /import\s+.*from\s+["']@qdrant\/js-client-rest["']/,
      /QDRANT_URL/,
      /QDRANT_API_KEY/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },
  {
    name: "Milvus",
    provider: "Zilliz",
    category: "embedding",
    patterns: [
      /from\s+pymilvus\s+import/,
      /import\s+pymilvus/,
      /MILVUS_HOST/,
    ],
    fileGlobs: ["*.py", "*.env*"],
    confidence: "high",
  },

  // ── ML Frameworks ──
  {
    name: "PyTorch",
    provider: "Meta/PyTorch Foundation",
    category: "ml-framework",
    patterns: [
      /import\s+torch/,
      /from\s+torch\s+import/,
      /torch\.nn/,
      /torch\.cuda/,
      /torch\.load/,
    ],
    fileGlobs: ["*.py"],
    confidence: "high",
  },
  {
    name: "TensorFlow",
    provider: "Google",
    category: "ml-framework",
    patterns: [
      /import\s+tensorflow/,
      /from\s+tensorflow\s+import/,
      /tf\.keras/,
      /tf\.data/,
      /tf\.train/,
    ],
    fileGlobs: ["*.py"],
    confidence: "high",
  },
  {
    name: "Keras",
    provider: "Google",
    category: "ml-framework",
    patterns: [
      /from\s+keras\s+import/,
      /import\s+keras/,
      /keras\.models/,
      /keras\.layers/,
    ],
    fileGlobs: ["*.py"],
    confidence: "high",
  },
  {
    name: "scikit-learn",
    provider: "Open Source",
    category: "ml-framework",
    patterns: [
      /from\s+sklearn\s+import/,
      /import\s+sklearn/,
      /from\s+sklearn\.\w+\s+import/,
    ],
    fileGlobs: ["*.py"],
    confidence: "high",
  },
  {
    name: "JAX",
    provider: "Google",
    category: "ml-framework",
    patterns: [
      /import\s+jax/,
      /from\s+jax\s+import/,
      /jax\.numpy/,
    ],
    fileGlobs: ["*.py"],
    confidence: "high",
  },

  // ── HuggingFace Ecosystem ──
  {
    name: "HuggingFace Transformers",
    provider: "HuggingFace",
    category: "nlp",
    patterns: [
      /from\s+transformers\s+import/,
      /import\s+transformers/,
      /AutoModel/,
      /AutoTokenizer/,
      /pipeline\s*\(\s*["'](text-generation|sentiment|translation|summarization)/,
    ],
    fileGlobs: ["*.py"],
    confidence: "high",
  },
  {
    name: "HuggingFace Hub",
    provider: "HuggingFace",
    category: "general-ai",
    patterns: [
      /from\s+huggingface_hub\s+import/,
      /import\s+.*from\s+["']@huggingface\/inference["']/,
      /HUGGINGFACE_TOKEN/,
      /HF_TOKEN/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },

  // ── Computer Vision ──
  {
    name: "OpenCV",
    provider: "Open Source",
    category: "computer-vision",
    patterns: [
      /import\s+cv2/,
      /from\s+cv2\s+import/,
    ],
    fileGlobs: ["*.py"],
    confidence: "medium",
  },
  {
    name: "YOLO",
    provider: "Ultralytics",
    category: "computer-vision",
    patterns: [
      /from\s+ultralytics\s+import/,
      /import\s+ultralytics/,
      /YOLO\s*\(/,
    ],
    fileGlobs: ["*.py"],
    confidence: "high",
  },

  // ── Speech ──
  {
    name: "Whisper",
    provider: "OpenAI",
    category: "speech",
    patterns: [
      /import\s+whisper/,
      /whisper\.load_model/,
      /openai\.audio/,
    ],
    fileGlobs: ["*.py", "*.ts", "*.js"],
    confidence: "high",
  },

  // ── LangChain / Orchestration ──
  {
    name: "LangChain",
    provider: "LangChain",
    category: "general-ai",
    patterns: [
      /from\s+langchain\s+import/,
      /import\s+.*from\s+["']langchain["']/,
      /from\s+langchain_\w+\s+import/,
      /import\s+.*from\s+["']@langchain\//,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py"],
    confidence: "high",
  },
  {
    name: "LlamaIndex",
    provider: "LlamaIndex",
    category: "general-ai",
    patterns: [
      /from\s+llama_index\s+import/,
      /import\s+.*from\s+["']llamaindex["']/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py"],
    confidence: "high",
  },
  {
    name: "Vercel AI SDK",
    provider: "Vercel",
    category: "llm-api",
    patterns: [
      /import\s+.*from\s+["']ai["']/,
      /import\s+.*from\s+["']@ai-sdk\//,
      /generateText\s*\(/,
      /streamText\s*\(/,
    ],
    fileGlobs: ["*.ts", "*.js"],
    confidence: "medium",
  },

  // ── Embeddings ──
  {
    name: "Pinecone",
    provider: "Pinecone",
    category: "embedding",
    patterns: [
      /from\s+pinecone\s+import/,
      /import\s+.*from\s+["']@pinecone-database\/pinecone["']/,
      /PINECONE_API_KEY/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },
  {
    name: "Weaviate",
    provider: "Weaviate",
    category: "embedding",
    patterns: [
      /import\s+weaviate/,
      /from\s+weaviate\s+import/,
      /WEAVIATE_URL/,
    ],
    fileGlobs: ["*.ts", "*.js", "*.py", "*.env*"],
    confidence: "high",
  },
  {
    name: "ChromaDB",
    provider: "Chroma",
    category: "embedding",
    patterns: [
      /import\s+chromadb/,
      /from\s+chromadb\s+import/,
    ],
    fileGlobs: ["*.py"],
    confidence: "high",
  },

  // ── Inference Servers ──
  {
    name: "vLLM",
    provider: "vLLM",
    category: "inference-server",
    patterns: [
      /from\s+vllm\s+import/,
      /import\s+vllm/,
    ],
    fileGlobs: ["*.py"],
    confidence: "high",
  },
  {
    name: "llama.cpp",
    provider: "Open Source",
    category: "inference-server",
    patterns: [
      /llama_cpp/,
      /llama\.cpp/,
      /GGUF/,
      /ggml/,
    ],
    fileGlobs: ["*.py", "*.ts", "*.js", "*.yaml", "*.yml", "Dockerfile*"],
    confidence: "medium",
  },
  {
    name: "Ollama",
    provider: "Ollama",
    category: "inference-server",
    patterns: [
      /import\s+ollama/,
      /from\s+ollama\s+import/,
      /localhost:11434/,
      /OLLAMA_HOST/,
    ],
    fileGlobs: ["*.py", "*.ts", "*.js", "*.env*", "*.yaml", "*.yml"],
    confidence: "high",
  },

  // ── Package manifest detection ──
  {
    name: "AI Dependency (npm)",
    provider: "Various",
    category: "general-ai",
    patterns: [
      /"openai"\s*:/,
      /"@anthropic-ai\/sdk"\s*:/,
      /"@google\/generative-ai"\s*:/,
      /"langchain"\s*:/,
      /"@langchain\//,
      /"llamaindex"\s*:/,
      /"replicate"\s*:/,
      /"@huggingface\/inference"\s*:/,
      /"cohere-ai"\s*:/,
      /"@mistralai\/client"\s*:/,
      /"@pinecone-database\/pinecone"\s*:/,
      /"ai"\s*:/,
      /"@ai-sdk\//,
      /"groq"\s*:/,
      /"@cerebras\/cerebras_cloud_sdk"\s*:/,
      /"elevenlabs"\s*:/,
      /"@qdrant\/js-client-rest"\s*:/,
    ],
    fileGlobs: ["package.json"],
    confidence: "high",
  },
  {
    name: "AI Dependency (Python)",
    provider: "Various",
    category: "general-ai",
    patterns: [
      /^openai[>=<~!\s]/m,
      /^anthropic[>=<~!\s]/m,
      /^google-generativeai[>=<~!\s]/m,
      /^transformers[>=<~!\s]/m,
      /^torch[>=<~!\s]/m,
      /^tensorflow[>=<~!\s]/m,
      /^langchain[>=<~!\s]/m,
      /^llama-index[>=<~!\s]/m,
      /^scikit-learn[>=<~!\s]/m,
      /^keras[>=<~!\s]/m,
      /^vllm[>=<~!\s]/m,
      /^chromadb[>=<~!\s]/m,
      /^pinecone-client[>=<~!\s]/m,
      /^groq[>=<~!\s]/m,
      /^deepseek[>=<~!\s]/m,
      /^stability-sdk[>=<~!\s]/m,
      /^elevenlabs[>=<~!\s]/m,
      /^spacy[>=<~!\s]/m,
      /^detectron2[>=<~!\s]/m,
      /^qdrant-client[>=<~!\s]/m,
      /^pymilvus[>=<~!\s]/m,
    ],
    fileGlobs: ["requirements*.txt", "pyproject.toml", "Pipfile", "setup.py", "setup.cfg"],
    confidence: "high",
  },
];
