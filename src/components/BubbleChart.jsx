import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

export const BubbleChart = ({ data, selections, onNodeClick, isPaperView }) => {
  const containerRef = useRef(null);

  // reconstruct hierarchical data tree from current filter settings
  const hierarchyData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const activeDims = selections.filter(s => s !== 'none');
    if (activeDims.length === 0) {
      return { name: 'Root', children: [] };
    }

    // recursively group elements based on active dropdown dimensions
    const groupFn = (dataArray, dimIndex, currentPath) => {
      if (dimIndex >= activeDims.length) return null;

      const currentDim = activeDims[dimIndex];
      const isLeafDimension = dimIndex === activeDims.length - 1;

      const groupsMap = new Map();
      dataArray.forEach(d => {
        const values = d[currentDim] || ['Uncategorized'];
        values.forEach(val => {
          let actualKey = val;
          for (let k of groupsMap.keys()) {
            if (k.toLowerCase() === val.toLowerCase()) {
              actualKey = k;
              break;
            }
          }
          if (!groupsMap.has(actualKey)) groupsMap.set(actualKey, []);
          groupsMap.get(actualKey).push(d);
        });
      });

      const children = Array.from(groupsMap.entries()).map(([key, items]) => {
        const newPath = [...currentPath, key];
        if (isLeafDimension) {
          return {
            name: key,
            dimension: currentDim,
            isLeaf: true,
            value: items.length,
            items: items,
            dimensions: newPath
          };
        } else {
          return {
            name: key,
            dimension: currentDim,
            isLeaf: false,
            children: groupFn(items, dimIndex + 1, newPath)
          };
        }
      });

      return children;
    };

    return {
      name: 'Root',
      isRoot: true,
      children: groupFn(data, 0, [])
    };
  }, [data, selections]);

  const onNodeClickRef = useRef(onNodeClick);
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  // render d3 visualization using the constructed data tree
  useEffect(() => {
    if (!containerRef.current || !hierarchyData || !hierarchyData.children || hierarchyData.children.length === 0) {
      d3.select(containerRef.current).selectAll('*').remove();
      return;
    }

    const containerWidth = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    d3.select(containerRef.current).selectAll('*').remove();

    const svg = d3.select(containerRef.current)
      .append('svg')
      .style('width', '100vw')
      .style('height', '100%')
      .style('position', 'absolute')
      .style('right', '0')
      .style('background', 'var(--bg-color)')
      .style('cursor', 'grab');

    const g = svg.append('g');

    // compute bubble colors based on tree depth
    const getColorForDepth = (depth, isLeaf) => {
      if (isLeaf) return 'var(--accent-color)'
      const colors = [
        '#001a22', // level 1 depth 1 darkest
        '#002d38', // level 2
        '#00424f', // level 3
        '#005766', // level 4
        '#006b6b'  // level 5 primary cyan fallback
      ];
      const idx = Math.min(colors.length, Math.max(1, depth)) - 1;
      return colors[idx];
    };

    // define scaling boundaries for graph interactions
    const zoom = d3.zoom()
      .scaleExtent([0.02, 10])
      .on('zoom', (e) => {
        g.attr('transform', e.transform);

        const currentScale = e.transform.k;
        g.selectAll('.node-label')
          .style('opacity', d => {
            if (d.isLabelExpanded) return 1;
            const visualRadius = d.r * currentScale;
            if (d.data.isLeaf) {
              return visualRadius > 25 ? 1 : 0;
            } else {
              return visualRadius > 35 ? 1 : 0;
            }
          });
      });
    svg.call(zoom);

    const root = d3.hierarchy(hierarchyData)
      .sum(d => d.value || 0)
      .sort((a, b) => b.value - a.value);

    // configure sizing constants for final leaf nodes
    const targetPadding = 60;
    const baseRadiusMultiplier = 40.0;
    const minLeafRadius = 55;

    // perform first pass pack with zero padding
    const pack1 = d3.pack().size([10000, 10000]).padding(0);
    pack1(root);

    let leaf = root.leaves()[0];
    if (!leaf) return;

    let targetRadius = Math.max(minLeafRadius, Math.sqrt(leaf.data.value) * baseRadiusMultiplier);
    let scaleFactor = targetRadius / leaf.r;

    // perform second pass pack using exact padding
    const layoutPadding = targetPadding / scaleFactor;
    const pack2 = d3.pack().size([10000, 10000]).padding(layoutPadding);
    pack2(root);

    // apply slight scaling correction post layout
    leaf = root.leaves()[0];
    scaleFactor = targetRadius / leaf.r;

    root.each(d => {
      d.x = (d.x - 5000) * scaleFactor;
      d.y = (d.y - 5000) * scaleFactor;
      d.r *= scaleFactor;
    });

    const nodes = root.descendants().filter(d => !d.data.isRoot);
    const packSize = root.r * 2;

    const nodeElements = g.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    nodeElements.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => d.data.isLeaf ? getColorForDepth(d.depth, d.data.isLeaf) : 'transparent')
      .attr('stroke', d => getColorForDepth(d.depth, d.data.isLeaf))
      .attr('stroke-width', 1.0)
      .style('cursor', d => d.data.isLeaf ? 'pointer' : 'default')
      .on('click', (event, d) => {
        if (event.defaultPrevented) return;
        if (d.data.isLeaf && onNodeClickRef.current) {
          onNodeClickRef.current({
            dimensions: d.data.dimensions,
            count: d.data.value,
            items: d.data.items
          });
        }
      })
      .on('mouseenter', function (event, d) {
        if (d.data.isLeaf) {
          d.leafHovered = true;
          updateLeafNodeHover(d);
        } else {
          d.circleHovered = true;
          updateOuterNodeHover(d);
        }
      })
      .on('mouseleave', function (event, d) {
        if (d.data.isLeaf) {
          d.leafHovered = false;
          setTimeout(() => {
            if (!d.leafHovered) updateLeafNodeHover(d);
          }, 20);
        } else {
          d.circleHovered = false;
          setTimeout(() => {
            if (!d.circleHovered && !d.labelHovered) updateOuterNodeHover(d);
          }, 20);
        }
      });

    function updateLeafNodeHover(d) {
      if (!d.data.isLeaf) return;
      const isHovered = d.leafHovered;
      const gNode = nodeElements.filter(nd => nd === d);
      const circleNode = gNode.select('circle');
      const labelNode = gNode.select('.node-label');

      if (isHovered) {
        circleNode.attr('stroke-width', 2.0).attr('stroke', 'var(--accent-hover)');

        const currentScale = d3.zoomTransform(svg.node()).k;
        if (d.r * currentScale < 45) {
          if (!d.isLeafExpanded && !d.leafHoverTimeout) {
            d.leafHoverTimeout = setTimeout(() => {
              d.isLeafExpanded = true;
              d.leafHoverTimeout = null;
              const targetScale = 45 / (d.r * currentScale);
              gNode.interrupt('hover');
              labelNode.interrupt('hover');

              gNode.transition('hover').duration(200)
                .attr('transform', `translate(${d.x},${d.y}) scale(${targetScale})`);
              labelNode.transition('hover').duration(200).style('opacity', 1);
              gNode.raise();
            }, 150);
          }
        }

        // Safety check for dropped mouseleave events
        if (!d.hoverCheckInterval) {
          d.hoverCheckInterval = setInterval(() => {
            const nodeEl = gNode.node();
            if (!nodeEl || !document.body.contains(nodeEl) || !nodeEl.matches(':hover')) {
              clearInterval(d.hoverCheckInterval);
              d.hoverCheckInterval = null;
              d.leafHovered = false;
              updateLeafNodeHover(d);
            }
          }, 50);
        }
      } else {
        if (d.leafHoverTimeout) {
          clearTimeout(d.leafHoverTimeout);
          d.leafHoverTimeout = null;
        }

        if (d.hoverCheckInterval) {
          clearInterval(d.hoverCheckInterval);
          d.hoverCheckInterval = null;
        }

        d.isLeafExpanded = false;
        circleNode.attr('stroke-width', 1.0).attr('stroke', getColorForDepth(d.depth, d.data.isLeaf));

        const currentScale = d3.zoomTransform(svg.node()).k;
        gNode.interrupt('hover');
        labelNode.interrupt('hover');

        gNode.transition('hover').duration(200)
          .attr('transform', `translate(${d.x},${d.y}) scale(1)`);
        labelNode.transition('hover').duration(200).style('opacity', d.r * currentScale <= 25 ? 0 : 1);
      }
    }

    function updateOuterNodeHover(d) {
      if (d.data.isLeaf) return;
      const isHovered = d.circleHovered || d.labelHovered;
      const gNode = nodeElements.filter(nd => nd === d);
      const circleNode = gNode.select('circle');
      const foNode = g.selectAll('.node-label-fo').filter(ld => ld === d);
      const spanNode = foNode.select('span');

      const parentFontSize = Math.max(10, Math.min(28, d.r / 5.0));
      const foWidth = 2000;
      const foHeight = 200;

      if (isHovered) {
        circleNode.attr('stroke-width', 1.8);

        if (!d.isLabelExpanded && !d.labelHoverTimeout) {
          d.labelHoverTimeout = setTimeout(() => {
            d.isLabelExpanded = true;
            d.labelHoverTimeout = null;
            const currentScale = d3.zoomTransform(svg.node()).k;
            let targetScale = 1;
            if (parentFontSize * currentScale < 16) {
              targetScale = 16 / (parentFontSize * currentScale);
            }
            spanNode
              .style('transform', `scale(${targetScale})`)
              .style('max-width', 'none')
              .style('background-color', 'white')
              .style('padding', '0px 4px')
              .style('z-index', '10')
              .style('position', 'relative');
            foNode.style('opacity', 1);

            // Move to Absolute Top!
            if (foNode.node()) {
              g.node().appendChild(foNode.node());
              foNode.attr('x', d.x - foWidth / 2)
                .attr('y', d.y - (d.r) - parentFontSize / 2 - foHeight / 2);
            }
          }, 500);
        }

        // Safety check for dropped mouseleave events
        if (!d.labelCheckInterval) {
          d.labelCheckInterval = setInterval(() => {
            const circleEl = circleNode.node();
            const spanEl = spanNode.node();
            const isCircleHovered = circleEl && document.body.contains(circleEl) && circleEl.matches(':hover');
            const isSpanHovered = spanEl && document.body.contains(spanEl) && spanEl.matches(':hover');

            if (!isCircleHovered && !isSpanHovered) {
              clearInterval(d.labelCheckInterval);
              d.labelCheckInterval = null;
              d.circleHovered = false;
              d.labelHovered = false;
              updateOuterNodeHover(d);
            }
          }, 50);
        }
      } else {
        if (d.labelHoverTimeout) {
          clearTimeout(d.labelHoverTimeout);
          d.labelHoverTimeout = null;
        }

        if (d.labelCheckInterval) {
          clearInterval(d.labelCheckInterval);
          d.labelCheckInterval = null;
        }

        d.isLabelExpanded = false;
        circleNode.attr('stroke-width', 1.0);

        const maxWidth = d.r * 1.6;
        spanNode
          .style('transform', 'scale(1)')
          .style('max-width', `${maxWidth}px`)
          .style('background-color', 'var(--bg-color)')
          .style('color', getColorForDepth(d.depth, d.data.isLeaf))
          .style('box-shadow', 'none')
          .style('z-index', 'auto');

        // Restore placement to gNode
        if (foNode.node() && gNode.node() && foNode.node().parentNode !== gNode.node()) {
          gNode.node().appendChild(foNode.node());
          foNode.attr('x', -foWidth / 2)
            .attr('y', -(d.r) - parentFontSize / 2 - foHeight / 2);
        }

        const currentScale = d3.zoomTransform(svg.node()).k;
        const visualRadius = d.r * currentScale;
        foNode.style('opacity', visualRadius > 35 ? 1 : 0);
      }
    }

    // compute line wrapping and draw text bound to circle radius
    function drawCircleLabel(gNode, d, name, value, r, nameFontSize, valFontSize) {
      const width = r * 1.6;
      const words = name.split(/\s+/);
      const lines = [];
      let currentLine = [];

      const testText = gNode.append('text')
        .style('font-size', `${nameFontSize}px`)
        .style('visibility', 'hidden');
      const testTspan = testText.append('tspan');

      words.forEach(word => {
        currentLine.push(word);
        testTspan.text(currentLine.join(' '));
        if (testTspan.node().getComputedTextLength() > width) {
          if (currentLine.length > 1) {
            currentLine.pop();
            lines.push(currentLine.join(' '));
            currentLine = [word];
          } else {
            lines.push(currentLine.join(' '));
            currentLine = [];
          }
        }
      });
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
      }
      testText.remove();

      const totalLines = lines.length + 1;
      const lineHeight = 1.15;
      const startDy = -((totalLines - 1) * lineHeight) / 2;

      const textNode = gNode.append('text')
        .datum(d)
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('y', 0)
        .style('pointer-events', 'none')
        .style('transition', 'opacity 0.2s ease')
        .style('opacity', 0)

      lines.forEach((lineText, idx) => {
        textNode.append('tspan')
          .text(lineText)
          .attr('x', 0)
          .attr('dy', idx === 0 ? `${startDy}em` : `${lineHeight}em`)
          .style('fill', '#ffffff')
          .style('font-size', `${nameFontSize}px`)
          .style('font-weight', '500');
      });

      textNode.append('tspan')
        .text(`(${value})`)
        .attr('x', 0)
        .attr('dy', `${lineHeight}em`)
        .style('fill', 'rgba(255, 255, 255, 0.85)')
        .style('font-size', `${valFontSize}px`)
        .style('font-weight', '400');

      const bbox = textNode.node().getBBox();
      const margin = r * 1.6;
      if (bbox.width > margin || bbox.height > margin) {
        if (bbox.width > 0 && bbox.height > 0) {
          const scale = Math.min(margin / bbox.width, margin / bbox.height);
          textNode.attr('transform', `scale(${scale})`);
        }
      }
    }

    // iterate over every group to draw the final labels
    nodeElements.each(function (d) {
      const gNode = d3.select(this);

      if (d.data.isLeaf) {
        const nameFontSize = Math.max(9, Math.min(24, d.r / 5.0));
        const valFontSize = Math.max(8, Math.min(18, d.r / 6.0));
        drawCircleLabel(gNode, d, d.data.name, d.data.value, d.r, nameFontSize, valFontSize);
      } else {
        const parentFontSize = Math.max(10, Math.min(28, d.r / 5.0));

        const maxWidth = d.r * 1.6;
        const foWidth = 2000;
        const foHeight = 200;

        // html label for parent node
        const fo = gNode.append('foreignObject')
          .datum(d)
          .attr('class', 'node-label node-label-fo')
          .attr('x', -foWidth / 2)
          .attr('y', -(d.r) - parentFontSize / 2 - foHeight / 2)
          .attr('width', foWidth)
          .attr('height', foHeight)
          .style('pointer-events', 'none')
          .style('transition', 'opacity 0.2s ease')
          .style('opacity', 0)
          .style('overflow', 'visible');

        const div = fo.append('xhtml:div')
          .style('display', 'flex')
          .style('justify-content', 'center')
          .style('align-items', 'center')
          .style('width', '100%')
          .style('height', '100%');

        div.append('xhtml:span')
          .style('color', getColorForDepth(d.depth, d.data.isLeaf))
          .style('font-size', `${parentFontSize}px`)
          .style('font-weight', '600')
          .style('background-color', 'var(--bg-color)')
          .style('padding', '0px 2px')
          .style('border-radius', '6px')
          .style('white-space', 'nowrap')
          .style('overflow', 'hidden')
          .style('text-overflow', 'ellipsis')
          .style('max-width', `${maxWidth}px`)
          .style('box-sizing', 'border-box')
          .style('pointer-events', 'auto')
          .style('cursor', 'pointer')
          .style('transition', 'all 0.2s ease')
          .text(d.data.name)
          .on('mouseenter', function () {
            d.labelHovered = true;
            updateOuterNodeHover(d);
          })
          .on('mouseleave', function () {
            d.labelHovered = false;
            setTimeout(() => {
              if (!d.circleHovered && !d.labelHovered) updateOuterNodeHover(d);
            }, 20);
          });
      }
    });

    // center and scale the root cluster
    const fitScale = Math.min(
      (containerWidth - 40) / packSize,
      (height - 40) / packSize
    );

    // permit extreme scaling for isolated groups
    const initialK = Math.max(0.05, Math.min(3.0, fitScale * 1.15));
    const initialTransform = d3.zoomIdentity.translate(window.innerWidth - containerWidth / 2, height / 2).scale(initialK);

    // apply matrix transforms without animations
    svg.call(zoom.transform, initialTransform);

  }, [hierarchyData]);

  return <div ref={containerRef} className="viz-container" />;
};
