import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SRC_ROOT = path.join(process.cwd(), 'src');

async function tryResolve(specifier, context, defaultResolve) {
  try {
    return await defaultResolve(specifier, context, defaultResolve);
  } catch {
    return null;
  }
}

export async function resolve(specifier, context, defaultResolve) {
  const candidates = [];

  if (specifier.startsWith('@/')) {
    const base = path.join(SRC_ROOT, specifier.slice(2));
    candidates.push(pathToFileURL(base).href);
    candidates.push(pathToFileURL(`${base}.ts`).href);
    candidates.push(pathToFileURL(`${base}.tsx`).href);
    candidates.push(pathToFileURL(path.join(base, 'index.ts')).href);
  } else if ((specifier.startsWith('./') || specifier.startsWith('../')) && !path.extname(specifier)) {
    candidates.push(`${specifier}.ts`);
    candidates.push(`${specifier}.tsx`);
    candidates.push(`${specifier}/index.ts`);
  }

  for (const candidate of candidates) {
    const resolved = await tryResolve(candidate, context, defaultResolve);
    if (resolved) {
      return resolved;
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}
