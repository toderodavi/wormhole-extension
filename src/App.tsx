import './App.css'
import OBR, { type Item } from '@owlbear-rodeo/sdk'
import Counter from './components/Counter'
import { createAction, createMode, createTool } from './utils/tool'
import { useEffect } from 'react'
import { AABB } from './utils/utils'

function App() {
  useEffect(() => {
    OBR.onReady(() => {
      createTool()
      createMode()
      createAction()
    })

    OBR.scene.items.onChange(async (items) => {
      // Check what items are wormholes
      const wormholes: Item[] = []
      for (const item of items) {
        if (item.metadata?.wormholeLink) {
          wormholes.push(item)
        }
      }

      for (const item of items) {
        for (const wormhole of wormholes) {
          if (item.id === wormhole.id || item.layer === 'MAP') {
            continue
          }

          if (await AABB(item, wormhole)) {
            // O RETORNO DESSA FUNÇÃO NÃO TRAZ DE MANEIRA ORDENADA,
            // VOCÊ PRECISA CHECAR QUE ITEM É QUAL PARA ENTÃO MUDAR A POSIÇÃO.
            // ACHO QUE ESSE É O ERRO PRINCIPAL
            await OBR.scene.items.updateItems([item.id, wormhole.id], (items) => {
              const item = items[0]
              const wormhole = OBR.scene.items.getItems((otherEnd) => otherEnd.metadata.wormholeLink === items[1].metadata.wormholeLink)

              item.position.x = wormhole.position.x + 1000
              item.position.y = wormhole.position.y
            })
          }
        }
      }
    })
  }, [])

  return (
    <div>
      <h1>teste simples</h1>
      <Counter />
    </div>
  )
}

export default App
