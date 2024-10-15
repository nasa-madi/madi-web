/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import React from 'react'
import * as d3 from 'd3'
import { useEffect, useRef, useState, useMemo } from 'react'
import { Flex } from '@radix-ui/themes'
import embedding_data from './output.json'
import { MaturityLevel } from './types'
import { useTheme } from '@/components/Themes'

import {
  createNodes,
  createLinks,
  createZoomBehavior,
  drag,
  createNodeElements,
  createLinkElements,
  createLabelElements,
  updateLinkPositions,
  updateNodePositions,
  updateLabelPositions,
  createLabel,
  createSimulation,
  calculateSimilarity,
  showLabel,
  hideLabel
} from './utils'
import { ThresholdSlider } from './ThresholdSlider'

const NODE_SHAPES = [
  // d3.symbolDiamond,
  d3.symbolCircle
  // d3.symbolSquare,
  // d3.symbolTriangle,
  // d3.symbolStar,
  // d3.symbolCross,
  // d3.symbolWye,
  // d3.symbolAsterisk
]

export const NetworkGraphOptions = () => {
  return (
    <Flex className="h-full mt-5" gap={'3'}>
      <span className="w-full text-center italic text-gray-600 dark:text-gray-400">
        No options available.
      </span>
    </Flex>
  )
}

export const NetworkGraph = () => {
  const [threshold, setThreshold] = useState(0.895)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const { theme } = useTheme()

  const COLOR_SCALE: Record<MaturityLevel, string> = useMemo(() => {
    const maturityLevels: MaturityLevel[] = [
      'whitespace',
      'Super High',
      'High',
      'Medium',
      'Low',
      'X1',
      'Execution'
    ]

    const scale: Record<MaturityLevel, string> = {} as Record<MaturityLevel, string>
    maturityLevels.forEach((level, index) => {
      const t = (index + 1) / maturityLevels.length
      const color = d3.rgb(d3.interpolatePlasma(t))
      scale[level] = theme === 'dark' ? color.brighter(1).toString() : color.darker(0.1).toString()
    })
    return scale
  }, [theme])

  const embeddings = useMemo(() => {
    return Array.isArray(embedding_data) ? embedding_data : []
  }, [])

  const lineColor = useMemo(() => {
    return theme === 'dark' ? '#595959' : '#adadad'
  }, [theme])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { width, height } = svg.node()?.getBoundingClientRect() ?? { width: 800, height: 600 }

    const embeddingVectors = embeddings.map((item) => item.embedding)
    const maturityLevels = embeddings.map((item) => item.maturity)
    const sources = embeddings.map((item) => item.source)

    const uniqueSources = Array.from(new Set(sources))
    const sourceShapeMap = Object.fromEntries(
      uniqueSources.map((source, index) => [source, NODE_SHAPES[index % NODE_SHAPES.length]])
    )

    const colors = maturityLevels.map((maturity) => {
      const color = COLOR_SCALE[maturity as MaturityLevel]
        ? COLOR_SCALE[maturity as MaturityLevel]
        : COLOR_SCALE['whitespace']
      return color
    })
    const shapes = sources.map((source) => sourceShapeMap[source])
    const labels = embeddings.map((item) => createLabel(item))

    const similarity = calculateSimilarity(embeddingVectors)
    const nodes = createNodes(embeddings, colors, labels)
    const links = createLinks(nodes, similarity, threshold)

    const simulation = createSimulation(nodes, links, width, height)
    const zoom = createZoomBehavior(svg)

    //@ts-ignore
    svg.call(zoom)

    const linkElements = createLinkElements(svg, links, lineColor)
    const nodeElements = createNodeElements(svg, nodes, shapes, drag(simulation))
    const labelElements = createLabelElements(svg, nodes)

    nodeElements
      .on('mouseover', function (event, d) {
        showLabel.call(this, event, d, labelElements)
      })
      .on('mouseout', function (event, d) {
        hideLabel.call(this, event, d, labelElements)
      })

    simulation.on('tick', () => {
      //@ts-ignore
      updateLinkPositions(linkElements)
      //@ts-ignore
      updateNodePositions(nodeElements)
      //@ts-ignore
      updateLabelPositions(labelElements)
    })
  }, [embeddings, threshold, theme, lineColor, COLOR_SCALE])

  return (
    <div>
      <svg ref={svgRef} width="100%" height="800px" />
      <ThresholdSlider value={threshold} onChange={setThreshold} />
    </div>
  )
}

export default NetworkGraph
