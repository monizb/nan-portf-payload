import React from 'react'
import Image from 'next/image'

type LexicalNode = {
  type: string
  tag?: string
  text?: string
  format?: number
  children?: LexicalNode[]
  url?: string
  src?: string
  altText?: string
  width?: number
  height?: number
  listType?: string
  value?: {
    url?: string
    alt?: string
    width?: number
    height?: number
  }
  relationTo?: string
  fields?: Record<string, unknown>
  direction?: string
  indent?: number
  version?: number
}

type LexicalContent = {
  root: {
    children: LexicalNode[]
    direction: string
    format: string
    indent: number
    type: string
    version: number
  }
}

function renderText(node: LexicalNode): React.ReactNode {
  let text: React.ReactNode = node.text || ''

  if (node.format) {
    if (node.format & 1) text = <strong key="bold">{text}</strong>
    if (node.format & 2) text = <em key="italic">{text}</em>
    if (node.format & 8) text = <u key="underline">{text}</u>
    if (node.format & 16) text = <code key="code" className="bg-gray-100 px-1.5 py-0.5 rounded text-[15px]">{text}</code>
    if (node.format & 4) text = <s key="strikethrough">{text}</s>
  }

  return text
}

function renderNode(node: LexicalNode, index: number): React.ReactNode {
  const children = node.children?.map((child, i) => renderNode(child, i))

  switch (node.type) {
    case 'text':
      return <React.Fragment key={index}>{renderText(node)}</React.Fragment>

    case 'paragraph':
      return <p key={index}>{children}</p>

    case 'heading': {
      const Tag = (node.tag || 'h2') as keyof React.JSX.IntrinsicElements
      const id = (node.children || [])
        .map((c) => c.text || '')
        .join('')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      return <Tag key={index} id={id}>{children}</Tag>
    }

    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      return <Tag key={index}>{children}</Tag>
    }

    case 'listitem':
      return <li key={index}>{children}</li>

    case 'link':
      return (
        <a
          key={index}
          href={node.url || node.fields?.url as string || '#'}
          className="underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600 transition-colors"
          target={node.fields?.newTab ? '_blank' : undefined}
          rel={node.fields?.newTab ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      )

    case 'quote':
      return <blockquote key={index}>{children}</blockquote>

    case 'upload': {
      const img = (node.value || node) as { url?: string; alt?: string; altText?: string; width?: number; height?: number }
      return (
        <figure key={index} className="my-8">
          <Image
            src={img.url || '/placeholder.svg'}
            alt={img.alt || img.altText || ''}
            width={img.width || 800}
            height={img.height || 450}
            className="rounded-xl w-full"
          />
        </figure>
      )
    }

    case 'linebreak':
      return <br key={index} />

    default:
      if (children) return <React.Fragment key={index}>{children}</React.Fragment>
      return null
  }
}

interface RichTextRendererProps {
  content: LexicalContent | null | undefined
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  if (!content?.root?.children) return null

  return (
    <div className="blog-content">
      {content.root.children.map((node, i) => renderNode(node, i))}
    </div>
  )
}
