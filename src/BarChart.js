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

        var information = {
            FFMC:"The Fine Fuel Moisture Code (FFMC) is a numeric rating of the moisture content of litter and other cured fine fuels.",
            DC:"This is the Drought code that signifies long term effect of moisture on the environment.",
            ISI:"The ISI is a measure of the head fire indicator and rate of fire spread. The higher ISI index indicates higher difficulty of control in grassland.",
            temp:"This is the temperature recorded just before the fires were reported. The temperature is in degrees celsius.",
            RH:"The moisture content of fine dead fuel such as pine needles and dried grasses responds rapidly to changes in relative humidity.",
            wind:"The winds give an idea of the extent of spread of fire. The speeds are in Kilometer per hour.",
            rain:"Forest fires caused due to lightning are usually followed by rain making them harder to detect.",
            area:"The burned area of the forest. This is a highly skewed metric indicating that majority of fires were small.",
        }

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

            var options = ["FFMC", "DC", "ISI", "temp", "RH", "wind", "rain", "area"];
            var drop_down_menu = d3.select("#DropDown");
            
            drop_down_menu.append("select")
                .attr("class","menu")
                .selectAll("option")
                .data(options)
                .enter()
                .append("option")
                .attr("value", function(d){
                    return d;})
                .text(function(d){
                    return d;})
            
            //Create lower and higher bounds for the ranges of the attributes to display
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

            var pass_data = {
                type: "bar-chart",
                data: fire_data,
                divisions: 5,
                attr: "FFMC"
            }
            visualizeData(pass_data);

            function visualizeData(pass_data){
                var chart_type = pass_data.type, fire_data = pass_data.data;
                var bin_number = pass_data.divisions, attribute = pass_data.attr;
                //Initiate operation clean slate before re-creating visualization
                //TODO: Ask Anagh about remove method
                
                //Add other garbage collection
                cleanSlate();

                bin_data = dynamic_bin_creation(chart_type, fire_data, bin_number, attribute);
                
                if(chart_type === "bar-chart"){
                    //console.log(bin_data)
                    constructBars(bin_data);
                }
                if(chart_type === "pie-chart"){
                    //console.log(bin_data)
                    constructPies(bin_data);
                }
            }

            function dynamic_bin_creation(chart_type, fire_data, bin_number, attribute){
                
                //Variables for specific attribute
                var index = 0, bin_data=[], bin_data_frequency=[];
                
                //Charting Variables
                var scale, low_index = [], high_index = [], bin_width = 0;

                var info = information[attribute];

                //Recalculate plotting data
                for (var i=0; i < bin_number; i++){
                    bin_data[i] = [];
                    bin_data_frequency[i] = 0;
                    low_index[i] = 0;
                    high_index[i] = 0;
                }

                bin_width = Math.floor((fire_max[attribute] - fire_min[attribute]) / bin_number * 100) / 100;
                low_index[0] = fire_min[attribute];
                high_index[bin_number-1] = fire_max[attribute];
                var j = "RH"
                console.log(fire_min[j]);
                console.log(fire_min.RH);
                //Calculate the start-end ranges for all the values
                for (var it = 1; it < bin_number; it++) {
                    low_index[it] = low_index[it-1] + bin_width;
                    high_index[it-1] = low_index[it];
                };

                for (var iz = 0; iz < fire_data.length; iz++) {
                    index = Math.floor((fire_data[iz][attribute] - fire_min[attribute]) / bin_width);
                    
                    if(index === bin_number){
                        index--;
                    }
                    
                    bin_data[index].push(fire_data[iz][attribute]);
                    bin_data_frequency[index]++;
                }     
                scale = d3.scaleLinear()
                .domain([0, d3.max(bin_data_frequency)])
                .range([0, 0.75 * svg_height]);
                   

                //Leaving coloring to random for now
                //This is only for the pie chart to differentiate between the
                //different arcs
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

                return {
                    count: bin_data_frequency,
                    low_index: low_index,
                    high_index: high_index,
                    chart_mode: chart_type, 
                    bin_number: bin_number,
                    attribute: attribute,
                    color: color,
                    scale: scale,
                    info: info
                };
            }


            //TODO: BAR WIDTH IS OFF
            function constructBars(bar_data){
                    // Create bars
                var width_bar = (svg_width - 100) / bar_data.bin_number;
                
                var bar_offset = width_bar * 0.3;
                
                //---------Just some print data-------------
                svg.append("text")
                    .attr("transform", "translate(100,0)")
                    .attr("id","top_text")
                    .attr("x", 190)
                    .attr("class", "axis")
                    .attr("y", 25)
                    .attr("font-size", "20px")
                    .text("Number of forest fires by attribute")
                //----------------------------

                d3.select("body")
                    .append("text")
                    .attr("class","info")
                    .text(bar_data.info)

                rects = svg.selectAll("rect")
                    .data(bar_data.count)
                    .enter()
                    .append("rect")
                    .attr("class", "bar")
                    .attr("id", "bar_chart")
                    .attr("x", function(d, i){
                        return 46 + (i * width_bar * 1.019) + (bar_offset / 1.5);})
                    .attr("y", function(d, i){
                        return 14.5 + 0.9 * svg_height - bar_data.scale(d);})
                    .attr("height", function(d, i){
                        return bar_data.scale(d);})
                    .attr("width", width_bar - bar_offset);
                
                
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

                for(i = 0; i < bar_data.high_index.length; i++){
                    plot_bounds.push(Math.floor(bar_data.low_index[i]*10)/10 + 
                    " - " + Math.floor(bar_data.high_index[i]*10)/10);
                }
                //console.log(plot_bounds);
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
            
            // on click
            rects.on("click", function(d, i){
                svg.selectAll("#bar_label").remove();
                svg.selectAll("#bar_chart").remove();
                svg.selectAll("#axis").remove();
                svg.selectAll("info").remove();

                //Change pass data to visualize function
                pass_data = {
                    type: "pie-chart",
                    data: fire_data,
                    divisions: bar_data.bin_number,
                    attr: bar_data.attribute
                }

                visualizeData(pass_data);
            });
            
            //Mouse over
            rects.on("mouseover", function(d, i){
                
                d3.select(this)
                	.transition()
                    .attr("x", 46 + (i * width_bar * 1.019) + (bar_offset / 1.5) - 4)
                    .attr("width", 8 + width_bar - bar_offset)
                    .attr("y", 14.5 + 0.9 * svg_height - bar_data.scale(d) - 7)
                    .attr("height", bar_data.scale(d) + 8);
                    
                svg.append("text")
                    .attr("id","bar_label")
                    .text(d)
                    .attr("x", 80 + (i * width_bar ) + (bar_offset / 1.5) )
                    .attr("y", 0)
                    .transition().duration(500)
                    .attr("x", 80 + (i * width_bar ) + (bar_offset / 1.5) )
                    .attr("y", 14.5 + 0.9 * svg_height - bar_data.scale(d) -25)
                    .style("text-anchor", "middle")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "16px")
                    .style("fill", "black")

            });
    
            //Mouse Out
            rects.on("mouseout", function(d, i) { 
                d3.select(this)
               		.transition().duration(500)
                    .attr("x", 46 + (i * width_bar * 1.019) + (bar_offset / 1.5))
                    .attr("width", width_bar - bar_offset)
                    .attr("y", 14.5 + 0.9 * svg_height - bar_data.scale(d))
                    .attr("height", bar_data.scale(d));
            
                // Remove text label
                d3.selectAll("#bar_label")
                .transition()
                .duration(200)
                .attr("x", 46 + (i * width_bar * 1.019) + (bar_offset / 1.5))
                .attr("y", 0)
                .remove();
            });
        };


        function constructPies(pie_data){
                
            var pie_arc = d3.arc()
                .outerRadius(150)
                .innerRadius(75);
            
            var pie = d3.pie().sort(null);

            
            d3.select("body")
                .append("text")
                .attr("class","info")
                .text(pie_data.info)
                
            svg.append("text")
                    .attr("transform", "translate(100,0)")
                    .attr("id","top_text")
                    .attr("x", 190)
                    .attr("id","pie_chart")
                    .attr("y", 25)
                    .attr("font-size", "20px")
                    .text("Number of forest fires by attribute")


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


            // Mouse behavior
            // On Click
            paths.on("click", function(d, i){
                svg.selectAll("#pie_label").remove();
                svg.selectAll("#pie_chart").remove();
                svg.selectAll("info").remove();
                pass_data = {
                    type: "bar-chart",
                    data: fire_data,
                    divisions: pie_data.bin_number,
                    attr: pie_data.attribute
                }
                visualizeData(pass_data);
            });
            
            // On mouse over
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
                    .text(pie_data.attribute + " : [" + Math.floor(pie_data.low_index[i]*10)/10 + 
                                            " - " + Math.floor(pie_data.high_index[i]*10)/10 + "]")
                    .attr("id","pie_label")
                    .style("text-anchor", "middle")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "16px")
                    .attr("y", 200)
                    .style("fill", "black");
            })


            //Mouse Over
            paths.on("mouseout", function(d, i) { 
                d3.select(this)
                	.transition().duration(500)
                    .attr("d", pie_arc)
                    .style("fill", "rgba(" + pie_data.color[i][0] + ", " + pie_data.color[i][1] + ", " 
                        + pie_data.color[i][2] + ", 0.75)");
                
                d3.selectAll("#pie_label").remove();
                
            });
            }

            //Function to plot chosen attribute

            function plot(attribute){
                pass_data = {
                    type: bin_data.chart_mode,
                    data: fire_data,
                    divisions: bin_data.bin_number,
                    attr: attribute
                }
                visualizeData(pass_data);
            }

            //Function for the drop down menu

            drop_down_menu.on('change', function(){
                var selected_attribute = d3.select(this)
                    .select("select")
                    .property("value")

                plot(selected_attribute);
            });

        // Mouse over handler for bin size mod
        // Group the bins together
        // iterate through them and recall visualizeData function always
        d3.selectAll(".touch_controller")
             .on("mouseover", function(d,i){
                 console.log(i);
                 pass_data = {
                    type: bin_data.chart_mode,
                    data: fire_data,
                    divisions: i+1,
                    attr: bin_data.attribute
                }
                 visualizeData(pass_data);
             });
        
        //Call this function while building a new canvas
        //Remove everything on the screen
        function cleanSlate(){

                svg.selectAll("info").remove();
                svg.selectAll("#bar_label").remove();
                svg.selectAll("#bar_chart").remove();
                svg.selectAll("#pie_label").remove();
                svg.selectAll("#pie_chart").remove();
                svg.selectAll("#axis").remove();
            }
            }
        );                 
      }
      render(){
        return <div></div>
      }
}

export default BarChart;