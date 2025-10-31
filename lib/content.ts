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
  const ref = await ofetch<GitHubRef>(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
    {
      headers: { Authorization: `Bearer ${TOKEN}` },
    }
  );
  return ref.object.sha;
}

export async function listMarkdownFiles(): Promise<string[]> {
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
}

export async function fetchMarkdown(relPath: string): Promise<string> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${relPath}?ref=${BRANCH}`;
  const data = await ofetch<GitHubContent>(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  const buff = Buffer.from(data.content, 'base64');
  return buff.toString('utf8');
}

