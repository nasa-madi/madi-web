import { useToast } from '@/components'
import { convertChunktoJsonArray, postRunner } from '@/components/getResponse'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { DefaultTools } from '../../Tools/default_tools'
import { Chat, ChatGPTInstance, ChatMessage, Persona, Tool } from '../../interface'
import { useLocalStorageContext } from '../../localStorage'

export const DefaultPersonas: Persona[] = [
  {
    id: 'chatgpt',
    role: 'system',
    name: 'ChatGPT',
    prompt: 'You are an AI assistant that helps people find information.',
    isDefault: true
  }
]

export const useChatContext = () => {
  const { toast } = useToast()
  // const toastRef = useRef<any>(null)
  const {
    state,
    setStorageState,
    appendMessageById,
    setMessagesById,
    getChatById,
    setChatById,
    setChatNameById,
    deleteChatById
  } = useLocalStorageContext()

  const searchParams = useSearchParams()
  const debug = searchParams.get('debug') === 'true'

  // Tools
  const [currentTool, setCurrentTool] = useState<string>('auto')
  const [toolList, setToolList] = useState<Tool[]>(DefaultTools || [])

  // Chats
  const [chatList, setChatList] = useState<string[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined)
  const [idAtStart, setStartId] = useState<string>(currentChatId || '')

  // Array of Chats
  const conversationRef = useRef<ChatMessage[]>([])
  const [conversation, setConversation] = useState<ChatMessage[]>([])

  // CurrentMessage
  const [message, setMessage] = useState('')
  const [currentMessage, setCurrentMessage] = useState<string>('')

  //Visual States
  const [toggleSidebar, setToggleSidebar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)

  //HTML Refs
  const chatRef = useRef<ChatGPTInstance>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const bottomOfChatRef = useRef<HTMLDivElement>(null)
  const cancelledRef = useRef<boolean>(false)

  const onChangeChat = useCallback((id: string) => {
    setCurrentChatId(id)
  }, [])

  const onCreateChat = useCallback(
    (persona: Persona) => {
      const id = uuid()
      const newChat: Chat = {
        id,
        name: 'Untitled',
        messages: [],
        persona: persona,
        date: Date.now()
      }
      setChatById(id, newChat)
      setChatList((state) => [id, ...state])
      setCurrentChatId(id)
    },
    [setChatById]
  )

  const onToggleSidebar = useCallback(() => {
    setToggleSidebar((state) => !state)
  }, [])

  const onDeleteChat = useCallback(
    (id: string) => {
      deleteChatById(id)
      setChatList((prevChatList) => prevChatList.filter((chatId) => chatId !== id))
    },
    [deleteChatById]
  )

  const coreSendMessage = async (
    input: string,
    conversation: ChatMessage[],
    systemPrompt: string,
    localIdAtStart: string,
    currentTool: string,
    toolList: Tool[],
    setConversation: (conv: ChatMessage[]) => void,
    setMessagesById: (id: string, messages: ChatMessage[]) => void,
    setCurrentMessage: (msg: string) => void,
    setIsLoading: (loading: boolean) => void,
    cancelledRef: React.MutableRefObject<boolean>,
    toast: (options: { title: string; description: string }) => void
  ) => {
    try {
      const { currentStream, additionalMessages } = await postRunner(
        systemPrompt,
        conversation,
        input,
        currentTool,
        toolList
      )

      let updatedConversation = [
        ...conversation,
        { content: input, role: 'user' },
        ...additionalMessages
      ] as ChatMessage[]
      setConversation(updatedConversation)
      if (localIdAtStart) setMessagesById(localIdAtStart, updatedConversation)

      let resultContent = ''

      //@ts-expect-error - currentStream is a ReadableStream polyfill
      for await (const chunk of currentStream) {
        const decoder = new TextDecoder('utf-8')
        console.log('sendMessage Chunks', decoder.decode(chunk))
        const decoded = convertChunktoJsonArray(decoder.decode(chunk)) || []
        const char = decoded.reduce(
          (acc, d) => `${acc}${d?.choices?.[0]?.delta?.content || ''}`,
          ''
        )
        if (char) {
          resultContent += char
          if (!cancelledRef.current) {
            setCurrentMessage(resultContent)
          }
        }
      }

      setTimeout(() => {
        if (localIdAtStart && !cancelledRef.current) {
          updatedConversation = [
            ...conversation,
            { content: input, role: 'user' },
            ...additionalMessages,
            { content: resultContent, role: 'assistant' }
          ]
          setMessagesById(localIdAtStart, updatedConversation)
          setCurrentMessage('')
          setConversation(updatedConversation)
        }
      }, 1)

      setIsLoading(false)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
        toast({
          title: 'Error',
          description: error.message
        })
        setIsLoading(false)
      }
    }
  }

  const sendMessage = async (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent) => {
    cancelledRef.current = false // reset the cancelled status before sending a new message

    e.preventDefault()
    const input = textAreaRef.current?.value || ''

    if (input.length < 1) {
      toast({
        title: 'Error',
        description: 'Please enter a message.'
      })
      return
    }
    setMessage('')
    setIsLoading(true)
    const localIdAtStart = currentChatId || ''
    setStartId(localIdAtStart)

    const updatedConversation = [
      ...conversation!,
      { content: input, role: 'user' }
    ] as ChatMessage[]
    setConversation(updatedConversation)
    if (localIdAtStart) setMessagesById(localIdAtStart, updatedConversation)

    const systemPrompt = getChatById(currentChatId || '')?.persona?.prompt || ''

    await coreSendMessage(
      input,
      conversation!,
      systemPrompt,
      localIdAtStart,
      currentTool,
      toolList,
      setConversation,
      setMessagesById,
      setCurrentMessage,
      setIsLoading,
      cancelledRef,
      toast
    )
  }

  const regenerateMessage = async (cutoffIndex: number) => {
    const id = currentChatId || ''
    const conversation = conversationRef.current
    if (conversation) {
      const updatedConversation = conversation.slice(0, cutoffIndex)
      setMessagesById(id, updatedConversation)
      setConversation(updatedConversation)
      setIsLoading(true)

      const systemPrompt = getChatById(currentChatId || '')?.persona?.prompt || ''

      await coreSendMessage(
        '',
        updatedConversation,
        systemPrompt,
        id,
        currentTool,
        toolList,
        setConversation,
        setMessagesById,
        setCurrentMessage,
        setIsLoading,
        cancelledRef,
        toast
      )
    }
  }

  const cancelSend = () => {
    cancelledRef.current = true
    const updatedConversation = [
      ...conversation!,
      { content: currentMessage, role: 'assistant' }
    ] as ChatMessage[]
    setMessagesById?.(idAtStart, updatedConversation)
    setIsLoading(false)
    setCurrentMessage('')
  }

  const clearMessages = () => {
    if (currentChatId) setMessagesById(currentChatId, [])
    setConversation([])
  }

  useEffect(() => {
    conversationRef.current = conversation
  }, [conversation])

  // useEffect(() => {
  //   if (textAreaRef.current) {
  //     textAreaRef.current.style.height = '50px'
  //     textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight + 2}px`
  //   }
  // }, [message, textAreaRef])

  // useEffect(() => {
  //   if (bottomOfChatRef.current) {
  //     bottomOfChatRef.current.scrollIntoView({ behavior: 'smooth' })
  //   }
  // }, [conversation, currentMessage])

  useEffect(() => {
    if (currentChatId) {
      const chat = getChatById(currentChatId)
      if (chat?.messages) setConversation(chat.messages)
    }
  }, [currentChatId, conversation, getChatById])

  useEffect(() => {
    if (!isLoading) {
      textAreaRef.current?.focus()
    }
  }, [isLoading])

  useEffect(() => {
    // Set default chat when no chat is selected
    if ((!currentChatId || !chatList.includes(currentChatId)) && chatList.length > 0) {
      setCurrentChatId(chatList[0])
    }
  }, [currentChatId, chatList])

  useEffect(() => {
    // Order chat list by date when changed
    const stateKeys = Object.keys(state.chats).sort(
      (a, b) => state.chats[b].date - state.chats[a].date
    )
    setChatList(stateKeys)
  }, [state.chats])

  useEffect(() => {
    // When chatList is empty and appState is loaded, create default chat
    if (chatList.length === 0 && state.appState.loaded && Object.keys(state.chats).length === 0) {
      onCreateChat(DefaultPersonas[0])
    }
  }, [chatList.length, state.appState.loaded, onCreateChat, state.chats])

  return {
    debug,
    //HTML Refs
    chatRef,
    textAreaRef, // Ensure textAreaRef is included in the context value
    bottomOfChatRef,
    cancelledRef,

    // Tools
    setCurrentTool,
    currentTool,
    toolList,
    setToolList,

    // Chats
    chatList,
    setChatList,
    currentChatId,
    setCurrentChatId,
    idAtStart,
    setStartId,
    onCreateChat,
    onDeleteChat,
    onChangeChat,

    // Chats
    conversationRef,
    conversation,
    setConversation,

    // CurrentMessage
    message,
    setMessage,
    currentMessage,
    setCurrentMessage,

    // Visual States
    onToggleSidebar,
    toggleSidebar,
    setToggleSidebar,
    isLoading,
    setIsLoading,

    // State
    state,
    setStorageState,
    appendMessageById,
    setMessagesById,
    getChatById,
    setChatById,
    setChatNameById,
    deleteChatById,

    // New Functions
    sendMessage,
    regenerateMessage,
    cancelSend,
    clearMessages
  }
}
