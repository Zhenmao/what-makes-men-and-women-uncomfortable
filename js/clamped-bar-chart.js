class ClampedBarChart {
  constructor({
    el,
    data,
    groupKeyAccessor,
    groupValuesAccessor,
    keyAccessor,
    xDomain,
    xAccessor,
    xTickFormat,
    xValueFormat,
  }) {
    this.el = el;
    this.data = data;
    this.groupKeyAccessor = groupKeyAccessor;
    this.groupValuesAccessor = groupValuesAccessor;
    this.keyAccessor = keyAccessor;
    this.xDomain = xDomain;
    this.xAccessor = xAccessor;
    this.xTickFormat = xTickFormat;
    this.xValueFormat = xValueFormat;
    this.init();
  }

  init() {
    this.fillHeight = 24;
    this.marginTop = 2;
    this.marginRight = this.fillHeight / 2 + 2;
    this.marginBottom = this.marginTop;
    this.marginLeft = this.marginRight;
    this.height = this.fillHeight + this.marginTop + this.marginBottom;

    this.x = d3.scaleLinear().domain(this.xDomain);

    this.container = d3.select(this.el).classed("clamped-bar-chart", true);
    this.group = this.container
      .selectAll(".group")
      .data(this.data, this.groupKeyAccessor)
      .join("div")
      .attr("class", "group");
    this.group
      .append("div")
      .attr("class", "group-title")
      .text(this.groupKeyAccessor);
    this.chart = this.group
      .append("div")
      .attr("class", "group-body")
      .selectAll(".chart")
      .data(this.groupValuesAccessor, this.keyAccessor)
      .join("div")
      .attr("class", "chart");
    this.svg = this.chart.append("svg");
    this.tooltip = this.chart.append("div").attr("class", "tooltip");
    this.tooltip.append("div").attr("class", "tooltip-arrow");
    this.tooltip.append("div").attr("class", "tooltip-body");

    this.resizeObserver = new ResizeObserver((entries) =>
      entries.forEach((entry) => this.resized(entry.contentRect))
    );
    this.resizeObserver.observe(this.chart.node());
  }

  resized({ width }) {
    if (!width || this.width === Math.floor(width)) return;

    this.width = Math.floor(width);

    this.x.range([this.marginLeft, this.width - this.marginRight]);

    this.svg.attr("viewBox", [0, -this.height / 2, this.width, this.height]);

    this.render();
  }

  render() {
    this.svg
      .selectAll(".track-line")
      .data((d) => [d])
      .join((enter) =>
        enter
          .append("line")
          .attr("class", "track-line")
          .attr("stroke-width", this.height)
          .attr("x1", this.marginLeft)
      )
      .attr("x2", this.width - this.marginRight);

    this.svg
      .selectAll(".fill-line")
      .data((d) => [d])
      .join((enter) =>
        enter
          .append("line")
          .attr("class", (d) => `fill-line ${this.keyAccessor(d)}`)
          .attr("stroke-width", this.fillHeight)
          .attr("x1", this.marginLeft)
          .attr("x2", this.marginLeft)
      )
      .transition()
      .duration(1000)
      .delay(500)
      .attr("x2", (d) => this.x(this.xAccessor(d)));

    this.svg
      .selectAll(".ticks-g")
      .data([0])
      .join((enter) => enter.append("g").attr("class", "ticks-g"))
      .selectAll(".tick-text")
      .data(this.x.ticks(10))
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "tick-text")
          .attr("dy", "0.35em")
          .text(this.xTickFormat)
          .attr("text-anchor", (d, i, n) => {
            if (i === 0) return "start";
            if (i === n.length - 1) return "end";
            return "middle";
          })
          .attr("dx", (d, i, n) => {
            if (i === 0) return -this.marginLeft + 8;
            if (i === n.length - 1) return this.marginRight - 8;
          })
      )
      .attr("x", this.x);

    this.tooltip.each((d, i, n) => {
      const tooltip = d3
        .select(n[i])
        .attr("class", `tooltip ${this.keyAccessor(d)}`);

      tooltip
        .select(".tooltip-body")
        .text(`${this.xValueFormat(this.xAccessor(d))}`);

      const tooltipArrow = tooltip.select(".tooltip-arrow");

      const { width: tooltipWidth, height: tooltipHeight } = tooltip
        .node()
        .getBoundingClientRect();

      const tooltipX = this.x(this.xAccessor(d)) - tooltipWidth / 2;
      let tooltipXOffset = 0;
      if (tooltipX < 0) {
        tooltipXOffset = -tooltipX;
      } else if (tooltipX + tooltipWidth > this.width) {
        tooltipXOffset + this.width - (tooltipX + tooltipWidth);
      }

      tooltip.style(
        "transform",
        `translate(${tooltipX + tooltipXOffset}px,${-tooltipHeight - 8}px)`
      );

      tooltipArrow.style("left", `${tooltipWidth / 2 - tooltipXOffset}px`);
    });
  }
}
