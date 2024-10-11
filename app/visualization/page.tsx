'use client'

import Wrapper from '@/components/Wrapper.component'
import Contexts from '@/components/Contexts.component'
import NetworkGraph from '@/components/Visuals/NetworkGraph/NetworkGraphTest'


const NetworkGraphPage = () => {
  //const chatProvider: ChatContextType = useChatContext()

  return (
    <Contexts>
      <Wrapper>
        <NetworkGraph />
      </Wrapper>
    </Contexts>
  )
}

export default NetworkGraphPage