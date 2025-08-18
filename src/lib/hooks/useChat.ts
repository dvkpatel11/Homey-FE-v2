/**
 * useChat - Real-time chat management
 * Handles messages, polls, file uploads, and real-time chat functionality
 * Integrated with mock server and proper context dependencies
 */
import { useAuth, useAuthenticatedRequest } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useHouseholdRealtime } from "@/contexts/RealtimeContext";
import { chatApi } from "@/lib/api/chat";
import {
  CreateMessageRequest,
  CreatePollVoteRequest,
  Message,
  MessageListResponse,
  MessageQueryParams,
  MessageType,
  Poll,
  UUID,
  isApiError,
  isApiSuccess,
} from "@/types/api";
import { useCallback, useEffect, useReducer, useRef } from "react";
import toast from "react-hot-toast";
import { useLocalStorage } from "./useLocalStorage";

export interface ChatState {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  hasMore: boolean;
  polls: Record<UUID, Poll>;
  typingUsers: Record<UUID, { name: string; timestamp: number }>;
  draft: string;
  error: string | null;
}

type ChatAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_SENDING"; sending: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_MESSAGES"; messages: Message[] }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "UPDATE_MESSAGE"; message: Message }
  | { type: "REMOVE_MESSAGE"; messageId: UUID }
  | { type: "APPEND_MESSAGES"; messages: Message[] }
  | { type: "SET_HAS_MORE"; hasMore: boolean }
  | { type: "SET_POLLS"; polls: Record<UUID, Poll> }
  | { type: "ADD_POLL"; poll: Poll }
  | { type: "UPDATE_POLL"; pollId: UUID; poll: Poll }
  | { type: "SET_DRAFT"; draft: string }
  | { type: "CLEAR_DRAFT" }
  | { type: "SET_TYPING_USERS"; typingUsers: Record<UUID, { name: string; timestamp: number }> }
  | { type: "ADD_TYPING_USER"; userId: UUID; user: { name: string; timestamp: number } }
  | { type: "REMOVE_TYPING_USER"; userId: UUID }
  | { type: "CLEAR_ALL" };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };

    case "SET_SENDING":
      return { ...state, sending: action.sending };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "SET_MESSAGES":
      return { ...state, messages: action.messages };

    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [action.message, ...state.messages],
        polls: action.message.poll ? { ...state.polls, [action.message.poll.id]: action.message.poll } : state.polls,
      };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) => (msg.id === action.message.id ? action.message : msg)),
      };

    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((msg) => msg.id !== action.messageId),
      };

    case "APPEND_MESSAGES":
      return { ...state, messages: [...state.messages, ...action.messages] };

    case "SET_HAS_MORE":
      return { ...state, hasMore: action.hasMore };

    case "SET_POLLS":
      return { ...state, polls: action.polls };

    case "ADD_POLL":
      return { ...state, polls: { ...state.polls, [action.poll.id]: action.poll } };

    case "UPDATE_POLL":
      return { ...state, polls: { ...state.polls, [action.pollId]: action.poll } };

    case "SET_DRAFT":
      return { ...state, draft: action.draft };

    case "CLEAR_DRAFT":
      return { ...state, draft: "" };

    case "SET_TYPING_USERS":
      return { ...state, typingUsers: action.typingUsers };

    case "ADD_TYPING_USER":
      return {
        ...state,
        typingUsers: { ...state.typingUsers, [action.userId]: action.user },
      };

    case "REMOVE_TYPING_USER":
      const { [action.userId]: removed, ...remainingUsers } = state.typingUsers;
      return { ...state, typingUsers: remainingUsers };

    case "CLEAR_ALL":
      return {
        ...state,
        messages: [],
        polls: {},
        typingUsers: {},
        draft: "",
        error: null,
        hasMore: true,
      };

    default:
      return state;
  }
};

export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  sendPoll: (question: string, options: string[], multipleChoice?: boolean) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  voteOnPoll: (pollId: UUID, selectedOptions: number[]) => Promise<void>;
  editMessage: (messageId: UUID, content: string) => Promise<void>;
  deleteMessage: (messageId: UUID) => Promise<void>;
  uploadFile: (file: File, caption?: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  setDraft: (content: string) => void;
  clearDraft: () => void;
  startTyping: () => void;
  stopTyping: () => void;
  clearError: () => void;
  scrollToBottom: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const MESSAGES_PER_PAGE = 50;
const TYPING_TIMEOUT = 3000; // 3 seconds
const TYPING_CLEANUP_INTERVAL = 5000; // 5 seconds

export const useChat = (): ChatState & ChatActions => {
  const { user } = useAuth();
  const { authenticatedFetch } = useAuthenticatedRequest();
  const { currentHousehold } = useHousehold();
  const { subscribeToMessageChanges } = useHouseholdRealtime(currentHousehold);

  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    loading: false,
    sending: false,
    hasMore: true,
    polls: {},
    typingUsers: {},
    draft: "",
    error: null,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageId = useRef<UUID | null>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimer = useRef<NodeJS.Timeout | null>(null);

  // Persistent draft storage
  const [storedDraft, setStoredDraft] = useLocalStorage(
    currentHousehold ? `chat-draft-${currentHousehold.id}` : null,
    ""
  );

  // Load initial messages when household changes
  useEffect(() => {
    if (currentHousehold) {
      loadMessages();

      // Restore draft
      dispatch({ type: "SET_DRAFT", draft: storedDraft });

      // Set up typing cleanup
      cleanupTimer.current = setInterval(cleanupTypingUsers, TYPING_CLEANUP_INTERVAL);

      return () => {
        if (cleanupTimer.current) clearInterval(cleanupTimer.current);
      };
    } else {
      dispatch({ type: "CLEAR_ALL" });
    }
  }, [currentHousehold?.id, storedDraft]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!currentHousehold) return;

    const unsubscribe = subscribeToMessageChanges((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      if (eventType === "INSERT" && newRecord) {
        const newMessage = newRecord as Message;
        dispatch({ type: "ADD_MESSAGE", message: newMessage });

        // Show toast for messages from other users
        if (newMessage.user_id !== user?.id) {
          const preview = newMessage.content.length > 50 ? `${newMessage.content.slice(0, 50)}...` : newMessage.content;
          toast(`${newMessage.user_name}: ${preview}`, { icon: "💬" });
        }

        scrollToBottom();
      } else if (eventType === "UPDATE" && newRecord) {
        const updatedMessage = newRecord as Message;
        dispatch({ type: "UPDATE_MESSAGE", message: updatedMessage });
      } else if (eventType === "DELETE" && oldRecord) {
        dispatch({ type: "REMOVE_MESSAGE", messageId: oldRecord.id });
      }
    });

    return unsubscribe;
  }, [currentHousehold?.id, user?.id, subscribeToMessageChanges]);

  // Save draft to localStorage
  useEffect(() => {
    if (currentHousehold) {
      setStoredDraft(state.draft);
    }
  }, [state.draft, setStoredDraft, currentHousehold]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", error: null });
  }, []);

  const loadMessages = async (before?: string) => {
    if (!currentHousehold) return;

    try {
      dispatch({ type: "SET_LOADING", loading: true });
      dispatch({ type: "SET_ERROR", error: null });

      const params: MessageQueryParams = {
        limit: MESSAGES_PER_PAGE,
        sort_by: "created_at",
        sort_order: "desc",
      };

      if (before) {
        params.before = before;
      }

      const response = await chatApi.getMessages(currentHousehold.id, params);

      if (isApiSuccess<MessageListResponse>(response)) {
        const { data: messages, meta } = response.data;

        if (before) {
          dispatch({ type: "APPEND_MESSAGES", messages });
        } else {
          dispatch({ type: "SET_MESSAGES", messages });
        }

        dispatch({ type: "SET_HAS_MORE", hasMore: meta?.has_more || false });

        // Set polls
        const polls = messages.reduce(
          (acc, msg) => {
            if (msg.poll) {
              acc[msg.poll.id] = msg.poll;
            }
            return acc;
          },
          {} as Record<UUID, Poll>
        );
        dispatch({ type: "SET_POLLS", polls });

        if (messages.length > 0 && !before) {
          lastMessageId.current = messages[0].id;
        }
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load messages";
      console.error("Load messages error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const loadMoreMessages = async () => {
    if (!state.hasMore || state.loading || state.messages.length === 0) return;

    const oldestMessage = state.messages[state.messages.length - 1];
    await loadMessages(oldestMessage.created_at);
  };

  const sendMessage = async (content: string) => {
    if (!currentHousehold || !content.trim()) return;

    try {
      dispatch({ type: "SET_SENDING", sending: true });
      dispatch({ type: "SET_ERROR", error: null });
      stopTyping();

      const messageData: CreateMessageRequest = {
        content: content.trim(),
        message_type: MessageType.TEXT,
      };

      const response = await chatApi.sendMessage(currentHousehold.id, messageData);

      if (isApiSuccess<Message>(response)) {
        // Message will be added via real-time subscription
        clearDraft();
        scrollToBottom();
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      console.error("Send message error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_SENDING", sending: false });
    }
  };

  const sendPoll = async (question: string, options: string[], multipleChoice = false) => {
    if (!currentHousehold || !question.trim() || options.length < 2) return;

    try {
      dispatch({ type: "SET_SENDING", sending: true });
      dispatch({ type: "SET_ERROR", error: null });

      const messageData: CreateMessageRequest = {
        content: question.trim(),
        message_type: MessageType.POLL,
        poll: {
          question: question.trim(),
          options: options.filter((opt) => opt.trim()) as [string, string, ...string[]],
          multiple_choice: multipleChoice,
        },
      };

      const response = await chatApi.sendMessage(currentHousehold.id, messageData);

      if (isApiSuccess<Message>(response)) {
        scrollToBottom();
        toast.success("Poll created");
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create poll";
      console.error("Send poll error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_SENDING", sending: false });
    }
  };

  const voteOnPoll = async (pollId: UUID, selectedOptions: number[]) => {
    try {
      const voteData: CreatePollVoteRequest = { selected_options: selectedOptions };

      const response = await chatApi.voteOnPoll(pollId, voteData);

      if (isApiSuccess(response)) {
        // Update local poll state
        dispatch({
          type: "UPDATE_POLL",
          pollId,
          poll: {
            ...state.polls[pollId],
            vote_counts: response.data.updated_vote_counts,
          },
        });
        toast.success("Vote recorded");
      } else {
        const errorMessage = (response as any)?.error?.message || "Voting failed. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Vote on poll error:", error);
      toast.error("Failed to record vote");
    }
  };

  const editMessage = async (messageId: UUID, content: string) => {
    try {
      const response = await chatApi.editMessage(messageId, { content });

      if (isApiSuccess<Message>(response)) {
        // Message will be updated via real-time subscription
        toast.success("Message updated");
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error("Edit message error:", error);
      toast.error("Failed to edit message");
    }
  };

  const deleteMessage = async (messageId: UUID) => {
    try {
      const response = await chatApi.deleteMessage(messageId);

      if (isApiSuccess(response)) {
        // Message will be removed via real-time subscription
        toast.success("Message deleted");
      } else {
        const errorMessage = (response as any)?.error?.message || "Deletion failed. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Delete message error:", error);
      toast.error("Failed to delete message");
    }
  };

  const uploadFile = async (file: File, caption?: string) => {
    if (!currentHousehold) return;

    try {
      dispatch({ type: "SET_SENDING", sending: true });
      dispatch({ type: "SET_ERROR", error: null });

      const response = file.type.startsWith("image/")
        ? await chatApi.uploadImage(currentHousehold.id, file, caption)
        : await chatApi.uploadFile(currentHousehold.id, file, caption);

      if (isApiSuccess<Message>(response)) {
        scrollToBottom();
        toast.success("File uploaded");
      } else if (isApiError(response)) {
        dispatch({ type: "SET_ERROR", error: response.error.message });
        toast.error(response.error.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
      console.error("Upload file error:", error);
      dispatch({ type: "SET_ERROR", error: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: "SET_SENDING", sending: false });
    }
  };

  const refreshMessages = async () => {
    await loadMessages();
  };

  const setDraft = useCallback((content: string) => {
    dispatch({ type: "SET_DRAFT", draft: content });
  }, []);

  const clearDraft = useCallback(() => {
    dispatch({ type: "CLEAR_DRAFT" });
    if (currentHousehold) {
      setStoredDraft("");
    }
  }, [setStoredDraft, currentHousehold]);

  const startTyping = useCallback(() => {
    if (!currentHousehold || !user) return;

    // Clear existing timer
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    // Send typing indicator (mock implementation)
    chatApi.sendTypingIndicator(currentHousehold.id, true).catch(console.error);

    // Set timer to stop typing
    typingTimer.current = setTimeout(() => {
      stopTyping();
    }, TYPING_TIMEOUT);
  }, [currentHousehold?.id, user]);

  const stopTyping = useCallback(() => {
    if (!currentHousehold) return;

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    chatApi.sendTypingIndicator(currentHousehold.id, false).catch(console.error);
  }, [currentHousehold?.id]);

  const cleanupTypingUsers = useCallback(() => {
    const now = Date.now();
    const filteredUsers = Object.fromEntries(
      Object.entries(state.typingUsers).filter(([_, data]) => now - data.timestamp < TYPING_TIMEOUT)
    );
    dispatch({ type: "SET_TYPING_USERS", typingUsers: filteredUsers });
  }, [state.typingUsers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
      if (cleanupTimer.current) {
        clearInterval(cleanupTimer.current);
      }
    };
  }, []);

  return {
    ...state,
    sendMessage,
    sendPoll,
    loadMoreMessages,
    voteOnPoll,
    editMessage,
    deleteMessage,
    uploadFile,
    refreshMessages,
    setDraft,
    clearDraft,
    startTyping,
    stopTyping,
    clearError,
    scrollToBottom,
    messagesEndRef,
  };
};
