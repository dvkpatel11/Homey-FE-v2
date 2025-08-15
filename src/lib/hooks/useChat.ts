/**
 * useChat - Real-time chat management
 * Handles messages, polls, file uploads, and real-time chat functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Message, 
  CreateMessageRequest, 
  Poll, 
  CreatePollVoteRequest,
  MessageListResponse,
  UUID,
  isApiSuccess,
  isApiError
} from '@/lib/types';
import { chatApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useHousehold } from '@/contexts/HouseholdContext';
import { supabase } from '@/contexts/AuthContext';
import { useLocalStorage } from './useLocalStorage';
import { useMobile } from './useMobile';
import toast from 'react-hot-toast';

export interface ChatState {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  hasMore: boolean;
  polls: Record<UUID, Poll>;
  typingUsers: Record<UUID, { name: string; timestamp: number }>;
  draft: string;
}

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
}

const MESSAGES_PER_PAGE = 50;
const TYPING_TIMEOUT = 3000; // 3 seconds
const TYPING_CLEANUP_INTERVAL = 5000; // 5 seconds

export const useChat = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { isMobile } = useMobile();
  
  const [state, setState] = useState<ChatState>({
    messages: [],
    loading: false,
    sending: false,
    hasMore: true,
    polls: {},
    typingUsers: {},
    draft: '',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageId = useRef<UUID | null>(null);
  const typingTimer = useRef<NodeJS.Timeout>();
  const cleanupTimer = useRef<NodeJS.Timeout>();
  
  // Persistent draft storage
  const [storedDraft, setStoredDraft] = useLocalStorage(
    `chat-draft-${currentHousehold?.id || 'none'}`, 
    ''
  );

  // Load initial messages when household changes
  useEffect(() => {
    if (currentHousehold) {
      loadMessages();
      
      // Restore draft
      setState(prev => ({ ...prev, draft: storedDraft }));
      
      // Set up real-time subscription
      const unsubscribe = subscribeToMessages();
      
      // Set up typing cleanup
      cleanupTimer.current = setInterval(cleanupTypingUsers, TYPING_CLEANUP_INTERVAL);
      
      return () => {
        unsubscribe();
        if (cleanupTimer.current) clearInterval(cleanupTimer.current);
      };
    } else {
      setState(prev => ({ 
        ...prev, 
        messages: [], 
        polls: {}, 
        typingUsers: {},
        draft: '' 
      }));
    }
  }, [currentHousehold, storedDraft]);

  // Auto-scroll to bottom on new messages (mobile-optimized)
  useEffect(() => {
    if (isMobile) {
      // Delay scroll on mobile to account for virtual keyboard
      setTimeout(scrollToBottom, 100);
    } else {
      scrollToBottom();
    }
  }, [state.messages, isMobile]);

  // Save draft to localStorage
  useEffect(() => {
    setStoredDraft(state.draft);
  }, [state.draft, setStoredDraft]);

  const loadMessages = async (before?: string) => {
    if (!currentHousehold) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      const response = await chatApi.getMessages(currentHousehold.id, {
        limit: MESSAGES_PER_PAGE,
        before,
      });

      if (isApiSuccess<MessageListResponse>(response)) {
        const { data: messages, meta } = response.data;
        
        setState(prev => ({
          ...prev,
          messages: before ? [...prev.messages, ...messages] : messages,
          hasMore: meta.has_more || false,
          polls: {
            ...prev.polls,
            ...messages.reduce((acc, msg) => {
              if (msg.poll) {
                acc[msg.poll.id] = msg.poll;
              }
              return acc;
            }, {} as Record<UUID, Poll>),
          },
        }));

        if (messages.length > 0 && !before) {
          lastMessageId.current = messages[0].id;
        }
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error('Load messages error:', error);
      toast.error('Failed to load messages');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
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
      setState(prev => ({ ...prev, sending: true }));
      stopTyping();

      const messageData: CreateMessageRequest = {
        content: content.trim(),
        message_type: 'text',
      };

      const response = await chatApi.sendMessage(currentHousehold.id, messageData);

      if (isApiSuccess<Message>(response)) {
        // Clear draft on successful send
        clearDraft();
        scrollToBottom();
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setState(prev => ({ ...prev, sending: false }));
    }
  };

  const sendPoll = async (question: string, options: string[], multipleChoice = false) => {
    if (!currentHousehold || !question.trim() || options.length < 2) return;

    try {
      setState(prev => ({ ...prev, sending: true }));

      const response = await chatApi.createPoll(
        currentHousehold.id,
        question.trim(),
        options.filter(opt => opt.trim()),
        { multiple_choice: multipleChoice }
      );

      if (isApiSuccess<Message>(response)) {
        scrollToBottom();
        toast.success('Poll created');
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error('Send poll error:', error);
      toast.error('Failed to create poll');
    } finally {
      setState(prev => ({ ...prev, sending: false }));
    }
  };

  const voteOnPoll = async (pollId: UUID, selectedOptions: number[]) => {
    try {
      const voteData: CreatePollVoteRequest = { selectedOptions };
      
      const response = await chatApi.voteOnPoll(pollId, voteData);

      if (isApiSuccess(response)) {
        toast.success('Vote recorded');
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error('Vote on poll error:', error);
      toast.error('Failed to record vote');
    }
  };

  const editMessage = async (messageId: UUID, content: string) => {
    try {
      const response = await chatApi.editMessage(messageId, { content });

      if (isApiSuccess<Message>(response)) {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId ? response.data : msg
          ),
        }));
        toast.success('Message updated');
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error('Edit message error:', error);
      toast.error('Failed to edit message');
    }
  };

  const deleteMessage = async (messageId: UUID) => {
    try {
      const response = await chatApi.deleteMessage(messageId);

      if (isApiSuccess(response)) {
        setState(prev => ({
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== messageId),
        }));
        toast.success('Message deleted');
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error('Delete message error:', error);
      toast.error('Failed to delete message');
    }
  };

  const uploadFile = async (file: File, caption?: string) => {
    if (!currentHousehold) return;

    try {
      setState(prev => ({ ...prev, sending: true }));

      const response = file.type.startsWith('image/') 
        ? await chatApi.uploadImage(currentHousehold.id, file, caption)
        : await chatApi.uploadFile(currentHousehold.id, file, caption);

      if (isApiSuccess<Message>(response)) {
        scrollToBottom();
        toast.success('File uploaded');
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }
    } catch (error) {
      console.error('Upload file error:', error);
      toast.error('Failed to upload file');
    } finally {
      setState(prev => ({ ...prev, sending: false }));
    }
  };

  const refreshMessages = async () => {
    await loadMessages();
  };

  const setDraft = useCallback((content: string) => {
    setState(prev => ({ ...prev, draft: content }));
  }, []);

  const clearDraft = useCallback(() => {
    setState(prev => ({ ...prev, draft: '' }));
    setStoredDraft('');
  }, [setStoredDraft]);

  const startTyping = useCallback(() => {
    if (!currentHousehold || !user) return;

    // Clear existing timer
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    // Send typing indicator
    chatApi.sendTypingIndicator(currentHousehold.id, true);

    // Set timer to stop typing
    typingTimer.current = setTimeout(() => {
      stopTyping();
    }, TYPING_TIMEOUT);
  }, [currentHousehold, user]);

  const stopTyping = useCallback(() => {
    if (!currentHousehold) return;

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = undefined;
    }

    chatApi.sendTypingIndicator(currentHousehold.id, false);
  }, [currentHousehold]);

  const cleanupTypingUsers = useCallback(() => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      typingUsers: Object.fromEntries(
        Object.entries(prev.typingUsers).filter(
          ([_, data]) => now - data.timestamp < TYPING_TIMEOUT
        )
      ),
    }));
  }, []);

  const subscribeToMessages = (): (() => void) => {
    if (!currentHousehold) return () => {};

    const channel = supabase
      .channel(`chat:${currentHousehold.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `household_id=eq.${currentHousehold.id}`,
      }, (payload) => {
        const newMessage = payload.new as Message;
        
        setState(prev => ({
          ...prev,
          messages: [newMessage, ...prev.messages],
          polls: newMessage.poll ? {
            ...prev.polls,
            [newMessage.poll.id]: newMessage.poll,
          } : prev.polls,
        }));

        // Show notification for messages from other users
        if (newMessage.user_id !== user?.id) {
          toast(`${newMessage.user_name}: ${newMessage.content.slice(0, 50)}${newMessage.content.length > 50 ? '...' : ''}`, {
            duration: 3000,
            icon: '💬',
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `household_id=eq.${currentHousehold.id}`,
      }, (payload) => {
        const updatedMessage = payload.new as Message;
        
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          ),
          polls: updatedMessage.poll ? {
            ...prev.polls,
            [updatedMessage.poll.id]: updatedMessage.poll,
          } : prev.polls,
        }));
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `household_id=eq.${currentHousehold.id}`,
      }, (payload) => {
        const deletedMessage = payload.old as Message;
        
        setState(prev => ({
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== deletedMessage.id),
        }));
      })
      // Typing indicators (if implemented in backend)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, user_name, is_typing } = payload.payload;
        
        if (user_id === user?.id) return; // Ignore own typing

        setState(prev => {
          const newTypingUsers = { ...prev.typingUsers };
          
          if (is_typing) {
            newTypingUsers[user_id] = {
              name: user_name,
              timestamp: Date.now(),
            };
          } else {
            delete newTypingUsers[user_id];
          }
          
          return { ...prev, typingUsers: newTypingUsers };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: isMobile ? 'auto' : 'smooth' // Instant scroll on mobile for better performance
    });
  };

  const actions: ChatActions = {
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
  };

  // Computed values
  const typingUsersList = Object.values(state.typingUsers).map(user => user.name);
  const hasTypingUsers = typingUsersList.length > 0;

  return {
    ...state,
    ...actions,
    messagesEndRef,
    canLoadMore: state.hasMore && !state.loading,
    typingUsersList,
    hasTypingUsers,
    canSend: !state.sending && state.draft.trim().length > 0,
  };
};
