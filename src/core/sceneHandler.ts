import OBR, { type Item } from '@owlbear-rodeo/sdk'
import { AABB, centroid, type WormholeUpdatePayload } from './utils'

export const handleSceneChange = async (items: Item[]) => {
  const wormholes = items.filter((item) => item.metadata?.wormholeLink)
  const sceneItems = items.filter((item) => !item.metadata.wormholeLink && item.layer !== 'MAP')

  const itemsToUpdate: WormholeUpdatePayload[] = []

  for (const item of sceneItems) {
    let isOverlapping = false
    let teleportTo: Item | undefined = undefined

    const itemBB = await OBR.scene.items.getItemBounds([item.id])
    if (!itemBB) continue

    for (const wormhole of wormholes) {
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
      if (teleportTo.type === 'CURVE') {
        itemsToUpdate.push({
          itemId: item.id,
          metadata: {
            ...item.metadata,
            // TS can't recon this property because of Owlbear available APIs.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            position: centroid(teleportTo.points),
            wasTeleportedRecently: true,
          },
        })
      } else {
        itemsToUpdate.push({
          itemId: item.id,
          metadata: {
            ...item.metadata,
            position: teleportTo.position,
            wasTeleportedRecently: true,
          },
        })
      }
    } else if (item.metadata.wasTeleportedRecently && !isOverlapping) {
      itemsToUpdate.push({
        itemId: item.id,
        metadata: {
          ...item.metadata,
          wasTeleportedRecently: false,
        },
      })
    }
  }

  if (itemsToUpdate.length > 0) {
    await OBR.scene.items.updateItems(
      (item) => itemsToUpdate.some((update) => update.itemId === item.id),
      (items) => {
        for (const item of items) {
          const update = itemsToUpdate.find((u) => u.itemId === item.id)
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
