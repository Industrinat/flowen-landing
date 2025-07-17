'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Plus, Kanban, List, Trash2, X, Edit2, ArrowLeft, DollarSign, User, Building2, 
  Mail, Phone, Calendar, Globe, AlertTriangle, Target, Clock, Settings, 
  Bell, ArrowUpDown, ArrowUp, ArrowDown, Upload, Paperclip
} from 'lucide-react';

// ----- KONSTANTER -----
const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'USD', symbol: '$', name: 'US Dollar' }
];

const STAGES = {
  'prospecting': { name: 'Prospecting', color: 'bg-gray-100 text-gray-700' },
  'qualification': { name: 'Qualification', color: 'bg-blue-100 text-blue-700' },
  'proposal': { name: 'Proposal', color: 'bg-yellow-100 text-yellow-700' },
  'negotiation': { name: 'Negotiation', color: 'bg-orange-100 text-orange-700' },
  'closed-won': { name: 'Closed Won', color: 'bg-green-100 text-green-700' },
  'closed-lost': { name: 'Closed Lost', color: 'bg-red-100 text-red-700' }
};

const TASK_STATUSES = {
  'todo': { 
    name: 'Discovery', 
    color: 'bg-gray-100 text-gray-700', 
    bgColor: 'bg-gray-50',
    probability: 20,
    description: 'Initial research and qualification'
  },
  'in-progress': { 
    name: 'Proposal', 
    color: 'bg-blue-100 text-blue-700', 
    bgColor: 'bg-blue-50',
    probability: 50,
    description: 'Proposal sent, awaiting response'
  },
  'review': { 
    name: 'Negotiation', 
    color: 'bg-yellow-100 text-yellow-700', 
    bgColor: 'bg-yellow-50',
    probability: 75,
    description: 'Active negotiation phase'
  },
  'done': { 
    name: 'Closed', 
    color: 'bg-green-100 text-green-700', 
    bgColor: 'bg-green-50',
    probability: 100,
    description: 'Deal successfully closed'
  }
};

// ----- MOCK DATA -----
const MOCK_DEALS = [
  {
    id: '1',
    title: 'Acme Corp - Website Redesign',
    value: 45000,
    customer: 'Acme Corporation',
    contact: 'John Smith',
    email: 'john@acme.com',
    phone: '+46 70 123 4567',
    stage: 'prospecting',
    probability: 25,
    expectedCloseDate: '2025-08-15',
    actualCloseDate: null,
    lastActivity: '2025-07-10',
    owner: 'Anna Anderson',
    description: 'Complete website redesign with new branding and modern UX/UI design.',
    currency: 'EUR',
    createdAt: '2025-06-15',
    status: 'open',
    tasks: [
      { id: 't1', title: 'Initial discovery call', description: 'Schedule and conduct initial client meeting to understand requirements and scope', status: 'done', assignee: 'Anna Anderson', dueDate: '2025-07-12', attachments: [], value: 45000 },
      { id: 't2', title: 'Send project proposal', description: 'Create detailed proposal document with timeline, deliverables and pricing', status: 'in-progress', assignee: 'Anna Anderson', dueDate: '2025-07-18', attachments: [], value: 45000 },
      { id: 't3', title: 'Schedule technical meeting', description: 'Arrange technical discussion with client development team', status: 'todo', assignee: 'Anna Anderson', dueDate: '2025-07-20', attachments: [], value: 45000 }
    ]
  },
  {
    id: '2',
    title: 'TechStart - Mobile App',
    value: 85000,
    customer: 'TechStart AB',
    contact: 'Maria Larsson',
    email: 'maria@techstart.se',
    phone: '+46 70 987 6543',
    stage: 'qualification',
    probability: 50,
    expectedCloseDate: '2025-09-01',
    actualCloseDate: null,
    lastActivity: '2025-07-12',
    owner: 'Erik Lindqvist',
    description: 'Native mobile app development for iOS and Android.',
    currency: 'EUR',
    createdAt: '2025-07-01',
    status: 'open',
    tasks: [
      { id: 't4', title: 'Requirements gathering', description: 'Detailed analysis of functional and technical requirements', status: 'done', assignee: 'Erik Lindqvist', dueDate: '2025-07-10', attachments: [], value: 85000 },
      { id: 't5', title: 'Create technical specification', description: 'Document technical architecture and implementation plan', status: 'in-progress', assignee: 'Erik Lindqvist', dueDate: '2025-07-16', attachments: [], value: 85000 },
      { id: 't6', title: 'Cost estimation', description: 'Final review of development costs and timeline', status: 'review', assignee: 'Erik Lindqvist', dueDate: '2025-07-18', attachments: [], value: 85000 }
    ]
  },
  {
    id: '3',
    title: 'StartupX - Brand Identity',
    value: 25000,
    customer: 'StartupX AB',
    contact: 'Lisa Chen',
    email: 'lisa@startupx.se',
    phone: '+46 70 555 1234',
    stage: 'closed-won',
    probability: 100,
    expectedCloseDate: '2025-07-01',
    actualCloseDate: '2025-07-15',
    lastActivity: '2025-07-15',
    owner: 'Anna Anderson',
    description: 'Complete brand identity and logo design.',
    currency: 'EUR',
    createdAt: '2025-05-15',
    status: 'won',
    tasks: []
  },
  {
    id: '4',
    title: 'MegaCorp - Integration Project',
    value: 120000,
    customer: 'MegaCorp International',
    contact: 'David Wilson',
    email: 'david@megacorp.com',
    phone: '+46 70 999 8888',
    stage: 'closed-won',
    probability: 100,
    expectedCloseDate: '2025-06-30',
    actualCloseDate: '2025-06-28',
    lastActivity: '2025-06-28',
    owner: 'Erik Lindqvist',
    description: 'Large system integration project.',
    currency: 'EUR',
    createdAt: '2025-04-01',
    status: 'won',
    tasks: []
  },
  {
    id: '5',
    title: 'CloudTech - Data Migration',
    value: 65000,
    customer: 'CloudTech Solutions',
    contact: 'Sarah Johnson',
    email: 'sarah@cloudtech.com',
    phone: '+46 70 777 9999',
    stage: 'negotiation',
    probability: 80,
    expectedCloseDate: '2025-08-30',
    actualCloseDate: null,
    lastActivity: '2025-07-14',
    owner: 'Anna Anderson',
    description: 'Complete data migration to cloud infrastructure.',
    currency: 'EUR',
    createdAt: '2025-06-01',
    status: 'open',
    tasks: []
  },
  {
    id: '6',
    title: 'RetailMax - E-commerce Platform',
    value: 95000,
    customer: 'RetailMax Inc',
    contact: 'Michael Brown',
    email: 'michael@retailmax.com',
    phone: '+46 70 555 7777',
    stage: 'proposal',
    probability: 60,
    expectedCloseDate: '2025-09-15',
    actualCloseDate: null,
    lastActivity: '2025-07-13',
    owner: 'Erik Lindqvist',
    description: 'Full e-commerce platform development.',
    currency: 'EUR',
    createdAt: '2025-06-20',
    status: 'open',
    tasks: []
  },
  {
    id: '7',
    title: 'FinTech Pro - Payment System',
    value: 180000,
    customer: 'FinTech Pro Ltd',
    contact: 'Alex Turner',
    email: 'alex@fintechpro.com',
    phone: '+46 70 444 5555',
    stage: 'qualification',
    probability: 35,
    expectedCloseDate: '2025-10-01',
    actualCloseDate: null,
    lastActivity: '2025-07-15',
    owner: 'Anna Anderson',
    description: 'Secure payment processing system with blockchain integration.',
    currency: 'EUR',
    createdAt: '2025-07-01',
    status: 'open',
    tasks: []
  },
  {
    id: '8',
    title: 'HealthApp - Telemedicine Platform',
    value: 135000,
    customer: 'HealthApp Solutions',
    contact: 'Dr. Emma Wilson',
    email: 'emma@healthapp.se',
    phone: '+46 70 666 7777',
    stage: 'negotiation',
    probability: 75,
    expectedCloseDate: '2025-08-20',
    actualCloseDate: null,
    lastActivity: '2025-07-16',
    owner: 'Erik Lindqvist',
    description: 'Comprehensive telemedicine platform with AI diagnostics.',
    currency: 'EUR',
    createdAt: '2025-06-10',
    status: 'open',
    tasks: []
  },
  {
    id: '9',
    title: 'EduTech - Learning Management System',
    value: 78000,
    customer: 'EduTech Innovation',
    contact: 'Mark Stevens',
    email: 'mark@edutech.se',
    phone: '+46 70 888 9999',
    stage: 'proposal',
    probability: 45,
    expectedCloseDate: '2025-09-30',
    actualCloseDate: null,
    lastActivity: '2025-07-11',
    owner: 'Anna Anderson',
    description: 'Modern LMS with VR/AR integration for immersive learning.',
    currency: 'EUR',
    createdAt: '2025-06-25',
    status: 'open',
    tasks: []
  },
  {
    id: '10',
    title: 'LogiFlow - Supply Chain Platform',
    value: 210000,
    customer: 'LogiFlow International',
    contact: 'Sandra Kim',
    email: 'sandra@logiflow.com',
    phone: '+46 70 111 2222',
    stage: 'prospecting',
    probability: 20,
    expectedCloseDate: '2025-11-15',
    actualCloseDate: null,
    lastActivity: '2025-07-09',
    owner: 'Erik Lindqvist',
    description: 'End-to-end supply chain management platform with IoT integration.',
    currency: 'EUR',
    createdAt: '2025-07-05',
    status: 'open',
    tasks: []
  }
];

// Budget data
const SALES_BUDGETS = {
  'Anna Anderson': {
    monthly: 50000,
    quarterly: 150000,
    yearly: 600000
  },
  'Erik Lindqvist': {
    monthly: 60000,
    quarterly: 180000,
    yearly: 720000
  },
  'team': {
    monthly: 110000,
    quarterly: 330000,
    yearly: 1320000
  }
};

// ----- UTIL FUNCTIONS -----
const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', 
    currency,
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', 
    day: 'numeric', 
    year: 'numeric'
  });
};

const getDaysUntilClose = (dateString) => {
  const closeDate = new Date(dateString);
  const today = new Date();
  return Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// ----- DEAL EDIT MODAL -----
function DealEditModal({ open, onClose, onSave, deal }) {
  const [form, setForm] = useState(deal || {
    title: '',
    customer: '',
    contact: '',
    email: '',
    phone: '',
    value: 0,
    probability: 50,
    expectedCloseDate: '',
    owner: '',
    description: '',
    stage: 'prospecting'
  });

  React.useEffect(() => {
    if (deal) setForm(deal);
  }, [deal, open]);

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{deal ? 'Edit Deal' : 'Create New Deal'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title *</label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. Acme Corp - Website Redesign"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. Acme Corporation"
                value={form.customer}
                onChange={e => setForm(f => ({ ...f, customer: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. John Smith"
                value={form.contact}
                onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. john@acme.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. +46 70 123 4567"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value (EUR) *</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. 45000"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full border rounded px-3 py-2"
                value={form.probability}
                onChange={e => setForm(f => ({ ...f, probability: parseInt(e.target.value) || 0 }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date *</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={form.expectedCloseDate}
                onChange={e => setForm(f => ({ ...f, expectedCloseDate: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deal Owner *</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.owner}
                onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                required
              >
                <option value="">Select owner...</option>
                <option value="Anna Anderson">Anna Anderson</option>
                <option value="Erik Lindqvist">Erik Lindqvist</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.stage}
                onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
              >
                {Object.entries(STAGES).map(([key, stage]) => (
                  <option key={key} value={key}>{stage.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2 resize-none"
              placeholder="Brief description of the deal..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 border border-gray-300 rounded px-4 py-2 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 font-medium"
            >
              {deal ? 'Update Deal' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function TaskModal({ open, onClose, onSave, initialTask, dealOwner }) {
  const [form, setForm] = useState(
    initialTask || { title: '', description: '', assignee: dealOwner || '', dueDate: '', status: 'todo' }
  );

  React.useEffect(() => {
    if (initialTask) setForm(initialTask);
    else setForm({ title: '', description: '', assignee: dealOwner || '', dueDate: '', status: 'todo' });
  }, [initialTask, dealOwner, open]);

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{initialTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
          <input
            className="mb-3 w-full border rounded px-3 py-2"
            placeholder="Task title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
          <textarea
            className="mb-3 w-full border rounded px-3 py-2 resize-none"
            placeholder="Task description (optional)"
            value={form.description || ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
          />
          <input
            className="mb-3 w-full border rounded px-3 py-2"
            placeholder="Assignee"
            value={form.assignee || ''}
            onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
          />
          <input
            type="date"
            className="mb-3 w-full border rounded px-3 py-2"
            value={form.dueDate}
            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
          />
          <select
            className="mb-4 w-full border rounded px-3 py-2"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          >
            {Object.entries(TASK_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 border rounded px-3 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700"
            >
              {initialTask ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----- MINI KANBAN -----
function MiniKanban({ tasks, setTasks, dealOwner }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingProbability, setEditingProbability] = useState(null);
  const [columnTitles, setColumnTitles] = useState({
    'todo': 'Discovery',
    'in-progress': 'Proposal', 
    'review': 'Negotiation',
    'done': 'Closed'
  });
  const [columnProbabilities, setColumnProbabilities] = useState({
    'todo': 20,
    'in-progress': 50,
    'review': 75,
    'done': 100
  });
  const fileInputRefs = useRef({});

  const grouped = useMemo(() => {
    const g = { 
      'todo': [], 
      'in-progress': [], 
      'review': [], 
      'done': [] 
    };
    for (const t of tasks) {
      if (g[t.status]) g[t.status].push(t);
    }
    return g;
  }, [tasks]);

  const updateColumnTitle = (columnId, newTitle) => {
    setColumnTitles(prev => ({
      ...prev,
      [columnId]: newTitle
    }));
    setEditingColumn(null);
  };

  const updateProbability = (columnId, newProbability) => {
    const prob = parseInt(newProbability);
    if (!isNaN(prob) && prob >= 0 && prob <= 100) {
      setColumnProbabilities(prev => ({
        ...prev,
        [columnId]: prob
      }));
    }
    setEditingProbability(null);
  };

  const handleFileUpload = async (files, status, taskId) => {
    const uploadedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadedFile = {
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
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, attachments: [...(task.attachments || []), ...uploadedFiles] }
          : task
      ));
    } else {
      const newTask = {
        id: `task-${Date.now()}`,
        title: `Files: ${Array.from(files).map(f => f.name).join(', ')}`,
        status: status,
        assignee: dealOwner,
        dueDate: '',
        attachments: uploadedFiles,
        value: 0,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, newTask]);
    }
  };

  const deleteAttachment = (taskId, attachmentId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, attachments: (task.attachments || []).filter(att => att.id !== attachmentId) }
        : task
    ));
  };

  function handleDrop(taskId, newStatus) {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  }

  function openEdit(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function handleDelete(taskId) {
    setTasks(tasks.filter(t => t.id !== taskId));
  }

  function handleSave(task) {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      setTasks([...tasks, { 
        ...task, 
        id: 't' + Date.now(), 
        attachments: [], 
        value: 0,
        description: task.description || ''
      }]);
    }
    setEditingTask(null);
    setModalOpen(false);
  }

  return (
    <div className="flex gap-6 overflow-x-auto">
      {Object.entries(TASK_STATUSES).map(([status, config]) => (
        <div key={status} className="w-64 flex-shrink-0">
          <div className={`p-3 rounded-t-lg ${config.bgColor} font-bold`}>
            <div className="flex items-center justify-between mb-2">
              {editingColumn === status ? (
                <input
                  type="text"
                  defaultValue={columnTitles[status]}
                  className="bg-white px-2 py-1 rounded text-gray-800 font-semibold text-sm border-0 focus:ring-2 focus:ring-blue-500 w-full"
                  onBlur={(e) => updateColumnTitle(status, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateColumnTitle(status, e.currentTarget.value);
                    }
                  }}
                  autoFocus
                />
              ) : (
                <div className="flex flex-col">
                  <span 
                    className="cursor-pointer hover:bg-white hover:bg-opacity-20 px-2 py-1 rounded text-sm"
                    onClick={() => setEditingColumn(status)}
                    title="Click to edit column name"
                  >
                    {columnTitles[status]}
                  </span>
                  <div className="text-xs text-gray-600 mt-1 px-2">
                    {editingProbability === status ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={columnProbabilities[status]}
                        className="w-12 px-1 py-0.5 text-xs border border-gray-300 rounded bg-white text-gray-800"
                        onBlur={(e) => updateProbability(status, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateProbability(status, e.currentTarget.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="cursor-pointer hover:bg-white hover:bg-opacity-20 px-1 py-0.5 rounded"
                        onClick={() => setEditingProbability(status)}
                        title="Click to edit probability"
                      >
                        {columnProbabilities[status]}%
                      </span>
                    )}
                    {editingProbability !== status && ' probability'}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white text-gray-600 px-2 rounded">
                  {grouped[status].length}
                </span>
                {grouped[status].length > 0 && (
                  <div className="text-xs bg-white text-gray-600 px-2 rounded">
                    {formatCurrency(
                      grouped[status].reduce((sum, task) => 
                        sum + ((task.value || 0) * (columnProbabilities[status] / 100)), 0
                      ),
                      'EUR'
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setEditingTask(null); setModalOpen(true); }}
                className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                title="Add task"
              >
                <Plus size={16} />
              </button>
              <button 
                onClick={() => fileInputRefs.current[status]?.click()}
                className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                title="Upload files"
              >
                <Upload size={16} />
              </button>
              <input
                ref={(el) => { fileInputRefs.current[status] = el; }}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files, status);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>

          <div
            className={`${config.bgColor} min-h-[400px] rounded-b-lg p-3 space-y-3`}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                handleFileUpload(files, status);
              } else {
                const data = e.dataTransfer.getData('text/plain');
                if (data) {
                  try {
                    const { taskId } = JSON.parse(data);
                    handleDrop(taskId, status);
                  } catch (error) {
                    console.error('Error parsing drag data:', error);
                  }
                }
              }
            }}
          >
            {grouped[status].map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg p-3 shadow border cursor-move hover:shadow-lg"
                draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id }))}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-gray-600 leading-relaxed mb-2">
                        {task.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button 
                      onClick={() => openEdit(task)} 
                      className="text-gray-400 hover:text-blue-600"
                      title="Edit task"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(task.id)} 
                      className="text-gray-400 hover:text-red-600"
                      title="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {task.attachments && task.attachments.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Paperclip size={12} />
                      {task.attachments.length} files
                    </div>
                    <div className="space-y-1">
                      {task.attachments.slice(0, 2).map((file) => (
                        <div key={file.id} className="bg-gray-50 p-2 rounded text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Paperclip size={10} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <button
                            onClick={() => deleteAttachment(task.id, file.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Delete file"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {task.attachments.length > 2 && (
                        <div className="text-xs text-gray-500 pl-4">
                          +{task.attachments.length - 2} more
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
                      handleFileUpload(files, status, task.id);
                    }
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handleFileUpload(files, status, task.id);
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload size={12} className="mx-auto text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Drop files</span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div>Assignee: {task.assignee || dealOwner || 'Unassigned'}</div>
                  <div>Due: {task.dueDate || '-'}</div>
                  {task.value && (
                    <div className="font-semibold text-green-600">
                      Value: {formatCurrency(task.value, 'EUR')}
                    </div>
                  )}
                  {task.value && (
                    <div className="text-gray-500">
                      Weighted: {formatCurrency(task.value * (columnProbabilities[status] / 100), 'EUR')}
                    </div>
                  )}
                  {task.createdAt && (
                    <div className="text-gray-400">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <button
              onClick={() => { setEditingTask(null); setModalOpen(true); }}
              className="w-full mt-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-blue-400 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add task
            </button>
          </div>
        </div>
      ))}
      
      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSave}
        initialTask={editingTask}
        dealOwner={dealOwner}
      />
    </div>
  );
}

// ----- DEAL DETAIL VIEW -----
function DealDetailView({ deal, onBack }) {
  const [tasks, setTasks] = useState(deal.tasks || []);
  const [view, setView] = useState('kanban');

  const tasksWithAttachments = tasks.map((task) => ({
    ...task,
    attachments: task.attachments || []
  }));

  const totalFiles = tasksWithAttachments.reduce((sum, task) => sum + (task.attachments?.length || 0), 0);

  return (
    <div className="h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <div>
            <div className="font-bold text-2xl">{deal.title}</div>
            <div className="text-gray-600 flex gap-3 text-sm mt-1">
              <span className="flex items-center gap-1">
                <Building2 size={14} />
                {deal.customer}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign size={14} />
                {formatCurrency(deal.value, deal.currency)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
          💡 Upload files to kanban columns →
        </div>
      </div>
      
      <div className="flex">
        <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6 min-h-[80vh]">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User size={16} />
                {deal.contact}
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                {deal.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                {deal.phone}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Deal Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Value:</span>
                <span className="font-semibold">{formatCurrency(deal.value, deal.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Probability:</span>
                <span>{deal.probability}%</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Close:</span>
                <span>{formatDate(deal.expectedCloseDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Owner:</span>
                <span>{deal.owner}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{formatDate(deal.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex justify-between mb-4">
            <div className="flex gap-2">
              <button 
                onClick={() => setView('kanban')} 
                className={`px-3 py-1 rounded flex items-center gap-2 ${
                  view === 'kanban' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Kanban size={16} /> Sales Kanban
              </button>
              <button 
                onClick={() => setView('list')} 
                className={`px-3 py-1 rounded flex items-center gap-2 ${
                  view === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <List size={16} /> Task List
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                📎 {totalFiles} total files
              </div>
              <div className="text-xs text-gray-400">
                💡 Click headers to edit names & probabilities
              </div>
            </div>
          </div>
          
          {view === 'kanban' ? (
            <MiniKanban tasks={tasksWithAttachments} setTasks={setTasks} dealOwner={deal.owner} />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Task</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Assignee</th>
                    <th className="px-4 py-2 text-left">Due Date</th>
                    <th className="px-4 py-2 text-left">Files</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasksWithAttachments.map((task) => (
                    <tr key={task.id} className="border-b border-gray-100">
                      <td className="px-4 py-2">{task.title}</td>
                      <td className="px-4 py-2">
                        {TASK_STATUSES[task.status]?.name}
                      </td>
                      <td className="px-4 py-2">{task.assignee}</td>
                      <td className="px-4 py-2">{task.dueDate}</td>
                      <td className="px-4 py-2">
                        {task.attachments?.length > 0 && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Paperclip size={12} />
                            {task.attachments.length}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <button 
                          onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} 
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----- DEAL ROW -----
const DealRow = ({ deal, selectedCurrency, onViewDeal, rank, showRank }) => {
  const getProbabilityColor = (probability) => {
    if (probability >= 75) return 'text-green-600 bg-green-50 border-green-200';
    if (probability >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (probability >= 25) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getUrgencyIndicator = () => {
    const daysUntilClose = getDaysUntilClose(deal.expectedCloseDate);
    if (daysUntilClose <= 7 && deal.probability >= 70) {
      return <AlertTriangle className="w-4 h-4 text-red-500" title="Urgent - Close soon!" />;
    }
    if (daysUntilClose <= 14 && deal.probability >= 50) {
      return <Clock className="w-4 h-4 text-orange-500" title="Attention needed" />;
    }
    return null;
  };

  const getRankBadge = () => {
    if (!showRank) return null;
    
    let badgeClass = 'bg-gray-100 text-gray-600';
    if (rank === 1) badgeClass = 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (rank === 2) badgeClass = 'bg-gray-200 text-gray-700 border-gray-400';
    if (rank === 3) badgeClass = 'bg-orange-100 text-orange-700 border-orange-300';
    
    return (
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${badgeClass}`}>
        {rank}
      </div>
    );
  };

  const stage = STAGES[deal.stage];
  const daysUntilClose = getDaysUntilClose(deal.expectedCloseDate);

  return (
    <tr className="hover:bg-blue-50 border-b border-gray-100 cursor-pointer transition-colors" onClick={() => onViewDeal(deal)}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {getRankBadge()}
          {getUrgencyIndicator()}
          <div className="flex-1">
            <div className="font-semibold text-gray-900 hover:text-blue-600 text-sm">
              {deal.title}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Building2 className="w-3 h-3" />
              {deal.customer}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="font-bold text-gray-900 text-sm">
          {formatCurrency(deal.value, selectedCurrency)}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stage.color}`}>
          {stage.name}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getProbabilityColor(deal.probability)}`}>
          {deal.probability}%
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-600">
        <div className="font-medium">{formatDate(deal.expectedCloseDate)}</div>
        <div className={`text-xs ${daysUntilClose <= 7 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          {daysUntilClose} days
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-blue-600">
              {deal.owner.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-xs text-gray-600">{deal.owner}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDeal(deal);
          }}
          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        >
          <Kanban className="w-3 h-3" />
          View
        </button>
      </td>
    </tr>
  );
};

// ----- TOP DEALS SECTION -----
const TopDealsSection = ({ deals, selectedCurrency, onViewDeal }) => {
  const [showAllDeals, setShowAllDeals] = useState(false);
  const [sortBy, setSortBy] = useState('value');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredDeals = deals.filter(deal => 
    deal.currency === selectedCurrency && deal.status === 'open'
  );

  const sortedDeals = useMemo(() => {
    return [...filteredDeals].sort((a, b) => {
      let aValue = 0;
      let bValue = 0;
      
      switch (sortBy) {
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'weighted':
          aValue = a.value * (a.probability / 100);
          bValue = b.value * (b.probability / 100);
          break;
        case 'closing':
          aValue = new Date(a.expectedCloseDate).getTime();
          bValue = new Date(b.expectedCloseDate).getTime();
          break;
        case 'probability':
          aValue = a.probability;
          bValue = b.probability;
          break;
        case 'customer':
          return sortOrder === 'asc' 
            ? a.customer.localeCompare(b.customer)
            : b.customer.localeCompare(a.customer);
        case 'stage':
          return sortOrder === 'asc' 
            ? a.stage.localeCompare(b.stage)
            : b.stage.localeCompare(a.stage);
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [filteredDeals, sortBy, sortOrder]);

  const topDeals = sortedDeals.slice(0, 10);
  const displayDeals = showAllDeals ? sortedDeals : topDeals;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    return sortOrder === 'asc'
      ? <ArrowUp className="w-3 h-3 text-blue-600" />
      : <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  const totalValue = displayDeals.reduce((sum, deal) => sum + deal.value, 0);
  const totalWeighted = displayDeals.reduce((sum, deal) => sum + (deal.value * (deal.probability / 100)), 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {showAllDeals ? 'All Active Deals' : 'Top 10 Deals'}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              {showAllDeals ? `${sortedDeals.length} total deals` : `Showing ${topDeals.length} of ${sortedDeals.length} deals`}
            </p>
          </div>
          <button
            onClick={() => setShowAllDeals(!showAllDeals)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {showAllDeals ? (
              <>
                <List className="w-4 h-4" />
                Show Top 10
              </>
            ) : (
              <>
                <ArrowUpDown className="w-4 h-4" />
                Show All Deals
              </>
            )}
          </button>
        </div>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleSort('value')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              sortBy === 'value' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <DollarSign className="w-3 h-3" />
            Value
            {getSortIcon('value')}
          </button>
          <button
            onClick={() => handleSort('weighted')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              sortBy === 'weighted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Target className="w-3 h-3" />
            Weighted
            {getSortIcon('weighted')}
          </button>
          <button
            onClick={() => handleSort('closing')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              sortBy === 'closing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-3 h-3" />
            Close Date
            {getSortIcon('closing')}
          </button>
          <button
            onClick={() => handleSort('probability')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              sortBy === 'probability' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Target className="w-3 h-3" />
            Probability
            {getSortIcon('probability')}
          </button>
          <button
            onClick={() => handleSort('customer')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              sortBy === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-3 h-3" />
            Customer
            {getSortIcon('customer')}
          </button>
          <button
            onClick={() => handleSort('stage')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              sortBy === 'stage' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Target className="w-3 h-3" />
            Stage
            {getSortIcon('stage')}
          </button>
        </div>

        <div className="flex gap-4 bg-gray-50 p-3 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(totalValue, selectedCurrency)}
            </div>
            <div className="text-xs text-gray-600">Total Pipeline Value</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(totalWeighted, selectedCurrency)}
            </div>
            <div className="text-xs text-gray-600">Weighted Value</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {displayDeals.length}
            </div>
            <div className="text-xs text-gray-600">Active Deals</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deal & Customer
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Probability
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Close
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayDeals.map((deal, index) => (
              <DealRow
                key={deal.id}
                deal={deal}
                selectedCurrency={selectedCurrency}
                onViewDeal={onViewDeal}
                rank={index + 1}
                showRank={!showAllDeals}
              />
            ))}
          </tbody>
        </table>
      </div>

      {displayDeals.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No active deals found</p>
        </div>
      )}
    </div>
  );
};

// ----- CURRENCY SELECTOR -----
const CurrencySelector = ({ selectedCurrency, onCurrencyChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCurrencyInfo = CURRENCIES.find(c => c.code === selectedCurrency);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Globe className="w-4 h-4" />
        <span>{selectedCurrencyInfo?.symbol} {selectedCurrency}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-48">
          {CURRENCIES.map(currency => (
            <button
              key={currency.code}
              onClick={() => {
                onCurrencyChange(currency.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                selectedCurrency === currency.code ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <span className="font-medium">{currency.symbol}</span>
              <span>{currency.code}</span>
              <span className="text-sm text-gray-500">- {currency.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ----- MAIN CRM DASHBOARD -----
const CRMDashboard = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDeal, setEditingDeal] = useState(null);
  const [dealModalOpen, setDealModalOpen] = useState(false);

  // Fetch deals from your API
  React.useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        // Try to fetch from API, but don't fail if it doesn't exist
        const response = await fetch('/api/deals').catch(() => null);
        
        if (response && response.ok) {
          const data = await response.json();
          setDeals(data.deals || MOCK_DEALS);
        } else {
          // If API doesn't exist, just use mock data
          setDeals(MOCK_DEALS);
        }
      } catch (err) {
        console.error('Error fetching deals:', err);
        setDeals(MOCK_DEALS); // Always fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const handleViewDeal = (deal) => {
    setSelectedDeal(deal);
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setDealModalOpen(true);
  };

  const handleCreateDeal = () => {
    setEditingDeal(null);
    setDealModalOpen(true);
  };

  const handleSaveDeal = (dealData) => {
    if (editingDeal) {
      // Update existing deal
      setDeals(deals.map(d => d.id === editingDeal.id ? { ...dealData, id: editingDeal.id } : d));
      if (selectedDeal && selectedDeal.id === editingDeal.id) {
        setSelectedDeal({ ...dealData, id: editingDeal.id });
      }
    } else {
      // Create new deal
      const newDeal = {
        ...dealData,
        id: 'deal-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
        actualCloseDate: null,
        lastActivity: new Date().toISOString().split('T')[0],
        currency: selectedCurrency,
        status: 'open',
        tasks: []
      };
      setDeals([...deals, newDeal]);
    }
    
    setDealModalOpen(false);
    setEditingDeal(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CRM Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
          <p className="text-gray-600">Using mock data for demonstration</p>
        </div>
      </div>
    );
  }

  if (selectedDeal) {
    return (
      <DealDetailView
        deal={selectedDeal}
        onBack={() => setSelectedDeal(null)}
        onEdit={handleEditDeal}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline Dashboard</h1>
              <p className="text-gray-600 mt-1">Focus on your biggest opportunities first</p>
            </div>
            <div className="flex items-center gap-3">
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                <span>New Deal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <TopDealsSection
          deals={deals}
          selectedCurrency={selectedCurrency}
          onViewDeal={handleViewDeal}
        />
      </div>
    </div>
  );
};

export default CRMDashboard;