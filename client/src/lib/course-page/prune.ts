import { BLOCKS, isSharedField, type BlockSpec } from './schema';
import { applyListOp, getList } from './paths';
import type { CoursePageContent } from './types';

function isBlankItem(item: unknown): boolean {
  if (typeof item === 'string') return item.trim() === '';
  if (typeof item !== 'object' || item === null) return true;
  // Shared fields (icon, photo) carry defaults, so only the text fields decide whether an item is blank.
  return Object.entries(item).every(([key, value]) => isSharedField(key) || typeof value !== 'string' || value.trim() === '');
}

/**
 * Removes blank English list items (through applyListOp, so SI/TA stay aligned) before saving. The server drops
 * blank English items too; doing it here first keeps the translated lists lined up with what it stores.
 */
export function pruneBlankItems(content: CoursePageContent, blocks: BlockSpec[] = BLOCKS): CoursePageContent {
  let out = content;
  for (const block of blocks) {
    for (const list of block.lists) {
      const path = `${block.id}.${list.key}`;
      const items = getList(out.en, path);
      for (let i = items.length - 1; i >= 0; i--) {
        if (isBlankItem(items[i])) out = applyListOp(out, path, { type: 'remove', index: i });
      }
    }
  }
  return out;
}
