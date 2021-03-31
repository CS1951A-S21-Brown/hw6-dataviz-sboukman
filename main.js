// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = 1000, graph_1_height = 500;
let graph_2_width = 1000, graph_2_height = 400;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

let data;
let curStartYear = 2014
let curEndYear = 2019
let allGroup = []
let count = 0


function setData(d){

	allGroup = []
	
	allGroup.push(d)

	updateScat()
}

let svg_bar = d3.select("#barplot")
	.append("svg")
	.attr("width", graph_1_width)
	.attr("height", graph_1_height)
	.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`);

svg_bar.append("text")
    .attr("transform",
        `translate(${(graph_1_width - margin.left - margin.right) / 2},
        ${(graph_1_height - margin.top - margin.bottom) + 40})`)
    .style("text-anchor", "middle")
    .text("Date");

svg_bar.append("text")
    .attr("transform",
        `translate(-80, ${(graph_2_height - margin.top - margin.bottom) / 2})`)
    .style("text-anchor", "middle")
    .text("Total Games");

svg_bar.append("text")
    .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${-20})`)
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .text("Total Games Per Year");

d3.csv("data/gamesPerYear.csv").then(function(d) {
	data = d;
	
	data = cleanData_bar(data)
	

	let x = d3.scaleBand()
		.domain(data.map(d => d.date))
		.range([0, graph_1_width - margin.left - margin.right])
		.padding(0.1);

	let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d["date"] }))
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), 5));
		

	svg_bar.append("g")
		.attr("transform", `translate(0, ${graph_1_height - margin.bottom - margin.top})`)
		.call(d3.axisBottom(x));

	let y = d3.scaleLinear()
		.range([graph_1_height - margin.top - margin.bottom, 0])
		.domain([0, d3.max(data, (d) => {return d.total_games;})]);
	
	svg_bar.append("g")
		.call(d3.axisLeft(y).tickSize(1).tickPadding(10));
		
	let bars = svg_bar.selectAll("rect").data(data);

	bars.enter()
		.append("rect")
		.merge(bars)
		.attr("x", (d) => {return x(d.date);})
		.attr("y", (d) => {return y(d.total_games)})
		.attr("fill", function(d) { return color(d['date']) })
		.attr("width", x.bandwidth())
		.attr("height", (d) => {return graph_1_height - margin.bottom - margin.top - y(d.total_games)});
});
//return graph_1_height - margin.bottom - margin.top  - y(d.total_games);


function cleanData_bar(data) {
	

	data.map((d) => {
		d["date"] = parseInt(d["date"].slice(0,4), 10)
	});
	

	data = data.filter((d) => { return d["date"] >= 2015});
	
	
	return data;
}


let svg_world = d3.select("#worldmap")
	.append("svg")
	.attr("width", graph_2_width)
	.attr("height", graph_2_height);
	//.attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.select("#mapTitle").append("text")
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .text("Top Winning Nations Over the Past 20 Years");


const projection = d3.geoRobinson().scale(130).translate([graph_2_width / 2, graph_2_height / 1.7]);
const path =d3.geoPath(projection);

const g = svg_world.append("g");

let tooltip = d3.select("#tooltip")
	.append("div")       
        .attr("class", "tooltip")
        .style("opacity", 0);


d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json")
	.then((data) => {
	
	const countries = topojson.feature(data, data.objects.countries);
	console.log(countries.features);
	
	d3.csv("data/winningRatio.csv").then(d => {

		winning_data = d

		g.selectAll("path").data(countries.features)
		.enter()
		.append("path")
		.attr("class", "country")
		.attr("d", path)
		.style('fill', d => {
			let countryName = d.properties.name;
			if(countryName === "United Kingdom"){
				countryName = "England"
			}
			let country = winning_data.find(item => {
				return item['country'] === countryName 
			});

			if(country == null){
				return "black"
			}else{
				
				let winning_perc = country["win_ratio"]
				if(winning_perc < 0.55){
					return "black";
				}else{
					return "blue";
				}
			}

			
			
		})
      		.style('stroke', 'white')
		.style('stroke-width', 0.1)
		.on('mouseover', (d => {
			tooltip.transition().style('visibility', 'visible').style("opacity", 1);
				
			let countryName = d.properties.name;
			if(countryName === "United Kingdom"){
				countryName = "England"
			}
			let country = winning_data.find(item => {
				return item['country'] === countryName 
			});
			
			if(country == null){
				tooltip.text("No data");
			}else{
				tooltip.text(country.country + " win rate " + (country.win_ratio * 100).toFixed(2) + "%").style("left", `300px`)
        .style("top", `${(d3.event.pageY)}px`);	
				
			}
			
		}))
		.on('mouseout', (d => {
			tooltip.transition().style('visibility', 'hidden');
		}));


	});
	

	


});






let svg_s = d3.select("#scatter")
	.append("svg")
	.attr("width", graph_2_width)
	.attr("height", graph_2_height)
	.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`);

svg_s.append("text")
    .attr("transform",
        `translate(${(graph_2_width - margin.left - margin.right) / 2},
        ${(graph_2_height - margin.top - margin.bottom) + 40})`)
    .style("text-anchor", "middle")
    .text("Date");

svg_s.append("text")
    .attr("transform",
        `translate(-80, ${(graph_2_height - margin.top - margin.bottom) / 2})`)
    .style("text-anchor", "middle")
    .text("Total Points");

let title_s = svg_s.append("text")
    .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${-20})`)
    .style("text-anchor", "middle")
    .style("font-size", 15);
    

function updateScat(){

	d3.selectAll("circle").remove();
	d3.selectAll("#hi").remove();
	d3.csv("data/totalPointsOverTime.csv").then(function(d){
	
	
	title_s.text(allGroup[0] + "'s" + " Points Over Past Two World Cups");
	data = cleanData_scatter(d);
	let dataReady = allGroup.map( function(grpName) {
		return {name: grpName,
			values: data.filter(function(d) {
			return grpName === d.country})
			.map(function(d) { return {time: d.date, value: +d.points}})}

		});
	
	let myColor = d3.scaleOrdinal()
      		.domain(allGroup)
      		.range(d3.schemeSet2);
	

	let x_ax = d3.scaleTime()
      		.range([0, graph_2_width - margin.left - margin.right])
		
    		
    	x_ax.domain([data[0].date, data[data.length - 1].date])
		.tickFormat(d3.timeFormat("%Y"));
	
	svg_s.append("g")
      		.attr("transform", `translate(0, ${graph_2_height - margin.top - margin.bottom})`)
      		.call(d3.axisBottom(x_ax));

  
    	let y_ax = d3.scaleLinear()
      		.range([graph_2_height - margin.top - margin.bottom, 0])
      		.domain([d3.min(data, function(d) {
        		return parseInt(d.points);
    		}), d3.max(data, function(d) {
        		return parseInt(d.points);
    		})]);
    	
	svg_s.append("g")
      		.call(d3.axisLeft(y_ax));

  
    	let line = d3.line()
      		.x(function(d) { return x_ax(d.time) })
      		.y(function(d) { return y_ax(+d.value) });
    	
	let lines = svg_s.selectAll("myLines")
      				.data(dataReady);
      		
	lines.enter()
      		.append("path")
		.attr("id", "hi")
        	.attr("d", function(d){ return line(d.values) } )
        	.attr("stroke", function(d){ return myColor(d.name) })
        	.style("stroke-width", 4)
        	.style("fill", "none")
		

    	let dots = svg_s.selectAll("myDots")
      				.data(dataReady)
				
      	dots.enter()
        	.append('g')
		.attr("class", "dots")
        	.style("fill", function(d){ return myColor(d.name) })
      	.selectAll("myPoints")
      	.data(function(d){ return d.values })
      	.enter()
	.merge(dots)
      	.append("circle")
	.transition()
        .delay(function(d, i) { return(i*3) })
        .duration(1000)
        .attr("cx", function(d) { return x_ax(d.time) } )
        .attr("cy", function(d) { return y_ax(d.value) } )
        .attr("r", 5)
        .attr("stroke", "white");
	
	dots.exit().remove();
	lines.exit().remove();
	


});



}

function cleanData_scatter(data) {
	

	data.map((d) => {d["date"] = Date.parse(d["date"])});

	
	return data;
	
}



setData("Iran")

    