"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon, XMarkIcon, CalendarIcon, FlagIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Níveis de prioridade
const PRIORITY_LEVELS = {
  low: { label: "Baixa", color: "bg-green-500", textColor: "text-green-400", borderColor: "border-green-500" },
  medium: { label: "Média", color: "bg-yellow-500", textColor: "text-yellow-400", borderColor: "border-yellow-500" },
  high: { label: "Alta", color: "bg-orange-500", textColor: "text-orange-400", borderColor: "border-orange-500" },
  urgent: { label: "Urgente", color: "bg-red-500", textColor: "text-red-400", borderColor: "border-red-500" },
};

// Mock data inicial
const initialBoards = [
  {
    id: "board-1",
    title: "Projeto Alpha",
    priority: "high",
    startDate: "2025-01-15",
    endDate: "2025-03-30",
    lists: [
      {
        id: "list-1",
        title: "A Fazer",
        cards: [
          {
            id: "card-1",
            title: "Configurar o banco de dados",
            description: "Configuração inicial do PostgreSQL.",
          },
          {
            id: "card-2",
            title: "Criar o front-end",
            description: "Desenvolver a interface com Next.js e Tailwind.",
          },
        ],
      },
      {
        id: "list-2",
        title: "Em Andamento",
        cards: [
          {
            id: "card-3",
            title: "Modelar as classes",
            description: "Definir os modelos Django para Boards, Lists e Cards.",
          },
        ],
      },
      {
        id: "list-3",
        title: "Concluído",
        cards: [],
      },
    ],
  },
  {
    id: "board-2",
    title: "Projeto Beta",
    priority: "medium",
    startDate: "2025-02-01",
    endDate: "2025-04-15",
    lists: [
      {
        id: "list-4",
        title: "A Fazer",
        cards: [
          {
            id: "card-5",
            title: "Pesquisa de mercado",
            description: "Analisar concorrentes e público-alvo.",
          },
        ],
      },
      {
        id: "list-5",
        title: "Em Andamento",
        cards: [],
      },
      {
        id: "list-6",
        title: "Concluído",
        cards: [],
      },
    ],
  },
];

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
      <p className="text-sm text-slate-400">
        {card.description}
      </p>
    </div>
  );
};

const App = () => {
  const [boards, setBoards] = useState(initialBoards);
  const [activeBoardId, setActiveBoardId] = useState(boards[0].id);
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
    startDate: "",
    endDate: "",
  });

  const activeBoard = boards.find((board) => board.id === activeBoardId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const card = activeBoard.lists
      .flatMap(list => list.cards)
      .find(c => c.id === active.id);
    setActiveCard(card);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    let startListId = null;
    for (const list of activeBoard.lists) {
      if (list.cards.find(card => card.id === active.id)) {
        startListId = list.id;
        break;
      }
    }

    let endListId = over.id;
    for (const list of activeBoard.lists) {
      if (list.cards.find(card => card.id === over.id)) {
        endListId = list.id;
        break;
      }
    }

    if (!startListId) return;

    if (startListId !== endListId) {
      const startList = activeBoard.lists.find((list) => list.id === startListId);
      const endList = activeBoard.lists.find((list) => list.id === endListId);
      const cardToMove = startList.cards.find((card) => card.id === active.id);

      const newStartCards = startList.cards.filter((card) => card.id !== active.id);
      const newEndCards = [...endList.cards, cardToMove];

      const newLists = activeBoard.lists.map((list) => {
        if (list.id === startListId) {
          return { ...list, cards: newStartCards };
        }
        if (list.id === endListId) {
          return { ...list, cards: newEndCards };
        }
        return list;
      });

      setBoards(
        boards.map((board) =>
          board.id === activeBoardId ? { ...board, lists: newLists } : board
        )
      );
      return;
    }

    const listToUpdate = activeBoard.lists.find((list) => list.id === startListId);
    const oldIndex = listToUpdate.cards.findIndex((card) => card.id === active.id);
    const newIndex = listToUpdate.cards.findIndex((card) => card.id === over.id);

    if (oldIndex !== newIndex) {
      const newCards = arrayMove(listToUpdate.cards, oldIndex, newIndex);

      const newLists = activeBoard.lists.map((list) =>
        list.id === listToUpdate.id ? { ...list, cards: newCards } : list
      );

      setBoards(
        boards.map((board) =>
          board.id === activeBoardId ? { ...board, lists: newLists } : board
        )
      );
    }
  };

  const handleAddCard = (listId) => {
    if (!newCardData.title.trim()) return;

    const newCard = {
      id: `card-${Date.now()}`,
      title: newCardData.title,
      description: newCardData.description,
    };

    const newLists = activeBoard.lists.map((list) =>
      list.id === listId
        ? { ...list, cards: [...list.cards, newCard] }
        : list
    );

    setBoards(
      boards.map((board) =>
        board.id === activeBoardId ? { ...board, lists: newLists } : board
      )
    );

    setNewCardData({ title: "", description: "" });
    setShowNewCardForm(null);
  };

  const handleDeleteCard = (cardId) => {
    const newLists = activeBoard.lists.map((list) => ({
      ...list,
      cards: list.cards.filter((card) => card.id !== cardId),
    }));

    setBoards(
      boards.map((board) =>
        board.id === activeBoardId ? { ...board, lists: newLists } : board
      )
    );
  };

  const handleAddList = () => {
    if (!newListTitle.trim()) return;

    const newList = {
      id: `list-${Date.now()}`,
      title: newListTitle,
      cards: [],
    };

    setBoards(
      boards.map((board) =>
        board.id === activeBoardId
          ? { ...board, lists: [...board.lists, newList] }
          : board
      )
    );

    setNewListTitle("");
    setShowNewListForm(false);
  };

  const handleDeleteList = (listId) => {
    const newLists = activeBoard.lists.filter((list) => list.id !== listId);

    setBoards(
      boards.map((board) =>
        board.id === activeBoardId ? { ...board, lists: newLists } : board
      )
    );
  };

  const handleCreateProject = () => {
    if (!newProjectData.title.trim() || !newProjectData.startDate || !newProjectData.endDate) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const newBoard = {
      id: `board-${Date.now()}`,
      title: newProjectData.title,
      priority: newProjectData.priority,
      startDate: newProjectData.startDate,
      endDate: newProjectData.endDate,
      lists: [
        { id: `list-${Date.now()}-1`, title: "A Fazer", cards: [] },
        { id: `list-${Date.now()}-2`, title: "Em Andamento", cards: [] },
        { id: `list-${Date.now()}-3`, title: "Concluído", cards: [] },
      ],
    };

    setBoards([...boards, newBoard]);
    setActiveBoardId(newBoard.id);
    setNewProjectData({ title: "", priority: "medium", startDate: "", endDate: "" });
    setShowNewProjectModal(false);
  };

  const handleDeleteProject = () => {
    if (boards.length <= 1) {
      alert("Você precisa ter pelo menos um projeto!");
      return;
    }
    
    const confirmed = confirm(`Tem certeza que deseja deletar o projeto "${activeBoard.title}"?`);
    if (confirmed) {
      const newBoards = boards.filter(b => b.id !== activeBoardId);
      setBoards(newBoards);
      setActiveBoardId(newBoards[0].id);
    }
  };

const calculateDaysRemaining = () => {
  const today = new Date();
  const end = new Date(activeBoard.endDate);
  const diffTime = end.getTime() - today.getTime(); // ✅ agora é um número
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};


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
                              {new Date(board.startDate).toLocaleDateString('pt-BR')} - {new Date(board.endDate).toLocaleDateString('pt-BR')}
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
                <span className="text-white font-medium">{new Date(activeBoard.startDate).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-slate-400" />
                <span className="text-slate-400">Término:</span>
                <span className="text-white font-medium">{new Date(activeBoard.endDate).toLocaleDateString('pt-BR')}</span>
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
                    value={newProjectData.startDate}
                    onChange={(e) => setNewProjectData({ ...newProjectData, startDate: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data de Término *
                  </label>
                  <input
                    type="date"
                    value={newProjectData.endDate}
                    onChange={(e) => setNewProjectData({ ...newProjectData, endDate: e.target.value })}
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
                  setNewProjectData({ title: "", priority: "medium", startDate: "", endDate: "" });
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
              <p className="text-sm text-slate-400">
                {activeCard.description}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default App;