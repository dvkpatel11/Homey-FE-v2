import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  CheckSquare,
  Clock,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import * as UI from "./ui";

interface TasksPageProps {
  isDark: boolean;
}

const TasksPage: React.FC<TasksPageProps> = ({ isDark }) => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    assignee: "all",
    sortBy: "due_date",
    sortOrder: "asc",
  });

  // Mock data
  const mockTasks = [
    {
      id: 1,
      title: "Take out trash",
      description: "Empty all trash cans and take bags to the curb",
      category: "cleaning",
      status: "pending",
      priority: "medium",
      assigned_to: "user_1",
      assignee_name: "John Doe",
      due_date: "2025-08-16",
      is_recurring: true,
      recurring_pattern: "weekly",
      created_at: "2025-08-10T10:00:00Z",
    },
    {
      id: 2,
      title: "Grocery shopping",
      description: "Buy groceries for the week - check the shared list",
      category: "shopping",
      status: "overdue",
      priority: "high",
      assigned_to: "user_2",
      assignee_name: "Jane Smith",
      due_date: "2025-08-14",
      is_recurring: false,
      created_at: "2025-08-08T15:30:00Z",
    },
    {
      id: 3,
      title: "Clean bathroom",
      description: "Deep clean the main bathroom including shower, toilet, and floors",
      category: "cleaning",
      status: "in_progress",
      priority: "medium",
      assigned_to: "user_3",
      assignee_name: "Mike Johnson",
      due_date: "2025-08-17",
      is_recurring: true,
      recurring_pattern: "weekly",
      created_at: "2025-08-09T09:15:00Z",
    },
    {
      id: 4,
      title: "Pay electricity bill",
      description: "Due: $127.50 - Electric company website",
      category: "bills",
      status: "completed",
      priority: "high",
      assigned_to: "user_1",
      assignee_name: "John Doe",
      due_date: "2025-08-15",
      is_recurring: true,
      recurring_pattern: "monthly",
      completed_at: "2025-08-14T16:45:00Z",
      created_at: "2025-08-05T12:00:00Z",
    },
    {
      id: 5,
      title: "Prepare dinner",
      description: "Cook pasta with marinara sauce for everyone",
      category: "cooking",
      status: "pending",
      priority: "medium",
      assigned_to: "user_2",
      assignee_name: "Jane Smith",
      due_date: "2025-08-15",
      is_recurring: false,
      created_at: "2025-08-15T08:00:00Z",
    },
    {
      id: 6,
      title: "Fix leaky faucet",
      description: "Kitchen sink has been dripping - need to replace washer",
      category: "maintenance",
      status: "pending",
      priority: "high",
      assigned_to: "user_3",
      assignee_name: "Mike Johnson",
      due_date: "2025-08-18",
      is_recurring: false,
      created_at: "2025-08-12T14:20:00Z",
    },
  ];

  const mockMembers = [
    { user_id: "user_1", name: "John Doe", role: "admin" },
    { user_id: "user_2", name: "Jane Smith", role: "member" },
    { user_id: "user_3", name: "Mike Johnson", role: "member" },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTasks(mockTasks);
      setMembers(mockMembers);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.status !== "all" && task.status !== filters.status) {
        return false;
      }
      if (filters.category !== "all" && task.category !== filters.category) {
        return false;
      }
      if (filters.assignee !== "all" && task.assigned_to !== filters.assignee) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const order = filters.sortOrder === "asc" ? 1 : -1;
      if (filters.sortBy === "due_date") {
        return (new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) * order;
      }
      if (filters.sortBy === "priority") {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        return (priorityOrder[a.priority] - priorityOrder[b.priority]) * order;
      }
      if (filters.sortBy === "title") {
        return a.title.localeCompare(b.title) * order;
      }
      return 0;
    });

  // Get task stats
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
  };

  const handleCompleteTask = async (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: "completed", completed_at: new Date().toISOString() } : task
      )
    );
  };

  const handleSwapRequest = (task: any) => {
    setSelectedTask(task);
    setShowSwapModal(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "text-amber-400 bg-amber-400/20",
      overdue: "text-red-400 bg-red-400/20",
      completed: "text-emerald-400 bg-emerald-400/20",
      in_progress: "text-blue-400 bg-blue-400/20",
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-emerald-400",
      medium: "text-amber-400",
      high: "text-red-400",
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      cleaning: "🧹",
      cooking: "👨‍🍳",
      shopping: "🛒",
      maintenance: "🔧",
      pets: "🐕",
      yard: "🌱",
      bills: "💰",
      other: "📋",
    };
    return icons[category] || icons.other;
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden safe-area-inset"
      style={{ backgroundColor: "var(--homey-bg)" }}
    >
      {/* Page Header */}
      <motion.div initial={{ opacity: 10, y: 20 }} animate={{ opacity: 10, y: 0 }} className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <UI.GlassHeading level={1} className="text-2xl sm:text-3xl mb-2">
              Task Management
            </UI.GlassHeading>
            <UI.GlassText variant="secondary">Organize and track household tasks efficiently</UI.GlassText>
          </div>

          <div className="flex gap-3">
            <UI.GlassButton variant="secondary" size="md">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </UI.GlassButton>
            <UI.GlassButton variant="primary" size="md" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </UI.GlassButton>
          </div>
        </div>
        {/* Quick Stats Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <UI.GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <UI.GlassHeading level={3} className="text-lg">
                  {taskStats.total}
                </UI.GlassHeading>
                <UI.GlassText variant="muted" className="text-xs">
                  Total Tasks
                </UI.GlassText>
              </div>
              <CheckSquare className="w-5 h-5 text-glass-muted" />
            </div>
          </UI.GlassCard>

          <UI.GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <UI.GlassHeading level={3} className="text-lg text-amber-400">
                  {taskStats.pending}
                </UI.GlassHeading>
                <UI.GlassText variant="muted" className="text-xs">
                  Pending
                </UI.GlassText>
              </div>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
          </UI.GlassCard>

          <UI.GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <UI.GlassHeading level={3} className="text-lg text-red-400">
                  {taskStats.overdue}
                </UI.GlassHeading>
                <UI.GlassText variant="muted" className="text-xs">
                  Overdue
                </UI.GlassText>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          </UI.GlassCard>

          <UI.GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <UI.GlassHeading level={3} className="text-lg text-blue-400">
                  {taskStats.in_progress}
                </UI.GlassHeading>
                <UI.GlassText variant="muted" className="text-xs">
                  In Progress
                </UI.GlassText>
              </div>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </UI.GlassCard>

          <UI.GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <UI.GlassHeading level={3} className="text-lg text-emerald-400">
                  {taskStats.completed}
                </UI.GlassHeading>
                <UI.GlassText variant="muted" className="text-xs">
                  Completed
                </UI.GlassText>
              </div>
              <CheckSquare className="w-5 h-5 text-emerald-400" />
            </div>
          </UI.GlassCard>
        </motion.div>
        {/* Stats Cards */}

        {/* Search and Filters */}
        <UI.GlassCard className="p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <UI.GlassInput
                placeholder="Search tasks..."
                icon={Search}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <UI.GlassSelect
                options={[
                  { value: "all", label: "All Status" },
                  { value: "pending", label: "Pending" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                  { value: "overdue", label: "Overdue" },
                ]}
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              />

              <UI.GlassSelect
                options={[
                  { value: "all", label: "All Categories" },
                  { value: "cleaning", label: "Cleaning" },
                  { value: "cooking", label: "Cooking" },
                  { value: "shopping", label: "Shopping" },
                  { value: "maintenance", label: "Maintenance" },
                  { value: "bills", label: "Bills" },
                ]}
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              />

              <UI.IconButton
                icon={ArrowUpDown}
                variant="ghost"
                onClick={() =>
                  setFilters({
                    ...filters,
                    sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                  })
                }
              />
            </div>
          </div>
        </UI.GlassCard>

        {/* Tasks List */}
        <UI.GlassCard className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <UI.GlassText variant="muted">Loading tasks...</UI.GlassText>
            </div>
          ) : (
            <div className="divide-y divide-glass-border">
              <AnimatePresence>
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-surface-1/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Completion Checkbox */}
                      <motion.button
                        className={`
                          flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center mt-1
                          ${
                            task.status === "completed"
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-glass-border hover:border-primary"
                          }
                        `}
                        onClick={() => task.status !== "completed" && handleCompleteTask(task.id)}
                        whileTap={{ scale: 0.95 }}
                      >
                        {task.status === "completed" && <CheckSquare className="w-4 h-4 text-white" />}
                      </motion.button>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getCategoryIcon(task.category)}</span>
                              <UI.GlassHeading
                                level={4}
                                className={`text-base ${task.status === "completed" ? "line-through text-glass-muted" : ""}`}
                              >
                                {task.title}
                              </UI.GlassHeading>

                              {task.is_recurring && (
                                <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                                  Recurring
                                </div>
                              )}
                            </div>

                            {task.description && (
                              <UI.GlassText variant="secondary" className="text-sm mb-2">
                                {task.description}
                              </UI.GlassText>
                            )}

                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{task.assignee_name}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(task.due_date).toLocaleDateString()}</span>
                              </div>

                              <div className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                                <AlertTriangle className="w-3 h-3" />
                                <span>{task.priority}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status and Actions */}
                          <div className="flex items-center gap-3 ml-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                            >
                              {task.status.replace("_", " ")}
                            </span>

                            <UI.IconButton icon={MoreVertical} variant="ghost" size="sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTasks.length === 0 && !isLoading && (
                <div className="p-8 text-center">
                  <CheckSquare className="w-12 h-12 text-glass-muted mx-auto mb-4" />
                  <UI.GlassText variant="muted">No tasks found matching your criteria</UI.GlassText>
                </div>
              )}
            </div>
          )}
        </UI.GlassCard>
      </motion.div>

      {/* Mock Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <UI.GlassCard className="relative z-10 p-6 w-full max-w-md">
            <UI.GlassHeading level={3} className="mb-4">
              Add New Task
            </UI.GlassHeading>
            <div className="space-y-4">
              <UI.GlassInput placeholder="Task title..." />
              <UI.GlassSelect
                options={[
                  { value: "cleaning", label: "🧹 Cleaning" },
                  { value: "cooking", label: "👨‍🍳 Cooking" },
                  { value: "shopping", label: "🛒 Shopping" },
                ]}
                placeholder="Select category"
              />
              <UI.GlassInput type="date" />
              <div className="flex gap-3">
                <UI.GlassButton variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </UI.GlassButton>
                <UI.GlassButton variant="success" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Create Task
                </UI.GlassButton>
              </div>
            </div>
          </UI.GlassCard>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
