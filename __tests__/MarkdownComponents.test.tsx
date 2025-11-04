import { render, screen } from '@testing-library/react';
import { markdownComponents } from '@/lib/markdownComponents';

describe('Markdown Custom Components', () => {
  describe('Strong (Bold) Component', () => {
    it('should render bold text with correct styles', () => {
      const StrongComponent = markdownComponents.strong as any;
      render(<StrongComponent>太字テキスト</StrongComponent>);

      const element = screen.getByText('太字テキスト');
      expect(element.tagName).toBe('STRONG');
      expect(element).toHaveStyle({
        fontWeight: 700,
        color: '#2c3e50',
        display: 'inline'
      });
    });

    it('should render bold text with adjacent punctuation', () => {
      const StrongComponent = markdownComponents.strong as any;
      const { container } = render(
        <p>
          <StrongComponent>強調</StrongComponent>!!
        </p>
      );

      const strongElement = screen.getByText('強調');
      expect(strongElement.tagName).toBe('STRONG');
      expect(container.textContent).toBe('強調!!');
    });
  });

  describe('List Components', () => {
    it('should render ordered list with correct styles', () => {
      const OlComponent = markdownComponents.ol as any;
      const LiComponent = markdownComponents.li as any;

      render(
        <OlComponent>
          <LiComponent>項目1</LiComponent>
          <LiComponent>項目2</LiComponent>
          <LiComponent>項目3</LiComponent>
        </OlComponent>
      );

      const olElement = document.querySelector('ol');
      expect(olElement).toBeInTheDocument();
      expect(olElement).toHaveClass('list-decimal');

      // list-inside が削除されていることを確認（番号と本文を同じ行に保つため）
      expect(olElement).not.toHaveClass('list-inside');

      const liElements = document.querySelectorAll('li');
      expect(liElements).toHaveLength(3);
      liElements.forEach(li => {
        expect(li).toHaveClass('leading-7');
      });
    });

    it('should render unordered list with correct styles', () => {
      const UlComponent = markdownComponents.ul as any;
      const LiComponent = markdownComponents.li as any;

      render(
        <UlComponent>
          <LiComponent>項目A</LiComponent>
          <LiComponent>項目B</LiComponent>
        </UlComponent>
      );

      const ulElement = document.querySelector('ul');
      expect(ulElement).toBeInTheDocument();
      expect(ulElement).toHaveClass('list-disc');

      // list-inside が削除されていることを確認
      expect(ulElement).not.toHaveClass('list-inside');

      const liElements = document.querySelectorAll('li');
      expect(liElements).toHaveLength(2);
    });
  });

  describe('Heading Components', () => {
    it('should render h1 with correct styles', () => {
      const H1Component = markdownComponents.h1 as any;
      render(<H1Component>見出し1</H1Component>);

      const h1 = screen.getByText('見出し1');
      expect(h1.tagName).toBe('H1');
      expect(h1).toHaveClass('text-4xl', 'font-bold');
      expect(h1).toHaveStyle({ color: '#2c3e50' });
    });

    it('should render h2 with correct styles', () => {
      const H2Component = markdownComponents.h2 as any;
      render(<H2Component>見出し2</H2Component>);

      const h2 = screen.getByText('見出し2');
      expect(h2.tagName).toBe('H2');
      expect(h2).toHaveClass('text-3xl', 'font-bold');
    });
  });

  describe('Paragraph Component', () => {
    it('should render paragraph with correct styles', () => {
      const PComponent = markdownComponents.p as any;
      render(<PComponent>段落テキスト</PComponent>);

      const p = screen.getByText('段落テキスト');
      expect(p.tagName).toBe('P');
      expect(p).toHaveClass('mb-4', 'leading-7');
      expect(p).toHaveStyle({ color: '#5a6c7d' });
    });
  });

  describe('Link Component', () => {
    it('should render link with correct attributes', () => {
      const AComponent = markdownComponents.a as any;
      render(<AComponent href="https://example.com">リンクテキスト</AComponent>);

      const link = screen.getByText('リンクテキスト');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveStyle({ color: '#4a90e2' });
    });
  });

  describe('Code Component', () => {
    it('should render inline code with correct styles', () => {
      const CodeComponent = markdownComponents.code as any;
      render(<CodeComponent inline={true}>console.log('test')</CodeComponent>);

      const code = screen.getByText("console.log('test')");
      expect(code.tagName).toBe('CODE');
      expect(code).toHaveClass('neu-pressed');
      expect(code).toHaveStyle({
        color: '#c7254e',
        display: 'inline-block'
      });
    });
  });

  describe('Emphasis Component', () => {
    it('should render italic text with correct styles', () => {
      const EmComponent = markdownComponents.em as any;
      render(<EmComponent>イタリック</EmComponent>);

      const em = screen.getByText('イタリック');
      expect(em.tagName).toBe('EM');
      expect(em).toHaveClass('italic');
      expect(em).toHaveStyle({ color: '#5a6c7d' });
    });
  });

  describe('Blockquote Component', () => {
    it('should render blockquote with correct styles', () => {
      const BlockquoteComponent = markdownComponents.blockquote as any;
      render(<BlockquoteComponent>引用文</BlockquoteComponent>);

      const blockquote = document.querySelector('blockquote');
      expect(blockquote).toBeInTheDocument();
      expect(blockquote).toHaveClass('neu-pressed', 'italic');
    });
  });

  describe('Table Components', () => {
    it('should render table with correct wrapper', () => {
      const TableComponent = markdownComponents.table as any;
      const TheadComponent = markdownComponents.thead as any;
      const ThComponent = markdownComponents.th as any;

      render(
        <TableComponent>
          <TheadComponent>
            <tr>
              <ThComponent>列1</ThComponent>
              <ThComponent>列2</ThComponent>
            </tr>
          </TheadComponent>
        </TableComponent>
      );

      const table = document.querySelector('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('min-w-full', 'border-collapse');

      const thead = document.querySelector('thead');
      expect(thead).toBeInTheDocument();

      const thElements = document.querySelectorAll('th');
      expect(thElements).toHaveLength(2);
    });
  });

  describe('Horizontal Rule Component', () => {
    it('should render hr with correct styles', () => {
      const HrComponent = markdownComponents.hr as any;
      render(<HrComponent />);

      const hr = document.querySelector('hr');
      expect(hr).toBeInTheDocument();
      expect(hr).toHaveClass('my-8');
    });
  });

  describe('Image Component', () => {
    it('should render image with correct attributes', () => {
      const ImgComponent = markdownComponents.img as any;
      render(<ImgComponent src="/test.png" alt="テスト画像" />);

      const img = screen.getByAltText('テスト画像');
      expect(img.tagName).toBe('IMG');
      expect(img).toHaveAttribute('src', '/test.png');
      expect(img).toHaveClass('max-w-full', 'h-auto', 'rounded-lg');
    });
  });
});
