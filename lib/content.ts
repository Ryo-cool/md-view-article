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
      // まずリポジトリの存在確認を試みる（より詳細なエラー情報を得るため）
      try {
        await ofetch(
          `https://api.github.com/repos/${OWNER}/${REPO}`,
          {
            headers: { Authorization: `Bearer ${TOKEN}` },
          }
        );
        
        // リポジトリが存在する場合、ブランチ情報を取得
      const ref = await ofetch<GitHubRef>(
        `https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );
      return ref.object.sha;
    } catch (repoError: unknown) {
      const repoErr = repoError as { status?: number; message?: string };
      
      // リポジトリ情報取得時のエラー
      if (repoErr?.status === 404) {
        throw new Error(
          `リポジトリ "${OWNER}/${REPO}" が見つかりません。\n` +
          `以下の可能性があります:\n` +
          `- リポジトリ名またはオーナー名が間違っている\n` +
          `- リポジトリが Private で、トークンに "repo" スコープがない\n` +
          `- リポジトリが削除された、または名前が変更された\n` +
          `- SSO 必須の組織で、トークンに SSO Grant が付与されていない`
        );
      }
      if (repoErr?.status === 401) {
        throw new Error(
          `認証に失敗しました。GITHUB_TOKEN が無効です。\n` +
          `トークンを再発行してください。`
        );
      }
      if (repoErr?.status === 403) {
        throw new Error(
          `アクセスが拒否されました。GITHUB_TOKEN に権限がありません。\n` +
          `以下の点を確認してください:\n` +
          `- トークンに "repo" スコープ（Private リポジトリの場合）が付与されているか\n` +
          `- SSO 必須の組織では、トークンに SSO Grant が付与されているか\n` +
          `- レート制限に達していないか`
        );
      }
      
      // ブランチ取得時のエラー（リポジトリは存在するがブランチがない）
      if (repoErr?.status === 404) {
        // 利用可能なブランチを確認してみる
        try {
          const branches = await ofetch<Array<{ name: string }>>(
            `https://api.github.com/repos/${OWNER}/${REPO}/branches`,
            {
              headers: { Authorization: `Bearer ${TOKEN}` },
            }
          );
          const branchNames = branches.map((b) => b.name).join(', ');
          throw new Error(
            `ブランチ "${BRANCH}" が見つかりません。\n` +
            `利用可能なブランチ: ${branchNames || '(なし)'}\n` +
            `環境変数 CONTENT_BRANCH を正しいブランチ名に設定してください。`
          );
        } catch {
          throw new Error(
            `ブランチ "${BRANCH}" が見つかりません。\n` +
            `リポジトリ "${OWNER}/${REPO}" は存在しますが、指定されたブランチが存在しない可能性があります。\n` +
            `環境変数 CONTENT_BRANCH を確認してください（デフォルト: main）`
          );
        }
      }
      
      throw repoError;
    }
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    
    if (err?.message) {
      throw err; // 既に詳細なエラーメッセージがある場合はそのまま
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

