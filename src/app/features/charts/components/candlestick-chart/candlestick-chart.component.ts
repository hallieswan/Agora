import { Component, Input } from '@angular/core';
import * as d3 from 'd3';

import { BaseChartComponent } from '../base-chart';
import { Gene } from '../../../../models';
import { HelperService } from '../../../../core/services';

@Component({
  selector: 'candlestick-chart',
  templateUrl: './candlestick-chart.component.html',
  styleUrls: ['./candlestick-chart.component.scss'],
})
export class CandlestickChartComponent extends BaseChartComponent {
  _gene: Gene = {} as Gene;
  get gene(): Gene {
    return this._gene;
  }
  @Input() set gene(gene: Gene) {
    this._gene = gene;
    this.init();
  }

  @Input() xAxisLabel = '';

  override name = 'candlestick-chart';
  chartData: any[] = [];
  maxValue = 2.0;
  minValue = 0.0;
  chartHeight = 500;

  constructor(private helperService: HelperService) {
    super();
  }

  override init() {
    if (
      !this._gene.neuropathologic_correlations?.length ||
      !this.chartContainer.nativeElement
    ) {
      return;
    }

    this.initData();
    this.initChart();
    this.addXAxisTooltips();

    this.isInitialized = true;
  }

  initData() {
    const neuropathCorrelations =
      this._gene.neuropathologic_correlations?.filter(
        (item: any) => item.neuropath_type !== 'DCFDX'
      ) || [];

    neuropathCorrelations.sort((a: any, b: any) =>
      a.neuropath_type > b.neuropath_type ? 1 : -1
    );

    this.chartData = neuropathCorrelations.map((item: any) => {
      const data = {
        key: item.neuropath_type,
        ensg: item.ensg,
        value: {
          min: item.ci_lower,
          max: item.ci_upper,
          mean: item.oddsratio,
          pval_adj: item.pval_adj,
        },
      };
      return data;
    });
  }

  initChart() {
    const self = this;
    const chartContainerEl = this.chartContainer.nativeElement;
    const chartContainer = d3.select(chartContainerEl);
    const margin = { top: 100, right: 0, bottom: 10, left: 80 };
    const width = chartContainerEl.offsetWidth - margin.left - margin.right;
    const height = this.chartHeight - margin.top - margin.bottom;
    const color = '#5171C0';
    const tooltip = this.getTooltip(
      'value',
      'chart-value-tooltip candlestick-chart-value-tooltip'
    );

    const svg = chartContainer
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    this.chart = svg;

    const group = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 10)`);

    // Draw X axis
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(
        this.chartData.map((item) => {
          return item.key;
        })
      )
      .paddingInner(1)
      .paddingOuter(0.5);

    group
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('class', 'axis x')
      .call(d3.axisBottom(x));

    // Draw Y axis
    const y = d3
      .scaleLinear()
      .domain([this.minValue, this.maxValue])
      .range([height, 0]);

    group.append('g').attr('class', 'axis y-axis').call(d3.axisLeft(y));

    // Draw Y axis title
    group
      .append('text')
      .attr('class', 'y-axis-label y-label')
      .attr(
        'transform',
        `rotate(-90) translate(${-height / 2}, ${-margin.left + 20})`
      )
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text('ODDS RATIO');

    // Draw vertical lines
    group
      .selectAll('.vertLines')
      .data(this.chartData)
      .enter()
      .append('line')
      .attr('class', 'vertLines')
      .attr('x1', (d: any): any => x(d.key))
      .attr('x2', (d: any): any => x(d.key))
      .attr('y1', (d: any) => y(d.value.min))
      .attr('y2', (d: any) => y(d.value.max))
      .attr('stroke', color)
      .attr('stroke-width', 1.5);

    // Draw mid circle (mean value)
    const circle = group
      .selectAll('.meanCircle')
      .data(this.chartData)
      .enter()
      .append('circle')
      .attr('class', 'meanCircle')
      .attr('cx', (d: any): any => x(d.key))
      .attr('cy', (d: any) => y(d.value.mean))
      .attr('r', 9)
      .attr('stroke', color)
      .style('fill', color);

    //Circle tooltip
    circle
      .on('mouseover', function (event: any, d: any) {
        const isOrNot = d.value.pval_adj <= 0.05 ? 'is' : 'is not';
        const text = `${
          self._gene.hgnc_symbol || self._gene.ensembl_gene_id
        } ${isOrNot} significantly correlated with ${
          d.key
        }, with an odds ratio of ${
          d.value.mean
        } and an adjusted p-value of ${self.helperService.getSignificantFigures(
          d.value.pval_adj,
          3
        )}.`;
        const offset = self.helperService.getOffset(this);

        tooltip
          .text(text)
          .style('left', (offset?.left || 0) + 'px')
          .style('top', (offset?.top || 0) + 40 + 'px');

        self.showTooltip('value');
      })
      .on('mouseout', function () {
        self.hideTooltip('value');
      });

    // Add red horizontal line
    group
      .append('g')
      .attr('transform', `translate(0,${y(1.0)})`)
      .append('line')
      .attr('class', 'yAxisGuide')
      .attr('x2', width)
      .style('stroke', 'red')
      .style('stroke-width', '1px');
  }
}
