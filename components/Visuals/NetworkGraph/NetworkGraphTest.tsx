import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const NetworkGraph = () => {
  const [threshold, setThreshold] = useState(0.895);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    svg.selectAll('*').remove();
    // Load the JSON file dynamically using require
    const embeddings = require('./output.json'); // Assuming the JSON file is in the same directory

    const embeddingVectors = embeddings.map((item: any) => item.embedding);
    const maturityLevels = embeddings.map((item: any) => item.maturity);
    const prompts = embeddings.map((item: any) => item.prompt);
    const sources = embeddings.map((item: any) => item.source);

    const nodeShapes = [
      d3.symbolDiamond,
      d3.symbolCircle,
      d3.symbolSquare,
      d3.symbolTriangle,
      d3.symbolStar,
      d3.symbolCross,
      d3.symbolWye,
      d3.symbolAsterisk,
    ];

    const sourceShapeMap: Record<string, any> = {};
    const uniqueSources = [...new Set(sources)];
    uniqueSources.forEach((source, index) => {
      sourceShapeMap[source] = nodeShapes[index % nodeShapes.length];
    });

    const colorScale = {
      Low: '#90c4a2',
      Medium: '#41b6c4',
      High: '#2c7fb8',
      SuperHigh: '#253494',
      X1: '#41c491',
      whitespace: '#942534',
    };

    const colors = maturityLevels.map((maturity: string) => colorScale[maturity]);
    const shapes = sources.map((source: string) => sourceShapeMap[source]);
    const labels = embeddings.map((item: any) =>
      `<span class="maturity">${item.maturity}</span> <span class="source">${item.source}</span><br>${item.prompt}`
    );

    // Cosine similarity calculation
    const similarity: any[] = [];
    for (let i = 0; i < embeddingVectors.length; i++) {
      for (let j = i + 1; j < embeddingVectors.length; j++) {
        const dist = cosineSimilarity(embeddingVectors[i], embeddingVectors[j]);
        similarity.push({ source: i, target: j, dist });
      }
    }

    const nodes = embeddingVectors.map((_, index) => ({
      id: index,
      color: colors[index],
      label: labels[index],
    }));

    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      const nodeLinks = similarity
        .filter((link) => (link.source === i || link.target === i) && link.dist >= threshold)
        .map((link) => ({ source: link.source, target: link.target, dist: link.dist }));

      if (nodeLinks.length === 0) {
        const closestLink = similarity
          .filter((link) => link.source === i || link.target === i)
          .sort((a, b) => b.dist - a.dist)[0];

        if (closestLink) {
          nodeLinks.push({
            source: closestLink.source,
            target: closestLink.target,
            dist: closestLink.dist,
          });
        }
      }

      links.push(...nodeLinks);
    }

    //const svg = d3.select(svgRef.current);
    const width = svg.node()?.getBoundingClientRect().width || 800;
    const height = svg.node()?.getBoundingClientRect().height || 600;

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.7));

    const zoom = d3.zoom().scaleExtent([0.5, 5]).on('zoom', (event) => {
      svg.selectAll('g').attr('transform', event.transform);
    });

    svg.call(zoom);

    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', 1);

    const nodeGroup = svg.append('g').attr('class', 'nodes');

    const node = nodeGroup
      .selectAll('path')
      .data(nodes)
      .enter()
      .append('path')
      .attr('d', (d, i) => d3.symbol().type(shapes[i]).size(200)())
      .attr('fill', (d) => d.color)
      .call(drag(simulation));

    const label = svg
      .append('g')
      .attr('class', 'labels')
      .selectAll('foreignObject')
      .data(nodes)
      .enter()
      .append('foreignObject')
      .attr('class', 'node-label')
      .style('visibility', 'hidden')
      .style('pointer-events', 'none')
      .html((d) => `<div class="label-content">${d.label}</div>`);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      label.attr('x', (d: any) => d.x + 10).attr('y', (d: any) => d.y + 10);
    });

    function drag(simulation: any) {
      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }, [threshold]);

  function cosineSimilarity(a: number[], b: number[]) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
  }

  return (
    <div>
      <svg ref={svgRef} width="100%" height="600px"></svg>
      <div className="slider-container">
        <input
          type="range"
          min="0.83"
          max="0.93"
          step="0.001"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
        />
      </div>

    </div>
  );
};

export default NetworkGraph;