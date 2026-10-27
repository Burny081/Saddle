import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createServer } from 'vite';

const outputPath = resolve(process.cwd(), 'output/catalogue-media/prompts.jsonl');
const vite = await createServer({
  configFile: resolve(process.cwd(), 'vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  const { catalogueProducts } = await vite.ssrLoadModule('/src/data/catalogue/index.ts');
  const { createCatalogueMediaPrompts, serializeProductMediaPrompts } = await vite.ssrLoadModule('/src/data/catalogue/productMediaPrompts.ts');
  const records = createCatalogueMediaPrompts(catalogueProducts);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, serializeProductMediaPrompts(records), 'utf8');
  console.log(`Exported ${records.length} unique product image prompts to ${outputPath}`);
} finally {
  await vite.close();
}
