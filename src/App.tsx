import './App.css'
import OBR from '@owlbear-rodeo/sdk'
import Counter from './components/Counter'
import { createAction, createMode, createTool } from './utils/tool'

function App() {
  OBR.onReady(() => {
    createTool()
    createMode()
    createAction()
  })

  return (
    <div>
      <h1>teste simples</h1>
      <Counter />
    </div>
  )
}

export default App
