/* eslint-disable import/no-anonymous-default-export */
// Mock for mermaid library
export default {
  initialize: jest.fn(),
  render: jest.fn(() => Promise.resolve({ svg: '<svg></svg>' })),
};
