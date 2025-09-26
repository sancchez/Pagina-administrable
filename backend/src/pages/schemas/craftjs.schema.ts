export const craftJsSchema = {
  type: 'object',
  properties: {
    ROOT: {
      type: 'object',
      properties: {
        type: { type: 'object', properties: { resolvedName: { type: 'string' } }, required: ['resolvedName'] },
        is: { type: 'string' },
        nodes: { type: 'array' },
        props: { type: 'object' },
      },
      required: ['type', 'is', 'nodes', 'props'],
      additionalProperties: true,
    },
  },
  required: ['ROOT'],
  additionalProperties: true,
};