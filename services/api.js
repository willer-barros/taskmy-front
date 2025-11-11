const API_URL = 'http://192.168.0.107:8000/api';

// Pega o token do localStorage (ou onde você armazenar)
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Token ${getAuthToken()}`,
});

// ============ BOARDS ============
export const boardsAPI = {
  // Lista todos os boards (leve)
  list: async () => {
    const response = await fetch(`${API_URL}/boards/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch boards');
    return response.json();
  },

  // Busca um board específico (com listas e cards)
  get: async (boardId) => {
    const response = await fetch(`${API_URL}/boards/${boardId}/`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch board');
    return response.json();
  },

  // Cria um novo board
  create: async (data) => {
    const response = await fetch(`${API_URL}/boards/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create board');
    return response.json();
  },

  // Atualiza um board
  update: async (boardId, data) => {
    const response = await fetch(`${API_URL}/boards/${boardId}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update board');
    return response.json();
  },

  // Deleta um board
  delete: async (boardId) => {
    const response = await fetch(`${API_URL}/boards/${boardId}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete board');
    return true;
  },
};

// ============ LISTS ============
export const listsAPI = {
  // Cria uma nova lista
  create: async (boardId, data) => {
    const response = await fetch(`${API_URL}/boards/${boardId}/lists/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create list');
    return response.json();
  },

  // Atualiza uma lista
  update: async (boardId, listId, data) => {
    const response = await fetch(`${API_URL}/boards/${boardId}/lists/${listId}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update list');
    return response.json();
  },

  // Deleta uma lista
  delete: async (boardId, listId) => {
    const response = await fetch(`${API_URL}/boards/${boardId}/lists/${listId}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete list');
    return true;
  },
};

// ============ CARDS ============
export const cardsAPI = {
  // Cria um novo card
  create: async (boardId, listId, data) => {
    const response = await fetch(`${API_URL}/boards/${boardId}/lists/${listId}/cards/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create card');
    return response.json();
  },

  // Atualiza um card
  update: async (boardId, listId, cardId, data) => {
    const response = await fetch(`${API_URL}/boards/${boardId}/lists/${listId}/cards/${cardId}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update card');
    return response.json();
  },

  // Move um card (drag & drop)
  move: async (boardId, listId, cardId, newListId, newPosition) => {
    const response = await fetch(`${API_URL}/boards/${boardId}/lists/${listId}/cards/${cardId}/move/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        list_id: newListId,
        position: newPosition,
      }),
    });
    if (!response.ok) throw new Error('Failed to move card');
    return response.json();
  },

  // Deleta um card
  delete: async (boardId, listId, cardId) => {
    const response = await fetch(`${API_URL}/boards/${boardId}/lists/${listId}/cards/${cardId}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete card');
    return true;
  },
};

// ============ AUTH ============
export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/auth-token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Failed to login');
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },
};