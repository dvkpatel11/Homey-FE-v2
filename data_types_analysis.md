# Data Types Analysis Report

This report identifies data types, enums, API response structures, and type definitions in your React application.

Generated on: $(date)


# 🌐 API Endpoints


## 📁 src/lib/config/api.js

```javascript
3:  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://your-api.com/api/v1",
```

## 📁 src/lib/api/auth.js

```javascript
7:    const response = await client.get("/api/profile");
13:    const response = await client.put("/api/profile", data);
22:    const response = await client.post("/api/profile/avatar", formData, {
32:    const response = await client.post("/api/invite/validate", {
40:    const response = await client.post("/api/invite/join", {
48:    const response = await client.post("/api/auth/refresh");
54:    const response = await client.post("/api/auth/logout");
```

## 📁 src/lib/api/households.js

```javascript
7:    const response = await client.get("/api/households");
13:    const response = await client.post("/api/households", data);
19:    const response = await client.get(`/api/households/${householdId}`);
25:    const response = await client.put(`/api/households/${householdId}`, data);
31:    const response = await client.delete(`/api/households/${householdId}`);
37:    const response = await client.get(`/api/households/${householdId}/members`);
43:    const response = await client.post(`/api/households/${householdId}/invite`);
49:    const response = await client.delete(`/api/households/${householdId}/members/${userId}`);
55:    const response = await client.post(`/api/households/${householdId}/leave`);
61:    const response = await client.get(`/api/households/${householdId}/dashboard`);
```

## 📁 src/lib/api/expenses.js

```javascript
16:      ? `/api/households/${householdId}/bills?${queryString}`
17:      : `/api/households/${householdId}/bills`;
25:    const response = await client.post(`/api/households/${householdId}/bills`, data);
31:    const response = await client.get(`/api/bills/${billId}`);
37:    const response = await client.put(`/api/bills/${billId}`, data);
43:    const response = await client.delete(`/api/bills/${billId}`);
49:    const response = await client.put(`/api/bills/${billId}/split`, {
57:    const response = await client.post(`/api/bills/${billId}/pay`, data);
63:    const response = await client.get(`/api/households/${householdId}/balances`);
69:    const response = await client.get(`/api/households/${householdId}/balances/${userId}`);
75:    const response = await client.post('/api/bills/batch/pay', {
83:    const response = await client.get(`/api/households/${householdId}/settlement`);
88:    const response = await client.post(`/api/households/${householdId}/settlement`, {
98:      `/api/households/${householdId}/bills/export?${params.toString()}`,
```

## 📁 src/lib/api/chat.js

```javascript
15:      ? `/api/households/${householdId}/messages?${queryString}`
16:      : `/api/households/${householdId}/messages`;
24:    const response = await client.post(`/api/households/${householdId}/messages`, data);
30:    const response = await client.put(`/api/messages/${messageId}`, data);
36:    const response = await client.delete(`/api/messages/${messageId}`);
42:    const response = await client.post(`/api/polls/${pollId}/vote`, {
50:    const response = await client.get(`/api/polls/${pollId}/results`);
61:      `/api/households/${householdId}/messages/upload`,
80:      `/api/households/${householdId}/messages/search?${params.toString()}`
87:    const response = await client.get(`/api/messages/${messageId}/thread`);
93:    const response = await client.post(`/api/messages/${messageId}/react`, {
101:    const response = await client.delete(`/api/messages/${messageId}/react`, {
```

## 📁 src/lib/api/prod-client.js

```javascript
6:  baseURL: API_CONFIG.BASE_URL,
```

## 📁 src/lib/api/notifications.js

```javascript
15:      ? `/api/notifications?${queryString}`
16:      : '/api/notifications';
24:    const response = await client.put(`/api/notifications/${notificationId}/read`);
30:    const response = await client.put('/api/notifications/read-all');
36:    const response = await client.delete(`/api/notifications/${notificationId}`);
42:    const response = await client.get('/api/notifications/unread-count');
48:    const response = await client.put('/api/notifications/preferences', preferences);
54:    const response = await client.get('/api/notifications/preferences');
60:    const response = await client.post('/api/notifications/batch/read', {
67:    const response = await client.post('/api/notifications/batch/delete', {
```

## 📁 src/lib/api/tasks.js

```javascript
15:      ? `/api/households/${householdId}/tasks?${queryString}`
16:      : `/api/households/${householdId}/tasks`;
23:    const response = await client.post(`/api/households/${householdId}/tasks`, data);
29:    const response = await client.get(`/api/tasks/${taskId}`);
35:    const response = await client.put(`/api/tasks/${taskId}`, data);
41:    const response = await client.delete(`/api/tasks/${taskId}`);
47:    const response = await client.post(`/api/tasks/${taskId}/assign`, {
55:    const response = await client.put(`/api/tasks/${taskId}/complete`);
61:    const response = await client.put(`/api/tasks/${taskId}/uncomplete`);
67:    const response = await client.post(`/api/tasks/${taskId}/swap/request`, data);
73:    const response = await client.put(`/api/task-swaps/${swapId}/accept`);
79:    const response = await client.put(`/api/task-swaps/${swapId}/decline`);
85:    const response = await client.get(`/api/households/${householdId}/task-swaps`);
91:    const response = await client.post("/api/tasks/batch/complete", {
98:    const response = await client.post("/api/tasks/batch/assign", {
```

## 📁 src/components/features/household/JoinHouseholdModal.jsx

```javascript
4:import { authAPI } from "../../../lib/api/index.js";
```

# 🎯 Data Type Patterns Analysis


## 📁 src/hooks/useClickOutside.js

### 🏷️  Enum-like Structures
```javascript
95:    const ref = { current: null };
108:export const useDropdown = (options = {}) => {
200:    dropdownRef: clickOutsideRef,
206:export const useModal = (onClose, options = {}) => {
```

### 📊 Hardcoded Data Structures
```javascript
95:    const ref = { current: null };
```


## 📁 src/hooks/useChat.js

### 🏷️  Enum-like Structures
```javascript
8:export const useChat = (options = {}) => {
22:    data: messagesData,
26:    isLoading: messagesLoading,
27:    error: messagesError,
28:    refetch: refetchMessages,
30:    queryKey: ['households', activeHouseholdId, 'messages'],
31:    queryFn: ({ pageParam = 1 }) => 
33:    enabled: !!activeHouseholdId,
34:    getNextPageParam: (lastPage, pages) => {
40:    staleTime: 30 * 1000, // 30 seconds
45:    mutationFn: (data) => chatAPI.createMessage(activeHouseholdId, data),
46:    onMutate: async (newMessage) => {
54:      const optimisticMessage = {
55:        id: `temp_${Date.now()}`,
56:        content: newMessage.content,
57:        message_type: newMessage.message_type || 'text',
58:        user_id: user.id,
59:        user_name: user.full_name,
60:        user_avatar: user.avatar_url,
61:        created_at: new Date().toISOString(),
```

### 🌐 API Response Patterns
```javascript
32:      chatAPI.getMessages(activeHouseholdId, { page: pageParam, limit }),
45:    mutationFn: (data) => chatAPI.createMessage(activeHouseholdId, data),
106:              data: firstPage.data.map(msg => 
107:                msg.id === context.optimisticMessage.id ? data.data : msg
119:    mutationFn: ({ messageId, data }) => chatAPI.updateMessage(messageId, data),
127:    mutationFn: chatAPI.deleteMessage,
141:            data: page.data.filter(msg => msg.id !== messageId),
157:    mutationFn: ({ pollId, selectedOptions }) => chatAPI.votePoll(pollId, selectedOptions),
165:    mutationFn: ({ file, messageData }) => chatAPI.uploadFile(activeHouseholdId, file, messageData),
173:    mutationFn: ({ query, options }) => chatAPI.searchMessages(activeHouseholdId, query, options),
178:    mutationFn: ({ messageId, reaction }) => chatAPI.reactToMessage(messageId, reaction),
244:    return chatAPI.removeReaction(messageId, reaction);
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
9:  const { activeHouseholdId } = useHousehold();
10:  const { showNotificationToast } = useNotifications();
11:  const { user } = useAuth();
```

### 📋 Type Definitions
```javascript
200:      poll: {
219:      data: { content: newContent },
```


## 📁 src/hooks/useRealtime.js

### 🏷️  Enum-like Structures
```javascript
37:        realtime: {
38:          params: {
39:            eventsPerSecond: 10,
70:            event: config.event || "*",
71:            schema: config.schema || "public",
72:            table: config.table,
73:            filter: config.filter,
139:        table: "messages",
140:        filter: `household_id=eq.${householdId}`,
141:        onData: (payload) => {
153:                  pages: [
156:                      data: [newMessage, ...firstPage.data],
166:                  type: "new_message",
167:                  title: `${newMessage.user_name}`,
168:                  message: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? "..." : ""),
180:                  pages: old.pages.map((page) => ({
182:                    data: page.data.map((msg) => (msg.id === newMessage.id ? newMessage : msg)),
195:                  pages: old.pages.map((page) => ({
197:                    data: page.data.filter((msg) => msg.id !== oldMessage.id),
204:        onError: (error) => {
```

### 🌐 API Response Patterns
```javascript
182:                    data: page.data.map((msg) => (msg.id === newMessage.id ? newMessage : msg)),
197:                    data: page.data.filter((msg) => msg.id !== oldMessage.id),
240:                data: { count: old.data.count + 1 },
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
9:  const { user, isAuthenticated } = useAuth();
10:  const { activeHouseholdId } = useHousehold();
11:  const { showNotificationToast } = useNotifications();
27:      const { createClient } = await import("@supabase/supabase-js");
142:          const { eventType, new: newMessage, old: oldMessage } = payload;
223:          const { eventType, new: newNotification } = payload;
```

### 📋 Type Definitions
```javascript
37:        realtime: {
38:          params: {
240:                data: { count: old.data.count + 1 },
```

### 📝 Form Data Structures
```javascript
71:            schema: config.schema || "public",
```


## 📁 src/hooks/useExpenses.js

### 🏷️  Enum-like Structures
```javascript
6:export const useExpenses = (filters = {}) => {
13:    data: billsData,
14:    isLoading: billsLoading,
15:    error: billsError,
16:    refetch: refetchBills,
18:    queryKey: ['households', activeHouseholdId, 'bills', filters],
19:    queryFn: () => expensesAPI.getBills(activeHouseholdId, filters),
20:    enabled: !!activeHouseholdId,
21:    staleTime: 2 * 60 * 1000, // 2 minutes
26:    data: balancesData,
27:    isLoading: balancesLoading,
28:    error: balancesError,
29:    refetch: refetchBalances,
31:    queryKey: ['households', activeHouseholdId, 'balances'],
32:    queryFn: () => expensesAPI.getBalances(activeHouseholdId),
33:    enabled: !!activeHouseholdId,
34:    staleTime: 1 * 60 * 1000, // 1 minute
39:    mutationFn: (data) => expensesAPI.createBill(activeHouseholdId, data),
40:    onSuccess: (data) => {
46:        type: 'bill_created',
```

### 🌐 API Response Patterns
```javascript
19:    queryFn: () => expensesAPI.getBills(activeHouseholdId, filters),
32:    queryFn: () => expensesAPI.getBalances(activeHouseholdId),
39:    mutationFn: (data) => expensesAPI.createBill(activeHouseholdId, data),
48:        message: `${data.data.title} has been added`,
62:    mutationFn: ({ billId, data }) => expensesAPI.updateBill(billId, data),
71:    mutationFn: expensesAPI.deleteBill,
81:    mutationFn: ({ billId, data }) => expensesAPI.recordPayment(billId, data),
97:              ...old.data.summary,
98:              total_owed_by_household: old.data.summary.total_owed_by_household - data.amount,
120:        message: `$${data.data.amount_paid.toFixed(2)} payment recorded`,
127:    mutationFn: ({ billId, splits }) => expensesAPI.updateSplit(billId, splits),
136:    mutationFn: expensesAPI.recordMultiplePayments,
146:    mutationFn: () => expensesAPI.calculateSettlement(activeHouseholdId),
150:    mutationFn: (settlements) => expensesAPI.recordSettlement(activeHouseholdId, settlements),
179:      const blob = await expensesAPI.exportBills(activeHouseholdId, format, exportFilters);
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
7:  const { activeHouseholdId } = useHousehold();
8:  const { showNotificationToast } = useNotifications();
```

### 📋 Type Definitions
```javascript
94:          data: {
96:            summary: {
```


## 📁 src/hooks/useDebounce.js

### 🏷️  Enum-like Structures
```javascript
111:    hasResults: results.length > 0,
112:    hasQuery: query.trim().length > 0,
150:    value: inputValue,
180:          signal: abortControllerRef.current.signal,
266:    hasErrors: Object.keys(validationErrors).length > 0,
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
68:  const { debouncedCallback: debouncedSearch } = useDebouncedCallback(
167:  const { debouncedCallback } = useDebouncedCallback(
235:  const { debouncedCallback: debouncedValidate } = useDebouncedCallback(
```

### 🎯 State Objects/Arrays
```javascript
62:  const [results, setResults] = useState([]);
233:  const [validationErrors, setValidationErrors] = useState({});
```

### 📝 Form Data Structures
```javascript
230:// Form validation debouncing
231:export const useDebouncedValidation = (validationFn, delay = 300) => {
233:  const [validationErrors, setValidationErrors] = useState({});
236:    async (formData) => {
240:        const errors = await validationFn(formData);
250:    [validationFn]
253:  const validate = useCallback((formData) => {
254:    debouncedValidate(formData);
```

### 📊 Hardcoded Data Structures
```javascript
21:export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
```


## 📁 src/hooks/useMobile.js

### 🏷️  Enum-like Structures
```javascript
36:    isLandscape: orientation === "landscape",
37:    isPortrait: orientation === "portrait",
38:    isSmallScreen: screenSize.width < 640,
39:    isMediumScreen: screenSize.width >= 640 && screenSize.width < 1024,
40:    isLargeScreen: screenSize.width >= 1024,
183:    const newErrors = {};
240:    setTouched: markTouched,
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
255:      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
```

### 🎯 State Objects/Arrays
```javascript
11:  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
164:  const [errors, setErrors] = useState({});
165:  const [touched, setTouchedState] = useState({});
```

### 📝 Form Data Structures
```javascript
161:// src/hooks/useFormValidation.js - Enhanced form validation for mobile
162:export function useFormValidation(initialValues, validationRules) {
170:      const rules = validationRules[name];
179:    [validationRules, values]
186:    Object.keys(validationRules).forEach((field) => {
197:  }, [values, validationRules, validateField]);
```


## 📁 src/hooks/useTasks.js

### 🏷️  Enum-like Structures
```javascript
7:export const useTasks = (filters = {}) => {
15:    data: tasksData,
16:    isLoading: tasksLoading,
17:    error: tasksError,
18:    refetch: refetchTasks,
20:    queryKey: ['households', activeHouseholdId, 'tasks', filters],
21:    queryFn: () => tasksAPI.getTasks(activeHouseholdId, filters),
22:    enabled: !!activeHouseholdId,
23:    staleTime: 1 * 60 * 1000, // 1 minute
28:    data: swapsData,
29:    isLoading: swapsLoading,
30:    error: swapsError,
31:    refetch: refetchSwaps,
33:    queryKey: ['households', activeHouseholdId, 'task-swaps'],
34:    queryFn: () => tasksAPI.getSwaps(activeHouseholdId),
35:    enabled: !!activeHouseholdId,
36:    staleTime: 30 * 1000, // 30 seconds
41:    mutationFn: (data) => tasksAPI.createTask(activeHouseholdId, data),
42:    onSuccess: (data) => {
47:        type: 'task_created',
```

### 🌐 API Response Patterns
```javascript
21:    queryFn: () => tasksAPI.getTasks(activeHouseholdId, filters),
34:    queryFn: () => tasksAPI.getSwaps(activeHouseholdId),
41:    mutationFn: (data) => tasksAPI.createTask(activeHouseholdId, data),
49:        message: `${data.data.title} has been added`,
63:    mutationFn: ({ taskId, data }) => tasksAPI.updateTask(taskId, data),
72:    mutationFn: tasksAPI.deleteTask,
81:    mutationFn: tasksAPI.completeTask,
93:          data: old.data.map(task => 
130:    mutationFn: tasksAPI.uncompleteTask,
142:          data: old.data.map(task => 
172:    mutationFn: ({ taskId, userIds }) => tasksAPI.assignTask(taskId, userIds),
180:    mutationFn: tasksAPI.batchCompleteTask,
195:    mutationFn: ({ taskId, data }) => tasksAPI.requestSwap(taskId, data),
208:    mutationFn: tasksAPI.acceptSwap,
222:    mutationFn: tasksAPI.declineSwap,
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
8:  const { activeHouseholdId } = useHousehold();
9:  const { showNotificationToast } = useNotifications();
10:  const { user } = useAuth();
```


## 📁 src/hooks/form/useBasicForm.js

### 🏷️  Enum-like Structures
```javascript
4:export const useBasicForm = (initialValues = {}, options = {}) => {
29:          const newErrors = { ...prev };
67:      const newErrors = { ...prev };
119:      value: values[name] || "",
120:      onChange: handleChange,
121:      onBlur: handleBlur,
129:      value: values[name],
130:      error: errors[name],
131:      touched: touched[name],
132:      hasError: Boolean(errors[name]),
133:      isTouched: Boolean(touched[name]),
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
5:  const { onSubmit, resetOnSubmit = false } = options;
46:      const { name, value, type, checked } = event.target;
55:    const { name } = event.target;
```

### 🎯 State Objects/Arrays
```javascript
8:  const [errors, setErrors] = useState({});
9:  const [touched, setTouched] = useState({});
```

### 📊 Hardcoded Data Structures
```javascript
84:        let result = { success: true, data: values };
```


## 📁 src/hooks/form/useMultiStepForm.js

### 🏷️  Enum-like Structures
```javascript
4:export const useMultiStepForm = (steps = [], options = {}) => {
71:    const allData = { ...stepData };
96:    currentStepData: steps[currentStep],
97:    completedSteps: Array.from(completedSteps),
118:    progress: ((currentStep + 1) / steps.length) * 100,
119:    completionRate: (completedSteps.size / steps.length) * 100,
```

### 🌐 API Response Patterns
```javascript
17:    const savedStep = stepData.__currentStep ?? 0;
18:    const savedCompleted = stepData.__completedSteps ?? [];
72:    delete allData.__currentStep;
73:    delete allData.__completedSteps;
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
5:  const { persistKey, onStepChange } = options;
11:  const { stepData, updateStep, clearAllSteps, getStep } = useMultiStepData(storageKey);
```

### 📝 Form Data Structures
```javascript
61:  const setStepFormData = useCallback(
68:  const getStepFormData = useCallback((step) => getStep(step) || {}, [getStep]);
70:  const getAllFormData = useCallback(() => {
113:    setStepFormData,
114:    getStepFormData,
115:    getAllFormData,
```

### 📊 Hardcoded Data Structures
```javascript
4:export const useMultiStepForm = (steps = [], options = {}) => {
```


## 📁 src/hooks/form/useFieldArray.js

### 🏷️  Enum-like Structures
```javascript
52:    fields: fieldValue,
61:    length: fieldValue.length,
```

### 📝 Form Data Structures
```javascript
5:  const fieldValue = form.values[name] || [];
9:    form.setValue(name, newArray);
14:    form.setValue(name, newArray);
19:    form.setValue(name, newArray);
25:    form.setValue(name, newArray);
32:    form.setValue(name, newArray);
38:    form.setValue(name, newArray);
44:    form.setValue(name, newArray);
```


## 📁 src/hooks/form/useFormValidation.js

### 🏷️  Enum-like Structures
```javascript
5:export const useFormValidation = (validationSchema, form, options = {}) => {
56:    const errors = {};
80:export const validationRules = {
81:  required: (message = 'This field is required') => ({
82:    validate: (value) => {
90:  email: (message = 'Please enter a valid email address') => ({
91:    validate: (value) => {
99:  minLength: (min, message) => ({
100:    validate: (value) => {
104:    message: message || `Must be at least ${min} characters`,
107:  maxLength: (max, message) => ({
108:    validate: (value) => {
112:    message: message || `Must be no more than ${max} characters`,
115:  pattern: (regex, message = 'Invalid format') => ({
116:    validate: (value) => {
123:  min: (min, message) => ({
124:    validate: (value) => {
128:    message: message || `Must be at least ${min}`,
131:  max: (max, message) => ({
132:    validate: (value) => {
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
6:  const { validateOnChange = false, validateOnBlur = true } = options;
8:  const { validate: debouncedValidate, isValidating } = useDebouncedValidation(
```

### 📝 Form Data Structures
```javascript
1:// Form validation hook - separate import
5:export const useFormValidation = (validationSchema, form, options = {}) => {
9:    validationSchema,
13:  // Enhanced setValue with validation
15:    form.setValue(name, value);
17:    if (validateOnChange && validationSchema) {
18:      debouncedValidate({ ...form.values, [name]: value });
20:  }, [form, validateOnChange, validationSchema, debouncedValidate]);
```


## 📁 src/hooks/form/useFormPersistence.js

### 🏷️  Enum-like Structures
```javascript
22:      const mergedValues = { ...form.values, ...persistedData };
50:    hasPersistedData: hasData,
55:export const useFormAutoSave = (form, saveFunction, options = {}) => {
```

### 📝 Form Data Structures
```javascript
22:      const mergedValues = { ...form.values, ...persistedData };
23:      form.setValues?.(mergedValues);
31:    if (!persistKey || !form.isDirty) return;
34:      setPersistedData(form.values);
38:  }, [form.values, form.isDirty, persistKey, setPersistedData]);
64:    if (!enabled || !form.isDirty) return;
68:        await saveFunction(form.values);
69:        onSaveSuccess?.(form.values);
```


## 📁 src/hooks/form/index.js

### 🏷️  Enum-like Structures
```javascript
9:export const useForm = (initialValues = {}, options = {}) => {
46:    setValue: validation?.setValueWithValidation || form.setValue,
47:    handleBlur: validation?.handleBlurWithValidation || form.handleBlur,
48:    validate: validation?.validate,
49:    isValidating: validation?.isValidating || false,
51:    clearPersistedData: persistence?.clearPersistedData,
52:    hasPersistedData: persistence?.hasPersistedData,
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
20:  const { useBasicForm } = require('./useBasicForm');
26:    const { useFormValidation } = require('./useFormValidation');
33:    const { useFormPersistence } = require('./useFormPersistence');
39:    const { useFormAutoSave } = require('./useFormPersistence');
```

### 📝 Form Data Structures
```javascript
3:export { useFormValidation, createValidationSchema, validationRules } from './useFormValidation';
11:    validationSchema,
23:  // Add validation if schema provided
24:  let validation = null;
25:  if (validationSchema) {
27:    validation = useFormValidation(validationSchema, form, { validateOnChange, validateOnBlur });
45:    // Enhanced methods with validation
46:    setValue: validation?.setValueWithValidation || form.setValue,
```


## 📁 src/hooks/useLocalStorage.js

### 🏷️  Enum-like Structures
```javascript
29:          detail: { key, value, source: "utility" },
77:          detail: { key: "*", value: null, source: "utility" },
169:export const AuthStorage = {
170:  getToken: () => LocalStorageManager.get("authToken"),
171:  setToken: (token) => LocalStorageManager.set("authToken", token),
172:  removeToken: () => LocalStorageManager.remove("authToken"),
173:  hasToken: () => LocalStorageManager.has("authToken"),
177:export const HouseholdStorage = {
178:  getActiveId: () => LocalStorageManager.get("activeHouseholdId"),
179:  setActiveId: (id) => LocalStorageManager.set("activeHouseholdId", id),
180:  removeActiveId: () => LocalStorageManager.remove("activeHouseholdId"),
181:  removeId: (id) => LocalStorageManager.remove(id),
182:  hasActiveId: () => LocalStorageManager.has("activeHouseholdId"),
240:    theme: "system",
241:    notifications: true,
242:    language: "en",
276:        timestamp: new Date().toISOString(),
291:    draft: isDraftExpired ? null : draft?.data,
294:    hasDraft: hasDraft && !isDraftExpired,
339:    getStep: (stepIndex) => stepData[stepIndex] || null,
```

### 🌐 API Response Patterns
```javascript
362:    const age = Date.now() - cacheData.timestamp;
363:    if (age > cacheData.ttl) {
368:    return cacheData.data;
375:  const isValid = cacheData && Date.now() - cacheData.timestamp < cacheData.ttl;
378:    data: isValid ? cacheData.data : null,
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
323:        const { [stepIndex]: removed, ...rest } = prev;
```

### 📋 Type Definitions
```javascript
29:          detail: { key, value, source: "utility" },
77:          detail: { key: "*", value: null, source: "utility" },
```


## 📁 src/hooks/useKeyboard.js

### 🏷️  Enum-like Structures
```javascript
4:export const useKeyboard = (keyMap = {}, options = {}) => {
87:export const useHotkeys = (hotkeys = {}, enabled = true) => {
90:    preventDefault: true,
91:    stopPropagation: true,
96:export const useKeyboardNavigation = (options = {}) => {
109:  const keyMap = {
127:    preventDefault: true,
132:export const useListNavigation = (items = [], options = {}) => {
168:    onUp: moveUp,
169:    onDown: moveDown,
170:    onEnter: selectCurrent,
171:    enabled: enabled && items.length > 0,
184:    selectedItem: items[selectedIndex],
196:  const shortcuts = {
240:    enableShortcuts: () => setIsEnabled(true),
241:    disableShortcuts: () => setIsEnabled(false),
247:export const useFormNavigation = (formRef, options = {}) => {
274:    target: formRef,
275:    preventDefault: false,
320:export const useKeySequence = (sequence = [], onComplete, options = {}) => {
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
321:  const { timeout = 1000, enabled = true } = options;
```

### 🎯 State Objects/Arrays
```javascript
322:  const [currentSequence, setCurrentSequence] = useState([]);
```

### 📝 Form Data Structures
```javascript
258:          const submitButton = form.querySelector('[type="submit"]');
267:          form.reset();
268:          const firstInput = form.querySelector('input, textarea, select');
281:      const firstInput = form.querySelector('input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
290:    const inputs = form.querySelectorAll('input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
303:    const inputs = form.querySelectorAll('input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
```

### 📊 Hardcoded Data Structures
```javascript
132:export const useListNavigation = (items = [], options = {}) => {
320:export const useKeySequence = (sequence = [], onComplete, options = {}) => {
```


## 📁 src/main.jsx

### 🌐 API Response Patterns
```javascript
11:      .then((registration) => {
14:      .catch((registrationError) => {
```


## 📁 src/App.jsx

### 🏷️  Enum-like Structures
```javascript
32:  defaultOptions: {
33:    queries: {
34:      staleTime: 5 * 60 * 1000, // 5 minutes
35:      retry: (failureCount, error) => {
153:      default:
200:                    duration: 4000,
201:                    style: {
202:                      background: "var(--homey-glass-bg)",
203:                      backdropFilter: "blur(16px)",
204:                      border: "1px solid var(--homey-glass-border)",
205:                      color: "var(--homey-text)",
206:                      borderRadius: "1rem",
207:                      padding: "12px 16px",
208:                      fontSize: "14px",
209:                      fontWeight: "500",
210:                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
211:                      maxWidth: "calc(100vw - 32px)",
213:                    success: {
214:                      style: {
215:                        borderColor: "rgba(16, 185, 129, 0.3)",
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
101:  const { isLoading: authLoading } = useAuth();
102:  const { households, activeHousehold, isLoading: householdLoading } = useHousehold();
103:  const { isDark } = useTheme();
```

### 📋 Type Definitions
```javascript
32:  defaultOptions: {
33:    queries: {
201:                    style: {
213:                    success: {
214:                      style: {
218:                      iconTheme: {
223:                    error: {
224:                      style: {
228:                      iconTheme: {
233:                    loading: {
```


## 📁 src/lib/utils/calculations.js

### 🏷️  Enum-like Structures
```javascript
21:    owedToUser: parseFloat(owedToUser.toFixed(2)),
22:    userOwes: parseFloat(userOwes.toFixed(2)),
23:    netBalance: parseFloat((owedToUser - userOwes).toFixed(2)),
35:  const colors = {
36:    high: isDarkMode ? "text-red-300 bg-red-500/20" : "text-red-600 bg-red-500/20",
37:    medium: isDarkMode ? "text-yellow-300 bg-yellow-500/20" : "text-yellow-600 bg-yellow-500/20",
38:    low: isDarkMode ? "text-green-300 bg-green-500/20" : "text-green-600 bg-green-500/20",
```


## 📁 src/lib/utils/dateHelpers.js

### 🏷️  Enum-like Structures
```javascript
4:    year: "numeric",
5:    month: "short",
6:    day: "numeric",
13:    year: "numeric",
14:    month: "short",
15:    day: "numeric",
16:    hour: "2-digit",
17:    minute: "2-digit",
```


## 📁 src/lib/config/api.js

### 🏷️  Enum-like Structures
```javascript
1:const API_CONFIG = {
3:  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://your-api.com/api/v1",
4:  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
5:  RETRIES: parseInt(import.meta.env.VITE_API_RETRIES) || 3,
8:  ENVIRONMENT: import.meta.env.MODE || "development",
11:  ENABLE_CACHING: import.meta.env.VITE_ENABLE_API_CACHING !== "false",
12:  ENABLE_RETRY: import.meta.env.VITE_ENABLE_API_RETRY !== "false",
15:  ENABLE_LOGGING: import.meta.env.MODE === "development",
17:  log: (...args) => {
```

### 🌐 API Response Patterns
```javascript
3:  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://your-api.com/api/v1",
```


## 📁 src/lib/config/colors.js

### 🏷️  Enum-like Structures
```javascript
5:export const VIOLET_PALETTE = {
7:  violet: {
21:  violetBright: {
28:  glass: {
29:    violet: {
30:      light: "rgba(139, 92, 246, 0.1)",
31:      medium: "rgba(139, 92, 246, 0.15)",
32:      strong: "rgba(139, 92, 246, 0.25)",
33:      border: "rgba(139, 92, 246, 0.2)",
34:      glow: "rgba(139, 92, 246, 0.4)",
38:    background: {
39:      dark: "rgba(0, 0, 0, 0.25)",
40:      light: "rgba(255, 255, 255, 0.15)",
41:      subtle: "rgba(255, 255, 255, 0.05)",
45:    border: {
46:      light: "rgba(255, 255, 255, 0.1)",
47:      medium: "rgba(255, 255, 255, 0.15)",
48:      strong: "rgba(255, 255, 255, 0.25)",
53:  status: {
54:    success: "#10b981",
```

### 📋 Type Definitions
```javascript
7:  violet: {
21:  violetBright: {
28:  glass: {
29:    violet: {
38:    background: {
45:    border: {
53:  status: {
61:  background: {
```


## 📁 src/lib/api/auth.js

### 🏷️  Enum-like Structures
```javascript
4:export const authAPI = {
23:      headers: {
33:      invite_code: inviteCode,
41:      invite_code: inviteCode,
```

### 🌐 API Response Patterns
```javascript
8:    return response.data;
14:    return response.data;
20:    formData.append("avatar", file);
27:    return response.data;
35:    return response.data;
43:    return response.data;
49:    return response.data;
56:    return response.data;
```

### 📋 Type Definitions
```javascript
23:      headers: {
```

### 📝 Form Data Structures
```javascript
19:    const formData = new FormData();
20:    formData.append("avatar", file);
22:    const response = await client.post("/api/profile/avatar", formData, {
```


## 📁 src/lib/api/households.js

### 🏷️  Enum-like Structures
```javascript
4:export const householdsAPI = {
71:        key: "activeHouseholdId",
72:        newValue: JSON.stringify(householdId), // ✅ Now it's JSON!
```

### 🌐 API Response Patterns
```javascript
8:    return response.data;
14:    return response.data;
20:    return response.data;
26:    return response.data;
32:    return response.data;
38:    return response.data;
44:    return response.data;
50:    return response.data;
56:    return response.data;
62:    return response.data;
```


## 📁 src/lib/api/expenses.js

### 🏷️  Enum-like Structures
```javascript
3:export const expensesAPI = {
```

### 🌐 API Response Patterns
```javascript
20:    return response.data;
26:    return response.data;
32:    return response.data;
38:    return response.data;
44:    return response.data;
52:    return response.data;
58:    return response.data;
64:    return response.data;
70:    return response.data;
78:    return response.data;
84:    return response.data;
91:    return response.data;
101:    return response.data;
```


## 📁 src/lib/api/chat.js

### 🏷️  Enum-like Structures
```javascript
3:export const chatAPI = {
43:      selected_options: selectedOptions,
64:        headers: {
75:      q: query,
102:      data: { reaction },
```

### 🌐 API Response Patterns
```javascript
19:    return response.data;
25:    return response.data;
31:    return response.data;
37:    return response.data;
45:    return response.data;
51:    return response.data;
57:    formData.append('file', file);
58:    formData.append('message_data', JSON.stringify(messageData));
69:    return response.data;
82:    return response.data;
88:    return response.data;
96:    return response.data;
104:    return response.data;
```

### 📋 Type Definitions
```javascript
64:        headers: {
102:      data: { reaction },
```

### 📝 Form Data Structures
```javascript
56:    const formData = new FormData();
57:    formData.append('file', file);
58:    formData.append('message_data', JSON.stringify(messageData));
62:      formData,
```


## 📁 src/lib/api/prod-client.js

### 🏷️  Enum-like Structures
```javascript
6:  baseURL: API_CONFIG.BASE_URL,
7:  timeout: API_CONFIG.TIMEOUT,
8:  headers: {
19:      _t: Date.now(),
60:      const apiError = {
61:        code: error.response.data?.error?.code || "API_ERROR",
62:        message: error.response.data?.error?.message || "An error occurred",
63:        status: error.response.status,
64:        details: error.response.data?.error?.details,
70:        code: "NETWORK_ERROR",
71:        message: "Unable to connect to the server",
72:        details: error.message,
77:        code: "UNKNOWN_ERROR",
78:        message: error.message || "An unknown error occurred",
```

### 🌐 API Response Patterns
```javascript
2:import API_CONFIG from "../config/api.js";
5:const prodClient = axios.create({
33:prodClient.interceptors.response.use(
37:      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
61:        code: error.response.data?.error?.code || "API_ERROR",
62:        message: error.response.data?.error?.message || "An error occurred",
63:        status: error.response.status,
64:        details: error.response.data?.error?.details,
```

### 📋 Type Definitions
```javascript
8:  headers: {
```


## 📁 src/lib/api/notifications.js

### 🏷️  Enum-like Structures
```javascript
3:export const notificationsAPI = {
61:      notification_ids: notificationIds,
68:      notification_ids: notificationIds,
```

### 🌐 API Response Patterns
```javascript
19:    return response.data;
25:    return response.data;
31:    return response.data;
37:    return response.data;
43:    return response.data;
49:    return response.data;
55:    return response.data;
63:    return response.data;
70:    return response.data;
```


## 📁 src/lib/api/client.js

### 🏷️  Enum-like Structures
```javascript
7:const ApiResponse = {
8:  validate: (response) => {
36:      expires: Date.now() + this.ttl,
127:      const enhancedError = {
129:        config: config,
130:        timestamp: new Date().toISOString(),
131:        retryable: this.isRetryableError(error),
167:      size: this.cache.cache.size,
168:      mode: API_CONFIG.MODE,
177:  request: async (config) => {
182:        Authorization: `Bearer ${token}`,
```

### 🌐 API Response Patterns
```javascript
3:import API_CONFIG from "../config/api.js";
9:    if (!response.data) throw new Error("Invalid API response structure");
91:    ApiResponse.validate(processedResponse);
101:      this.cache.set(cacheKey, processedResponse.data);
191:  if (response.status === 401) {
```


## 📁 src/lib/api/tasks.js

### 🏷️  Enum-like Structures
```javascript
3:export const tasksAPI = {
48:      assigned_to: userIds,
92:      task_ids: taskIds,
```

### 🌐 API Response Patterns
```javascript
19:    return response.data;
24:    return response.data;
30:    return response.data;
36:    return response.data;
42:    return response.data;
50:    return response.data;
56:    return response.data;
62:    return response.data;
68:    return response.data;
74:    return response.data;
80:    return response.data;
86:    return response.data;
94:    return response.data;
101:    return response.data;
```


## 📁 src/lib/api/index.js

### 🏷️  Enum-like Structures
```javascript
13:export const API = {
14:  auth: () => import('./auth.js').then(m => m.default),
15:  households: () => import('./households.js').then(m => m.default),
16:  tasks: () => import('./tasks.js').then(m => m.default),
17:  expenses: () => import('./expenses.js').then(m => m.default),
18:  chat: () => import('./chat.js').then(m => m.default),
19:  notifications: () => import('./notifications.js').then(m => m.default),
```

### 🌐 API Response Patterns
```javascript
14:  auth: () => import('./auth.js').then(m => m.default),
15:  households: () => import('./households.js').then(m => m.default),
16:  tasks: () => import('./tasks.js').then(m => m.default),
17:  expenses: () => import('./expenses.js').then(m => m.default),
18:  chat: () => import('./chat.js').then(m => m.default),
19:  notifications: () => import('./notifications.js').then(m => m.default),
```


## 📁 src/contexts/ThemeContext.jsx

### 🏷️  Enum-like Structures
```javascript
12:        theme: action.payload,
17:        systemTheme: action.payload,
22:        theme: state.theme === "light" ? "dark" : "light",
27:        highContrast: action.payload,
32:        reducedMotion: action.payload,
34:    default:
39:const initialState = {
40:  theme: "system", // 'light', 'dark', 'system'
41:  systemTheme: "light",
42:  highContrast: false,
43:  reducedMotion: false,
49:    theme: persistedTheme,
50:    setTheme: setPersistedTheme,
161:  const value = {
170:    effectiveTheme: getEffectiveTheme(),
```


## 📁 src/contexts/NotificationContext.jsx

### 🏷️  Enum-like Structures
```javascript
16:        notifications: action.payload,
25:        notifications: [action.payload, ...state.notifications],
26:        unreadCount: state.unreadCount + (action.payload.read_at ? 0 : 1),
31:        notifications: state.notifications.map((n) => (n.id === action.payload.id ? { ...n, ...action.payload } : n)),
39:        notifications: state.notifications.filter((n) => n.id !== action.payload),
40:        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
45:        unreadCount: action.payload,
50:        notifications: state.notifications.map((n) =>
53:        unreadCount: Math.max(0, state.unreadCount - 1),
58:        notifications: state.notifications.map((n) =>
65:        notifications: state.notifications.map((n) =>
68:        unreadCount: state.unreadCount + 1,
73:        notifications: state.notifications.map((n) => ({
75:          read_at: n.read_at || new Date().toISOString(),
76:          optimistic: !n.read_at,
78:        unreadCount: 0,
84:        notifications: state.notifications.map((n) => (n.optimistic ? { ...n, read_at: null, optimistic: false } : n)),
85:        unreadCount: state.notifications.filter((n) => n.optimistic).length,
90:        preferences: action.payload,
95:        error: action.payload,
```

### 🌐 API Response Patterns
```javascript
137:    queryFn: () => notificationsAPI.getNotifications({ limit: 50 }),
152:    queryFn: notificationsAPI.getUnreadCount,
163:    queryFn: notificationsAPI.getPreferences,
170:    mutationFn: notificationsAPI.markRead,
181:      dispatch({ type: "MARK_READ_SUCCESS", payload: { id: notificationId, ...data.data } });
190:    mutationFn: notificationsAPI.markAllRead,
212:    mutationFn: notificationsAPI.deleteNotification,
229:    mutationFn: notificationsAPI.batchMarkRead,
237:    mutationFn: notificationsAPI.updatePreferences,
239:      dispatch({ type: "SET_PREFERENCES", payload: data.data });
292:              dispatch({ type: "REMOVE_NOTIFICATION", payload: message.data.id });
355:      dispatch({ type: "SET_NOTIFICATIONS", payload: notificationsData.data });
361:      dispatch({ type: "SET_UNREAD_COUNT", payload: unreadCountData.data.count });
367:      dispatch({ type: "SET_PREFERENCES", payload: preferencesData.data });
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
124:  const { isAuthenticated, user } = useAuth();
150:  const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery({
161:  const { data: preferencesData } = useQuery({
```

### 📋 Type Definitions
```javascript
110:  preferences: {
181:      dispatch({ type: "MARK_READ_SUCCESS", payload: { id: notificationId, ...data.data } });
283:                data: { count: (old?.data?.count || 0) + 1 },
```


## 📁 src/contexts/HouseholdContext.jsx

### 🏷️  Enum-like Structures
```javascript
15:        households: action.payload,
20:        activeHousehold: action.payload,
21:        activeHouseholdId: action.payload?.id || null,
26:        members: action.payload,
31:        dashboardData: action.payload,
36:        isLoading: action.payload,
41:        error: action.payload,
46:        error: null,
48:    default:
53:const initialState = {
54:  households: [],
55:  activeHousehold: null,
56:  activeHouseholdId: null,
57:  members: [],
58:  dashboardData: null,
59:  isLoading: false,
60:  error: null,
71:    data: householdsData,
72:    isLoading: householdsLoading,
73:    error: householdsError,
```

### 🌐 API Response Patterns
```javascript
77:    queryFn: householdsAPI.getHouseholds,
89:    queryFn: () => householdsAPI.getHousehold(activeHouseholdId),
101:    queryFn: () => householdsAPI.getMembers(activeHouseholdId),
114:    queryFn: () => householdsAPI.getDashboard(activeHouseholdId),
122:    mutationFn: householdsAPI.createHousehold,
124:      queryClient.setQueryData(["households"], (old) => [...(old?.data || []), data.data]);
125:      switchHousehold(data.data.id);
134:    mutationFn: ({ householdId, data }) => householdsAPI.updateHousehold(householdId, data),
136:      queryClient.setQueryData(["households", data.data.id], data);
143:    mutationFn: householdsAPI.deleteHousehold,
154:    mutationFn: householdsAPI.leaveHousehold,
165:    mutationFn: ({ householdId, userId }) => householdsAPI.removeMember(householdId, userId),
173:    mutationFn: householdsAPI.createInvite,
179:      dispatch({ type: "SET_HOUSEHOLDS", payload: householdsData.data });
182:      if (!activeHouseholdId && householdsData.data.length > 0) {
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
66:  const { isAuthenticated } = useAuth();
```


## 📁 src/contexts/AuthContext.jsx

### 🏷️  Enum-like Structures
```javascript
14:        user: action.payload,
15:        isAuthenticated: !!action.payload,
20:        isLoading: action.payload,
25:        error: action.payload,
26:        isLoading: false,
30:        user: null,
31:        isAuthenticated: false,
32:        isLoading: false,
33:        error: null,
35:    default:
40:const initialState = {
41:  user: null,
42:  isAuthenticated: false,
43:  isLoading: true,
44:  error: null,
54:    data: profileData,
55:    isLoading: profileLoading,
56:    error: profileError,
57:    refetch: refetchProfile,
59:    queryKey: ["auth", "profile"],
```

### 🌐 API Response Patterns
```javascript
60:    queryFn: authAPI.getProfile,
72:    mutationFn: authAPI.updateProfile,
75:      dispatch({ type: "SET_USER", payload: data.data });
84:    mutationFn: authAPI.uploadAvatar,
87:      dispatch({ type: "SET_USER", payload: data.data });
93:    mutationFn: authAPI.joinHousehold,
102:    mutationFn: authAPI.validateInvite,
113:      dispatch({ type: "SET_USER", payload: profileData.data });
140:        await authAPI.logout();
176:        const response = await authAPI.refreshToken();
177:        setAuthToken(response.data.token);
```


## 📁 src/components/features/tasks/TaskCard.jsx

### 🏷️  Enum-like Structures
```javascript
35:  const priorityColors = {
36:    low: 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30',
37:    medium: 'text-amber-400 bg-amber-400/20 border-amber-400/30',
38:    high: 'text-red-400 bg-red-400/20 border-red-400/30'
41:  const categoryIcons = {
42:    cleaning: '🧹',
43:    cooking: '👨‍🍳',
44:    shopping: '🛒',
45:    maintenance: '🔧',
46:    pets: '🐕',
47:    yard: '🌱',
48:    bills: '💰',
49:    other: '📋'
```

### 📋 Type Definitions
```javascript
105:              whileTap={isAssignedToMe && !isCompleted ? { scale: 0.95 } : {}}
```


## 📁 src/components/features/tasks/TaskSwapModal.jsx

### 🏷️  Enum-like Structures
```javascript
13:    swap_with: '',
14:    reason: '',
15:    proposed_date: ''
29:        value: member.user_id,
30:        label: member.name
35:    const newErrors = {};
66:      swap_with: '',
67:      reason: '',
68:      proposed_date: ''
97:            Task: {task.title}
101:              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
104:              Category: {task.category}
```

### 🌐 API Response Patterns
```javascript
37:    if (!formData.swap_with) {
41:    if (!formData.reason.trim()) {
118:            value={formData.swap_with}
128:            value={formData.reason}
141:              value={formData.proposed_date}
```

### 🎯 State Objects/Arrays
```javascript
12:  const [formData, setFormData] = useState({
18:  const [errors, setErrors] = useState({});
```

### 📋 Type Definitions
```javascript
97:            Task: {task.title}
101:              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
104:              Category: {task.category}
```

### 📝 Form Data Structures
```javascript
12:  const [formData, setFormData] = useState({
37:    if (!formData.swap_with) {
41:    if (!formData.reason.trim()) {
54:      await onSubmit(task.id, formData);
65:    setFormData({
74:  const updateFormData = (field, value) => {
75:    setFormData(prev => ({ ...prev, [field]: value }));
118:            value={formData.swap_with}
```


## 📁 src/components/features/tasks/TaskList.jsx

### 🏷️  Enum-like Structures
```javascript
37:  const groupedTasks = {
38:    overdue: tasks.filter((task) => task.status === "overdue"),
39:    due_today: tasks.filter((task) => {
44:    pending: tasks.filter(
47:    in_progress: tasks.filter((task) => task.status === "in_progress"),
48:    completed: tasks.filter((task) => task.status === "completed"),
103:        const statusConfig = {
104:          pending: { color: "text-glass-secondary", dot: "bg-glass-muted" },
105:          in_progress: { color: "text-blue-400", dot: "bg-blue-400" },
106:          completed: { color: "text-emerald-400", dot: "bg-emerald-400" },
```

### 📋 Type Definitions
```javascript
104:          pending: { color: "text-glass-secondary", dot: "bg-glass-muted" },
105:          in_progress: { color: "text-blue-400", dot: "bg-blue-400" },
106:          completed: { color: "text-emerald-400", dot: "bg-emerald-400" },
```


## 📁 src/components/features/tasks/TaskFilters.jsx

### 🏷️  Enum-like Structures
```javascript
41:      value: member.user_id,
42:      label: member.name,
```


## 📁 src/components/features/tasks/AddTaskModal.jsx

### 🏷️  Enum-like Structures
```javascript
12:    title: '',
13:    description: '',
14:    category: 'other',
15:    assigned_to: '',
16:    due_date: '',
17:    priority: 'medium',
18:    is_recurring: false,
19:    recurring_pattern: 'weekly'
52:      value: member.user_id,
53:      label: member.name
58:    const newErrors = {};
101:      title: '',
102:      description: '',
103:      category: 'other',
104:      assigned_to: '',
105:      due_date: '',
106:      priority: 'medium',
107:      is_recurring: false,
108:      recurring_pattern: 'weekly'
```

### 🌐 API Response Patterns
```javascript
60:    if (!formData.title.trim()) {
64:    if (!formData.assigned_to) {
68:    if (!formData.due_date) {
71:      const dueDate = new Date(formData.due_date);
138:          value={formData.title}
147:            value={formData.category}
155:            value={formData.priority}
165:            value={formData.assigned_to}
175:            value={formData.due_date || getTomorrowDate()}
185:          value={formData.description}
196:                checked={formData.is_recurring}
205:            {formData.is_recurring && (
208:                value={formData.recurring_pattern}
214:            {formData.is_recurring && (
```

### 🎯 State Objects/Arrays
```javascript
11:  const [formData, setFormData] = useState({
22:  const [errors, setErrors] = useState({});
```

### 📝 Form Data Structures
```javascript
11:  const [formData, setFormData] = useState({
60:    if (!formData.title.trim()) {
64:    if (!formData.assigned_to) {
68:    if (!formData.due_date) {
71:      const dueDate = new Date(formData.due_date);
89:      await onSubmit(formData);
100:    setFormData({
114:  const updateFormData = (field, value) => {
```


## 📁 src/components/features/household/HouseholdOnboarding.jsx

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
13:  const { households, isLoading } = useHousehold();
```


## 📁 src/components/features/household/JoinHouseholdModal.jsx

### 🏷️  Enum-like Structures
```javascript
32:        code: error.response?.data?.message || "Invalid invite code. Please check and try again.",
51:        submit: error.response?.data?.message || "Failed to join household. Please try again.",
```

### 🌐 API Response Patterns
```javascript
27:      const response = await authAPI.validateInvite(inviteCode.trim());
28:      setHouseholdInfo(response.data);
43:      await authAPI.joinHousehold(inviteCode.trim());
```

### 🎯 State Objects/Arrays
```javascript
13:  const [errors, setErrors] = useState({});
```


## 📁 src/components/features/household/CreateHouseholdModal.jsx

### 🏷️  Enum-like Structures
```javascript
15:    name: "",
16:    address: "",
17:    lease_start_date: "",
18:    lease_end_date: "",
19:    max_members: "",
20:    description: "",
25:    const newErrors = {};
58:        name: formData.name.trim(),
59:        address: formData.address.trim() || undefined,
60:        lease_start_date: formData.lease_start_date || undefined,
61:        lease_end_date: formData.lease_end_date || undefined,
62:        max_members: formData.max_members ? Number(formData.max_members) : undefined,
63:        description: formData.description.trim() || undefined,
76:      name: "",
77:      address: "",
78:      lease_start_date: "",
79:      lease_end_date: "",
80:      max_members: "",
81:      description: "",
```

### 🌐 API Response Patterns
```javascript
27:    if (!formData.name.trim()) {
29:    } else if (formData.name.trim().length < 2) {
31:    } else if (formData.name.trim().length > 50) {
35:    if (formData.max_members) {
36:      const max = Number(formData.max_members);
42:    if (formData.lease_start_date && isNaN(Date.parse(formData.lease_start_date))) {
45:    if (formData.lease_end_date && isNaN(Date.parse(formData.lease_end_date))) {
58:        name: formData.name.trim(),
59:        address: formData.address.trim() || undefined,
60:        lease_start_date: formData.lease_start_date || undefined,
61:        lease_end_date: formData.lease_end_date || undefined,
62:        max_members: formData.max_members ? Number(formData.max_members) : undefined,
63:        description: formData.description.trim() || undefined,
112:            value={formData.name}
122:            value={formData.address}
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
13:  const { createHousehold, isCreatingHousehold } = useHousehold();
```

### 🎯 State Objects/Arrays
```javascript
14:  const [formData, setFormData] = useState({
22:  const [errors, setErrors] = useState({});
```

### 📝 Form Data Structures
```javascript
14:  const [formData, setFormData] = useState({
27:    if (!formData.name.trim()) {
29:    } else if (formData.name.trim().length < 2) {
31:    } else if (formData.name.trim().length > 50) {
35:    if (formData.max_members) {
36:      const max = Number(formData.max_members);
42:    if (formData.lease_start_date && isNaN(Date.parse(formData.lease_start_date))) {
45:    if (formData.lease_end_date && isNaN(Date.parse(formData.lease_end_date))) {
```


## 📁 src/components/ui/GlassButton.jsx

### 🏷️  Enum-like Structures
```javascript
10:      icon: Icon,
11:      rightIcon: RightIcon,
19:    const variants = {
20:      primary: "glass-button text-white",
21:      secondary: "glass-input hover:bg-surface-2 text-glass border-glass-border",
22:      ghost: "hover:bg-surface-1 text-glass-secondary hover:text-glass",
23:      danger: "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30",
26:    const sizes = {
27:      sm: "px-3 py-2 text-sm",
28:      md: "px-4 py-3 text-sm",
29:      lg: "px-6 py-4 text-base",
30:      xl: "px-8 py-5 text-lg",
```

### 📋 Type Definitions
```javascript
44:        whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
```


## 📁 src/components/ui/IconButton.jsx

### 🏷️  Enum-like Structures
```javascript
6:    const sizes = {
7:      sm: "p-2",
8:      md: "p-3",
9:      lg: "p-4",
12:    const variants = {
13:      ghost: "hover:bg-surface-1 text-glass-secondary hover:text-glass",
14:      primary: "glass-button text-white",
15:      danger: "hover:bg-red-500/20 text-red-400",
```


## 📁 src/components/ui/GlassContainer.jsx

### 🏷️  Enum-like Structures
```javascript
4:  const variants = {
5:    default: "glass-card",
6:    subtle: "glass-card glass-card-subtle",
7:    strong: "glass-card glass-card-strong",
8:    violet: "glass-card glass-card-violet",
11:  const paddings = {
12:    none: "",
13:    sm: "p-4",
14:    md: "p-6",
15:    lg: "p-8",
16:    xl: "p-10",
```


## 📁 src/components/ui/GlassHeading.jsx

### 🏷️  Enum-like Structures
```javascript
3:  const sizes = {
```


## 📁 src/components/ui/FloatingActionButton.jsx

### 🏷️  Enum-like Structures
```javascript
6:  icon: Icon = Plus,
22:        hover:scale-110 hover:shadow-glass-violet
30:        type: "spring", 
31:        stiffness: 500, 
32:        damping: 30,
33:        delay: 0.5
```


## 📁 src/components/ui/GlassModal.jsx

### 🏷️  Enum-like Structures
```javascript
37:  const maxWidthClasses = {
38:    sm: "max-w-sm",
39:    md: "max-w-md",
40:    lg: "max-w-lg",
41:    xl: "max-w-xl",
44:    full: "max-w-full",
```


## 📁 src/components/ui/GlassCard.jsx

### 🏷️  Enum-like Structures
```javascript
6:  const variants = {
7:    default: "glass-card",
8:    subtle: "glass-card-subtle",
9:    strong: "glass-card-strong",
10:    violet: "glass-card-violet",
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
4:  const { isDark, reducedMotion } = useTheme();
```


## 📁 src/components/ui/GlassInput.jsx

### 🏷️  Enum-like Structures
```javascript
13:      icon: Icon,
14:      rightIcon: RightIcon,
39:        default: return null;
```


## 📁 src/components/ui/GlassText.jsx

### 🏷️  Enum-like Structures
```javascript
2:  const variants = {
3:    default: "text-glass",
4:    secondary: "text-glass-secondary",
5:    muted: "text-glass-muted",
```


## 📁 src/components/layout/FloatingElements.jsx

### 🏷️  Enum-like Structures
```javascript
7:      id: 1,
8:      size: "w-32 h-32",
9:      position: "top-1/4 left-1/4",
10:      gradient: "from-homey-violet-500/10 to-homey-violet-600/5",
11:      delay: 0,
12:      duration: 20,
15:      id: 2,
16:      size: "w-24 h-24",
17:      position: "top-3/4 right-1/4",
18:      gradient: "from-emerald-500/8 to-emerald-600/4",
19:      delay: 2,
20:      duration: 25,
23:      id: 3,
24:      size: "w-40 h-40",
25:      position: "bottom-1/3 left-1/6",
26:      gradient: "from-amber-500/6 to-orange-500/3",
27:      delay: 4,
28:      duration: 30,
31:      id: 4,
32:      size: "w-20 h-20",
```

### 📋 Type Definitions
```javascript
49:    animate: {
```


## 📁 src/components/layout/Header.jsx

### 🏷️  Enum-like Structures
```javascript
114:                       hover:border-red-500/30 transition-all duration-300"
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
11:  const { isDark, toggleTheme } = useTheme();
12:  const { logout, user } = useAuth();
13:  const { activeHousehold, households, switchHousehold, isAdmin } = useHousehold();
14:  const { unreadCount, hasUnread, markAllAsRead } = useNotifications();
```


## 📁 src/components/layout/Navigation.jsx

### 🏷️  Enum-like Structures
```javascript
14:      id: "dashboard",
15:      icon: Home,
16:      label: "Home",
17:      color: "from-homey-violet-500 to-homey-violet-600",
18:      count: 0,
21:      id: "tasks",
22:      icon: CheckSquare,
23:      label: "Tasks",
24:      color: "from-amber-500 to-orange-500",
25:      count: pendingTasks?.length + overdueTasks?.length || 0,
28:      id: "expenses",
29:      icon: DollarSign,
30:      label: "Bills",
31:      color: "from-emerald-500 to-emerald-600",
32:      count: getPendingBills?.()?.length + getOverdueBills?.()?.length || 0,
35:      id: "announcements",
36:      icon: MessageSquare,
37:      label: "Chat",
38:      color: "from-blue-500 to-indigo-600",
39:      count: unreadCount || 0,
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
8:  const { pendingTasks, overdueTasks } = useTasks();
9:  const { getPendingBills, getOverdueBills } = useExpenses();
10:  const { unreadCount } = useNotifications();
```


## 📁 src/reportWebVitals.js

### 🌐 API Response Patterns
```javascript
3:    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
```


## 📁 src/pages/tasks/TasksPage.jsx

### 🏷️  Enum-like Structures
```javascript
37:    search: "",
38:    category: "all",
39:    assignee: "all",
40:    status: "pending",
41:    sortBy: "due_date",
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
31:  const { activeHousehold, members, isAdmin } = useHousehold();
```

### 🎯 State Objects/Arrays
```javascript
36:  const [filters, setFilters] = useState({
```


## 📁 src/pages/household/InvitePage.jsx

### 🏷️  Enum-like Structures
```javascript
36:        title: `Join ${activeHousehold?.name} on Homey`,
37:        text: `You've been invited to join ${activeHousehold?.name} household on Homey! Use invite code: ${inviteCode}`,
38:        url: window.location.origin,
```

### 🌐 API Response Patterns
```javascript
18:      setInviteCode(response.data.invite_code);
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
12:  const { activeHousehold, generateInvite, isGeneratingInvite } = useHousehold();
```


## 📁 src/pages/expenses/ExpensesPage.jsx

### 🏷️  Enum-like Structures
```javascript
13:    description: "",
14:    amount: "",
15:    paidBy: "",
16:    splitBetween: ["John", "Sarah", "Mike"],
23:        amount: parseFloat(newExpense.amount),
26:        description: "",
27:        amount: "",
28:        paidBy: "",
29:        splitBetween: ["John", "Sarah", "Mike"],
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
10:  const { expenses, expenseSummary, addExpense } = useExpenses();
```

### 🎯 State Objects/Arrays
```javascript
12:  const [newExpense, setNewExpense] = useState({
```


## 📁 src/pages/dashboard/DashboardPage.jsx

### 🏷️  Enum-like Structures
```javascript
44:    outstanding_tasks: 0,
45:    total_balance_owed: 0,
46:    upcoming_deadlines: 0,
47:    recent_activity_count: 0,
```

### 🌐 API Response Patterns
```javascript
110:            dashboardData.calendar_events.map((event, index) => (
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
8:  const { isDarkMode, themeClasses } = useTheme();
9:  const { dashboardData, dashboardLoading, currentHousehold } = useHousehold();
```


## 📁 tailwind.config.js

### 🏷️  Enum-like Structures
```javascript
5:  content: ["./src/**/*.{js,jsx,ts,tsx}"],
6:  darkMode: "class",
7:  theme: {
8:    screens: {
9:      xs: "475px",
10:      sm: "640px",
11:      md: "768px",
12:      lg: "1024px",
13:      xl: "1280px",
16:    extend: {
17:      colors: {
22:        primary: {
23:          DEFAULT: "var(--homey-primary)",
24:          bright: "var(--homey-primary-bright)",
25:          dark: "var(--homey-primary-dark)",
29:        glass: {
30:          DEFAULT: "var(--homey-glass-bg)",
31:          border: "var(--homey-glass-border)",
32:          violet: "var(--homey-glass-violet)",
33:          subtle: "rgba(255,255,255,0.05)",
```

### 🔍 Object Destructuring (Data Structure Usage)
```javascript
1:const { TAILWIND_COLORS } = require("./src/lib/config/colors.js");
```

### 📋 Type Definitions
```javascript
7:  theme: {
8:    screens: {
16:    extend: {
17:      colors: {
22:        primary: {
29:        glass: {
38:        text: {
45:        surface: {
53:      spacing: {
60:      backdropBlur: {
```


## 📁 vite.config.js

### 🏷️  Enum-like Structures
```javascript
8:  plugins: [
11:      registerType: "autoUpdate",
12:      workbox: {
13:        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
14:        runtimeCaching: [
16:            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
17:            handler: "CacheFirst",
18:            options: {
19:              cacheName: "google-fonts-cache",
20:              expiration: {
21:                maxEntries: 10,
22:                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
28:      manifest: {
29:        name: "Homey - Household Management",
30:        short_name: "Homey",
31:        description: "Modern household management app with glassmorphic design",
32:        theme_color: "#7c3aed",
33:        background_color: "#0f172a",
34:        display: "standalone",
35:        orientation: "portrait-primary",
```

### 📋 Type Definitions
```javascript
12:      workbox: {
18:            options: {
20:              expiration: {
28:      manifest: {
61:  server: {
64:    hmr: {
70:  preview: {
76:  build: {
82:    rollupOptions: {
83:      output: {
```


# 🔍 Specific Data Patterns


## Task Types and Status

src/hooks/useRealtime.js:102:      const subscription = channel.subscribe((status) => {
src/hooks/useRealtime.js:103:        if (status === "SUBSCRIBED") {
src/hooks/useRealtime.js:106:        } else if (status === "CHANNEL_ERROR") {
src/hooks/useExpenses.js:162:    return billsData?.data?.filter(bill => bill.status === 'pending') || [];
src/hooks/useExpenses.js:166:    return billsData?.data?.filter(bill => bill.status === 'overdue') || [];
src/hooks/useMobile.js:52:    if (typeof window === "undefined") return;
src/hooks/useMobile.js:136:// src/hooks/useOnlineStatus.js - Network status detection
src/hooks/useTasks.js:242:    return tasksData?.data?.filter(task => task.status === 'pending') || [];
src/hooks/useTasks.js:246:    return tasksData?.data?.filter(task => task.status === 'completed') || [];
src/hooks/useTasks.js:250:    return tasksData?.data?.filter(task => task.status === 'overdue') || [];
src/hooks/useTasks.js:256:      task.due_date && task.due_date.startsWith(today) && task.status === 'pending'
src/hooks/useTasks.js:268:      swap.to_user.id === user.id && swap.status === 'pending'
src/hooks/form/useBasicForm.js:46:      const { name, value, type, checked } = event.target;
src/hooks/form/useBasicForm.js:47:      const fieldValue = type === "checkbox" ? checked : value;
src/hooks/form/useFormValidation.js:84:      if (typeof value === 'string') return value.trim().length > 0;
src/hooks/useLocalStorage.js:15:        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
src/hooks/useLocalStorage.js:195:    rawId && typeof rawId === "string" && rawId.startsWith('"') && rawId.endsWith('"')
src/hooks/useLocalStorage.js:201:    const cleanValue = id && typeof id === "string" && id.startsWith('"') && id.endsWith('"') ? id.slice(1, -1) : id;
src/hooks/useLocalStorage.js:389:  const [key, setKey] = useState(() => (typeof keyGenerator === "function" ? keyGenerator() : keyGenerator));
src/hooks/useLocalStorage.js:394:    const newKey = typeof newKeyOrGenerator === "function" ? newKeyOrGenerator() : newKeyOrGenerator;
src/hooks/useKeyboard.js:258:          const submitButton = form.querySelector('[type="submit"]');
src/App.jsx:37:        if (error?.status === 401) return false;
src/lib/utils/calculations.js:34:export const getPriorityColor = (priority, isDarkMode = false) => {
src/lib/api/client.js:140:    return error.code === "NETWORK_ERROR" || error.status >= 500 || error.code === "TIMEOUT";
src/lib/api/client.js:191:  if (response.status === 401) {
src/contexts/AuthContext.jsx:65:      if (error?.status === 401) return false;
src/contexts/AuthContext.jsx:115:      if (profileError.status === 401) {
src/components/features/tasks/TaskCard.jsx:31:  const isOverdue = isPast(new Date(task.due_date)) && task.status !== 'completed';
src/components/features/tasks/TaskCard.jsx:33:  const isCompleted = task.status === 'completed';
src/components/features/tasks/TaskCard.jsx:35:  const priorityColors = {
src/components/features/tasks/TaskCard.jsx:41:  const categoryIcons = {
src/components/features/tasks/TaskSwapModal.jsx:140:              type="date"
src/components/features/tasks/TaskList.jsx:38:    overdue: tasks.filter((task) => task.status === "overdue"),
src/components/features/tasks/TaskList.jsx:42:      return dueDate === today && task.status === "pending";
src/components/features/tasks/TaskList.jsx:45:      (task) => task.status === "pending" && new Date(task.due_date).toDateString() !== new Date().toDateString()
src/components/features/tasks/TaskList.jsx:47:    in_progress: tasks.filter((task) => task.status === "in_progress"),
src/components/features/tasks/TaskList.jsx:48:    completed: tasks.filter((task) => task.status === "completed"),
src/components/features/tasks/TaskList.jsx:99:      {["pending", "in_progress", "completed"].map((status) => {
src/components/features/tasks/TaskList.jsx:100:        const statusTasks = groupedTasks[status];
src/components/features/tasks/TaskList.jsx:101:        if (statusTasks.length === 0) return null;
src/components/features/tasks/TaskList.jsx:103:        const statusConfig = {
src/components/features/tasks/TaskList.jsx:110:          <div key={status} className="space-y-3">
src/components/features/tasks/TaskList.jsx:114:                {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} ({statusTasks.length})
src/components/features/tasks/TaskList.jsx:118:              {statusTasks.map((task, index) => (
src/components/features/tasks/TaskFilters.jsx:23:  const statusOptions = [
src/components/features/tasks/TaskFilters.jsx:57:              type="search"
src/components/features/tasks/TaskFilters.jsx:73:          {["all", "pending", "overdue", "completed"].map((status) => (
src/components/features/tasks/TaskFilters.jsx:78:                filters.status === status
src/components/features/tasks/AddTaskModal.jsx:36:  const priorityOptions = [
src/components/features/tasks/AddTaskModal.jsx:174:            type="date"
src/components/features/tasks/AddTaskModal.jsx:194:                type="checkbox"
src/components/features/household/CreateHouseholdModal.jsx:131:              type="date"
src/components/features/household/CreateHouseholdModal.jsx:140:              type="date"
src/components/features/household/CreateHouseholdModal.jsx:151:            type="number"
src/components/ui/GlassInput.jsx:8:      type = "text",
src/components/ui/GlassInput.jsx:27:    const inputType = type === "password" && showPassword ? "text" : type;
src/components/ui/GlassInput.jsx:44:    const showPasswordToggle = type === "password";
src/components/ui/GlassInput.jsx:58:            type={inputType}
src/components/ui/GlassInput.jsx:86:              type="button"
src/pages/tasks/TasksPage.jsx:73:    const matchesCategory = filters.category === "all" || task.category === filters.category;
src/pages/tasks/TasksPage.jsx:75:    const matchesStatus = filters.status === "all" || task.status === filters.status;
src/pages/expenses/ExpensesPage.jsx:67:          type="number"
src/pages/dashboard/DashboardPage.jsx:114:                  event.type === "task" ? "border-orange-400" : "border-green-400"
src/pages/dashboard/DashboardPage.jsx:126:                      event.type === "task"
src/pages/dashboard/DashboardPage.jsx:131:                    {event.type === "task" ? "Due Today" : "Added Today"}

## Household Data Structures

src/hooks/useChat.js:30:    queryKey: ['households', activeHouseholdId, 'messages'],
src/hooks/useChat.js:48:      await queryClient.cancelQueries({ queryKey: ['households', activeHouseholdId, 'messages'] });
src/hooks/useChat.js:51:      const previousMessages = queryClient.getQueryData(['households', activeHouseholdId, 'messages']);
src/hooks/useChat.js:66:      queryClient.setQueryData(['households', activeHouseholdId, 'messages'], (old) => {
src/hooks/useChat.js:87:        queryClient.setQueryData(['households', activeHouseholdId, 'messages'], context.previousMessages);
src/hooks/useChat.js:97:      queryClient.setQueryData(['households', activeHouseholdId, 'messages'], (old) => {
src/hooks/useChat.js:121:      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'messages'] });
src/hooks/useChat.js:129:      await queryClient.cancelQueries({ queryKey: ['households', activeHouseholdId, 'messages'] });
src/hooks/useChat.js:131:      const previousMessages = queryClient.getQueryData(['households', activeHouseholdId, 'messages']);
src/hooks/useChat.js:134:      queryClient.setQueryData(['households', activeHouseholdId, 'messages'], (old) => {
src/hooks/useChat.js:150:        queryClient.setQueryData(['households', activeHouseholdId, 'messages'], context.previousMessages);
src/hooks/useChat.js:159:      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'messages'] });
src/hooks/useChat.js:167:      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'messages'] });
src/hooks/useChat.js:180:      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'messages'] });
src/hooks/useRealtime.js:133:    (householdId) => {
src/hooks/useRealtime.js:134:      if (!householdId) return;
src/hooks/useRealtime.js:136:      const channelName = `chat:${householdId}`;
src/hooks/useRealtime.js:140:        filter: `household_id=eq.${householdId}`,
src/hooks/useRealtime.js:147:              queryClient.setQueryData(["households", householdId, "messages"], (old) => {
src/hooks/useRealtime.js:175:              queryClient.setQueryData(["households", householdId, "messages"], (old) => {

## Notification Types

src/hooks/useChat.js:57:        message_type: newMessage.message_type || 'text',
src/hooks/useChat.js:191:      message_type: 'text',
src/hooks/useChat.js:199:      message_type: 'poll',
src/hooks/useRealtime.js:163:              // Show notification if message is from another user
src/hooks/useRealtime.js:212:  // Subscribe to notifications
src/hooks/useRealtime.js:217:      const channelName = `notifications:${userId}`;
src/hooks/useRealtime.js:220:        table: "notifications",
src/hooks/useRealtime.js:226:            // Add notification to cache
src/hooks/useRealtime.js:227:            queryClient.setQueryData(["notifications"], (old) => {
src/hooks/useRealtime.js:236:            queryClient.setQueryData(["notifications", "unread-count"], (old) => {
src/hooks/useRealtime.js:244:            // Show toast notification
src/hooks/useLocalStorage.js:241:    notifications: true,
src/lib/api/notifications.js:3:export const notificationsAPI = {
src/lib/api/notifications.js:4:  // Get notifications
src/lib/api/notifications.js:15:      ? `/api/notifications?${queryString}`

# 📊 Summary

## 📈 Statistics

- **Total JavaScript/JSX files**: 68
- **Files with potential type definitions**: 2
- **API-related files**: 9
- **Main directories analyzed**:
  - `src/components/` - React components
  - `src/contexts/` - Context providers
  - `src/hooks/` - Custom hooks
  - `src/lib/api/` - API layer
  - `src/pages/` - Page components

## 🎯 Key Areas for Type Definitions

Based on the analysis, consider adding proper TypeScript interfaces for:

1. **API Response Types** - Define interfaces for all API responses
2. **Component Props** - Add PropTypes or TypeScript interfaces for component props
3. **State Objects** - Define types for complex state objects
4. **Context Types** - Add types for context providers
5. **Form Data** - Define schemas for form validations
6. **Enum Values** - Convert hardcoded strings to proper enums

## 📝 Recommendations

1. **Convert to TypeScript** - Consider migrating to TypeScript for better type safety
2. **Add PropTypes** - If staying with JavaScript, add PropTypes validation
3. **API Type Safety** - Define interfaces for all API responses and requests
4. **Enum Standardization** - Create a centralized enum/constants file
5. **Form Validation** - Use libraries like Yup or Zod for schema validation

