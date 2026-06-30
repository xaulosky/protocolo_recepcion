import { useState, useRef } from 'react'
import type { KeyboardEvent } from 'react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

export function TagInput({ tags, onChange, placeholder = 'Agregar etiqueta...', maxTags = 10 }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (tags.includes(trimmed)) return
    if (tags.length >= maxTags) return
    onChange([...tags, trimmed])
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
      setInputValue('')
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.endsWith(',')) {
      addTag(value.slice(0, -1))
      setInputValue('')
    } else {
      setInputValue(value)
    }
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div
      onClick={handleContainerClick}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        border: `1px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 8,
        padding: '6px 8px',
        background: 'var(--bg)',
        minHeight: 38,
        cursor: 'text',
        transition: 'border-color 0.15s',
      }}
    >
      {tags.map((tag, index) => (
        <span
          key={index}
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 20,
            background: 'var(--primary-soft)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(index)
            }}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'inherit',
              padding: 0,
              lineHeight: 1,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          if (inputValue.trim()) {
            addTag(inputValue)
            setInputValue('')
          }
        }}
        placeholder={tags.length === 0 ? placeholder : ''}
        disabled={tags.length >= maxTags}
        style={{
          border: 'none',
          outline: 'none',
          fontSize: 13,
          flex: 1,
          minWidth: 80,
          padding: '2px 4px',
          background: 'transparent',
        }}
      />
    </div>
  )
}
