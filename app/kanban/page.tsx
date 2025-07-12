'use client';

import { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Calendar, User, Paperclip, MessageSquare, Upload, Edit2, Bell, X, Save, Trash2 } from 'lucide-react';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  attachments: AttachedFile[];
  comments: number;
  createdAt: string;
  reminderDate?: string;
  reminderEnabled: boolean;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  isEditing?: boolean;
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'bg-gray-100',
    tasks: [
      {
        id: 'task-1',
        title: 'Design new landing page',
        description: 'Create mockups for the updated homepage design',
        assignee: 'John Doe',
        dueDate: '2025-07-15',
        priority: 'high',
        attachments: [],
        comments: 3,
        createdAt: '2025-07-10',
        reminderDate: '2025-07-14',
        reminderEnabled: true
      }
    ]
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    color: 'bg-blue-100',
    tasks: []
  },
  {
    id: 'review',
    title: 'In Review',
    color: 'bg-yellow-100',
    tasks: []
  },
  {
    id: 'done',
    title: 'Done',
    color: 'bg-green-100',
    tasks: []
  }
];

export default function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileUpload = async (files: FileList, columnId: string, taskId?: string) => {
    const uploadedFiles: AttachedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadedFile: AttachedFile = {
        id: `file-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      };
      uploadedFiles.push(uploadedFile);
    }

    if (taskId) {
      setColumns(columns.map(col => ({
        ...col,
        tasks: col.tasks.map(task => 
          task.id === taskId 
            ? { ...task, attachments: [...task.attachments, ...uploadedFiles] }
            : task
        )
      })));
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: `Files uploaded: ${Array.from(files).map(f => f.name).join(', ')}`,
        priority: 'medium',
        attachments: uploadedFiles,
        comments: 0,
        createdAt: new Date().toISOString(),
        reminderEnabled: false
      };

      setColumns(columns.map(col => 
        col.id === columnId 
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      ));
    }
  };

  const updateColumnTitle = (columnId: string, newTitle: string) => {
    setColumns(columns.map(col => 
      col.id === columnId 
        ? { ...col, title: newTitle, isEditing: false }
        : col
    ));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setColumns(columns.map(col => ({
      ...col,
      tasks: col.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    })));
  };

  const deleteAttachment = (taskId: string, attachmentId: string) => {
    setColumns(columns.map(col => ({
      ...col,
      tasks: col.tasks.map(task => 
        task.id === taskId 
          ? { ...task, attachments: task.attachments.filter(att => att.id !== attachmentId) }
          : task
      )
    })));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && 
           !columns.find(col => col.id === 'done')?.tasks.includes(task);
  };

  const isReminderDue = (task: Task) => {
    if (!task.reminderEnabled || !task.reminderDate) return false;
    const reminderTime = new Date(task.reminderDate).getTime();
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    return reminderTime - now <= oneDay && reminderTime > now;
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns.find(col => col.id === source.droppableId);
      const destColumn = columns.find(col => col.id === destination.droppableId);
      
      if (!sourceColumn || !destColumn) return;

      const sourceItems = [...sourceColumn.tasks];
      const destItems = [...destColumn.tasks];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setColumns(columns.map(col => {
        if (col.id === source.droppableId) {
          return { ...col, tasks: sourceItems };
        }
        if (col.id === destination.droppableId) {
          return { ...col, tasks: destItems };
        }
        return col;
      }));
    } else {
      const column = columns.find(col => col.id === source.droppableId);
      if (!column) return;

      const items = [...column.tasks];
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);

      setColumns(columns.map(col => 
        col.id === source.droppableId ? { ...col, tasks: items } : col
      ));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const openCreateModal = (columnId: string) => {
    setSelectedColumn(columnId);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Board</h1>
            <p className="text-gray-600 mt-2">Manage your tasks and track progress</p>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus size={20} />
              Add Task
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => (
              <div key={column.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className={`${column.color} p-4 rounded-t-lg`}>
                  <div className="flex justify-between items-center">
                    {column.isEditing ? (
                      <input
                        type="text"
                        defaultValue={column.title}
                        className="bg-white px-2 py-1 rounded text-gray-800 font-semibold border-0 focus:ring-2 focus:ring-blue-500"
                        onBlur={(e) => updateColumnTitle(column.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateColumnTitle(column.id, e.currentTarget.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <h3 
                        className="font-semibold text-gray-800 cursor-pointer hover:bg-white hover:bg-opacity-20 px-2 py-1 rounded"
                        onClick={() => setColumns(columns.map(col => 
                          col.id === column.id ? { ...col, isEditing: true } : { ...col, isEditing: false }
                        ))}
                      >
                        {column.title}
                      </h3>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                        {column.tasks.length}
                      </span>
                      <button 
                        onClick={() => openCreateModal(column.id)}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                        title="Add task"
                      >
                        <Plus size={16} />
                      </button>
                      <button 
                        onClick={() => fileInputRefs.current[column.id]?.click()}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                        title="Upload files"
                      >
                        <Upload size={16} />
                      </button>
                      <input
                        ref={(el) => fileInputRefs.current[column.id] = el}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileUpload(e.target.files, column.id);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 min-h-[400px] space-y-3 ${
                        snapshot.isDraggingOver ? 'bg-gray-50' : ''
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                          handleFileUpload(files, column.id);
                        }
                      }}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                                snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 line-clamp-2">
                                    {task.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {isOverdue(task) && (
                                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                        Overdue
                                      </span>
                                    )}
                                    {isReminderDue(task) && (
                                      <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Bell size={10} />
                                        Reminder
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button 
                                    className="p-1 hover:bg-gray-100 rounded"
                                    onClick={() => setEditingTask(task)}
                                    title="Edit task"
                                  >
                                    <Edit2 size={14} className="text-gray-400" />
                                  </button>
                                  <button className="p-1 hover:bg-gray-100 rounded">
                                    <MoreHorizontal size={16} className="text-gray-400" />
                                  </button>
                                </div>
                              </div>

                              {task.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {task.attachments.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                    <Paperclip size={12} />
                                    Attachments ({task.attachments.length})
                                  </div>
                                  <div className="space-y-1">
                                    {task.attachments.slice(0, 2).map((file) => (
                                      <div key={file.id} className="bg-gray-50 p-2 rounded text-xs flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <Paperclip size={10} className="text-gray-400 flex-shrink-0" />
                                          <span className="truncate">{file.name}</span>
                                          <span className="text-gray-400">({formatFileSize(file.size)})</span>
                                        </div>
                                        <button
                                          onClick={() => deleteAttachment(task.id, file.id)}
                                          className="text-gray-400 hover:text-red-500 p-1"
                                          title="Delete attachment"
                                        >
                                          <X size={10} />
                                        </button>
                                      </div>
                                    ))}
                                    {task.attachments.length > 2 && (
                                      <div className="text-xs text-gray-500 pl-4">
                                        +{task.attachments.length - 2} more files
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div 
                                className="border-2 border-dashed border-gray-200 rounded-lg p-2 text-center hover:border-gray-300 transition-colors cursor-pointer mb-3"
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const files = e.dataTransfer.files;
                                  if (files.length > 0) {
                                    handleFileUpload(files, column.id, task.id);
                                  }
                                }}
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.multiple = true;
                                  input.onchange = (e) => {
                                    const files = (e.target as HTMLInputElement).files;
                                    if (files && files.length > 0) {
                                      handleFileUpload(files, column.id, task.id);
                                    }
                                  };
                                  input.click();
                                }}
                              >
                                <Upload size={14} className="mx-auto text-gray-400 mb-1" />
                                <span className="text-xs text-gray-500">Drop files or click</span>
                              </div>

                              <div className="flex items-center mb-3">
                                <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mr-2`}></span>
                                <span className="text-xs text-gray-500 capitalize">{task.priority} Priority</span>
                              </div>

                              <div className="space-y-2">
                                {task.assignee && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <User size={14} className="mr-2" />
                                    {task.assignee}
                                  </div>
                                )}
                                
                                {task.dueDate && (
                                  <div className={`flex items-center text-sm ${isOverdue(task) ? 'text-red-600' : 'text-gray-600'}`}>
                                    <Calendar size={14} className="mr-2" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                    {isOverdue(task) && <span className="ml-1 text-xs">(Overdue)</span>}
                                  </div>
                                )}

                                {task.reminderEnabled && task.reminderDate && (
                                  <div className={`flex items-center text-sm ${isReminderDue(task) ? 'text-yellow-600' : 'text-gray-600'}`}>
                                    <Bell size={14} className="mr-2" />
                                    Reminder: {new Date(task.reminderDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                  {task.attachments.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Paperclip size={14} />
                                      {task.attachments.length}
                                    </div>
                                  )}
                                  
                                  {task.comments > 0 && (
                                    <div className="flex items-center gap-1">
                                      <MessageSquare size={14} />
                                      {task.comments}
                                    </div>
                                  )}
                                </div>
                                
                                <span className="text-xs text-gray-400">
                                  {new Date(task.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      <button
                        onClick={() => openCreateModal(column.id)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Add a task
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {isCreateModalOpen && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          columnId={selectedColumn}
          onCreateTask={(task) => {
            setColumns(columns.map(col => 
              col.id === selectedColumn 
                ? { ...col, tasks: [...col.tasks, task] }
                : col
            ));
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdateTask={(updates) => {
            updateTask(editingTask.id, updates);
            setEditingTask(null);
          }}
          onDeleteTask={() => {
            setColumns(columns.map(col => ({
              ...col,
              tasks: col.tasks.filter(task => task.id !== editingTask.id)
            })));
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  onCreateTask: (task: Task) => void;
}

function CreateTaskModal({ isOpen, onClose, columnId, onCreateTask }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    reminderDate: '',
    reminderEnabled: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      assignee: formData.assignee,
      dueDate: formData.dueDate,
      priority: formData.priority,
      attachments: [],
      comments: 0,
      createdAt: new Date().toISOString(),
      reminderDate: formData.reminderDate,
      reminderEnabled: formData.reminderEnabled
    };

    onCreateTask(newTask);
    setFormData({
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      priority: 'medium',
      reminderDate: '',
      reminderEnabled: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                placeholder="Enter task description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Assign to team member"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'medium' | 'high'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reminderEnabled"
                  checked={formData.reminderEnabled}
                  onChange={(e) => setFormData({...formData, reminderEnabled: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="reminderEnabled" className="text-sm font-medium text-gray-700">
                  Set reminder
                </label>
              </div>

              {formData.reminderEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.reminderDate}
                    onChange={(e) => setFormData({...formData, reminderDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdateTask: (updates: Partial<Task>) => void;
  onDeleteTask: () => void;
}

function EditTaskModal({ task, onClose, onUpdateTask, onDeleteTask }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    assignee: task.assignee || '',
    dueDate: task.dueDate || '',
    priority: task.priority,
    reminderDate: task.reminderDate || '',
    reminderEnabled: task.reminderEnabled
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTask(formData);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDeleteTask();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
            <div className="flex gap-2">
              <button 
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 p-1"
                title="Delete task"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'medium' | 'high'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editReminderEnabled"
                  checked={formData.reminderEnabled}
                  onChange={(e) => setFormData({...formData, reminderEnabled: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="editReminderEnabled" className="text-sm font-medium text-gray-700">
                  Set reminder
                </label>
              </div>

              {formData.reminderEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.reminderDate}
                    onChange={(e) => setFormData({...formData, reminderDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {task.attachments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments ({task.attachments.length})
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {task.attachments.map((file) => (
                    <div key={file.id} className="bg-gray-50 p-2 rounded flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Paperclip size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-gray-400 text-xs">
                          ({(file.size / 1024 / 1024).toFixed(1)}MB)
                        </span>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-xs mr-2"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}