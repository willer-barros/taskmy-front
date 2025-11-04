"use client";

import { useEffect, useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import Link from 'next/link';
import Image from 'next/image'; 
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Mock data to start with. Replace with API calls.
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

const SortableItem = ({ card }) => {
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
    zIndex: isDragging ? 10 : 1,
    boxShadow: isDragging ? "0 8px 16px rgba(0,0,0,0.2)" : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-slate-700 p-4 rounded-lg shadow-sm border-l-4 border-blue-500 cursor-grab active:cursor-grabbing transform transition duration-200 hover:scale-[1.02] ${isDragging ? "ring-2 ring-blue-500" : ""}`}
    >
      <h4 className="font-semibold text-white mb-1">
        {card.title}
      </h4>
      <p className="text-sm text-slate-400">
        {card.description}
      </p>
    </div>
  );
};

const App = () => {
  const [boards, setBoards] = useState(initialBoards);
  const [activeBoardId, setActiveBoardId] = useState(boards[0].id);
  const activeBoard = boards.find((board) => board.id === activeBoardId);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    // Lógica para arrastar entre listas
    const startListId = active.data.current.sortable.containerId;
    const endListId = over.data.current?.sortable.containerId || over.id;

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

    // Lógica para arrastar dentro da mesma lista
    const listToUpdate = activeBoard.lists.find((list) => list.id === startListId);
    const oldIndex = listToUpdate.cards.findIndex((card) => card.id === active.id);
    const newIndex = listToUpdate.cards.findIndex((card) => card.id === over.id);

    const newCards = arrayMove(listToUpdate.cards, oldIndex, newIndex);

    const newLists = activeBoard.lists.map((list) =>
      list.id === listToUpdate.id ? { ...list, cards: newCards } : list
    );

    setBoards(
      boards.map((board) =>
        board.id === activeBoardId ? { ...board, lists: newLists } : board
      )
    );
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white font-sans p-8">
      <div className="flex justify-between items-center mb-6">

        
      </div>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {activeBoard.title}
        </h2>
        <p className="text-slate-400">
          Gerenciamento de tarefas em um só lugar. Arraste e solte os cartões
          para organizar seu fluxo de trabalho.
        </p>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeBoard.lists.map((list) => (
            <SortableContext items={list.cards.map(card => card.id)} key={list.id} id={list.id}>
              <div
                className="bg-slate-800 p-5 rounded-xl shadow-md flex flex-col gap-4 min-h-[300px]"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-white">
                    {list.title}
                  </h3>
                  <button className="text-slate-400 hover:text-red-500 transition duration-200">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                {list.cards.map((card) => (
                  <SortableItem key={card.id} card={card} />
                ))}
                <button className="flex items-center justify-center text-slate-400 hover:text-blue-500 transition duration-200 mt-2">
                  <PlusIcon className="h-5 w-5" />
                  <span className="ml-2">Adicionar Cartão</span>
                </button>
              </div>
            </SortableContext>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default App;
