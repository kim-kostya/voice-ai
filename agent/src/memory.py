from mem0 import AsyncMemoryClient
from logging import getLogger

memory = AsyncMemoryClient()
logger = getLogger("MEM0")

async def search_memory(user_id: str, message: str) -> list[str]:
  try:
    search_results = await memory.search(message=message, user_id=user_id)

    if search_results and search_results.get('results', []):
      context_parts = []
      for result in search_results.get('results', []):
        paragraph = result.get("memory") or result.get("text")
        if paragraph:
          source = "mem0 Memories"
          if "from [" in paragraph:
            source = paragraph.split("from [")[1].split("]")[0]
            paragraph = paragraph.split("]")[1].strip()
          context_parts.append(f"Source: {source}\nContent: {paragraph}\n")
      return context_parts
    else:
      return []
  except Exception as e:
    logger.warning(f"Unable to search memory: {e}")
    return []

async def save_memory(user_id: str, message: str):
  try:
    await memory.add(messages=[{
      "role": "user",
      "message": message,
    }], user_id=user_id)
  except Exception as e:
    logger.warning(f"Unable to save memory: {e}")