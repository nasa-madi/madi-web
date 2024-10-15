/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { NodeDatum, SimulationLink, SimilarityLink, LabelSelection, DragEvent } from './types'
import * as d3 from 'd3'
import styles from './NetworkGraph.module.css'

export function drag(simulation: d3.Simulation<NodeDatum, undefined>) {
  function dragstarted(event: DragEvent, d: NodeDatum) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(event: DragEvent, d: NodeDatum) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragended(event: DragEvent, d: NodeDatum) {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }

  return d3
    .drag<SVGPathElement, NodeDatum>()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
}

export function showLabel(
  this: SVGPathElement,
  event: MouseEvent,
  d: { id: number },
  label: LabelSelection
) {
  label
    .filter((node) => node.id === d.id)
    .style('visibility', 'visible')
    .raise() // Add this line to bring the label to the front
  d3.select(this).style('stroke', 'hotpink').style('stroke-width', '3px')
}

export function hideLabel(
  this: SVGPathElement,
  event: MouseEvent,
  d: { id: number },
  label: LabelSelection
) {
  label.filter((node) => node.id === d.id).style('visibility', 'hidden')
  d3.select(this).style('stroke', null).style('stroke-width', null)
}

export function cosineSimilarity(a: number[], b: number[]) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (normA * normB)
}

export function createNodes(embeddings: any[], colors: string[], labels: string[]): NodeDatum[] {
  return embeddings.map((_, index) => ({
    id: index,
    color: colors[index],
    label: labels[index]
  }))
}

export function createZoomBehavior(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
  return d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 5])
    .on('zoom', (event) => {
      svg.selectAll('g').attr('transform', event.transform)
    }) as unknown as (
    selection: d3.Selection<SVGSVGElement | null, unknown, null, undefined>
  ) => void
}

export function createLinks(
  nodes: NodeDatum[],
  similarity: SimilarityLink[],
  threshold: number
): SimulationLink[] {
  const links: SimulationLink[] = []
  for (let i = 0; i < nodes.length; i++) {
    const nodeLinks = similarity
      .filter((link) => (link.source === i || link.target === i) && link.dist >= threshold)
      .map((link) => ({
        source: nodes[link.source],
        target: nodes[link.target]
      }))

    if (nodeLinks.length === 0) {
      const closestLink = similarity
        .filter((link) => link.source === i || link.target === i)
        .sort((a, b) => b.dist - a.dist)[0]

      if (closestLink) {
        nodeLinks.push({
          source: nodes[closestLink.source],
          target: nodes[closestLink.target]
        })
      }
    }

    links.push(...nodeLinks)
  }
  return links
}

export function createLabel(item: { source: string; maturity: string; prompt: string }) {
  return `
      <div style="background-color: white; padding: 0px 5px 5px 5px; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); font-size: 12px; max-width: 200px; word-wrap: break-word;">
        <span style="font-weight: bold;">${item.source}</span><br>
        <span style="font-style: italic;>${item.maturity}</span><br>
        <span class="prompt">${item.prompt}</span>
      </div>
    `
}

export function calculateSimilarity(embeddingVectors: number[][]): SimilarityLink[] {
  const similarity: SimilarityLink[] = []
  for (let i = 0; i < embeddingVectors.length; i++) {
    for (let j = i + 1; j < embeddingVectors.length; j++) {
      const dist = cosineSimilarity(embeddingVectors[i], embeddingVectors[j])
      similarity.push({ source: i, target: j, dist })
    }
  }
  return similarity
}

export function createSimulation(nodes: any[], links: any[], width: number, height: number) {
  return d3
    .forceSimulation(nodes)
    .force('link', d3.forceLink(links))
    .force('charge', d3.forceManyBody().strength(-100))
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    .force('center', d3.forceCenter(width / 2, height / 2).strength(0.7))
}

export function createLinkElements(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  links: any[],
  color: string
) {
  return svg
    .append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', color)
    .attr('stroke-width', 1)
}

export function createNodeElements(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  nodes: any[],
  shapes: d3.SymbolType[],
  dragBehavior: any
) {
  return svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll('path')
    .data(nodes)
    .enter()
    .append('path')
    .attr('d', (d, i) => d3.symbol().type(shapes[i]).size(150)())
    .attr('fill', (d) => d.color)
    .call(dragBehavior)
}

export function createLabelElements(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  nodes: any[]
) {
  return svg
    .append('g')
    .attr('class', 'labels')
    .selectAll('foreignObject')
    .data(nodes)
    .enter()
    .append('foreignObject')
    .attr('class', styles['node-label'])
    .style('visibility', 'hidden')
    .style('pointer-events', 'none')
    .style('z-index', '10') // Add this line to set the z-index

    .html((d) => `<div xmlns="http://www.w3.org/1999/xhtml" class="label-content">${d.label}</div>`)
    .each(function () {
      const labelElement = this.querySelector('.label-content')
      if (labelElement) {
        d3.select(this).attr('width', 200).attr('height', '100%')
      }
    })
}

export function updateLinkPositions(
  linkElements: d3.Selection<SVGLineElement, SimulationLink, null, undefined>
) {
  linkElements
    .attr('x1', (d) => (d.source as any).x ?? 0)
    .attr('y1', (d) => (d.source as any).y ?? 0)
    .attr('x2', (d) => (d.target as any).x ?? 0)
    .attr('y2', (d) => (d.target as any).y ?? 0)
}

export function updateNodePositions(
  nodeElements: d3.Selection<SVGPathElement, NodeDatum, null, undefined>
) {
  nodeElements.attr('transform', (d) => `translate(${d.x},${d.y})`)
}

export function updateLabelPositions(
  labelElements: d3.Selection<SVGForeignObjectElement, NodeDatum, null, undefined>
) {
  labelElements.attr('x', (d) => (d.x ?? 0) + 10).attr('y', (d) => (d.y ?? 0) + 10)
}
