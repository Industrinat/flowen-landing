"use client";

import React, { useState } from 'react';
import { Plus, MoreVertical, Calendar, User, Tag } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  tags?: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        {
          id: '1',
          title: 'Update file encryption algorithm',
          description: 'Improve security for file uploads',
          priority: 'high',
          assignee: 'You',
          dueDate: '2025-01-15',
          tags: ['security', 'backend']
        },
        {
          id: '2',
          title: 'Design new dashboard layout',
          description: 'Create mockups for improved UI',
          priority: 'medium',
          assignee: 'You',
          dueDate: '2025-01-20',
          tags: ['design', 'frontend']
        }
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        {
          id: '3',
          title: 'Implement file sharing feature',
          description: 'Allow users to share encrypted files',
          priority: 'high',
          assignee: 'You',
          dueDate: '2025-01-10',
          tags: ['feature', 'backend']
        }
      ]
    },
    {
      id: 'review',
      title: 'Review',
      tasks: [
        {
          id: '4',
          title: 'Test mobile responsiveness',
          description: 'Ensure all pages work on mobile',
          priority: 'medium',
          assignee: 'You',
          tags: ['testing', 'mobile']
        }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        {
          id: '5',
          title: 'Setup project structure',
          priority: 'low',
          assignee: 'You',
          tags: ['setup']
        }
      ]
    }
  ]);

  const [draggedTask, setDraggedTask] = useState<{ task: Task; sourceColumnId: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleDragStart = (e: React.DragEvent, task: Task, columnId: string) => {
    setDraggedTask({ task, sourceColumnId: columnId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (columnId: string) => {
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only remove highlight if we're leaving the column entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    if (!draggedTask) return;
    
    const { task, sourceColumnId } = draggedTask;
    
    if (sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      setDragOverColumn(null);
      return;
    }
    
    // Remove task from source column
    const newColumns = columns.map(col => {
      if (col.id === sourceColumnId) {
        return {
          ...col,
          tasks: col.tasks.filter(t => t.id !== task.id)
        };
      }
      if (col.id === targetColumnId) {
        return {
          ...col,
          tasks: [...col.tasks, task]
        };
      }
      return col;
    });
    
    setColumns(newColumns);
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleAddTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      priority: 'medium',
      assignee: 'You',
      tags: []
    };
    
    setColumns(columns.map(col => 
      col.id === columnId 
        ? { ...col, tasks: [...col.tasks, newTask] }
        : col
    ));
    
    setNewTaskTitle('');
    setShowAddTask(null);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map(column => (
          <div
            key={column.id}
            className={`min-w-[320px] transition-all ${
              dragOverColumn === column.id ? 'scale-[1.02]' : ''
            }`}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`bg-white/10 backdrop-blur-lg rounded-xl border transition-all ${
              dragOverColumn === column.id 
                ? 'border-blue-400 bg-blue-500/20' 
                : 'border-white/20'
            }`}>
              {/* Column Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{column.title}</h3>
                    <span className="text-sm text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                      {column.tasks.length}
                    </span>
                  </div>
                  <button className="p-1 hover:bg-white/10 rounded transition-colors">
                    <MoreVertical className="h-4 w-4 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Tasks */}
              <div className="p-3 space-y-3 min-h-[400px]">
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 cursor-move hover:bg-white/15 transition-all hover:scale-[1.02] hover:shadow-lg"
                  >
                    <h4 className="font-medium text-white mb-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-white/70 mb-3">{task.description}</p>
                    )}
                    
                    {/* Task metadata */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {task.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      )}
                      {task.tags?.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <div className="flex items-center gap-3">
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{task.assignee}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Task Button/Form */}
                {showAddTask === column.id ? (
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                      placeholder="Enter task title..."
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddTask(column.id)}
                        className="px-3 py-1 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded text-sm transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddTask(null);
                          setNewTaskTitle('');
                        }}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddTask(column.id)}
                    className="w-full flex items-center gap-2 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add task</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;