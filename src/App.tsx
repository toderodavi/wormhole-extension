import './App.css'
import OBR from '@owlbear-rodeo/sdk'
import { createAction, createMode, createTool } from './core/tool'
import { useEffect } from 'react'
import { handleSceneChange } from './core/sceneHandler'
import { debounce } from './core/utils'

export default function App() {
  useEffect(() => {
    OBR.onReady(() => {
      createTool()
      createMode()
      createAction()

      const debouncedHandler = debounce(handleSceneChange, 100)
      OBR.scene.items.onChange((items) => debouncedHandler(items))
    })
  }, [])

  return (
    <div>
      <h1 className="color: #fff">teste simples</h1>
    </div>
  )
}
