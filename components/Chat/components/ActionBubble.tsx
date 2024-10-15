'use client'

import { useContext } from 'react'
import { Box, IconButton, Tooltip } from '@radix-ui/themes'
// import * as Tooltip from '@radix-ui/tooltip'
import { ChatContext } from '@/components/Chat'
import { CopyIcon, SymbolIcon } from '@radix-ui/react-icons'
import { TiThumbsDown } from 'react-icons/ti'

export interface ActionBubbleProps {
  message: string
  index: number
}

export const ActionBubble = (props: ActionBubbleProps) => {
  const messageIndex = props.index
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(props.message)
      .then(() => {
        console.log('Message copied to clipboard')
      })
      .catch((err) => {
        console.error('Failed to copy message: ', err)
      })
  }

  const { regenerateMessage } = useContext(ChatContext)

  return (
    <Box width="max-content">
      <Tooltip content="Copy">
        <IconButton
          className="mr-2 w-5 h-5"
          radius="large"
          variant="ghost"
          size="1"
          onClick={copyToClipboard}
        >
          <CopyIcon />
        </IconButton>
      </Tooltip>
      <Tooltip content="Regenerate">
        <IconButton
          className="mr-2 w-5 h-5"
          radius="large"
          variant="ghost"
          size="1"
          onClick={() => regenerateMessage(messageIndex)}
        >
          <SymbolIcon />
        </IconButton>
      </Tooltip>
      <Tooltip content="Bad Reponse - Coming Soon">
        <IconButton className="mr-2 w-5 h-5" radius="large" variant="ghost" size="1">
          <TiThumbsDown />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default ActionBubble
