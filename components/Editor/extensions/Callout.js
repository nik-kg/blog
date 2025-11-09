import { Node, mergeAttributes } from '@tiptap/core'

export const Callout = Node.create({
  name: 'callout',

  group: 'block',

  content: 'block+',

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-callout-type'),
        renderHTML: attributes => {
          return {
            'data-callout-type': attributes.type,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.callout',
      },
    ]
  },

  renderHTML({ node }) {
    const type = node.attrs.type || 'info'
    return [
      'div',
      {
        class: `callout callout-${type}`,
        'data-callout-type': type,
      },
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
