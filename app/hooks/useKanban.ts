const addAttachment = (taskId: string, file: AttachedFile) => {
    if (!currentBoard) return;

    const updatedBoard = {
      ...currentBoard,
      columns: currentBoard.columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task =>
          task.id === taskId
            ? { ...task, attachments: [...task.attachments, file], updatedAt: new Date().toISOString() }
            : task
        )
      }))
    };

    updateBoard(updatedBoard);
  };

  const removeAttachment = (taskId: string, attachmentId: string) => {
    if (!currentBoard) return;

    const updatedBoard = {
      ...currentBoard,
      columns: currentBoard.columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task =>
          task.id === taskId
            ? { 
                ...task, 
                attachments: task.attachments.filter(att => att.id !== attachmentId),
                updatedAt: new Date().toISOString()
              }
            : task
        )
      }))
    };

    updateBoard(updatedBoard);
  };

  const getTasksWithReminders = (): Task[] => {
    if (!currentBoard) return [];

    const allTasks = currentBoard.columns.flatMap(column => column.tasks);
    return allTasks.filter(task => 
      task.reminderEnabled && 
      task.reminderDate &&
      new Date(task.reminderDate) > new Date()
    );
  };

  const getTasksDueToday = (): Task[] => {
    if (!currentBoard) return [];

    const today = new Date().toISOString().split('T')[0];
    const allTasks = currentBoard.columns.flatMap(column => column.tasks);
    
    return allTasks.filter(task => 
      task.dueDate === today &&
      !currentBoard.columns.find(col => col.id === 'done')?.tasks.includes(task)
    );
  };import { useState, useEffect } from 'react';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  attachments: AttachedFile[];
  comments: number;
  createdAt: string;
  updatedAt?: string;
  projectId?: string;
  tags?: string[];
  reminderDate?: string;
  reminderEnabled: boolean;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  order: number;
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: Column[];
  projectId?: string;
}

const STORAGE_KEY = 'flowen_kanban_boards';

export function useKanban(boardId?: string) {
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [currentBoard, setCurrentBoard] = useState<KanbanBoard | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize with default board if none exists
  useEffect(() => {
    const savedBoards = localStorage.getItem(STORAGE_KEY);
    let parsedBoards: KanbanBoard[] = [];

    if (savedBoards) {
      try {
        parsedBoards = JSON.parse(savedBoards);
      } catch (error) {
        console.error('Error parsing saved boards:', error);
      }
    }

    // Create default board if none exists
    if (parsedBoards.length === 0) {
      const defaultBoard = createDefaultBoard();
      parsedBoards = [defaultBoard];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedBoards));
    }

    setBoards(parsedBoards);
    
    // Set current board
    if (boardId) {
      const board = parsedBoards.find(b => b.id === boardId);
      setCurrentBoard(board || parsedBoards[0]);
    } else {
      setCurrentBoard(parsedBoards[0]);
    }
    
    setLoading(false);
  }, [boardId]);

  // Save to localStorage whenever boards change
  useEffect(() => {
    if (boards.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    }
  }, [boards]);

  const createDefaultBoard = (): KanbanBoard => {
    return {
      id: 'default-board',
      title: 'Project Board',
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          color: 'bg-gray-100',
          order: 0,
          tasks: []
        },
        {
          id: 'inprogress',
          title: 'In Progress',
          color: 'bg-blue-100',
          order: 1,
          tasks: []
        },
        {
          id: 'review',
          title: 'In Review',
          color: 'bg-yellow-100',
          order: 2,
          tasks: []
        },
        {
          id: 'done',
          title: 'Done',
          color: 'bg-green-100',
          order: 3,
          tasks: []
        }
      ]
    };
  };

  const addTask = (columnId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'attachments' | 'comments'>) => {
    if (!currentBoard) return;

    const newTask: Task = {
      ...taskData,
      id: generateTaskId(),
      createdAt: new Date().toISOString(),
      attachments: [],
      comments: 0
    };

    const updatedBoard = {
      ...currentBoard,
      columns: currentBoard.columns.map(column =>
        column.id === columnId
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      )
    };

    updateBoard(updatedBoard);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    if (!currentBoard) return;

    const updatedBoard = {
      ...currentBoard,
      columns: currentBoard.columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        )
      }))
    };

    updateBoard(updatedBoard);
  };

  const deleteTask = (taskId: string) => {
    if (!currentBoard) return;

    const updatedBoard = {
      ...currentBoard,
      columns: currentBoard.columns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => task.id !== taskId)
      }))
    };

    updateBoard(updatedBoard);
  };

  const moveTask = (taskId: string, sourceColumnId: string, destinationColumnId: string, destinationIndex: number) => {
    if (!currentBoard) return;

    const sourceColumn = currentBoard.columns.find(col => col.id === sourceColumnId);
    const destinationColumn = currentBoard.columns.find(col => col.id === destinationColumnId);

    if (!sourceColumn || !destinationColumn) return;

    const taskToMove = sourceColumn.tasks.find(task => task.id === taskId);
    if (!taskToMove) return;

    // Remove task from source column
    const updatedSourceTasks = sourceColumn.tasks.filter(task => task.id !== taskId);
    
    // Add task to destination column at specific index
    const updatedDestinationTasks = [...destinationColumn.tasks];
    updatedDestinationTasks.splice(destinationIndex, 0, taskToMove);

    const updatedBoard = {
      ...currentBoard,
      columns: currentBoard.columns.map(column => {
        if (column.id === sourceColumnId) {
          return { ...column, tasks: updatedSourceTasks };
        }
        if (column.id === destinationColumnId) {
          return { ...column, tasks: updatedDestinationTasks };
        }
        return column;
      })
    };

    updateBoard(updatedBoard);
  };

  const reorderTasksInColumn = (columnId: string, sourceIndex: number, destinationIndex: number) => {
    if (!currentBoard) return;

    const column = currentBoard.columns.find(col => col.id === columnId);
    if (!column) return;

    const reorderedTasks = Array.from(column.tasks);
    const [removed] = reorderedTasks.splice(sourceIndex, 1);
    reorderedTasks.splice(destinationIndex, 0, removed);

    const updatedBoard = {
      ...currentBoard,
      columns: currentBoard.columns.map(col =>
        col.id === columnId ? { ...col, tasks: reorderedTasks } : col
      )
    };

    updateBoard(updatedBoard);
  };

  const addColumn = (title: string, color: string) => {
    if (!currentBoard) return;

    const newColumn: Column = {
      id: generateColumnId(),
      title,
      color,
      tasks: [],
      order: currentBoard.columns.length
    };

    const updatedBoard = {
      ...currentBoard,
      columns: [...currentBoard.columns, newColumn]
    };

    updateBoard(updatedBoard);
  };

  const updateColumn = (columnId: string, updates: Partial<Column>) => {
    if (!currentBoard) return;

    const updatedBoard = {
      ...currentBoard,
      columns: currentBoard.columns.map(column =>
        column.id === columnId ? { ...column, ...updates } : column
      )
    };

    updateBoard(updatedBoard);
  };

  const deleteColumn = (columnId: string) => {
    if (!currentBoard) return;

    const updatedBoard = {
      ...currentBoard,
      columns: currentBoard.columns.filter(column => column.id !== columnId)
    };

    updateBoard(updatedBoard);
  };

  const updateBoard = (updatedBoard: KanbanBoard) => {
    setCurrentBoard(updatedBoard);
    setBoards(boards.map(board => 
      board.id === updatedBoard.id ? updatedBoard : board
    ));
  };

  const createBoard = (title: string, projectId?: string): KanbanBoard => {
    const newBoard: KanbanBoard = {
      id: generateBoardId(),
      title,
      projectId,
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          color: 'bg-gray-100',
          order: 0,
          tasks: []
        },
        {
          id: 'inprogress',
          title: 'In Progress',
          color: 'bg-blue-100',
          order: 1,
          tasks: []
        },
        {
          id: 'review',
          title: 'In Review',
          color: 'bg-yellow-100',
          order: 2,
          tasks: []
        },
        {
          id: 'done',
          title: 'Done',
          color: 'bg-green-100',
          order: 3,
          tasks: []
        }
      ]
    };

    setBoards([...boards, newBoard]);
    return newBoard;
  };

  const deleteBoard = (boardId: string) => {
    const updatedBoards = boards.filter(board => board.id !== boardId);
    setBoards(updatedBoards);
    
    if (currentBoard?.id === boardId) {
      setCurrentBoard(updatedBoards[0] || null);
    }
  };

  const getTaskStats = () => {
    if (!currentBoard) return { total: 0, completed: 0, inProgress: 0, todo: 0 };

    const allTasks = currentBoard.columns.flatMap(column => column.tasks);
    const completed = currentBoard.columns.find(col => col.id === 'done')?.tasks.length || 0;
    const inProgress = currentBoard.columns.find(col => col.id === 'inprogress')?.tasks.length || 0;
    const todo = currentBoard.columns.find(col => col.id === 'todo')?.tasks.length || 0;

    return {
      total: allTasks.length,
      completed,
      inProgress,
      todo
    };
  };

  const searchTasks = (query: string): Task[] => {
    if (!currentBoard || !query.trim()) return [];

    const allTasks = currentBoard.columns.flatMap(column => column.tasks);
    return allTasks.filter(task =>
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      task.description?.toLowerCase().includes(query.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getTasksByPriority = (priority: 'low' | 'medium' | 'high'): Task[] => {
    if (!currentBoard) return [];

    const allTasks = currentBoard.columns.flatMap(column => column.tasks);
    return allTasks.filter(task => task.priority === priority);
  };

  const getOverdueTasks = (): Task[] => {
    if (!currentBoard) return [];

    const today = new Date().toISOString().split('T')[0];
    const allTasks = currentBoard.columns.flatMap(column => column.tasks);
    
    return allTasks.filter(task => 
      task.dueDate && task.dueDate < today && 
      !currentBoard.columns.find(col => col.id === 'done')?.tasks.includes(task)
    );
  };

  // Helper functions
  const generateTaskId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const generateColumnId = () => `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const generateBoardId = () => `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    // State
    boards,
    currentBoard,
    loading,

    // Board operations
    createBoard,
    deleteBoard,
    updateBoard,
    setCurrentBoard,

    // Column operations
    addColumn,
    updateColumn,
    deleteColumn,

    // Task operations
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasksInColumn,

    // Utility functions
    getTaskStats,
    searchTasks,
    getTasksByPriority,
    getOverdueTasks,

    // New functions
    addAttachment,
    removeAttachment,
    getTasksWithReminders,
    getTasksDueToday
  };
}