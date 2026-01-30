import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos);
        // Convert date strings back to Date objects
        const todosWithDates = parsedTodos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }));
        setTodos(todosWithDates);
      } catch (error) {
        console.error('Failed to parse todos from localStorage:', error);
      }
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() === '') return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date(),
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      setTodos(
        todos.map((todo) =>
          todo.id === editingId ? { ...todo, text: editText.trim() } : todo
        )
      );
      setEditingId(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const itemsLeft = todos.filter((todo) => !todo.completed).length;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingId) {
        saveEdit();
      } else {
        addTodo();
      }
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 py-12 px-4 sm:px-6">
      <Head>
        <title>Cool Todo App</title>
        <meta name="description" content="A cool todo application" />
      </Head>

      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-300 mb-3">
            Cool Todo
          </h1>
          <p className="text-purple-200 text-lg">Organize your world in style</p>
        </div>

        {/* Add Todo Form */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden mb-8">
          <div className="p-1 bg-gradient-to-r from-cyan-500 to-purple-500">
            <div className="bg-black/30 backdrop-blur-lg p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleInputKeyPress}
                  placeholder="What needs to be done?"
                  className="flex-grow px-5 py-4 bg-black/20 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white placeholder-gray-400"
                />
                <button
                  onClick={addTodo}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Filters */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="text-cyan-300 font-medium">
                {itemsLeft} {itemsLeft === 1 ? 'item' : 'items'} left
              </div>
              
              <div className="flex gap-2">
                {(['all', 'active', 'completed'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-lg capitalize transition-all duration-200 ${
                      filter === filterType
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-white/10 text-purple-200 hover:bg-white/20'
                    }`}
                  >
                    {filterType}
                  </button>
                ))}
              </div>
              
              <button
                onClick={clearCompleted}
                className="text-pink-300 hover:text-pink-100 transition-colors duration-200 text-sm"
              >
                Clear Completed
              </button>
            </div>

            {/* Todo List */}
            <div className="space-y-3">
              {filteredTodos.length === 0 ? (
                <div className="text-center py-10 text-purple-300">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="text-lg">
                    {filter === 'completed' 
                      ? 'No completed tasks yet' 
                      : filter === 'active' 
                        ? 'All tasks completed!' 
                        : 'Add your first task!'}
                  </p>
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      todo.completed
                        ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30'
                        : 'bg-black/20 border-white/10'
                    }`}
                  >
                    <div className="flex items-center flex-grow">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-200 ${
                          todo.completed
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500'
                            : 'border-cyan-400 hover:border-cyan-300'
                        }`}
                      >
                        {todo.completed && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </button>
                      
                      {editingId === todo.id ? (
                        <div className="flex-grow flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="flex-grow bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            autoFocus
                          />
                          <button
                            onClick={saveEdit}
                            className="text-green-400 hover:text-green-300 ml-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-400 hover:text-red-300 ml-1"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div 
                          className={`flex-grow cursor-pointer ${todo.completed ? 'line-through text-gray-400' : 'text-white'}`}
                          onDoubleClick={() => startEditing(todo)}
                        >
                          {todo.text}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(todo)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="text-pink-400 hover:text-pink-300 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="text-center text-sm text-purple-300/70">
          <p>✨ Double-click to edit a task</p>
          <p className="mt-1">💡 Press Enter to add/save, Esc to cancel</p>
        </div>
      </div>
    </div>
  );
}