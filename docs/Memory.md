
# Memory System

## Purpose

The memory system allows Syntrophos to remember, understand, connect, retrieve, and evolve knowledge over time.

Unlike traditional chat history, memory is persistent, structured, explainable, and user-owned.

Obsidian acts as the canonical long-term knowledge base.

---

# Goals

- Never lose useful knowledge.
- Remember context across months and years.
- Connect related information automatically.
- Surface forgotten information at the right time.
- Improve personalization over time.
- Keep all knowledge transparent and editable.

---

# Design Principles

- User owns all memory.
- Memory should be explainable.
- AI augments memory, never hides it.
- Everything important is stored in Markdown.
- Retrieval should prioritize relevance over recency.
- Memory should improve continuously.

---

# Memory Types

## Short-Term Memory

Stores context for the current conversation.

Examples:

- Current task
- Recent messages
- Temporary reasoning
- Active workflow

Lifetime:
Minutes to hours.

---

## Working Memory

Information needed across multiple related tasks.

Examples:

- Current project
- Active research
- Weekly goals
- Meeting notes

Lifetime:
Days to weeks.

---

## Long-Term Memory

Permanent knowledge stored inside Obsidian.

Examples:

- Projects
- Ideas
- Books
- People
- Decisions
- Lessons
- Goals

Lifetime:
Unlimited.

---

# Memory Lifecycle

Information follows this pipeline:

Capture

↓

Understand

↓

Extract entities

↓

Link to existing knowledge

↓

Store in Obsidian

↓

Retrieve when relevant

↓

Update after use

↓

Reflect periodically

---

# Memory Objects

Every memory contains:

- title
- type
- source
- created_at
- updated_at
- importance
- related entities
- tags
- summary
- original content
- embeddings
- references

---

# Entity Extraction

Syntrophos automatically identifies:

People

Projects

Companies

Books

Concepts

Skills

Technologies

Locations

Events

Goals

Tasks

These become nodes in the knowledge graph.

---

# Relationships

Memories are connected through relationships such as:

works_on

created

mentions

depends_on

learned_from

inspired_by

belongs_to

related_to

blocked_by

supersedes

---

# Retrieval

When answering a question, Syntrophos retrieves:

Relevant notes

Related projects

Past conversations

Previous decisions

Connected entities

Recent changes

Goals

instead of searching by keywords alone.

---

# Reflection

At scheduled intervals the AI:

Summarizes recent work.

Extracts lessons learned.

Identifies recurring themes.

Updates project status.

Strengthens useful connections.

Archives stale memories.

---

# Obsidian Integration

Obsidian is the source of truth.

Every permanent memory should eventually exist as Markdown inside the user's vault.

The AI enriches the vault but never locks information inside proprietary storage.

---

# Future Ideas

Memory importance scoring

Memory decay

Automatic resurfacing

Contradiction detection

Knowledge gap detection

Timeline visualization

Personal knowledge graph

Company-wide shared memory

Multi-agent shared memory

# Current Design

- Short-term memory
- Working memory
- Long-term memory
- Entity extraction
- Knowledge graph
- Obsidian synchronization
- Semantic retrieval

---

# Future Enhancements

- Memory promotion
- Memory confidence scoring
- Memory decay
- Contradiction detection
- Automatic reflection
- Knowledge gap detection


# Obsidian Synchronization

## Canonical Source

The user's Obsidian vault is the canonical source of truth for long-term memory.

Syntrophos never locks important information inside proprietary storage. Permanent knowledge should always exist as Markdown inside the user's vault.

---

## Synchronization

Whenever the user modifies the vault, Syntrophos:

- Detects changes
- Re-indexes affected notes
- Updates embeddings
- Refreshes the knowledge graph
- Makes the new information available for retrieval

Whenever Syntrophos creates or updates long-term knowledge, it writes those changes back into the vault.

---

## Benefits

- User owns their data
- Human-readable Markdown
- Git-friendly
- Local-first
- No vendor lock-in
- AI and user always work from the same knowledge base