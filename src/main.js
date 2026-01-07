import { setupCounter } from './setupCounter'
import './style.css'
import OBR, { buildLine } from '@owlbear-rodeo/sdk'

const ID = 'com.wormhole.extension'

function createTool() {
  OBR.tool.create({
    id: `${ID}/tool`,
    icons: [
      {
        icon: '/line.svg',
        label: 'Line tool',
      },
    ],
    defaultMetadata: {
      strokeColor: 'red',
    },
  })
}

function createMode() {
  let interaction = null
  OBR.tool.createMode({
    id: `${ID}/mode`,
    icons: [
      {
        icon: '/line.svg',
        label: 'Line',
        filter: {
          activeTools: [`${ID}/tool`],
        },
      },
    ],
    async onToolDragStart(context, event) {
      let strokeColor = 'red'
      // Define um valor padrão para cor
      // e depois checa se o localStorage possui um valor
      // se houver, utiliza ele
      if (typeof context.metadata.strokeColor === 'string ') {
        strokeColor = context.metadata.strokeColor
      }
      const line = buildLine().startPosition(event.pointerPosition).endPosition(event.pointerPosition).strokeColor(strokeColor).build()
      interaction = await OBR.interaction.startItemInteraction(line)
    },
    onToolDragMove(_, event) {
      if (interaction) {
        const [update] = interaction
        update((line) => {
          line.endPosition = event.pointerPosition
        })
      }
    },
    onToolDragEnd(_, event) {
      if (interaction) {
        const [update, stop] = interaction
        const line = update((line) => {
          line.endPosition = event.pointerPosition
        })
        OBR.scene.items.addItems([line])
        stop()
      }
      interaction = null
    },
    onToolDragCancel() {
      if (interaction) {
        const [_, event] = interaction
        stop()
      }
      interaction = null
    },
  })
}

function createAction() {
  OBR.tool.createAction({
    id: `${ID}/action`,
    icons: [
      {
        icon: '/icon.svg',
        label: 'Color',
        filter: {
          activeTools: [`${ID}/tool`],
        },
      },
    ],
  })
}

OBR.onReady(() => {
  createTool()
  createMode()
  createAction()
})

document.querySelector('#app').innerHTML = `
  <div>
    <h1>OI FERNANDA</h1>
    <p>Um teste da extensão</p>
    <button id="button">DIOWJAODIAJW</button>
  </div>
`
setupCounter(document.querySelector('#button'))
