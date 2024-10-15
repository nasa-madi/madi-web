'use client'
import Wrapper from '@/components/Wrapper.component'
import Contexts from '@/components/Contexts.component'
import SideBarChatList from '@/components/Chat/components/SideBarChatList.component'
import { PluginList } from '@/components/Tools/PluginList'
import { Suspense } from 'react'

const PluginsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Contexts>
        <Wrapper sidebarComponent={<SideBarChatList />}>
          <PluginList />
        </Wrapper>
      </Contexts>
    </Suspense>
  )
}

export default PluginsPage
