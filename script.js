import PieChart from './PieChart.js';

d3.csv('MoviesOnStreamingPlatforms_updated.csv', d3.autoType).then((data) => {
  let type = 'all';
  let platform ='All';
  d3.select('#group-by').on('change', (e) => {
    type = e.target.value;
    pieChart.update(data, type,platform);
  });
  d3.select('#platform').on('click', (e) => {
    platform = e.target.value;
    pieChart.update(data, type,platform);
  });

  const pieChart = PieChart('#pie-chart-container');
  pieChart.update(data, type,platform);
});