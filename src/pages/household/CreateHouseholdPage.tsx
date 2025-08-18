import * as UI from "@/components/ui";
import { useHousehold } from "@/contexts/HouseholdContext";
import { CreateHouseholdModal } from "@/pages/household/CreateHouseholdModal";
import { JoinHouseholdModal } from "@/pages/household/JoinHouseholdModal";
import { motion } from "framer-motion";
import { ArrowRight, Home, Plus, UserPlus, Users } from "lucide-react";
import { useState } from "react";

const CreateHouseholdPage: React.FC = () => {
  const { households, loading } = useHousehold();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-homey-bg-start to-homey-bg-end flex items-center justify-center p-6">
        <UI.GlassContainer variant="strong" padding="lg" className="max-w-md w-full text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <UI.GlassText variant="secondary">Loading your households...</UI.GlassText>
        </UI.GlassContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-homey-bg-start to-homey-bg-end flex items-center justify-center p-6">
      <motion.div
        className="max-w-lg w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark 
                       rounded-glass-xl mx-auto flex items-center justify-center shadow-glass-violet"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Home className="w-10 h-10 text-white" />
          </motion.div>

          <div>
            <UI.GlassHeading level={1} className="mb-2">
              Welcome to Homey
            </UI.GlassHeading>
            <UI.GlassText variant="secondary" className="text-lg">
              Your smart household management companion
            </UI.GlassText>
          </div>
        </div>

        {/* Onboarding Options */}
        <UI.GlassContainer variant="strong" padding="lg">
          <div className="space-y-6">
            <div className="text-center">
              <UI.GlassHeading level={3} className="mb-2">
                Get Started
              </UI.GlassHeading>
              <UI.GlassText variant="secondary">Create a new household or join an existing one</UI.GlassText>
            </div>

            <div className="space-y-4">
              {/* Create Household Option */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <UI.GlassButton
                  variant="primary"
                  size="lg"
                  icon={Plus}
                  rightIcon={ArrowRight}
                  onClick={() => setShowCreateModal(true)}
                  className="w-full justify-between"
                >
                  <div className="text-left">
                    <div className="font-medium">Create New Household</div>
                    <div className="text-sm opacity-80">Start fresh and invite others</div>
                  </div>
                </UI.GlassButton>
              </motion.div>

              {/* Join Household Option */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <UI.GlassButton
                  variant="secondary"
                  size="lg"
                  icon={UserPlus}
                  rightIcon={ArrowRight}
                  onClick={() => setShowJoinModal(true)}
                  className="w-full justify-between"
                >
                  <div className="text-left">
                    <div className="font-medium">Join Existing Household</div>
                    <div className="text-sm opacity-70">Use an invite code</div>
                  </div>
                </UI.GlassButton>
              </motion.div>
            </div>

            {/* Existing Households */}
            {households && households.length > 0 && (
              <div className="pt-6 border-t border-glass-border">
                <UI.GlassText variant="secondary" className="text-sm mb-3">
                  Your Households:
                </UI.GlassText>
                <div className="space-y-2">
                  {households.map((household) => (
                    <div key={household.id} className="flex items-center space-x-3 glass-input p-3 rounded-glass">
                      <Users className="w-4 h-4 text-glass-muted flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-glass truncate">{household.name}</div>
                        <div className="text-xs text-glass-muted">
                          {household.member_count} member{household.member_count !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </UI.GlassContainer>

        {/* Feature Preview */}
        <UI.GlassContainer variant="subtle" padding="md">
          <div className="text-center space-y-3">
            <UI.GlassHeading level={4}>What's Inside</UI.GlassHeading>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-amber-500/20 rounded-md flex items-center justify-center">📋</div>
                <span className="text-glass-secondary">Task Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center">💰</div>
                <span className="text-glass-secondary">Bill Splitting</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">💬</div>
                <span className="text-glass-secondary">Group Chat</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-md flex items-center justify-center">📊</div>
                <span className="text-glass-secondary">Analytics</span>
              </div>
            </div>
          </div>
        </UI.GlassContainer>
      </motion.div>

      {/* Modals */}
      <CreateHouseholdModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <JoinHouseholdModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </div>
  );
};

export default CreateHouseholdPage;
