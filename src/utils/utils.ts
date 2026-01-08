import OBR, { type Item } from '@owlbear-rodeo/sdk'

export async function AABB(item: Item, wormhole: Item) {
  const wormholeBB = await OBR.scene.items.getItemBounds([wormhole.id])
  const itemBB = await OBR.scene.items.getItemBounds([item.id])
  const isOverlapping =
    itemBB.min.x < wormholeBB.min.x + wormholeBB.width &&
    itemBB.min.x + itemBB.width > wormholeBB.min.x &&
    itemBB.min.y < wormholeBB.min.y + wormholeBB.height &&
    itemBB.min.y + itemBB.height > wormholeBB.min.y

  return isOverlapping
}

export async function getWormholeByID(wormhole: Item) {
  return (await OBR.scene.items.getItems([wormhole.metadata.wormholeLink as string]))[0]
}
