'use client'

import { useField, useFormFields } from '@payloadcms/ui'

type LexicalNode = {
  type: string
  tag?: string
  children?: LexicalNode[]
  text?: string
}

type HiddenHeading = {
  id?: string
  headingText: string
}

function extractHeadings(content: unknown): string[] {
  if (!content || typeof content !== 'object') return []
  const root = (content as { root?: { children?: LexicalNode[] } }).root
  if (!root?.children) return []

  const headings: string[] = []
  for (const node of root.children) {
    if (node.type === 'heading' && (node.tag === 'h2' || node.tag === 'h3')) {
      const text = (node.children || []).map((c) => c.text || '').join('')
      if (text.trim()) headings.push(text.trim())
    }
  }
  return headings
}

export function HeadingVisibilityField() {
  const { value, setValue } = useField<HiddenHeading[]>({ path: 'hiddenHeadings' })
  const content = useFormFields(([fields]) => fields['content']?.value)

  const allHeadings = extractHeadings(content)
  const hiddenList = Array.isArray(value) ? value : []
  const hiddenSet = new Set(hiddenList.map((h) => h.headingText))

  function toggle(text: string) {
    if (hiddenSet.has(text)) {
      // was hidden → make visible (remove from hidden list)
      setValue(hiddenList.filter((h) => h.headingText !== text))
    } else {
      // was visible → hide it (add to hidden list)
      setValue([...hiddenList, { headingText: text }])
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#9ca3af',
          marginBottom: 6,
        }}
      >
        Sidebar Headings
      </p>
      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
        Uncheck headings you want to hide from the case study sidebar.
      </p>

      {allHeadings.length === 0 ? (
        <p style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>
          No h2 / h3 headings found in the content yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allHeadings.map((text) => {
            const isVisible = !hiddenSet.has(text)
            return (
              <label
                key={text}
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => toggle(text)}
                  style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#D97757' }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color: isVisible ? '#111827' : '#9ca3af',
                    textDecoration: isVisible ? 'none' : 'line-through',
                  }}
                >
                  {text}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
