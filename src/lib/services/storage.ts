/**
 * Servico de armazenamento de imagens.
 *
 * Degrada graciosamente quando as variaveis STORAGE_URL e STORAGE_KEY
 * nao estao configuradas — loga um aviso e retorna null.
 *
 * ── Configuracao ──────────────────────────────────────────────────
 *
 * Opcao A: Cloudflare R2
 *   1. Crie um bucket R2 no painel da Cloudflare
 *   2. Gere um token de API com permissao de escrita no R2
 *   3. Configure as variaveis de ambiente:
 *      STORAGE_URL="https://<ACCOUNT_ID>.r2.cloudflarestorage.com/<BUCKET>"
 *      STORAGE_KEY="<API_TOKEN>"
 *   4. Implemente o upload usando a API S3-compatible do R2
 *
 * Opcao B: Uploadthing
 *   1. Crie uma conta em https://uploadthing.com
 *   2. Crie um app e copie as credenciais
 *   3. Configure as variaveis de ambiente:
 *      STORAGE_URL="https://uploadthing.com/api"
 *      STORAGE_KEY="<UPLOADTHING_SECRET>"
 *   4. Instale @uploadthing/react e configure o file router
 *
 * @module services/storage
 */

const STORAGE_URL = process.env.STORAGE_URL;
const STORAGE_KEY = process.env.STORAGE_KEY;

/**
 * Faz upload de uma imagem para o servico de armazenamento configurado.
 *
 * @param file - Buffer contendo os bytes da imagem
 * @param filename - Nome do arquivo (ex: "hero-photo.jpg")
 * @returns URL publica do arquivo enviado, ou `null` se o storage nao esta configurado ou o upload falhou.
 */
export async function uploadImage(
  file: Buffer,
  filename: string
): Promise<string | null> {
  if (!STORAGE_URL || !STORAGE_KEY) {
    console.warn(
      "[Storage] STORAGE_URL ou STORAGE_KEY nao configuradas. Upload ignorado:",
      filename
    );
    return null;
  }

  // TODO: Implementar upload real apos escolher provedor (R2 ou Uploadthing).
  // O codigo abaixo e um placeholder que demonstra a estrutura esperada.

  try {
    console.log(`[Storage] Enviando ${filename} para ${STORAGE_URL}...`);

    // Placeholder — substituir pela implementacao real:
    //
    // Cloudflare R2 (S3-compatible):
    //   const response = await fetch(`${STORAGE_URL}/${filename}`, {
    //     method: "PUT",
    //     headers: {
    //       Authorization: `Bearer ${STORAGE_KEY}`,
    //       "Content-Type": "application/octet-stream",
    //     },
    //     body: file,
    //   });
    //
    // Uploadthing:
    //   Use the Uploadthing SDK or REST API to upload.

    console.warn("[Storage] Implementacao de upload ainda nao configurada.");
    return null;
  } catch (err) {
    console.error("[Storage] Erro ao fazer upload:", err);
    return null;
  }
}

/**
 * Remove uma imagem do servico de armazenamento.
 *
 * @param fileUrl - URL publica do arquivo a ser removido
 * @returns `true` se removido com sucesso, `false` caso contrario.
 */
export async function deleteImage(fileUrl: string): Promise<boolean> {
  if (!STORAGE_URL || !STORAGE_KEY) {
    console.warn("[Storage] Storage nao configurado. Exclusao ignorada:", fileUrl);
    return false;
  }

  // TODO: Implementar exclusao real apos escolher provedor.
  console.warn("[Storage] Implementacao de exclusao ainda nao configurada.");
  return false;
}
