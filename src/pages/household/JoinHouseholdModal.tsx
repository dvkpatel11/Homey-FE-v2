import * as UI from "@/components/ui";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useForm } from "@/lib/hooks/form";
import { validationRules } from "@/lib/hooks/form/useFormValidation";
import { UserPlus, Users } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const JoinHouseholdModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { validateInviteCode, joinHousehold } = useHousehold();
  const navigate = useNavigate();
  const [householdInfo, setHouseholdInfo] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const form = useForm(
    {
      invite_code: "",
    },
    {
      validationSchema: {
        invite_code: [
          validationRules.required("Please enter an invite code"),
          validationRules.minLength(6, "Invite code must be at least 6 characters"),
        ],
      },
      onSubmit: async (values) => {
        try {
          const success = await joinHousehold(values);
          if (success) {
            toast.success(`Successfully joined ${householdInfo?.name || "household"}!`);
            onClose();
            navigate("/dashboard");
            return { success: true };
          }
          return { success: false, error: "Failed to join household" };
        } catch (error) {
          return { success: false, error: "Failed to join household. Please try again." };
        }
      },
    }
  );

  const handleValidateCode = async () => {
    if (!form.values.invite_code || form.values.invite_code.length < 6) return;

    setIsValidating(true);
    try {
      const isValid = await validateInviteCode(form.values.invite_code);
      if (isValid) {
        // This would ideally return household info, but your current implementation doesn't
        setHouseholdInfo({ name: "Household" }); // Placeholder
      } else {
        form.setFieldError("invite_code", "Invalid invite code");
      }
    } catch (error) {
      form.setFieldError("invite_code", "Invalid invite code. Please check and try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    form.setValue("invite_code", value);
    setHouseholdInfo(null);
  };

  const handleClose = () => {
    form.reset();
    setHouseholdInfo(null);
    onClose();
  };

  return (
    <UI.GlassModal isOpen={isOpen} onClose={handleClose} title="Join Household" maxWidth="md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-glass-lg mx-auto flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <UI.GlassText variant="secondary">
              Enter the invite code shared by a household member to join their household.
            </UI.GlassText>
          </div>

          {/* Invite Code Input */}
          <div className="space-y-4">
            <UI.GlassInput
              label="Invite Code"
              placeholder="ABCD1234"
              value={form.values.invite_code}
              onChange={handleCodeChange}
              error={form.getFieldState("invite_code").error}
              maxLength={8}
              required
            />

            {form.values.invite_code.length >= 6 && !householdInfo && (
              <UI.GlassButton
                type="button"
                variant="secondary"
                onClick={handleValidateCode}
                loading={isValidating}
                className="w-full"
              >
                Validate Code
              </UI.GlassButton>
            )}
          </div>

          {/* Household Info Preview */}
          {householdInfo && (
            <div className="p-4 glass-input rounded-glass border-l-4 border-l-emerald-400">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-glass flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-glass mb-1">{householdInfo.name}</h4>
                  <div className="text-glass-muted text-xs">Ready to join this household</div>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-glass">
            <UI.GlassText className="text-emerald-300 text-sm">
              🔗 Ask a household member to share their invite code with you. You can find invite codes in the household
              settings.
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
              icon={UserPlus}
              className="flex-1"
              disabled={!householdInfo}
            >
              Join Household
            </UI.GlassButton>
          </div>
        </div>
      </form>
    </UI.GlassModal>
  );
};
