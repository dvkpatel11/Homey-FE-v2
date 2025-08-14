#!/bin/bash

# TypeScript Migration Script

echo "🔄 Starting TypeScript migration..."

# Step 1: Install additional TypeScript dependencies
echo "📦 Installing TypeScript ESLint dependencies..."
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Step 2: Remove jsconfig.json and create TypeScript configs
echo "🗑️ Removing jsconfig.json..."
rm -f jsconfig.json

echo "📝 Creating tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@contexts/*": ["src/contexts/*"],
      "@hooks/*": ["src/hooks/*"],
      "@lib/*": ["src/lib/*"],
      "@utils/*": ["src/lib/utils/*"]
    }
  },
  "include": [
    "src",
    "vite.config.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ],
  "references": [
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
EOF

echo "📝 Creating tsconfig.node.json..."
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "vite.config.ts",
    "postcss.config.ts",
    "tailwind.config.ts"
  ]
}
EOF

# Step 3: Rename config files
echo "🔄 Renaming config files to TypeScript..."
if [ -f "vite.config.js" ]; then
    mv vite.config.js vite.config.ts
    echo "✅ Renamed vite.config.js → vite.config.ts"
fi

if [ -f "postcss.config.js" ]; then
    mv postcss.config.js postcss.config.ts
    echo "✅ Renamed postcss.config.js → postcss.config.ts"
fi

if [ -f "tailwind.config.js" ]; then
    mv tailwind.config.js tailwind.config.ts
    echo "✅ Renamed tailwind.config.js → tailwind.config.ts"
fi

# Step 4: Rename source files
echo "🔄 Renaming source files to TypeScript..."
if [ -f "src/main.jsx" ]; then
    mv src/main.jsx src/main.tsx
    echo "✅ Renamed src/main.jsx → src/main.tsx"
fi

# Rename all .jsx files to .tsx in components/ui
if [ -d "src/components/ui" ]; then
    find src/components/ui -name "*.jsx" -exec bash -c 'mv "$1" "${1%.jsx}.tsx"' _ {} \;
    echo "✅ Renamed all UI component files to .tsx"
fi

# Step 5: Create type definitions
echo "📝 Creating type definitions..."
mkdir -p src/types
cat > src/types/index.ts << 'EOF'
// Global type definitions
export interface User {
  id: string;
  name: string;
  email: string;
}

// UI Component Props
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

// Add more types as needed
EOF

# Step 6: Create vite environment types
cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global variables defined in vite config
declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;
EOF

# Step 7: Create a basic colors config since it was deleted
echo "📝 Creating basic colors config..."
mkdir -p src/lib/config
cat > src/lib/config/colors.ts << 'EOF'
// Basic color configuration - customize as needed
export const TAILWIND_COLORS = {
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  // Add more colors as needed
};
EOF

echo "✅ TypeScript migration complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update tailwind.config.ts to use the new colors import"
echo "2. Update vite.config.ts if needed (change postcss path)"
echo "3. Add types to your UI components"
echo "4. Test the build: npm run type-check"
echo "5. Update package.json ESLint config for TypeScript"
echo ""
echo "⚠️  Don't forget to update your package.json ESLint configuration!"