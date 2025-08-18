import * as UI from "@/components/ui";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useForm } from "@/lib/hooks/form";
import { validationRules } from "@/lib/hooks/form/useFormValidation";
import { CreateHouseholdRequest } from "@/types/api";
import { Home, Plus, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Create Household Modal Component
export const CreateHouseholdModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { createHousehold } = useHousehold();
  const navigate = useNavigate();

  const form = useForm<CreateHouseholdRequest>({
    name: "",
    address: "",
    lease_start_date: "",
    lease_end_date: "",
    max_members: 5,
    data_retention_days: 365,
  }, {
    validationSchema: {
      name: [
        validationRules.required("Household name is required"),
        validationRules.minLength(2),
        validationRules.maxLength(100)
      ],
      max_members: [
        validationRules.required("Max members is required"),
        validationRules.min(2),
        validationRules.max(20)
      ],
      address: [validationRules.maxLength(255)],
      data_retention_days: [validationRules.min(30), validationRules.max(2555)]
    },
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const household = await createHousehold(values);
        if (household) {
          toast.success("Household created successfully!");
          onClose();
          navigate('/dashboard');
          return { success: true };
        }
        return { success: false, error: "Failed to create household" };
      } catch (error) {
        console.error("Failed to create household:", error);
        return { success: false, error: "Failed to create household. Please try again." };
      }
    }
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <UI.GlassModal isOpen={isOpen} onClose={handleClose} title="Create New Household" maxWidth="md">
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-glass-lg mx-auto flex items-center justify-center">
              <Home className="w-8 h-8 text-white" />
            </div>
            <UI.GlassText variant="secondary">
              Set up your new household and start managing tasks, expenses, and more together.
            </UI.GlassText>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <UI.GlassInput
              label="Household Name"
              placeholder="The Smith Family, Roommates, etc."
              icon={Users}
              required
              {...form.getFieldProps('name')}
              error={form.getFieldState('name').error}
            />

            <UI.GlassInput
              label="Address (Optional)"
              placeholder="123 Main St, Apt 4B, New York, NY 10001"
              icon={Home}
              {...form.getFieldProps('address')}
              error={form.getFieldState('address').error}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UI.GlassInput
                label="Lease Start Date"
                type="date"
                {...form.getFieldProps('lease_start_date')}
                error={form.getFieldState('lease_start_date').error}
              />
              <UI.GlassInput
                label="Lease End Date"
                type="date"
                {...form.getFieldProps('lease_end_date')}
                error={form.getFieldState('lease_end_date').error}
              />
            </div>

            <UI.GlassInput
              label="Max Members"
              type="number"
              min={2}
              max={20}
              placeholder="5"
              icon={Users}
              {...form.getFieldProps('max_members')}
              error={form.getFieldState('max_members').error}
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-glass">
            <UI.GlassText className="text-blue-300 text-sm">
              💡 As the household creator, you'll be the admin and can invite members, create recurring tasks, and manage household settings.
            </UI.GlassText>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <UI.GlassButton 
              type="button"
              variant="ghost" 
              onClick={handleClose} 
              className="flex-1" 
              disabled={form.isSubmitting}
            >
              Cancel
            </UI.GlassButton>

            <UI.GlassButton
              type="submit"
              variant="primary"
              loading={form.isSubmitting}
              icon={Plus}
              className="flex-1"
            >
              Create Household
            </UI.GlassButton>
          </div>
        </div>
      </form>
    </UI.GlassModal>
  );
};
