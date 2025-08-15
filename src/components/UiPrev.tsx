import { Calendar, Heart, Mail, Plus, Search, Settings, User } from "lucide-react";
import React, { useState } from "react";
import FloatingElements from "./layout/FloatingElements";
import * as UI from "./ui";

// FIXED: Proper prop interface
interface UIPreviewProps {
  isDark: boolean;
}

const UIPreview: React.FC<UIPreviewProps> = ({ isDark }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");

  const selectOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden safe-area-inset"
      style={{
        // FIXED: Use CSS variables instead of hardcoded values
        backgroundColor: "var(--homey-bg)",
      }}
    >
      {/* Floating background elements */}
      <FloatingElements />

      <main className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <UI.GlassHeading level={1} className="text-4xl font-bold mb-4" style={{ color: "var(--homey-text)" }}>
            UI Components Library
          </UI.GlassHeading>
          <UI.GlassText variant="secondary" style={{ color: "var(--homey-text-secondary)" }}>
            Explore all the beautiful glassmorphic components
          </UI.GlassText>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Typography Section */}
          <UI.GlassSection title="Typography" subtitle="Headings and text components">
            <UI.GlassContainer padding="md">
              <div className="space-y-4">
                <UI.GlassHeading level={1} style={{ color: "var(--homey-text)" }}>
                  Heading 1
                </UI.GlassHeading>
                <UI.GlassHeading level={2} style={{ color: "var(--homey-text)" }}>
                  Heading 2
                </UI.GlassHeading>
                <UI.GlassHeading level={3} style={{ color: "var(--homey-text)" }}>
                  Heading 3
                </UI.GlassHeading>
                <UI.GlassHeading level={4} style={{ color: "var(--homey-text)" }}>
                  Heading 4
                </UI.GlassHeading>
                <UI.GlassText variant="default" style={{ color: "var(--homey-text)" }}>
                  Default text with glass styling
                </UI.GlassText>
                <UI.GlassText variant="secondary" style={{ color: "var(--homey-text-secondary)" }}>
                  Secondary text variant
                </UI.GlassText>
                <UI.GlassText variant="muted" style={{ color: "var(--homey-text-muted)" }}>
                  Muted text for subtle content
                </UI.GlassText>
              </div>
            </UI.GlassContainer>
          </UI.GlassSection>

          {/* Buttons Section */}
          <UI.GlassSection title="Buttons" subtitle="Various button styles and states">
            <UI.GlassContainer padding="md">
              <div className="space-y-4">
                {/* Button Variants */}
                <div className="flex flex-wrap gap-3">
                  <UI.GlassButton variant="primary" icon={Heart}>
                    Primary
                  </UI.GlassButton>
                  <UI.GlassButton variant="success" icon={User}>
                    Success
                  </UI.GlassButton>
                  <UI.GlassButton variant="danger" icon={Settings}>
                    Cancel/Error
                  </UI.GlassButton>
                  <UI.GlassButton variant="ghost" icon={Mail}>
                    Ghost
                  </UI.GlassButton>
                </div>

                {/* Button Sizes */}
                <div className="flex flex-wrap gap-3">
                  <UI.GlassButton size="sm">Small</UI.GlassButton>
                  <UI.GlassButton size="md">Medium</UI.GlassButton>
                  <UI.GlassButton size="lg">Large</UI.GlassButton>
                  <UI.GlassButton size="xl">Extra Large</UI.GlassButton>
                </div>

                {/* Button States */}
                <div className="flex flex-wrap gap-3">
                  <UI.GlassButton loading>Loading</UI.GlassButton>
                  <UI.GlassButton disabled>Disabled</UI.GlassButton>
                  <UI.GlassButton rightIcon={Calendar}>With Right Icon</UI.GlassButton>
                </div>

                {/* Icon Buttons */}
                <div className="flex gap-3">
                  <UI.IconButton icon={Search} variant="ghost" />
                  <UI.IconButton icon={Settings} variant="primary" />
                  <UI.IconButton icon={Heart} variant="danger" />
                </div>
              </div>
            </UI.GlassContainer>
          </UI.GlassSection>

          {/* Cards Section */}
          <UI.GlassSection title="Cards & Containers" subtitle="Different card variants and containers">
            <div className="space-y-4">
              <UI.GlassCard variant="default" className="p-4">
                <UI.GlassText style={{ color: "var(--homey-text)" }}>
                  Default glass card with hover effects
                </UI.GlassText>
              </UI.GlassCard>

              <UI.GlassCard variant="subtle" className="p-4">
                <UI.GlassText style={{ color: "var(--homey-text)" }}>Subtle glass card variant</UI.GlassText>
              </UI.GlassCard>

              <UI.GlassCard variant="strong" className="p-4">
                <UI.GlassText style={{ color: "var(--homey-text)" }}>Strong glass card variant</UI.GlassText>
              </UI.GlassCard>

              <UI.GlassCard variant="violet" className="p-4">
                <UI.GlassText style={{ color: "var(--homey-text)" }}>Violet-themed glass card</UI.GlassText>
              </UI.GlassCard>

              <UI.GlassContainer variant="violet" padding="lg">
                <UI.GlassText style={{ color: "var(--homey-text)" }}>
                  Container with violet variant and large padding
                </UI.GlassText>
              </UI.GlassContainer>
            </div>
          </UI.GlassSection>

          {/* Forms Section */}
          <UI.GlassSection title="Form Elements" subtitle="Inputs, selects, and form components">
            <UI.GlassContainer padding="md">
              <div className="space-y-6">
                <UI.GlassInput
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  icon={Mail}
                />

                <UI.GlassInput label="Password" type="password" placeholder="Enter password" required />

                <UI.GlassInput label="Search" type="search" placeholder="Search something..." rightIcon={Search} />

                <UI.GlassInput
                  label="With Error"
                  placeholder="This field has an error"
                  error="This field is required"
                />

                <UI.GlassInput label="With Success" placeholder="This field is valid" success="Looks good!" />

                <UI.GlassSelect
                  label="Select Option"
                  placeholder="Choose an option"
                  options={selectOptions}
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                />

                <UI.GlassTextarea
                  label="Message"
                  placeholder="Enter your message..."
                  rows={4}
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                />
              </div>
            </UI.GlassContainer>
          </UI.GlassSection>

          {/* Modal Section */}
          <UI.GlassSection
            title="Modal"
            subtitle="Interactive modal component"
            action={
              <UI.GlassButton onClick={() => setModalOpen(true)} size="sm">
                Open Modal
              </UI.GlassButton>
            }
          >
            <UI.GlassContainer padding="md">
              <UI.GlassText style={{ color: "var(--homey-text)" }}>
                Click the "Open Modal" button to see the modal component in action. The modal includes backdrop blur,
                animations, and proper accessibility.
              </UI.GlassText>
            </UI.GlassContainer>
          </UI.GlassSection>

          {/* Interactive Elements */}
          <UI.GlassSection
            title="Interactive Elements"
            subtitle="Floating action button and other interactive components"
          >
            <UI.GlassContainer padding="md">
              <div className="space-y-4">
                <UI.GlassText style={{ color: "var(--homey-text)" }}>
                  The floating action button appears in the bottom right corner of the screen. It includes smooth
                  animations and hover effects.
                </UI.GlassText>

                <div className="flex gap-4 items-center">
                  <UI.GlassText variant="muted" style={{ color: "var(--homey-text-muted)" }}>
                    Icon Buttons:
                  </UI.GlassText>
                  <UI.IconButton icon={Search} size="sm" />
                  <UI.IconButton icon={Settings} size="md" />
                  <UI.IconButton icon={Heart} size="lg" />
                </div>
              </div>
            </UI.GlassContainer>
          </UI.GlassSection>
        </div>

        {/* Modal Component with PROPER button variants */}
        <UI.GlassModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal" maxWidth="md">
          <div className="space-y-4">
            <UI.GlassText style={{ color: "var(--homey-text)" }}>
              This is a beautiful glassmorphic modal with backdrop blur and smooth animations. It supports keyboard
              navigation (ESC to close) and click-outside-to-close.
            </UI.GlassText>

            <UI.GlassInput placeholder="Try typing in this input..." icon={User} />

            <div className="flex gap-3 justify-center pt-4">
              {/* Cancel button - error/red background */}
              <UI.GlassButton variant="danger" onClick={() => setModalOpen(false)}>
                Cancel
              </UI.GlassButton>

              {/* Submit button - success/green background */}
              <UI.GlassButton variant="success" onClick={() => setModalOpen(false)}>
                Confirm
              </UI.GlassButton>
            </div>
          </div>
        </UI.GlassModal>

        {/* Floating Action Button */}
        <UI.FloatingActionButton icon={Plus} onClick={() => console.log("FAB clicked!")} />
      </main>
    </div>
  );
};

export default UIPreview;
