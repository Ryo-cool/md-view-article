import { ofetch } from 'ofetch';

// 環境変数の取得（ビルド時に未設定の場合はエラーを投げる）
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `環境変数 ${name} が設定されていません。.env.local ファイルを作成するか、Vercel の環境変数設定を確認してください。`
    );
  }
  return value;
}

const TOKEN = getEnvVar('GITHUB_TOKEN');
const OWNER = getEnvVar('CONTENT_REPO_OWNER');
const REPO = getEnvVar('CONTENT_REPO_NAME');
const DIR = (process.env.CONTENT_DIR ?? '').replace(/\/+$/, ''); // 末尾/除去
const BRANCH = process.env.CONTENT_BRANCH || 'main';

interface GitHubRef {
  object: {
    sha: string;
  };
}

interface GitHubTreeNode {
  type: 'blob' | 'tree';
  path: string;
  sha: string;
}

interface GitHubTree {
  tree: GitHubTreeNode[];
}

interface GitHubContent {
  content: string;
  encoding: string;
}

async function getHeadSha(): Promise<string> {
  try {
    const ref = await ofetch<GitHubRef>(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    return ref.object.sha;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err?.status === 404) {
      throw new Error(
        `リポジトリが見つかりません: ${OWNER}/${REPO}\n` +
        `ブランチ "${BRANCH}" が存在しない可能性があります。\n` +
        `以下の点を確認してください:\n` +
        `- リポジトリ名とオーナー名が正しいか\n` +
        `- ブランチ名が正しいか（main / master / その他）\n` +
        `- リポジトリが Private の場合、GITHUB_TOKEN に適切な権限があるか（repo スコープが必要）\n` +
        `- SSO 必須の組織では、GITHUB_TOKEN に SSO Grant が付与されているか`
      );
    }
    if (err?.status === 401) {
      throw new Error(
        `認証に失敗しました。GITHUB_TOKEN が無効または権限不足です。\n` +
        `- トークンが有効か確認してください\n` +
        `- トークンに repo スコープ（Private リポジトリの場合）が付与されているか確認してください\n` +
        `- SSO 必須の組織では、トークンに SSO Grant が付与されているか確認してください`
      );
    }
    throw new Error(
      `GitHub API エラー: ${err?.message || String(error)}\n` +
      `リポジトリ: ${OWNER}/${REPO}, ブランチ: ${BRANCH}`
    );
  }
}

export async function listMarkdownFiles(): Promise<string[]> {
  try {
    const sha = await getHeadSha();
    const tree = await ofetch<GitHubTree>(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${sha}?recursive=1`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );

    const files = tree.tree
      .filter((n) => n.type === 'blob' && (n.path.endsWith('.md') || n.path.endsWith('.mdx')))
      .filter((n) => (DIR ? n.path.startsWith(DIR + '/') : true))
      .map((n) => n.path);

    return files;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error; // getHeadSha からのエラーをそのまま伝播
    }
    throw new Error(
      `Markdown ファイルの一覧取得に失敗しました: ${String(error)}`
    );
  }
}

export async function fetchMarkdown(relPath: string): Promise<string> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${relPath}?ref=${BRANCH}`;
  const data = await ofetch<GitHubContent>(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  const buff = Buffer.from(data.content, 'base64');
  return buff.toString('utf8');
}

