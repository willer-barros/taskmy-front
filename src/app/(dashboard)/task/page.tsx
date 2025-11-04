"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Mock data inicial
const initialBoards = [
  {
    id: "board-1",
    title: "Projeto Alpha",
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
        cards: [
          {
            id: "card-4",
            title: "Configurar Docker",
            description: "Criar os arquivos Dockerfile e docker-compose.yml.",
          },
        ],
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
  const [newCardData, setNewCardData] = useState({ title: "", description: "" });
  const [newListTitle, setNewListTitle] = useState("");

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

    // Encontrar a lista de origem
    let startListId = null;
    for (const list of activeBoard.lists) {
      if (list.cards.find(card => card.id === active.id)) {
        startListId = list.id;
        break;
      }
    }

    // Determinar a lista de destino
    let endListId = over.id;
    for (const list of activeBoard.lists) {
      if (list.cards.find(card => card.id === over.id)) {
        endListId = list.id;
        break;
      }
    }

    if (!startListId) return;

    // Mover entre listas diferentes
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

    // Reordenar dentro da mesma lista
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

  return (
    <div className="bg-[#1e293b] min-h-screen text-white p-8">
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">
          {activeBoard.title}
        </h2>
        <p className="text-slate-400">
          Gerenciamento de tarefas em um só lugar. Arraste e solte os cartões
          para organizar seu fluxo de trabalho.
        </p>
      </div>

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

          {/* Adicionar nova lista */}
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