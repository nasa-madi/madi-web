import * as d3 from 'd3'

export type NodeDatum = d3.SimulationNodeDatum & {
  id: number
  color: string
  label?: string
}

export type MaturityLevel =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Super High'
  | 'X1'
  | 'whitespace'
  | 'Execution'

export type SimulationLink = {
  source: NodeDatum
  target: NodeDatum
}

export type SimilarityLink = {
  source: number
  target: number
  dist: number
}

export type DragEvent = d3.D3DragEvent<SVGPathElement, NodeDatum, NodeDatum>

export type LabelSelection = d3.Selection<SVGForeignObjectElement, NodeDatum, SVGGElement, unknown>
