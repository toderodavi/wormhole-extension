import OBR from '@owlbear-rodeo/sdk'
import { ID } from './utils'

export function createTool() {
  OBR.tool.create({
    id: `${ID}/tool`,
    icons: [
      {
        icon: '/tool.svg',
        label: 'Wormhole',
      },
    ],
  })
}

export function createMode() {
  let firstItemId: string | null = null
  let secondItemId: string | null = null

  OBR.tool.createMode({
    id: `${ID}/mode`,
    icons: [
      {
        icon: '/link.svg',
        label: 'Link',
        filter: {
          activeTools: [`${ID}/tool`],
        },
      },
    ],
    async onToolClick(_, event) {
      // Logic to link two Items
      if (!event.target || event.target.layer === 'MAP') return

      const itemId = event.target.id
      if (firstItemId === null) {
        firstItemId = itemId
        OBR.notification.show('First item selected: ' + itemId)
        OBR.notification.show(`${event.target.position.x} / ${event.target.position.y}`)
        return
      } else {
        if (firstItemId === itemId) return
      }

      secondItemId = itemId
      OBR.notification.show('Second item selected: ' + secondItemId)

      await OBR.scene.items.updateItems([firstItemId, secondItemId], (items) => {
        for (const item of items) {
          // Takes all the Items on the scene and iterates them
          // assigning a metadata to our wormholes to save their relation
          if (item.id === firstItemId) {
            item.metadata.wormholeLink = secondItemId
          } else {
            if (item.id === secondItemId) {
              item.metadata.wormholeLink = firstItemId
            }
          }
        }
        firstItemId = null
        secondItemId = null

        // TODO
        // what if one of the wormholes are deleted?
        // you will have to remove the other item metadata to avoid problems
      })
    },
  })
}

export function createAction() {
  OBR.tool.createAction({
    id: `${ID}/action`,
    icons: [
      {
        icon: '/eye.svg',
        label: 'Show',
        filter: {
          activeTools: [`${ID}/tool`],
        },
      },
    ],
  })
}
