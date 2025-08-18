// src/pages/DashboardPage.tsx
import * as UI from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useChat } from "@/lib/hooks/useChat";
import { useExpenses } from "@/lib/hooks/useExpenses";
import { useTasks } from "@/lib/hooks/useTasks";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Home,
  MessageCircle,
  Plus,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold, dashboardData, members, loadDashboardData } = useHousehold();
  const { unreadCount } = useNotifications();

  // Hook integrations
  const { myTasks, overdueTasks, pendingTasks, completionRate, hasOverdue, loadTasks } = useTasks();

  const { totalOutstanding, upcomingBills, myBalance, hasOverdue: hasOverdueBills } = useExpenses();

  const { messages, loading: chatLoading } = useChat();

  const [refreshing, setRefreshing] = useState(false);

  // Quick actions
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadDashboardData(), loadTasks()]);
    } finally {
      setRefreshing(false);
    }
  };

  // Quick stats for KPI cards
  const quickStats = [
    {
      title: "Tasks Today",
      value: pendingTasks.length,
      change: completionRate,
      changeText: "completion rate",
      icon: Target,
      color: "from-blue-500 to-blue-600",
      href: "/tasks",
      urgent: hasOverdue,
    },
    {
      title: "Outstanding Bills",
      value: `$${totalOutstanding.toFixed(2)}`,
      change: upcomingBills.length,
      changeText: "due this week",
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      href: "/expenses",
      urgent: hasOverdueBills,
    },
    {
      title: "Notifications",
      value: unreadCount,
      change: messages.length,
      changeText: "recent messages",
      icon: Bell,
      color: "from-violet-500 to-violet-600",
      href: "/notifications",
      urgent: unreadCount > 5,
    },
    {
      title: "Housemates",
      value: members.length,
      change: currentHousehold?.member_count || 0,
      changeText: "total members",
      icon: Users,
      color: "from-orange-500 to-orange-600",
      href: "/household/members",
      urgent: false,
    },
  ];

  // Recent activity items
  const recentActivities = [
    ...myTasks.slice(0, 3).map((task) => ({
      id: task.id,
      type: "task",
      title: task.title,
      time: task.created_at,
      user: user?.full_name || "You",
      status: task.status,
      icon: CheckCircle,
    })),
    ...upcomingBills.slice(0, 2).map((bill) => ({
      id: bill.id,
      type: "bill",
      title: bill.title,
      time: bill.due_date,
      user: bill.paid_by_name,
      status: bill.status,
      icon: DollarSign,
    })),
  ].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <UI.GlassHeading level={1} className="text-2xl lg:text-3xl">
              Welcome back, {user?.full_name?.split(" ")[0]}! 👋
            </UI.GlassHeading>
            <UI.GlassText variant="secondary" className="mt-1">
              Here's what's happening in {currentHousehold?.name}
            </UI.GlassText>
          </div>

          <UI.IconButton
            icon={refreshing ? Clock : TrendingUp}
            size="lg"
            variant="primary"
            onClick={handleRefresh}
            className={refreshing ? "animate-spin" : ""}
          />
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <UI.GlassCard
              className="p-6 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
              onClick={() => (window.location.href = stat.href)}
            >
              {/* Urgent indicator */}
              {stat.urgent && (
                <div className="absolute top-2 right-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-glass-lg bg-gradient-to-r ${stat.color} text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-glass-secondary group-hover:text-glass transition-colors" />
              </div>

              <div>
                <UI.GlassText variant="secondary" className="text-sm">
                  {stat.title}
                </UI.GlassText>
                <UI.GlassHeading level={2} className="text-2xl font-bold mt-1">
                  {stat.value}
                </UI.GlassHeading>
                <UI.GlassText variant="muted" className="text-xs mt-1">
                  {stat.change} {stat.changeText}
                </UI.GlassText>
              </div>
            </UI.GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <UI.GlassCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <UI.GlassHeading level={3}>Recent Activity</UI.GlassHeading>
              <UI.GlassButton variant="ghost" size="sm" onClick={() => (window.location.href = "/tasks")}>
                View All
              </UI.GlassButton>
            </div>

            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-4 p-3 glass-input rounded-glass hover:glass-button transition-all duration-200"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "task" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      <activity.icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <UI.GlassText className="font-medium truncate">{activity.title}</UI.GlassText>
                      <UI.GlassText variant="secondary" className="text-sm">
                        {activity.user} • {new Date(activity.time).toLocaleDateString()}
                      </UI.GlassText>
                    </div>

                    <div
                      className={`px-2 py-1 rounded-full text-xs ${
                        activity.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : activity.status === "overdue"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {activity.status}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-glass-muted mx-auto mb-3" />
                  <UI.GlassText variant="secondary">No recent activity</UI.GlassText>
                </div>
              )}
            </div>
          </UI.GlassCard>
        </div>

        {/* Quick Actions & Summary */}
        <div className="space-y-6">
          {/* My Balance */}
          {myBalance && (
            <UI.GlassCard className="p-6">
              <UI.GlassHeading level={4} className="mb-4">
                My Balance
              </UI.GlassHeading>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <UI.GlassText variant="secondary">Owed</UI.GlassText>
                  <UI.GlassText
                    className={`font-medium ${parseFloat(myBalance.total_owed) > 0 ? "text-red-400" : "text-glass"}`}
                  >
                    ${parseFloat(myBalance.total_owed).toFixed(2)}
                  </UI.GlassText>
                </div>
                <div className="flex justify-between">
                  <UI.GlassText variant="secondary">Paid</UI.GlassText>
                  <UI.GlassText className="font-medium text-emerald-400">
                    ${parseFloat(myBalance.total_paid).toFixed(2)}
                  </UI.GlassText>
                </div>
                <div className="border-t border-glass-border pt-3">
                  <div className="flex justify-between">
                    <UI.GlassText className="font-medium">Net Balance</UI.GlassText>
                    <UI.GlassText
                      className={`font-bold ${
                        parseFloat(myBalance.net_balance) > 0
                          ? "text-emerald-400"
                          : parseFloat(myBalance.net_balance) < 0
                            ? "text-red-400"
                            : "text-glass"
                      }`}
                    >
                      ${parseFloat(myBalance.net_balance).toFixed(2)}
                    </UI.GlassText>
                  </div>
                </div>
              </div>
            </UI.GlassCard>
          )}

          {/* Quick Actions */}
          <UI.GlassCard className="p-6">
            <UI.GlassHeading level={4} className="mb-4">
              Quick Actions
            </UI.GlassHeading>
            <div className="space-y-3">
              <UI.GlassButton
                variant="primary"
                className="w-full justify-start"
                icon={Plus}
                onClick={() => (window.location.href = "/tasks?action=create")}
              >
                Add Task
              </UI.GlassButton>
              <UI.GlassButton
                variant="secondary"
                className="w-full justify-start"
                icon={DollarSign}
                onClick={() => (window.location.href = "/expenses?action=create")}
              >
                Add Expense
              </UI.GlassButton>
              <UI.GlassButton
                variant="ghost"
                className="w-full justify-start"
                icon={MessageCircle}
                onClick={() => (window.location.href = "/chat")}
              >
                Open Chat
              </UI.GlassButton>
              <UI.GlassButton
                variant="ghost"
                className="w-full justify-start"
                icon={Calendar}
                onClick={() => (window.location.href = "/calendar")}
              >
                View Calendar
              </UI.GlassButton>
            </div>
          </UI.GlassCard>

          {/* Upcoming Tasks */}
          {pendingTasks.length > 0 && (
            <UI.GlassCard className="p-6">
              <UI.GlassHeading level={4} className="mb-4">
                Upcoming Tasks
              </UI.GlassHeading>
              <div className="space-y-2">
                {pendingTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-2 glass-input rounded-glass">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <UI.GlassText className="text-sm truncate">{task.title}</UI.GlassText>
                      {task.due_date && (
                        <UI.GlassText variant="muted" className="text-xs">
                          Due {new Date(task.due_date).toLocaleDateString()}
                        </UI.GlassText>
                      )}
                    </div>
                  </div>
                ))}
                {pendingTasks.length > 3 && (
                  <UI.GlassButton
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => (window.location.href = "/tasks")}
                  >
                    View {pendingTasks.length - 3} more
                  </UI.GlassButton>
                )}
              </div>
            </UI.GlassCard>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <UI.FloatingActionButton
        icon={Plus}
        onClick={() => {
          // Could open a quick action modal
          window.location.href = "/tasks?action=create";
        }}
      />
    </div>
  );
};

export default DashboardPage;
