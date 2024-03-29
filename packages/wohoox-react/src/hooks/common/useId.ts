import { useRef } from 'react'
import { guid } from 'wohoox-utils'

export default function useId() {
  const id = useRef<string>()

  if (!id.current) id.current = guid()

  return id.current
}
