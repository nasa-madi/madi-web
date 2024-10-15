'use client'
import { Chat } from '@/components'
import { useChatContext } from '@/components'
import { ChatContextType } from '@/components/Chat/context'
import { Suspense } from 'react'

import Wrapper from '@/components/Wrapper.component'
import Contexts from '@/components/Contexts.component'
import SideBarChatList from '@/components/Chat/components/SideBarChatList.component'

const InnerPage = () => {
  const chatProvider: ChatContextType = useChatContext()

  return (
    <Contexts>
      <Wrapper sidebarComponent={<SideBarChatList />}>
        <Chat ref={chatProvider.chatRef} />
      </Wrapper>
    </Contexts>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InnerPage />
    </Suspense>
  )
}
