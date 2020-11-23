export default function PieChart(container){
    // initialization
    var margin = {top: 0, right: 10, bottom: 100, left: 60},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate('+width/2+','+height/2+')')

    function update(data,type){
        console.log(type);

        var genres = [];

        var doNothing=0;
        for (var i=0;i<data.length;i++){
            //console.log(data[i].Age);
            if (data[i].Age===type){
                if (data[i].Genres==null){
                    doNothing++;
                }
                else{
                    var temp =data[i].Genres.split(',');
                    for(var j=0;j<temp.length;j++){
                        genres.push(temp[j]);
                    }
                }
            }
        }
        //console.log(genres);
        
        const select ={};
        genres.forEach((el) => {
            if (select[el]){
                select[el]++;
            }
            else{
                select[el]=1;
            }
        });
        //console.log(select);


        var data1 = [];
        var total=0;
        for (var key in select) {
            data1.push({
                name: key,
                value: select[key]
            })
            total=total+select[key];
        };
        //console.log(total);
        
    

        
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(150)

        var pie = d3.pie().value(function(d) {
            return d.value;
          });
        //console.log(pie(data1));
        
        const color = d3.scaleOrdinal()
            .domain(data1)
            .range(['#D35231', '#C38231','#E6FF80', '#1AFF33', '#999933',
            '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
            '#E64D66', '#4DB380', '#FF4D4D', '#98E6E6', '#6666FF']);
        
        let piechart = svg.datum(data1).selectAll('path')
            .data(pie);
        piechart
            .enter()
            .append('path')
            .merge(piechart)
            .on("mouseenter", (event,d) =>{
                console.log(d);

                const pos = d3.pointer(event, window);
                d3.select('.tooltip')
                  .style('display', 'inline-block')
                  .style('top', pos[1] + 'px')
                  .style('left', pos[0] + 'px')
                  .html(
                    'Genre: '+ d + '<br' + 'Number of movies: '+ d[0]
                  );
             })
            .on("mouseleave", (event, d) => {
                d3.select(".tooltip").classed("hidden", true);
            })
            .transition()
            .style("fill", function(d, i) {
                return color(i);
              })
            .attr('d',arc);

        piechart.exit().remove();
        

            //.each(function(d) { this._current = d; }); // store the initial angles

    };
    return {
        update
	};    

}