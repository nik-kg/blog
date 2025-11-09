import { Node, mergeAttributes } from '@tiptap/core'

export const Callout = Node.create({
  name: 'callout',

  group: 'block',

  content: 'block+',

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => {
          return {
            'data-type': attributes.type,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'callout',
        class: `callout callout-${HTMLAttributes.type || 'info'}`,
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setCallout: (type) => ({ commands }) => {
        return commands.wrapIn(this.name, { type })
      },
      toggleCallout: (type) => ({ commands }) => {
        return commands.toggleWrap(this.name, { type })
      },
    }
  },
})
