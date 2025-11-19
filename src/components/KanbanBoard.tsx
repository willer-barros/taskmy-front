"use client";

import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, XMarkIcon, CalendarIcon, FlagIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Configuração da API
const API_URL = 'http://192.168.0.107:8000/api';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    // console.log('🔑 Token recuperado:', token); // DEBUG
    return token;
  }
  return null;
};

const getHeaders = () => {
  const token = getAuthToken();
  // console.log('📤 Enviando headers com token:', token); // DEBUG
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` }),
  };
};

// API Functions
const api = {
  boards: {
    list: async () => {
      const response = await fetch(`${API_URL}/boards/`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch boards');
      return response.json();
    },
    get: async (boardId) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch board');
      return response.json();
    },
    create: async (data) => {
      const response = await fetch(`${API_URL}/boards/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create board');
      return response.json();
    },
    delete: async (boardId) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete board');
      return true;
    },
  },
  lists: {
    create: async (boardId, data) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/lists/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create list');
      return response.json();
    },
    delete: async (boardId, listId) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/lists/${listId}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete list');
      return true;
    },
  },
  cards: {
    create: async (boardId, listId, data) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/lists/${listId}/cards/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create card');
      return response.json();
    },
    move: async (boardId, oldListId, cardId, newListId) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/lists/${oldListId}/cards/${cardId}/move/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ list_id: newListId }),
      });
      if (!response.ok) throw new Error('Failed to move card');
      return response.json();
    },
    delete: async (boardId, listId, cardId) => {
      const response = await fetch(`${API_URL}/boards/${boardId}/lists/${listId}/cards/${cardId}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete card');
      return true;
    },
  },
};

// Níveis de prioridade
const PRIORITY_LEVELS = {
  low: { label: "Baixa", color: "bg-green-500", textColor: "text-green-400", borderColor: "border-green-500" },
  medium: { label: "Média", color: "bg-yellow-500", textColor: "text-yellow-400", borderColor: "border-yellow-500" },
  high: { label: "Alta", color: "bg-orange-500", textColor: "text-orange-400", borderColor: "border-orange-500" },
  urgent: { label: "Urgente", color: "bg-red-500", textColor: "text-red-400", borderColor: "border-red-500" },
};

const SortableItem = ({ card, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-slate-700 p-4 rounded-lg shadow-sm border border-slate-600 hover:border-slate-500 cursor-grab active:cursor-grabbing transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-white flex-1 pr-2">
          {card.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
      {card.description && (
        <p className="text-sm text-slate-400">
          {card.description}
        </p>
      )}
    </div>
  );
};

const App = () => {
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [activeBoard, setActiveBoard] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [showNewCardForm, setShowNewCardForm] = useState(null);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [newCardData, setNewCardData] = useState({ title: "", description: "" });
  const [newListTitle, setNewListTitle] = useState("");
  const [newProjectData, setNewProjectData] = useState({
    title: "",
    priority: "medium",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Carregar lista de boards ao montar
  useEffect(() => {
    loadBoards();
  }, []);

  // Carregar board completo quando selecionar um
  useEffect(() => {
    if (activeBoardId) {
      loadBoardDetail(activeBoardId);
    }
  }, [activeBoardId]);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const data = await api.boards.list();
      setBoards(data);
      if (data.length > 0 && !activeBoardId) {
        setActiveBoardId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
      alert('Erro ao carregar projetos. Verifique se está autenticado.');
    } finally {
      setLoading(false);
    }
  };

  const loadBoardDetail = async (boardId) => {
    try {
      const data = await api.boards.get(boardId);
      setActiveBoard(data);
    } catch (error) {
      console.error('Error loading board detail:', error);
      alert('Erro ao carregar detalhes do projeto.');
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const card = activeBoard?.lists
      ?.flatMap(list => list.cards)
      .find(c => c.id === active.id);
    setActiveCard(card);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || !activeBoard) return;

    // Encontrar a lista de origem
    let startListId = null;
    let startList = null;
    for (const list of activeBoard.lists) {
      if (list.cards.find(card => card.id === active.id)) {
        startListId = list.id;
        startList = list;
        break;
      }
    }

    // Determinar a lista de destino
    let endListId = over.id;
    let endList = null;
    for (const list of activeBoard.lists) {
      if (list.cards.find(card => card.id === over.id)) {
        endListId = list.id;
        endList = list;
        break;
      }
      if (list.id === over.id) {
        endListId = list.id;
        endList = list;
        break;
      }
    }

    if (!startListId || !endListId) return;

    // Se moveu para outra lista, chama a API
    if (startListId !== endListId) {
      try {
        await api.cards.move(activeBoard.id, startListId, active.id, endListId);
        // Recarrega o board após mover
        await loadBoardDetail(activeBoard.id);
      } catch (error) {
        console.error('Error moving card:', error);
        alert('Erro ao mover card.');
      }
    }
  };

  const handleAddCard = async (listId) => {
    if (!newCardData.title.trim()) return;

    try {
      await api.cards.create(activeBoard.id, listId, newCardData);
      setNewCardData({ title: "", description: "" });
      setShowNewCardForm(null);
      // Recarrega o board
      await loadBoardDetail(activeBoard.id);
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Erro ao criar card.');
    }
  };

  const handleDeleteCard = async (cardId) => {
    const list = activeBoard.lists.find(l => l.cards.some(c => c.id === cardId));
    if (!list) return;

    try {
      await api.cards.delete(activeBoard.id, list.id, cardId);
      await loadBoardDetail(activeBoard.id);
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Erro ao deletar card.');
    }
  };

  const handleAddList = async () => {
  if (!newListTitle.trim()) return;

  try {
    console.log('🔵 Criando lista:', { title: newListTitle });
    console.log('🔵 Board ID:', activeBoard.id);
    
    const result = await api.lists.create(activeBoard.id, { title: newListTitle });
    
    console.log('✅ Lista criada:', result);
    setNewListTitle("");
    setShowNewListForm(false);
    await loadBoardDetail(activeBoard.id);
  } catch (error) {
    console.error('❌ Erro ao criar lista:', error);
    
    // Tentar pegar mais detalhes do erro
    if (error.response) {
      const errorData = await error.response.json();
      console.error('❌ Detalhes do erro:', errorData);
    }
    
    alert('Erro ao criar lista.');
  }
};

  const handleDeleteList = async (listId) => {
    try {
      await api.lists.delete(activeBoard.id, listId);
      await loadBoardDetail(activeBoard.id);
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Erro ao deletar lista.');
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectData.title.trim() || !newProjectData.start_date || !newProjectData.end_date) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const newBoard = await api.boards.create(newProjectData);
      await loadBoards();
      setActiveBoardId(newBoard.id);
      setNewProjectData({ title: "", priority: "medium", start_date: "", end_date: "" });
      setShowNewProjectModal(false);
    } catch (error) {
      console.error('Error creating board:', error);
      alert('Erro ao criar projeto.');
    }
  };

  const handleDeleteProject = async () => {
    if (boards.length <= 1) {
      alert("Você precisa ter pelo menos um projeto!");
      return;
    }
    
    const confirmed = confirm(`Tem certeza que deseja deletar o projeto "${activeBoard.title}"?`);
    if (confirmed) {
      try {
        await api.boards.delete(activeBoard.id);
        await loadBoards();
        if (boards.length > 1) {
          const newBoard = boards.find(b => b.id !== activeBoard.id);
          setActiveBoardId(newBoard.id);
        }
      } catch (error) {
        console.error('Error deleting board:', error);
        alert('Erro ao deletar projeto.');
      }
    }
  };

  const calculateDaysRemaining = () => {
    if (!activeBoard?.end_date) return 0;
    const today = new Date();
    const end = new Date(activeBoard.end_date);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e293b] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!activeBoard) {
    return (
      <div className="min-h-screen bg-[#1e293b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Nenhum projeto encontrado</p>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Criar Primeiro Projeto
          </button>
        </div>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="bg-[#1e293b] min-h-screen text-white p-8">
      {/* Header com seletor de projetos */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <button
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="flex items-center gap-3 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full ${PRIORITY_LEVELS[activeBoard.priority].color}`}></div>
                  <span className="text-xl font-bold text-white">{activeBoard.title}</span>
                  <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                </button>

                {showProjectDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-slate-700 rounded-lg shadow-xl border border-slate-600 min-w-[300px] z-50">
                    <div className="p-2 max-h-[400px] overflow-y-auto">
                      {boards.map((board) => (
                        <button
                          key={board.id}
                          onClick={() => {
                            setActiveBoardId(board.id);
                            setShowProjectDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            board.id === activeBoardId
                              ? 'bg-slate-600 text-white'
                              : 'hover:bg-slate-600 text-slate-300'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${PRIORITY_LEVELS[board.priority].color} flex-shrink-0`}></div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{board.title}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              {new Date(board.start_date).toLocaleDateString('pt-BR')} - {new Date(board.end_date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${PRIORITY_LEVELS[board.priority].color}`}>
                            {PRIORITY_LEVELS[board.priority].label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowNewProjectModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition-colors font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Novo Projeto
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-slate-400" />
                <span className="text-slate-400">Início:</span>
                <span className="text-white font-medium">{new Date(activeBoard.start_date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-slate-400" />
                <span className="text-slate-400">Término:</span>
                <span className="text-white font-medium">{new Date(activeBoard.end_date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <FlagIcon className={`h-5 w-5 ${PRIORITY_LEVELS[activeBoard.priority].textColor}`} />
                <span className="text-slate-400">Prioridade:</span>
                <span className={`font-medium ${PRIORITY_LEVELS[activeBoard.priority].textColor}`}>
                  {PRIORITY_LEVELS[activeBoard.priority].label}
                </span>
              </div>
              <div className={`flex items-center gap-2 ${daysRemaining < 7 ? 'text-red-400' : 'text-slate-400'}`}>
                <span>•</span>
                <span className="font-medium">
                  {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Prazo vencido'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDeleteProject}
            className="text-slate-400 hover:text-red-400 transition-colors"
            title="Deletar projeto"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Modal para criar novo projeto */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Criar Novo Projeto</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  value={newProjectData.title}
                  onChange={(e) => setNewProjectData({ ...newProjectData, title: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Ex: Redesign do Site"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nível de Prioridade *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(PRIORITY_LEVELS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setNewProjectData({ ...newProjectData, priority: key })}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                        newProjectData.priority === key
                          ? `${value.borderColor} bg-slate-700`
                          : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${value.color}`}></div>
                      <span className="text-white font-medium">{value.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    value={newProjectData.start_date}
                    onChange={(e) => setNewProjectData({ ...newProjectData, start_date: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data de Término *
                  </label>
                  <input
                    type="date"
                    value={newProjectData.end_date}
                    onChange={(e) => setNewProjectData({ ...newProjectData, end_date: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateProject}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Criar Projeto
              </button>
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setNewProjectData({ title: "", priority: "medium", start_date: "", end_date: "" });
                }}
                className="px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {activeBoard.lists.map((list) => (
            <div
              key={list.id}
              className="bg-slate-800 p-5 rounded-xl shadow-md flex flex-col gap-3 min-w-[320px] max-w-[320px] flex-shrink-0"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {list.title}
                  </h3>
                  <span className="text-sm text-slate-400">({list.cards.length})</span>
                </div>
                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="text-slate-400 hover:text-red-400 transition duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <SortableContext
                items={list.cards.map(card => card.id)}
                strategy={verticalListSortingStrategy}
                id={list.id}
              >
                <div className="flex flex-col gap-3 min-h-[100px]">
                  {list.cards.map((card) => (
                    <SortableItem
                      key={card.id}
                      card={card}
                      onDelete={handleDeleteCard}
                    />
                  ))}
                </div>
              </SortableContext>

              {showNewCardForm === list.id ? (
                <div className="bg-slate-700 p-4 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Título do cartão"
                    value={newCardData.title}
                    onChange={(e) => setNewCardData({ ...newCardData, title: e.target.value })}
                    className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                  <textarea
                    placeholder="Descrição (opcional)"
                    value={newCardData.description}
                    onChange={(e) => setNewCardData({ ...newCardData, description: e.target.value })}
                    className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddCard(list.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                    >
                      Adicionar
                    </button>
                    <button
                      onClick={() => {
                        setShowNewCardForm(null);
                        setNewCardData({ title: "", description: "" });
                      }}
                      className="px-4 py-2 text-slate-400 hover:text-white transition"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewCardForm(list.id)}
                  className="flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-slate-700 py-3 rounded-lg transition duration-200"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span className="ml-2">Adicionar Cartão</span>
                </button>
              )}
            </div>
          ))}

          {showNewListForm ? (
            <div className="bg-slate-800 p-5 rounded-xl shadow-md min-w-[320px] max-w-[320px] flex-shrink-0">
              <input
                type="text"
                placeholder="Título da lista"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddList}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  Adicionar Lista
                </button>
                <button
                  onClick={() => {
                    setShowNewListForm(false);
                    setNewListTitle("");
                  }}
                  className="px-4 py-2 text-slate-400 hover:text-white transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewListForm(true)}
              className="bg-slate-800 hover:bg-slate-700 p-5 rounded-xl min-w-[320px] max-w-[320px] flex-shrink-0 flex items-center justify-center text-slate-400 hover:text-white transition duration-200"
            >
              <PlusIcon className="h-6 w-6 mr-2" />
              Adicionar Lista
            </button>
          )}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="bg-slate-700 p-4 rounded-lg shadow-2xl border border-slate-600 w-[320px] cursor-grabbing opacity-90">
              <h4 className="font-semibold text-white mb-2">
                {activeCard.title}
              </h4>
              {activeCard.description && (
                <p className="text-sm text-slate-400">
                  {activeCard.description}
                </p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default App;