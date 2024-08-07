import { useAuthContext } from '@/components/authenticate'
import { getTools } from '@/components/getResponse'
import { Select } from '@radix-ui/themes'
import { Fragment, useContext, useEffect } from 'react'
import { ChatContext } from '../Chat/context'
import { Tool } from '../interface'

export const ToolSelect = () => {
  const { toolList, setToolList, currentTool, setCurrentTool } = useContext(ChatContext)
  const { currentUser } = useAuthContext()

  const splitByPlugin = (toolList: Tool[]) => {
    return toolList.reduce((acc: Record<string, Tool[]>, tool: Tool) => {
      const pluginName = tool.plugin || 'Common'
      if (!acc[pluginName]) {
        acc[pluginName] = []
      }
      acc[pluginName].push(tool)
      return acc
    }, {})
  }

  useEffect(() => {
    if (currentUser) {
      ;(async () => {
        const fetchTools = await getTools()
        if (setToolList) setToolList(fetchTools)
      })()
    }
  }, [currentUser, setToolList])

  if (!toolList || toolList.length === 0) {
    return null
  }

  const splitTools = splitByPlugin(toolList || [])

  // useEffect(() => {
  //   console.log('toolcheck currentUser', currentUser)
  //   if (currentUser) {
  //     ;(async () => {
  //       const fetchTools = await getTools()
  //       if (setToolList) setToolList(fetchTools)
  //       console.log('fetchTools', fetchTools)
  //     })()
  //   }
  // }, [currentUser, setToolList])

  // if (!toolList || toolList.length === 0) {
  //   return null
  //

  return (
    <Select.Root defaultValue={currentTool} size="2" onValueChange={setCurrentTool}>
      <Select.Trigger
        className="rounded-3xl"
        variant="surface"
        style={{
          minHeight: '24px'
        }}
      />
      <Select.Content>
        {/* <Select.Group> */}
        {/* <Select.Label>Auto</Select.Label> */}
        <Select.Item key="auto" value="auto">
          Auto
        </Select.Item>
        <Select.Item key="off" value="off">
          Off
        </Select.Item>
        <Select.Separator />

        {Object.keys(splitTools).map((plugin) => (
          <Fragment key={plugin}>
            <Select.Group>
              <Select.Label>{plugin}</Select.Label>
              {splitTools[plugin].map((tool: Tool) => (
                <Select.Item key={tool.function.name} value={tool.function.name}>
                  {tool.display || tool.function.name}
                </Select.Item>
              ))}
            </Select.Group>
            <Select.Separator />
          </Fragment>
        ))}
      </Select.Content>
    </Select.Root>
  )
}
