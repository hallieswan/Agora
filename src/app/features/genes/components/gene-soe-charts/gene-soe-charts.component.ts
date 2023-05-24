import { Component, Input, OnInit } from '@angular/core';

import {
  Distribution,
  Gene,
  OverallScores,
  OverallScoresDistribution,
} from '../../../../models';
import { GeneService } from '../../services';

export interface SOEChartProps {
  title: string;
  distributionData: OverallScoresDistribution;
  geneScore: number;
  wikiInfo: {
    ownerId: string;
    wikiId: string;
  };
}

@Component({
  selector: 'gene-soe-charts',
  templateUrl: './gene-soe-charts.component.html',
  styleUrls: ['./gene-soe-charts.component.scss']
})
export class GeneSoeChartsComponent implements OnInit {
  _gene: Gene | undefined;
  get gene(): Gene | undefined {
    return this._gene;
  }
  @Input() set gene(gene: Gene | undefined) {
    this._gene = gene;
    this.init();
  }

  @Input() wikiId = '';

  primaryBarColor = '#8B8AD1';
  alternateBarColor = '#42C7BB';

  scoreDistributions: OverallScoresDistribution[] = [];

  constructor(private geneService: GeneService) {}

  ngOnInit() {}

  customSortDistributions(distributions: OverallScoresDistribution[]) {
    // sort the distributions such that the order is: Target Risk Score, Genetic Risk Score, Multi-omic Risk Score
    // this should match the default column order on the GCT page
    distributions.sort((a: OverallScoresDistribution, b: OverallScoresDistribution) => {
      if (a.name === 'Target Risk Score') {
        return -1;
      } else if (b.name === 'Target Risk Score') {
        return 1;
      } else if (a.name === 'Genetic Risk Score') {
        return -1;
      } else if (b.name === 'Genetic Risk Score') {
        return 1;
      } else if (a.name === 'Multi-omic Risk Score') {
        return -1;
      } else if (b.name === 'Multi-omic Risk Score') {
        return 1;
      } else {
        return a.name.localeCompare(b.name);  // if there are more scores columns in the future, default to alphabetical
      }
    });
  }

  init() {
    this.geneService.getDistribution().subscribe((data: Distribution) => {
      this.scoreDistributions = data.overall_scores;
      this.customSortDistributions(this.scoreDistributions);
      // remove literature score
      this.scoreDistributions = this.scoreDistributions.filter((item: any) => (item.name !== 'Literature Score'));
    });
  }

  getBarColor(chartName: string | undefined) {
    if (!chartName)
      return this.primaryBarColor;
    if (chartName === 'Target Risk Score') {
      return this.alternateBarColor;
    }
    return this.primaryBarColor;
  }

  getGeneOverallScores(name: string) {
    const scores: OverallScores =
      this._gene?.overall_scores || ({} as OverallScores);

    if ('Genetic Risk Score' === name) {
      return scores['genetics_score'];
    } else if ('Multi-omic Risk Score' === name) {
      return scores['multi_omics_score'];
    } else if ('Literature Score' === name) {
      return scores['literature_score'];
    } else if ('Target Risk Score' === name) {
      return scores['target_risk_score'];
    }

    return 0;
  }
}
