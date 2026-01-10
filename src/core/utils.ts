import type { BoundingBox, Metadata, Vector2 } from '@owlbear-rodeo/sdk'

export interface WormholeUpdatePayload {
  itemId: string
  metadata: Metadata & {
    position?: Vector2
    wasTeleportedRecently?: boolean
  }
}

export const ID = 'com.wormhole.tool'

export function AABB(itemBB: BoundingBox, wormholeBB: BoundingBox) {
  const isOverlapping =
    itemBB.min.x < wormholeBB.min.x + wormholeBB.width &&
    itemBB.min.x + itemBB.width > wormholeBB.min.x &&
    itemBB.min.y < wormholeBB.min.y + wormholeBB.height &&
    itemBB.min.y + itemBB.height > wormholeBB.min.y

  return isOverlapping
}

// To be honest, function bellow was vibe coded. I'm not completly sure how to make
// a functional debounce function.
// Will be changed later to better fit the extension.

// IDEA: implement debounce using useEffect and useRef from react <--

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
      timeout = null
    }
    timeout = setTimeout(() => func(...args), waitFor)
  }

  return debounced
}
