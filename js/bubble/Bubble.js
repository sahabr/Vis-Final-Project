import DensityChart from './Density.js';

export default function BubbleChart(container) {
  const margin = {
      top: 20,
      right: 10,
      bottom: 20,
      left: 10,
    },
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const rScale = d3.scaleLinear().range([5, 13]).clamp(true);
  const cScale = d3.scaleOrdinal(d3.schemeTableau10);
  const centerScale = d3.scalePoint().padding(1).range([0, width]);
  const forceStrength = 0.05;

  // append the svg object to the body of the page
  let svg = d3
    .select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const group = svg
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const drag = (simulation) => {
    function started(event) {
      if (!event.active) simulation.alpha(1).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function ended(event) {
      if (!event.active) simulation.alphaTarget(0.0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    return d3.drag().on('start', started).on('drag', dragged).on('end', ended);
  };

  let x = d3
    .scaleLinear()
    .domain([1, 4])
    .range([0, width - margin.left - margin.right])
    .clamp(true);

  let slidersvg = d3
    .select('#slider')
    .append('svg')
    .attr('width', width)
    .attr('height', 50);

  let slider = slidersvg
    .append('g')
    .attr('class', 'slider')
    .attr('transform', 'translate(' + margin.left + ',' + 15 + ')');

  slider
    .append('line')
    .attr('class', 'track')
    .attr('x1', x.range()[0])
    .attr('x2', x.range()[1]);

  slider
    .insert('g', '.track-overlay')
    .attr('class', 'ticks')
    .attr('transform', 'translate(0,' + 10 + ')')
    .selectAll('text')
    .data(x.ticks(4))
    .join('text')
    .attr('x', x)
    .attr('y', 10)
    .attr('text-anchor', 'middle')
    .text((d) => d);

  //dragging handle
  let handle = slider
    .insert('circle', '.track-overlay')
    .attr('class', 'handle');

  let playButton = d3.select('#play-button');
  let sliderStage = 1;

  function step() {
    sliderStage = (sliderStage % 4) + 1;
    handleMove(sliderStage);
  }

  function handleMove(h) {
    let round_h = Math.round(h);
    sliderStage = round_h;
    handle.transition().duration(200).attr('cx', x(round_h));
  }

  function showComments() {
    let comments = group
      .append('text')
      .attr('class', 'comments')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .html(
        'Many movies are streamed on Netflix. Click on the button to find out!'
      );
    comments.exit().remove();
  }

  function hideComments() {
    d3.select('.comments').remove();
  }

  showComments();

  function update(data) {
    let density = DensityChart('.density');

    //for color iterations
    data.forEach((d) => {
      let genre = d.Genres;

      if (
        genre == 'Action' ||
        genre == 'Adventure' ||
        genre == 'Sci-Fi' ||
        genre == 'Fantasy'
      ) {
        d.category = 'genre1';
      } else if (
        genre == 'Comedy' ||
        genre == 'Talk-Show' ||
        genre == 'Game-Show'
      ) {
        d.category = 'genre2';
      } else if (genre == 'Biography' || genre == 'Documentary') {
        d.category = 'genre3';
      } else if (
        genre == 'Horror' ||
        genre == 'Mystery' ||
        genre == 'Thriller' ||
        genre == 'Crime' ||
        genre == 'Film-Noir'
      ) {
        d.category = 'genre4';
      } else if (
        genre == 'Drama' ||
        // genre == 'Family' ||
        genre == 'Animation'
      ) {
        d.category = 'genre5';
      } else {
        d.category = 'genre6';
      }
      if (d.Netflix == 1) d.platform = 'Netflix';
      else if (d.Hulu == 1) d.platform = 'Hulu';
      else if (d.Prime_Video == 1) d.platform = 'Prime';
      else d.platform = 'Disney';
    });
    rScale.domain(d3.extent(data, (d) => d.IMDb));

    data.forEach(function (d) {
      d.x = width / 2;
      d.y = height / 2;
    });

    const simulation = d3
      .forceSimulation(data)
      .force('charge', d3.forceManyBody().strength(forceStrength))
      .force(
        'y',
        d3
          .forceY()
          .y(height / 2)
          .strength(forceStrength)
      )
      .force(
        'x',
        d3
          .forceX()
          .x(width / 2)
          .strength(forceStrength)
      )
      .force(
        'collision',
        d3
          .forceCollide()
          .radius(d3.max(data, (d) => d.IMDb))
          .iterations(25)
      );

    function showCircles() {
      let circles = group
        .selectAll('circle')
        .data(data)
        .join('circle')
        .attr('r', (d) => rScale(d.IMDb))
        .attr('cx', (d, i) => {
          return 175 + 25 * i + 2 * i ** 2;
        })
        .attr('cy', (d) => 250)
        .style('fill', (d, i) => {
          return cScale(d.category);
        })
        .style('pointer-events', 'all')
        .call(drag(simulation));

      circles
        .on('mouseover', function (event, d) {
          const pos = d3.pointer(event, window);

          //Update the tooltip position and value
          d3.select('#tooltip2')
            .style('left', pos[0] + 'px')
            .style('top', pos[1] + 'px')
            .select('#title')
            .text(d.Title);
          d3.select('#tooltip2')
            .style('left', pos[0] + 'px')
            .style('top', pos[1] + 'px')
            .select('#genre')
            .text(d.Genres);
          d3.select('#tooltip2')
            .style('left', pos[0] + 'px')
            .style('top', pos[1] + 'px')
            .select('#rating')
            .text(d.IMDb);
          // Show the tooltip
          d3.select('#tooltip2').classed('hidden', false);
        })
        .on('mouseout', function (d) {
          //Hide the tooltip
          d3.select('#tooltip2').classed('hidden', true);
        });

      circles.on('click', (event, d) => {
        density.update(data, d.category, cScale(d.category));
      });

      simulation.on('tick', () => {
        circles.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      });
    }

    function hideCircles() {
      group.selectAll('circle').remove();
    }

    function showTitles(stage, scale) {
      let titles = group.selectAll('.title').data(scale.domain());

      titles
        .enter()
        .append('text')
        .attr('class', 'title')
        .merge(titles)
        .attr('x', (d) => scale(d))
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('font-size', 12)
        .text((d) => {
          let genre_title;
          if (d === 'genre1') {
            return 'Action & Adventure';
          } else if (d === 'genre2') {
            return 'Comedy & Shows';
          } else if (d === 'genre3') {
            return 'Bio & Documentary';
          } else if (d === 'genre4') {
            return 'Horror & Crime';
          } else if (d === 'genre5') {
            return 'Drama & Animation';
          } else if (d === 'genre6') {
            return 'Others';
          }
        });
      titles.exit().remove();
    }

    function hideTitles() {
      group.selectAll('.title').remove();
    }

    function splitBubbles(stage) {
      if (stage === 1) {
        hideCircles();
        hideTitles();
        showComments();
      }
      if (stage === 2) {
        hideComments();
        showCircles();
        const platform_map = data.map((d) => d.platform);
        platform_map.sort();

        centerScale.domain(platform_map);
        showTitles(stage, centerScale);
        simulation.force(
          'x',
          d3
            .forceX()
            .strength(forceStrength)
            .x((d) => centerScale(d.platform))
        );
      } else if (stage === 3) {
        hideComments();
        showCircles();
        const category_map = data.map((d) => d.category);
        category_map.sort();

        centerScale.domain(category_map);
        showTitles(stage, centerScale);
        simulation.force(
          'x',
          d3
            .forceX()
            .strength(0.07)
            .x((d) => centerScale(d.category))
        );
      }

      // @v4 We can reset the alpha value and restart the simulation
      simulation.alpha(2).restart();
    }
    let heading = [
      '',
      'Movies on Netflix',
      'Genre Distribution',
      'Runtime Distribution',
    ];
    let description = [
      '',
      'These are top 500 movies streamed on Netflix. </br>The radius of a circle represents IMDb ratings of each movie. </br>The colors of circles represent various genres of streamed movies. </br>You can hover over to the circle to identify information of movies!',
      'These are top 5 genre groups streamed on Netflix. </br>Biography & Documentary genre group leads with high ratings. </br></br>',
      'Now click on the bubbles to find out runtime of each genre!</br></br></br>',
    ];

    function setupButtons() {
      playButton.on('click', function () {
        step();
        if (sliderStage === 1) {
          d3.select('#play-button').text('Next  ▶');
          density.removeBars();
        } else if (sliderStage === 4) {
          d3.select('#play-button').text('Restart  ↻');
        }
        let hTag = document.querySelector('#heading-1');
        hTag.innerHTML = heading[sliderStage - 1];
        let pTag = document.querySelector('#comment-1');
        pTag.innerHTML = description[sliderStage - 1];
        splitBubbles(sliderStage);
      });
    }

    setupButtons();
  }
  return {
    update,
  };
}
