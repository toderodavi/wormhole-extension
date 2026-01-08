import OBR from '@owlbear-rodeo/sdk'

const ID = 'com.wormhole.tool'

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
      if (!event.target || event.target.layer === 'MAP') return

      const itemId = event.target.id
      if (firstItemId === null) {
        firstItemId = itemId
        OBR.notification.show('First item selected: ' + itemId)
        return
      } else {
        if (firstItemId === itemId) return
      }

      let secondItemId: string | null = itemId
      OBR.notification.show('Second item selected: ' + secondItemId)

      await OBR.scene.items.updateItems([firstItemId, secondItemId], (items) => {
        for (const item of items) {
          if (item.id == firstItemId) {
            item.metadata.wormholeLink = secondItemId
          } else {
            item.metadata.wormholeLink = firstItemId
          }
        }
        firstItemId = null
        secondItemId = null
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
