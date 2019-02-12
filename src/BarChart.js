import React, {Component} from 'react';
import * as d3 from "d3";
import * as data from './forestfires.csv';

class BarChart extends Component{
    componentDidMount() {
        this.drawChart();
      }

    drawChart() {

        var svg = d3.select("svg"),
            margin = 200,
            width = 800 - margin,
            height = 500 - margin;

        var month_map = {
            "jan":0,
            "feb":0,
            "mar":0,
            "apr":0,
            "may":0,
            "jun":0,
            "jul":0,
            "aug":0,
            "sep":0,
            "oct":0,
            "nov":0,
            "dec":0
        };
        var data_x = [];
        var data_y = [];

        svg.append("text")
            .attr("transform", "translate(100,0)")
            .attr("x", 200)
            .attr("y", 50)
            .attr("font-size", "20px")
            .text("Number of fires by Month")

        var xScale = d3.scaleBand().range([0, width]).padding(0.4);

        var yScale = d3.scaleLinear().range([height, 0]);

        var g = svg.append("g")
                    .attr("transform", "translate(" + 100 + "," + 100 + ")");

        //var mydata = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        console.log(data_y);
        d3.csv(data, function(error, line){
            for(var i = 0; i < line.length; i++){
                if(!month_map[line[i].month]){
                    month_map[line[i].month] = 1;
                }
                else{
                    month_map[line[i].month]++;
                }
            }
            Object.keys(month_map).forEach(function(key) {
                data_x.push(key);
                data_y.push(month_map[key]);
              });
            
            xScale.domain(data_x);
            yScale.domain([0,d3.max(data_y)]);

            g.append("g") //Another group element to have our x-axis grouped under one group element
                .attr("transform", "translate(0," + height + ")") // We then use the transform attribute to shift our x-axis towards the bottom of the SVG.
                .call(d3.axisBottom(xScale)) //We then insert x-axis on this group element using .call(d3.axisBottom(x)).
                .append("text")
                .attr("y", height - 250)
                .attr("x", width - 100)
                .attr("text-anchor", "end")
                .attr("stroke", "black")
                .text("Months");
            
            g.append("g") //Another group element to have our y-axis grouped under one group element
                .call(d3.axisLeft(yScale)
                .tickFormat(function(d){ // Try with X Scaling too.
                    return  d;
                })
                .ticks(10)) //We have also specified the number of ticks we would like our y-axis to have using ticks(10).
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 10)
                .attr("dy", "-5.1em")
                .attr("text-anchor", "end")
                .attr("stroke", "black")
                .text("Number of Fires");

               g.selectAll(".bar") //created dynamic bars with our data using the SVG rectangle element.
                .data(data_y)
                .enter().append("rect")
                .attr("class", "bar") // try to comment this and see the changes
                .attr("x", (d,i) => i * 50)  //x scale created earlier and pass the year value from our data.
                .attr("y", (d,i) => height - d*1.6) // pass the data value to our y scale and receive the corresponding y value from the y range.
                .attr("width", xScale.bandwidth()) //width of our bars would be determined by the scaleBand() function.
                .attr("height", (d, i) => d*1.6) //height of the bar would be calculated as height - yScale(d.value)
                .style("fill","orange");
                //the height of the SVG minus the corresponding y-value of the bar from the y-scale*/
    
        });                 
      }
      render(){
        return <div></div>
      }
}

export default BarChart;