'use client'

import { useState } from 'react'
import Wrapper from '@/components/Wrapper.component'
import Contexts from '@/components/Contexts.component'
import { NetworkGraph, NetworkGraphOptions } from '@/components/Visuals/NetworkGraph/NetworkGraph'
import { Flex, Select } from '@radix-ui/themes'
import { Suspense } from 'react'

interface SideBarVisualsProps {
  selectedGraph: string
  onSelectChange: (value: string) => void
}

/**
 * Given the selected graph, render the associated options
 * @returns a JSX element representing the options for the selected graph
 */
const SideBarVisuals = ({ selectedGraph, onSelectChange }: SideBarVisualsProps) => {
  const renderOptions = () => {
    switch (selectedGraph) {
      case 'networkGraph':
        return <NetworkGraphOptions />
      case 'graph2':
        return <>Graph 2 Options</>
      case 'graph3':
        return <>Graph 3 Options</>
      default:
        return null
    }
  }

  return (
    <Flex className="h-full" gap={'3'} direction={'column'}>
      <Select.Root defaultValue="networkGraph" onValueChange={onSelectChange} size="2">
        <Select.Trigger variant="surface" className="w-full dark:text-white" />
        <Select.Content className="w-full">
          <Select.Group className="w-full">
            <Select.Item value="networkGraph">Network Graph</Select.Item>
            <Select.Item value="graph2">Graph 2</Select.Item>
            <Select.Item value="graph3">Graph 3</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>
      {renderOptions()}
    </Flex>
  )
}

/**
 * A page component that displays a visualization based on the selected graph.
 * The user can select the graph to display from the sidebar.
 *
 * @returns a JSX element representing the page
 */
const NetworkGraphPage = () => {
  const [selectedGraph, setSelectedGraph] = useState('networkGraph')

  const handleSelectChange = (value: string) => {
    setSelectedGraph(value)
  }

  const renderGraph = () => {
    switch (selectedGraph) {
      case 'networkGraph':
        return <NetworkGraph />
      case 'graph2':
        return <>Graph2</>
      case 'graph3':
        return <>Graph3</>
      default:
        return null
    }
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Contexts>
        <Wrapper
          sidebarComponent={
            <SideBarVisuals selectedGraph={selectedGraph} onSelectChange={handleSelectChange} />
          }
        >
          {renderGraph()}
        </Wrapper>
      </Contexts>
    </Suspense>
  )
}

export default NetworkGraphPage
