import PieChart from './PieChart.js';

d3.csv('final_pj_dataset/MoviesOnStreamingPlatforms_updated.csv', d3.autoType).then(data=>{

    let type = 'all';
    d3.select('#group-by')
      .on('change', e => {
        type = e.target.value;
        pieChart.update(data, type);
      });
    console.log(data);
    const pieChart = PieChart(".pie"); 
    pieChart.update(data,type);
})