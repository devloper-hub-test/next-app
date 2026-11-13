import type { Block, PageBlock, ExtendedRecordMap } from "notion-types";

export const isPageBlock = (block: Block): block is PageBlock => {
  return block.type === "page";
};

export const findPageBlock = (
  recordMap: ExtendedRecordMap
): PageBlock | null => {
  for (const blockId in recordMap.block) {
    const entry = recordMap.block[blockId]?.value;
    // Some record maps wrap the block in an extra { role, value } layer
    const block = entry && "role" in entry ? entry.value : entry;
    if (block && isPageBlock(block)) {
      return block;
    }
  }
  return null;
};
