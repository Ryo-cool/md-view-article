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
  content?: string | null;
  encoding?: string;
  download_url?: string | null;
  size?: number;
}

async function getHeadSha(): Promise<string> {
  try {
    // まずトークンが有効かを確認
    try {
      await ofetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      // トークンは有効（認証できている）
    } catch (authError: unknown) {
      const authErr = authError as { status?: number; message?: string };
      if (authErr?.status === 401) {
        throw new Error(
          `認証に失敗しました。GITHUB_TOKEN が無効です。\n` +
          `トークンを再発行してください: https://github.com/settings/tokens`
        );
      }
      if (authErr?.status === 403) {
        throw new Error(
          `アクセスが拒否されました。\n` +
          `- レート制限に達している可能性があります\n` +
          `- SSO 必須の組織では、トークンに SSO Grant が付与されているか確認してください`
        );
      }
    }

    // リポジトリの存在確認を試みる
    try {
      await ofetch<{ private?: boolean; full_name?: string }>(
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
        // 404の場合、Privateリポジトリで権限がない可能性が高い
        // Publicリポジトリかどうかを確認してみる（認証なし）
        try {
          await ofetch(`https://api.github.com/repos/${OWNER}/${REPO}`, {
            // 認証なしでアクセス
          });
          // Publicリポジトリならアクセスできるはず（ここに来ることはない）
        } catch (publicError: unknown) {
          const publicErr = publicError as { status?: number };
          if (publicErr?.status === 404) {
            throw new Error(
              `リポジトリ "${OWNER}/${REPO}" が見つかりません。\n` +
              `- リポジトリ名またはオーナー名が間違っている可能性があります\n` +
              `- GitHub上でリポジトリが存在するか確認してください: https://github.com/${OWNER}/${REPO}`
            );
          }
        }
        
        // 認証ありで404 = Privateリポジトリで権限がない
        throw new Error(
          `リポジトリ "${OWNER}/${REPO}" へのアクセスが拒否されました。\n` +
          `このリポジトリは Private リポジトリの可能性が高いです。\n\n` +
          `以下の点を確認してください:\n` +
          `1. GITHUB_TOKEN に "repo" スコープが付与されているか\n` +
          `   トークン作成時: https://github.com/settings/tokens/new\n` +
          `   → "repo" スコープにチェックを入れる\n\n` +
          `2. SSO 必須の組織の場合:\n` +
          `   - トークンに SSO Grant が付与されているか確認\n` +
          `   - https://github.com/settings/tokens で対象のトークンを選択\n` +
          `   - "Enable SSO" をクリックして組織を承認\n\n` +
          `3. トークンが正しく設定されているか:\n` +
          `   - Vercel の場合: Settings → Environment Variables\n` +
          `   - ローカルの場合: .env.local ファイル\n\n` +
          `4. リポジトリへのアクセス権限があるか:\n` +
          `   - リポジトリの Settings → Collaborators で確認`
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

  const base64 = (data.content || '').replace(/\s+/g, '');
  if (!base64) {
    throw new Error(`Markdown content is empty: ${relPath}`);
  }

  const buff = Buffer.from(base64, 'base64');
  return buff.toString('utf8');
}

/**
 * GitHubリポジトリから画像ファイルを取得し、Base64データURLとして返す
 * @param relPath リポジトリルートからの相対パス（例: "docs/images/photo.png"）
 * @returns Base64データURL（例: "data:image/png;base64,..."）
 */
export async function fetchImage(relPath: string): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${relPath}?ref=${BRANCH}`;
    const data = await ofetch<GitHubContent>(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    // GitHub Contents APIは1MB超でcontentがnullになるので、download_url経由で再取得する
    let base64 = (data.content || '').replace(/\s+/g, '');
    if (!base64 && data.download_url) {
      const buffer = await ofetch<ArrayBuffer>(data.download_url, {
        responseType: 'arrayBuffer',
      });
      base64 = Buffer.from(buffer).toString('base64');
    }

    // 画像取得成功をログ（本番でも Vercel ログで確認できる）
    console.log('[fetchImage] ok', {
      relPath,
      branch: BRANCH,
      size: base64.length,
      via: data.content ? 'content' : 'download_url',
    });

    if (!base64) {
      console.warn('[fetchImage] empty content', { relPath, branch: BRANCH });
      return null;
    }

    // 画像のMIMEタイプを拡張子から判定
    const ext = relPath.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      ico: 'image/x-icon',
    };
    const mimeType = mimeTypes[ext] || 'image/png';

    // Base64データURLを構築
    return `data:${mimeType};base64,${base64}`;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err?.status === 404) {
      // 画像が見つからない場合はnullを返す
      console.warn('[fetchImage] 404', { relPath, branch: BRANCH });
      return null;
    }
    console.error('[fetchImage] fail', { relPath, branch: BRANCH, error });
    return null;
  }
}
