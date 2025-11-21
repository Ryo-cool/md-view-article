/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

// Mock SyntaxHighlighter component
export const Prism = ({ children, ...props }: any) => {
  return <pre data-testid="syntax-highlighter">{children}</pre>;
};

export const oneLight = {};
