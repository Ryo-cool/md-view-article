import React from 'react';

// Mock SyntaxHighlighter component
export const Prism = ({ children, ...props }: any) => {
  return <pre data-testid="syntax-highlighter">{children}</pre>;
};

export const oneLight = {};
