import React, {Component} from 'react';
import * as d3 from "d3";
import * as data from './forestfires.csv';
import './BarChart.css';

class BarChart extends Component{
    componentDidMount() {
        this.drawChart();
      }

    drawChart() {


        var svg_width = 600, 
            svg_height = 400;

        var svg = d3.select("svg")
                    .attr("class", "svg")
                    .attr("width", svg_width)
                    .attr("height", svg_height);
        
        var fire_data = [];

        var rects, paths, bin_data;

        d3.csv(data, function(error, line){
            for(var i = 0; i < line.length; i++){
                fire_data[i] = {
                    month: line[i].month, 
                    day: line[i].day, 
                    FFMC: line[i].FFMC, 
                    DC: line[i].DC, 
                    ISI: line[i].ISI,
                    temp: line[i].temp,
                    RH: line[i].RH,
                    wind: line[i].wind,
                    rain: line[i].rain,
                    area: line[i].area
                }
            }
            
            var fire_max = {
                FFMC: d3.max(fire_data, function(d){return parseFloat(d.FFMC); }),
                DC: d3.max(fire_data, function(d){return parseFloat(d.DC); }),
                ISI: d3.max(fire_data, function(d){return parseFloat(d.ISI); }),
                temp: d3.max(fire_data, function(d){return parseFloat(d.temp); }),
                RH: d3.max(fire_data, function(d){return parseFloat(d.RH); }),
                wind: d3.max(fire_data, function(d){return parseFloat(d.wind); }),
                rain: d3.max(fire_data, function(d){return parseFloat(d.rain); }),
                area: d3.max(fire_data, function(d){return parseFloat(d.area); })
            }
            var fire_min = {
                FFMC: d3.min(fire_data, function(d){return parseFloat(d.FFMC); }),
                DC: d3.min(fire_data, function(d){return parseFloat(d.DC); }),
                ISI: d3.min(fire_data, function(d){return parseFloat(d.ISI); }),
                temp: d3.min(fire_data, function(d){return parseFloat(d.temp); }),
                RH: d3.min(fire_data, function(d){return parseFloat(d.RH); }),
                wind: d3.min(fire_data, function(d){return parseFloat(d.wind); }),
                rain: d3.min(fire_data, function(d){return parseFloat(d.rain); }),
                area: d3.min(fire_data, function(d){return parseFloat(d.area); })
            }

            var options = ["FFMC", "DC", "ISI", "temp", "RH", "wind", "rain", "area"];
            var drop_down_menu = d3.select("#DropDown");
            
            drop_down_menu.append("select")
                .attr("class","menu")
                .selectAll("option")
                .data(options)
                .enter()
                .append("option")
                .attr("value", function(d){
                    return d;
                })
                .text(function(d){
                    return d;
                })
            
            visualizeData("bar-chart", fire_data, 5, "RH");

            /*bin_display = svg.append('text')
                .text(bin_data.bin_num)             //TODO: check for function error
                .attr("x", 0.9 * svg_width)
                .attr("y", 0.1 * svg_height)
                .style("text-anchor", "middle")
                .attr("font-family", "ariel")
                .attr("font-size", "28px")
                .attr("border", "1px solid")
                .style("fill", "black");*/

            function visualizeData(chart_type, fire_data, bin_number, attribute){
                
                //Initiate operation clean slate before re-creating visualization
                //TODO: Ask Anagh about remove method
                
                //Add other garbage collection
                svg.selectAll("#bar_xAxis").remove();
                svg.selectAll("#bar_label").remove();
                svg.selectAll("#bar_chart").remove();
                svg.selectAll("#bar_range").remove();
                svg.selectAll("#bar_y_Axis").remove();
                svg.selectAll("#pie_label").remove();
                svg.selectAll("#pie_chart").remove();
                svg.selectAll("#axis").remove();
                
                bin_data = dynamic_bin_creation(chart_type, fire_data, bin_number, attribute);
                
                if(chart_type === "bar-chart"){
                    //console.log(bin_data)
                    buildBarChart(bin_data);
                }
                else if(chart_type === "pie-chart"){
                    //console.log(bin_data)
                    buildPieChart(bin_data);
                }
                else{
                    console.log("Error: App does not support this visualization.")
                }

            }

            function dynamic_bin_creation(chart_type, fire_data, bin_number, attribute){
                
                //Variables for specific attribute
                var index = 0, bin_data=[], bin_data_frequency=[];
                
                //Charting Variables
                var scale, lowerBound = [], upperBound = [], bin_width = 0;

                //Recalculate plotting data
                for (var i=0; i < bin_number; i++){
                    bin_data[i] = [];
                    bin_data_frequency[i] = 0;
                    lowerBound[i] = 0;
                    upperBound[i] = 0;
                }

                switch(attribute){
                    case "FFMC":
                        bin_width = Math.floor((fire_max.FFMC - fire_min.FFMC) / bin_number * 100) / 100;
                        lowerBound[0] = fire_min.FFMC;
                        upperBound[bin_number-1] = fire_max.FFMC;
                        
                        //Calculate the start-end ranges for all the values
                        for (var it = 1; it < bin_number; it++) {
                            lowerBound[it] = lowerBound[it-1] + bin_width;
                            upperBound[it-1] = lowerBound[it];
                        };

                        for (var iz = 0; iz < fire_data.length; iz++) {
                            index = Math.floor((fire_data[iz].FFMC - fire_min.FFMC) / bin_width);
                            
                            if(index === bin_number){
                                index--;
                            }
                            
                            bin_data[index].push(fire_data[iz].FFMC);
                            bin_data_frequency[index]++;
                        }
                        break;

                    case "RH":
                        bin_width = Math.floor((fire_max.RH - fire_min.RH) / bin_number * 100) / 100;
                        lowerBound[0] = fire_min.RH;
                        upperBound[bin_number-1] = fire_max.RH;
                        
                        //Calculate the start-end ranges for all the values
                        for (var iqt = 1; iqt < bin_number; iqt++) {
                            lowerBound[iqt] = lowerBound[iqt-1] + bin_width;
                            upperBound[iqt-1] = lowerBound[iqt];
                        };
                        
                        for (var itr = 0; itr < fire_data.length; itr++) {
                            index = Math.floor((fire_data[itr].RH - fire_min.RH) / bin_width);
                            
                            if(index === bin_number){
                                index--;
                            }
                            
                            bin_data[index].push(fire_data[itr].RH);
                            bin_data_frequency[index]++;
                        }
                        break;
                    default: break;
                }
                

                //Leaving coloring to random for now

                var color = [];
                var c_min=0; 
                var c_max=255;  
                for (i=0; i < bin_number; i++){
                    color[i] = [
                        Math.floor(Math.random() * (+c_max - +c_min)) + +c_min,
                        Math.floor(Math.random() * (+c_max - +c_min)) + +c_min,
                        Math.floor(Math.random() * (+c_max - +c_min)) + +c_min
                    ];
                }

                //Creating a scale

                scale = d3.scaleLinear()
                .domain([0, d3.max(bin_data_frequency)])
                .range([0, 0.75 * svg_height]);

                return {
                    set: bin_data, 
                    count: bin_data_frequency,
                    chart_mode: chart_type, 
                    bin_number: bin_number,
                    attribute: attribute,
                    color: color,
                    scale: scale,
                    lowerBound: lowerBound,
                    upperBound: upperBound
                };
            }


            //TODO: BAR WIDTH IS OFF
            function buildBarChart(bar_data){
                    // Create bars
                var bar_w = (svg_width - 100) / bar_data.bin_number;
                
                var bar_padding = bar_w * 0.3;
                
                //---------Just some print data-------------
                svg.append("text")
                    .attr("transform", "translate(100,0)")
                    .attr("id","top_text")
                    .attr("x", 200)
                    .attr("y", 25)
                    .attr("font-size", "20px")
                    .text("Number of forest fires by Month")
                //----------------------------

                
                rects = svg.selectAll("rect")
                    .data(bar_data.count)
                    .enter()
                    .append("rect")
                    .attr("class", "bar")
                    .attr("id", "bar_chart")
                    .attr("x", function(d, i){
                        return 46 + (i * bar_w * 1.019) + (bar_padding / 1.5);
                    })
                    .attr("y", function(d, i){
                        return 14.5 + 0.9 * svg_height - bar_data.scale(d);
                    })
                    .attr("height", function(d, i){
                        return bar_data.scale(d);
                    })
                    .attr("width", bar_w - bar_padding);
                
                
                //----------------------Building the Y-Scale--------------------------------
                    
                var yScale = d3.scaleLinear()
                        .domain([0, d3.max(bar_data.count)])
                        .range([0.9 * svg_height, 0.15 * svg_height]);
            
                svg.append("g")
                    .attr("id", "axis") //Another group element to have our y-axis grouped under one group element
                    .attr("transform","translate(30,15)")
                    .call(d3.axisLeft(yScale)
                    .tickFormat(function(d){ // Try with X Scaling too.
                        return  d;
                    })
                    .ticks(10)) //We have also specified the number of ticks we would like our y-axis to have using ticks(10).
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 42)
                    .attr("x", 15)
                    .attr("dy", "-5.1em")
                    .attr("text-anchor", "end")
                    .attr("stroke", "black")
                    .text("Number of Fires");
                //------------------------------------------------------------

                //-----------------Building the X-Scale-----------------------
                var plot_bounds = []

                for(i = 0; i < bar_data.upperBound.length; i++){
                    plot_bounds.push(Math.floor(bar_data.lowerBound[i]*10)/10 + 
                    " - " + Math.floor(bar_data.upperBound[i]*10)/10);
                }
                console.log(plot_bounds);
                var xScale = d3.scaleBand()
                    .domain(plot_bounds)
                    .range([0, svg_width-50])
                    .padding(0.4);

                svg.append("g")
                    .attr("id","axis") //Another group element to have our x-axis grouped under one group element
                    .attr("transform", "translate(30,375)") // We then use the transform attribute to shift our x-axis towards the bottom of the SVG.
                    .call(d3.axisBottom(xScale)) //We then insert x-axis on this group element using .call(d3.axisBottom(x)).
                    .append("text")
                    .attr("y", 23)
                    .attr("x", 550)
                    .attr("text-anchor", "end")
                    .attr("stroke", "black")
                    .text(bar_data.attribute);


                //------------------------------------------------------------------------

            
            // Functions to handle mouse events
            
            // Event 1: Click
            rects.on("click", function(d, i){
                svg.selectAll("#bar_label").remove();
                svg.selectAll("#bar_chart").remove();
                svg.selectAll("#axis").remove();
                //console.log(fire_data);
                //console.log(bin_data);
                //console.log(bar_data);
                visualizeData("pie-chart", fire_data, bar_data.bin_number, bar_data.attribute);
                //visualizeData(chart_type, fire_data, bin_number, attribute)
                //visualizeData("bar-chart", fire_data, 5, "RH");
            });
            
            // Event 2: Mouse over
            rects.on("mouseover", function(d, i){
                
                d3.select(this)
                	.transition()
                    .attr("x", 46 + (i * bar_w * 1.019) + (bar_padding / 1.5) - 4)
                    .attr("width", 8 + bar_w - bar_padding)
                    .attr("y", 14.5 + 0.9 * svg_height - bar_data.scale(d) - 7)
                    .attr("height", bar_data.scale(d) + 8);
                    // Add value above a bar
                
                svg.append("text")
                    .attr("id","bar_label")
                    .text(d)
                    .attr("x", 80 + (i * bar_w ) + (bar_padding / 1.5) )
                    .attr("y", 0)
                    .transition().duration(500)
                    .attr("x", 80 + (i * bar_w ) + (bar_padding / 1.5) )
                    .attr("y", 14.5 + 0.9 * svg_height - bar_data.scale(d) -25)
                    .style("text-anchor", "middle")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "16px")
                    .style("fill", "black")

            });
    
            // Event 3: Mouse out 
            rects.on("mouseout", function(d, i) { 
                d3.select(this)
               		.transition().duration(500)
                    .attr("x", 46 + (i * bar_w * 1.019) + (bar_padding / 1.5))
                    .attr("width", bar_w - bar_padding)
                    .attr("y", 14.5 + 0.9 * svg_height - bar_data.scale(d))
                    .attr("height", bar_data.scale(d));
            
                // Remove text label
                d3.selectAll("#bar_label")
                .transition()
                .duration(200)
                .attr("x", 46 + (i * bar_w * 1.019) + (bar_padding / 1.5))
                .attr("y", 0)
                .remove();
            });
        };


        function buildPieChart(pie_data){
                
            var pie_arc = d3.arc()
                .outerRadius(150)
                .innerRadius(75);
            
            var pie = d3.pie().sort(null);

            paths = svg.append("g")
                .attr("transform", "translate(190,175)")
                .selectAll("path")
                .data(pie(pie_data.count))
                .enter()
                .append("path")
                .attr("id","pie_chart")
                .attr("d", pie_arc)
                .style("fill", function(d, i) {
                    return "rgba(" + pie_data.color[i][0]  + ", " + pie_data.color[i][1] + ", " 
                        + pie_data.color[i][2] + ", 0.75)"
                });


            // Add mouse events
            // Event 1: On Click
            paths.on("click", function(d, i){
                svg.selectAll("#pie_label").remove();
                svg.selectAll("#pie_chart").remove();
                visualizeData("bar-chart", fire_data, pie_data.bin_number, pie_data.attribute);
            });
            
            // Event 2: Mouse over
            paths.on("mouseover", function(d, i){
                var new_pie_arc = d3.arc()
                .outerRadius(175)
                .innerRadius(100);
                d3.select(this)
                	.transition().duration(500)
                    .attr("d", new_pie_arc)
                    .style("fill", "rgba(" + pie_data.color[i][0] + ", " + pie_data.color[i][1] + ", " 
                        + pie_data.color[i][2] + ", 1)");

                svg.select("g")
                    .append("text")
                    .text(pie_data.count[i])
                    .attr("id","pie_label")
                    .style("text-anchor", "middle")
                    .attr("font-size", "20px")
                    .style("fill", "black");

                svg.select("g")
                    .append("text")
                    .text(pie_data.attribute + " : [" + pie_data.lowerBound[i] + " - " + pie_data.upperBound[i] + "]")
                    .attr("id","pie_label")
                    .style("text-anchor", "middle")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "16px")
                    .attr("y", 200)
                    .style("fill", "black");
            })


            //Event 3: Mouse Over
            paths.on("mouseout", function(d, i) { 
                d3.select(this)
                	.transition().duration(500)
                    .attr("d", pie_arc)
                    .style("fill", "rgba(" + pie_data.color[i][0] + ", " + pie_data.color[i][1] + ", " 
                        + pie_data.color[i][2] + ", 0.75)");
                // Remove text label
                d3.selectAll("#pie_label").remove();
                
            });
            }

            //Function to plot chosen attribute

            function plot(attribute){
                visualizeData(bin_data.chart_mode, fire_data, bin_data.bin_number, attribute);
            }

            //Function for the drop down menu

            drop_down_menu.on('change', function(){
                var selected_attribute = d3.select(this)
                    .select("select")
                    .property("value")

                plot(selected_attribute);
            });
        // Add events for buttons and slider bar
        //console.log(d3.selectAll(".slider_inside"));
        d3.selectAll(".slider_inside")
             .on("mouseover", function(d,i){
                 console.log(i);
                 visualizeData(bin_data.chart_mode, fire_data, i+1, bin_data.attribute);
             });
            }
        );                 
      }
      render(){
        return <div></div>
      }
}

export default BarChart;