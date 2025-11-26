import type { Root, Content, Text } from 'mdast';

type ParentNode = {
  children?: Content[];
};

/**
 * CommonMark 仕様では、閉じ括弧の直後に `**` が続くようなケースで
 * その後ろに句読点がないと強調として認識されないことがある。
 * Markdown パーサーで強調として解釈されなかった `**...**` パターンを
 * フォールバック的に強調ノードへ変換する。
 */
export function remarkStrongFallback() {
  return (tree: Root) => {
    transform(tree as ParentNode);
  };
}

function transform(node: ParentNode) {
  if (!node.children) return;

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];

    if (child?.type === 'text') {
      const replacements = splitTextNode(child as Text);
      if (replacements) {
        node.children.splice(i, 1, ...replacements);
        i += replacements.length - 1;
        continue;
      }
    }

    transform(child as ParentNode);
  }
}

function splitTextNode(node: Text): Content[] | null {
  const value = node.value;
  if (!value || value.indexOf('**') === -1) {
    return null;
  }

  const pattern = /(?<!\\)\*\*([^\n*]+?)\*\*/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  const segments: Content[] = [];

  while ((match = pattern.exec(value)) !== null) {
    const [fullMatch, inner] = match;
    const start = match.index;

    if (start > lastIndex) {
      segments.push({
        type: 'text',
        value: value.slice(lastIndex, start),
      });
    }

    segments.push({
      type: 'strong',
      children: [
        {
          type: 'text',
          value: inner,
        },
      ],
    });

    lastIndex = start + fullMatch.length;
  }

  if (segments.length === 0) {
    return null;
  }

  if (lastIndex < value.length) {
    segments.push({
      type: 'text',
      value: value.slice(lastIndex),
    });
  }

  return segments;
}


