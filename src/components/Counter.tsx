import OBR from '@owlbear-rodeo/sdk'
import { useState } from 'react'

export default function SetupCounter() {
  const [count, setCount] = useState(0)

  return (
    <button
      onClick={() => {
        setCount(count + 1)
        OBR.notification.show('Counter: ' + count)
      }}
    >
      Counter: {count}
    </button>
  )
}
