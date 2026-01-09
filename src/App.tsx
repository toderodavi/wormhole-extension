import './App.css'
import OBR from '@owlbear-rodeo/sdk'
import { createAction, createMode, createTool } from './utils/tool'
import { useEffect } from 'react'
import { debounce, handleSceneChange } from './utils/utils'

export default function App() {
  useEffect(() => {
    OBR.onReady(() => {
      createTool()
      createMode()
      createAction()

      const debouncedHandler = debounce(handleSceneChange, 200)
      OBR.scene.items.onChange((items) => debouncedHandler(items))
    })
  }, [])

  return (
    <div>
      <h1 className="color: #fff">teste simples</h1>
    </div>
  )
}
