const TRELLO_BASE = "https://api.trello.com/1";

function getCredentials() {
  const key = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;
  if (!key || !token) {
    throw new Error("Trello not configured");
  }
  return { key, token };
}

/**
 * Check if Trello integration is configured (env vars present).
 */
export function isTrelloConfigured(): boolean {
  return !!(process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN);
}

async function trelloFetch<T>(
  path: string,
  options: { method?: string; body?: Record<string, unknown> } = {}
): Promise<T> {
  const { key, token } = getCredentials();
  const method = options.method ?? "GET";

  const url = new URL(`${TRELLO_BASE}${path}`);
  url.searchParams.set("key", key);
  url.searchParams.set("token", token);

  const fetchOptions: RequestInit = { method };

  if (options.body) {
    fetchOptions.headers = { "Content-Type": "application/json" };
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url.toString(), fetchOptions);

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Trello API error (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

interface TrelloBoard {
  id: string;
  url: string;
  shortUrl: string;
}

interface TrelloList {
  id: string;
  name: string;
}

interface TrelloCard {
  id: string;
  name: string;
}

/**
 * Create a new Trello board.
 */
export async function createBoard(name: string): Promise<{ id: string; url: string }> {
  const board = await trelloFetch<TrelloBoard>("/boards", {
    method: "POST",
    body: {
      name,
      defaultLists: false,
      prefs_permissionLevel: "private",
    },
  });
  return { id: board.id, url: board.shortUrl || board.url };
}

/**
 * Create a list on a board.
 */
export async function createList(
  boardId: string,
  name: string,
  pos: string = "bottom"
): Promise<TrelloList> {
  return trelloFetch<TrelloList>("/lists", {
    method: "POST",
    body: { name, idBoard: boardId, pos },
  });
}

/**
 * Create a card on a list.
 */
export async function createCard(
  listId: string,
  name: string,
  desc?: string
): Promise<TrelloCard> {
  const body: Record<string, unknown> = { name, idList: listId };
  if (desc) body.desc = desc;
  return trelloFetch<TrelloCard>("/cards", {
    method: "POST",
    body,
  });
}

/**
 * Orchestrate full board creation for a wedding project.
 * Creates board, lists, and initial cards.
 */
export async function setupBoardForWedding(
  coupleName: string,
  _packageType?: string
): Promise<{ boardId: string; boardUrl: string }> {
  // 1. Create the board
  const board = await createBoard(`CIAN — ${coupleName}`);

  // 2. Create lists in order
  const listNames = [
    "Briefing",
    "Conceito",
    "Produção",
    "Aprovação",
    "Entrega",
    "Concluído",
  ];

  const lists: TrelloList[] = [];
  for (const name of listNames) {
    const list = await createList(board.id, name, "bottom");
    lists.push(list);
  }

  // 3. Create initial cards in the Briefing list
  const briefingList = lists[0];
  const initialCards = [
    "Questionário inicial",
    "Referências visuais",
    "Paleta de cores",
  ];

  for (const cardName of initialCards) {
    await createCard(briefingList.id, cardName);
  }

  return { boardId: board.id, boardUrl: board.url };
}
