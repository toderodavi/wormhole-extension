import OBR, { type BoundingBox, type Item, type Metadata, type Vector2 } from '@owlbear-rodeo/sdk'

interface WormholeUpdatePayload {
  id: string
  metadata: Metadata & {
    position?: Vector2
    wasTeleportedRecently?: boolean
  }
}

function AABB(itemBB: BoundingBox, wormholeBB: BoundingBox) {
  const isOverlapping =
    itemBB.min.x < wormholeBB.min.x + wormholeBB.width &&
    itemBB.min.x + itemBB.width > wormholeBB.min.x &&
    itemBB.min.y < wormholeBB.min.y + wormholeBB.height &&
    itemBB.min.y + itemBB.height > wormholeBB.min.y

  return isOverlapping
}

export const handleSceneChange = async (items: Item[]) => {
  const wormholes = items.filter((item) => item.metadata?.wormholeLink)
  const sceneItems = items.filter((item) => !item.metadata.wormholeLink && item.layer !== 'MAP')

  const itemsToUpdate: WormholeUpdatePayload[] = []

  for (const item of sceneItems) {
    let isOverlapping = false
    let teleportTo: Item | undefined = undefined

    // Get the bounds for the current item.
    // According to the docs, this returns a single BoundingBox.
    const itemBB = await OBR.scene.items.getItemBounds([item.id])
    if (!itemBB) continue

    for (const wormhole of wormholes) {
      // Get the bounds for the current wormhole.
      const wormholeBB = await OBR.scene.items.getItemBounds([wormhole.id])
      if (!wormholeBB) continue

      if (AABB(itemBB, wormholeBB)) {
        isOverlapping = true

        if (!item.metadata.wasTeleportedRecently) {
          const otherSideId = wormhole.metadata.wormholeLink as string
          teleportTo = items.find((i) => i.id === otherSideId)
        }
      }
    }

    if (teleportTo) {
      itemsToUpdate.push({
        id: item.id,
        metadata: {
          ...item.metadata,
          position: teleportTo.position,
          wasTeleportedRecently: true,
        },
      })
    } else if (item.metadata.wasTeleportedRecently && !isOverlapping) {
      itemsToUpdate.push({
        id: item.id,
        metadata: {
          ...item.metadata,
          wasTeleportedRecently: false,
        },
      })
    }
  }

  if (itemsToUpdate.length > 0) {
    await OBR.scene.items.updateItems(
      (item) => itemsToUpdate.some((update) => update.id === item.id),
      (items) => {
        for (const item of items) {
          const update = itemsToUpdate.find((u) => u.id === item.id)
          if (update) {
            if (update.metadata.position) {
              item.position = update.metadata.position
            }
            delete update.metadata.position
            item.metadata = { ...item.metadata, ...update.metadata }
          }
        }
      }
    )
  }
}
// To be honest, this whole part is made by AI. I'm not completly sure how to make
// a functional debounce function, so that's why of this.
// Probably will be changed later to fit better the extension.
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
