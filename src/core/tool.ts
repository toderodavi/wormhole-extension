import OBR, { buildLine, buildShape, type Item } from '@owlbear-rodeo/sdk'
import { centroid, ID } from './utils'

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
  let firstItem: Item | null = null
  let secondItem: Item | null = null

  // One-way wormhole
  OBR.tool.createMode({
    id: `${ID}/one-way`,
    icons: [
      {
        icon: '/arrowRight.svg',
        label: 'One-way',
        filter: {
          activeTools: [`${ID}/tool`],
        },
      },
    ],
    async onToolClick(_, event) {
      // Logic to create a one-way wormhole
      if (!event.target || event.target.layer === 'MAP') return
      const itemTargeted = event.target
      if (firstItem === null) {
        firstItem = itemTargeted
        return
      } else {
        if (firstItem.id === itemTargeted.id) return
      }

      secondItem = itemTargeted
      OBR.notification.show('Link made!', 'SUCCESS')

      await OBR.scene.items.updateItems([firstItem], (items) => {
        for (const item of items) {
          console.log(item.id)
          item.metadata.wormholeLink = secondItem?.id
        }
        firstItem = null
        secondItem = null
      })
    },
  })

  // Two-way wormhole
  OBR.tool.createMode({
    id: `${ID}/two-way`,
    icons: [
      {
        icon: '/arrowHorizontal.svg',
        label: 'Two-way',
        filter: {
          activeTools: [`${ID}/tool`],
        },
      },
    ],
    async onToolClick(_, event) {
      // Logic to create a two-way wormhole
      if (!event.target || event.target.layer === 'MAP') return

      const itemTargeted = event.target
      if (firstItem === null) {
        firstItem = itemTargeted
        return
      } else {
        if (firstItem.id === itemTargeted.id) return
      }

      secondItem = itemTargeted
      OBR.notification.show('Link made!', 'SUCCESS')

      await OBR.scene.items.updateItems([firstItem, secondItem], (items) => {
        for (const item of items) {
          console.log(item.id)
          // Takes the two Items asked in the filter and iterates them
          // assigning a metadata to our wormholes to save their relation
          if (item.id === firstItem?.id) {
            item.metadata.wormholeLink = secondItem?.id
          } else {
            if (item.id === secondItem?.id) {
              item.metadata.wormholeLink = firstItem?.id
            }
          }
        }
        firstItem = null
        secondItem = null

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
        icon: '/closedEye.svg',
        label: 'Show',
        filter: {
          activeTools: [`${ID}/tool`],
        },
      },
    ],
    async onClick() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const wormholes = await OBR.scene.items.getItems((item) => item.metadata?.wormholeLink)
      const items: Item[] = []

      for (const wormhole of wormholes) {
        const wormholeBB = await OBR.scene.items.getItemBounds([wormhole.id])
        const otherSideBB = await OBR.scene.items.getItemBounds([wormhole.metadata.wormholeLink as string])

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        items.push(buildLine().startPosition(wormholeBB.center).endPosition(otherSideBB.center).build())
        if (wormhole.type !== 'CURVE') {
          items.push(
            buildShape()
              .shapeType('RECTANGLE')
              .width(wormholeBB.width)
              .height(wormholeBB.height)
              .style({
                fillColor: 'rgba(255,0,100,.3)',
                fillOpacity: 0.7,
                strokeColor: 'black',
                strokeOpacity: 0.5,
                strokeWidth: 1,
                strokeDash: [1],
              })
              .position(wormhole.position)
              .build()
          )
        } else {
          items.push(
            buildShape()
              .shapeType('RECTANGLE')
              .width(wormholeBB.width)
              .height(wormholeBB.height)
              .style({
                fillColor: 'rgba(255,0,100,.3)',
                fillOpacity: 0.7,
                strokeColor: 'black',
                strokeOpacity: 0.5,
                strokeWidth: 1,
                strokeDash: [1],
              })
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              .position(centroid(wormhole.points))
              .build()
          )
        }
      }
      console.log(items)
      console.log(await OBR.scene.local.addItems(items))
    },
  })
}
