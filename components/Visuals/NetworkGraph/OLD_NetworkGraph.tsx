// 'use client'

// // import NextLink from 'next/link'
// import React from 'react'
// import * as d3 from 'd3'
// import { useEffect, useRef } from 'react'
// import { Flex } from '@radix-ui/themes'

// export const NetworkGraphOptions = () => {
//   return (
//     <Flex className="h-full mt-5" gap={'3'}>
//       <span className="w-full text-center italic text-gray-500">No options available.</span>
//     </Flex>
//   )
// }
// export const NetworkGraph = () => {
//   const ref = useRef<SVGSVGElement>(null)

//   useEffect(() => {
//     if (ref.current) {
//       // set the dimensions and margins of the graph
//       const margin = { top: 30, right: 30, bottom: 70, left: 60 },
//         width = 460 - margin.left - margin.right,
//         height = 400 - margin.top - margin.bottom

//       // append the svg object to the body of the page
//       const svg = d3
//         .select(ref.current)
//         .append('svg')
//         .attr('width', width + margin.left + margin.right)
//         .attr('height', height + margin.top + margin.bottom)
//         .append('g')
//         .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

//       // Parse the Data
//       d3.csv(
//         'https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv'
//       ).then(function (data) {
//         // X axis
//         const x = d3
//           .scaleBand()
//           .range([0, width])
//           .domain(
//             data.map(function (d) {
//               return d.Country
//             })
//           )
//           .padding(0.2)
//         svg
//           .append('g')
//           .attr('transform', 'translate(0,' + height + ')')
//           .call(d3.axisBottom(x))
//           .selectAll('text')
//           .attr('transform', 'translate(-10,0)rotate(-45)')
//           .style('text-anchor', 'end')

//         // Add Y axis
//         const y = d3.scaleLinear().domain([0, 13000]).range([height, 0])
//         svg.append('g').call(d3.axisLeft(y))

//         // Bars
//         svg
//           .selectAll('mybar')
//           .data(data)
//           .enter()
//           .append('rect')
//           .attr('x', function (d) {
//             return x(d.Country!)!
//           })
//           .attr('y', function (d) {
//             return y(+d.Value)
//           })
//           .attr('width', x.bandwidth())
//           .attr('height', function (d) {
//             return height - y(+d.Value)
//           })
//           .attr('fill', '#69b3a2')
//       })
//     }
//   }, [])
//   return <svg width={460} height={400} id="barchart" ref={ref} />
// }
