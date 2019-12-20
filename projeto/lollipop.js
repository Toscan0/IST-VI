import { partyColor } from "./main.js"
import { animTime } from "./main.js"
import { dispatchParty } from "./main.js"
import { dispatchParty2 } from "./main.js";
import  { years } from "./main.js";
import  { dispatchLollipopLineOver } from "./main.js";
import  { dispatchLollipopLineOut } from "./main.js";

import { dispatchControlsYears } from "./main.js"; //year -> grouped bars




var  full_dataset, dataset;
var selectedParty = ["Democratic", "Republican"];

var defaultCategories = ["Democratic", "Republican"];

var sentimentCategories = ["Acceptance", "Protest"];

const sentimentColor = {
    "Acceptance": "#98E690", //green
    "Protest": "#F9665E" //red
};

var w = d3.select('#lollipop').node().getBoundingClientRect().width-4;
var h = d3.select('#lollipop').node().getBoundingClientRect().height - 19.5;

var svg = d3.select("#lollipop")
            .append("svg")
            .attr("width",w)
            .attr("height",h)
            .attr("transform", `translate(${17},${0})`);;

var padding = 32;
var bar_w = 5;
var margin = { top: 30, right: 20, bottom: 30, left: 50 };

var first_year = years[0], final_year = years[1];

var hscale = d3.scaleLinear()
                     .domain([4,0])
                     .range([padding,h-padding]);

var xscale = d3.scaleLinear()
                     .domain([0,final_year - first_year])
                     .range([padding,w-padding]);

 var totalYears = final_year - first_year;

 var xaxis, yaxis;

// Define the div for the tooltip
var tooltipAux = d3.select("body").append("div")
    .attr("class", "my-tooltip")
    .style("opacity", 0);

d3.csv("datasets/lollipop_expanded.csv").then(function (data) {
full_dataset = data;
dataset = full_dataset;

lollipop();
});

dispatchControlsYears.on("ControlsYearsEvent.lollipop", function(yearsSelected){
    first_year = yearsSelected[0];
    final_year = yearsSelected[1];
    xscale.domain([0,final_year - first_year])
    dataset = full_dataset.filter(d => d.year <= final_year && d.year >= first_year);

    updateAxis();
    //console.log(first_year + " " + final_year)
    createLines(dataset, 1, false);
    createCircles(dataset, 1, false);


});

dispatchParty.on("partyEvent.lollipop", function(partysSelected){

 //chamada ao treemap
 //dispatchParty2.call("partyEvent2", partysSelected, partysSelected);


 selectedParty = partysSelected;
 //console.log(selectedParty);
 createLines(dataset, 1, true);
 createCircles(dataset, 1,true);
 for (var y = 1928; y < first_year; y++){
     var s = "circle[year='" + y + "']";
     d3.select("#lollipop").selectAll(s)
     .style("opacity", 0);
 }
 for (var y = final_year; y < 2015; y++){
     var s = "circle[year='" + y + "']";
     d3.select("#lollipop").selectAll(s)
     .style("opacity", 0);
 }

});

function updateAxis(){
    totalYears = final_year - first_year;
    if (totalYears === 0){
        totalYears = 1;
    }
    var n_ticks = totalYears < 10 ? totalYears : 10;
    xaxis.scale(d3.scaleLinear()
              .domain([first_year,final_year])
              .range([padding+bar_w/4,w-padding-bar_w/4]))
          .tickFormat(d3.format("d"))
          .ticks(n_ticks);
    svg.select(".x.axis")
        .transition()
        .call(xaxis);
}


//lollipop
function lollipop() {
        totalYears = final_year - first_year;
        var n_ticks = totalYears < 10 ?  totalYears : 10;

        /*yaxis = d3.axisLeft()
                      .scale(hscale)
                      .ticks(4);*/

        xaxis = d3.axisBottom()
                  .scale(d3.scaleLinear()
                            .domain([first_year,final_year])
                            .range([padding+bar_w/4,w-padding-bar_w/4]))
                  .tickFormat(d3.format("d"))
                  .ticks(n_ticks);


        /*svg.append("g")
            .attr("transform","translate(33,0)")
            .attr("class","x axis")
            .call(yaxis);*/

        svg.append("g")
            .attr("transform","translate(0," + (h-padding) + ")")
            .attr("class", "x axis")
            .call(xaxis);

        createLines(full_dataset, 0, false);

        createCircles(full_dataset, 0);


        svg.selectAll("line")
            .each(function(d,i){
                d3.select(this)
                .append("title")
                .text(d3.select(this).attr("year"))}
                );


            //Legend
       var legend = svg.selectAll(".legend")
           .data(sentimentCategories)
           .enter().append("g")
           .attr("class", "legend")
           .attr("transform", function(d,i) {
               //console.log(i);
               return "translate(0," + ((i * 20) + 20) + ")";
           })
           .style("opacity","1");

       //create a square with color
       legend.append("rect")
           .attr("x", w - 150)
           .attr("width", 16)
           .attr("height", 16)
           .style("fill", function(sentiment) {
               return sentimentColor[sentiment];
           })
           .attr("stroke", function(sentiment) {
               return sentimentColor[sentiment];
           })
           .attr("stroke-width",2);

      //add text
      legend.append("text")
          .attr("class", "legend-text")
          .attr("x", w - 130)
          .attr("y", 8)
          //.attr("font-family", "sans-serif")
          //.attr("font-size", 12)
          .attr("dy", ".35em")
          .text(function(d) {
              return d;
          });

      //XX axis label
      svg.append("text")
          .attr("class", "axis-label")
          .attr("text-anchor", "end")
          .attr("x", w - margin.right  - 10)
          .attr("y", h )
          .text("Year");
         /*
      //YY axis label
      svg.append("text")
          .attr("class", "axis-label")
          .attr("text-anchor", "end")
          //.attr("transform", "rotate(-90)")
          .attr("y", margin.left - 30)
          .attr("x", margin.top + 80)
          .text("Events per year");*/

          //add a title idiom
     var title = svg.selectAll(".title")
         .data([1])
         .enter().append("g")
         .attr("class", "idiom-title");

     /*title.append("text")
         .attr("transform", `translate(${230}, ${12})`)
         .style("text-align","center")
         .text("Racial Events")*/

}
// key: anos value: i associado a esse ano
var years_i = {};
var num_events_per_year = {};

function createLines(dataset, notFirstTime, changingParties){
    var time = 0;
    if (notFirstTime === 1){
        var delay_1 = 0;
        years_i = {};
        time = animTime;
        for (var y = 1928; y < first_year; y++){
            var s = "line[year='" + y + "']";
            d3.selectAll(s)
            .style("opacity", 0);
        }
        for (var y = final_year; y < 2015; y++){
            var s = "line[year='" + y + "']";
            d3.selectAll(s)
            .style("opacity", 0);
        }
        if (changingParties){
            var years_i_contained = {};
            var years_i_contained_x2 = {};

            d3.selectAll("line")
            .filter(function() { // ticks desapareciam
                return !this.parentNode.classList.contains("tick")
            })
            .data(dataset)
            .attr("x1", function(d, i){
                    if (!(d.year in years_i)){
                        years_i[d.year] = i - delay_1;
                        years_i_contained[years_i[d.year]] = 1;
                        return xscale(years_i[d.year]);
                    }
                    else{
                        years_i_contained[years_i[d.year]] += 1;
                        delay_1++;
                    }
            })
            .attr("x2", function(d, i){
                    if (!(years_i[d.year] in years_i_contained_x2)){
                        years_i_contained_x2[years_i[d.year]] = 1;
                        d3.select(this).style("opacity",1);
                        return xscale(years_i[d.year]);
                    }
                    else{
                        d3.select(this).style("opacity",0);
                    }
            })
            .transition()
            .duration(time)
            .ease(d3.easeLinear)
            .attr("class", "lollipop-line")
            .attr("y1", function(d) {
                //console.log("lines: " + d.year + " " + selectedParty.includes(d.political_party));
                if (!selectedParty.includes(d.political_party) ){
                    return hscale(0);
                }
                else{
                 return hscale(num_events_per_year[d.year]);
                 }
            })

           /*.attr("y2", hscale(0))*/
           .attr("opacity", 1)
           .attr("year", function(d){return d.year;});
        }
        else{
            var years_i_contained = {};
            var years_i_contained_x2 = {};
            d3.selectAll(".lollipop-line")
            .filter(function() { // ticks desapareciam
                return !this.parentNode.classList.contains("tick")
            })
            .data(dataset)
            .attr("year", function(d){return d.year;})
            .attr("opacity", 1)
            .attr("y1", function(d) {
                //console.log("lines: " + d.year + " " + selectedParty.includes(d.political_party));
                if (!selectedParty.includes(d.political_party) ){
                    return hscale(0);
                }
                else{
                 return hscale(num_events_per_year[d.year]);
                 }
            })
            .attr("x1", function(d, i){
                if (!(d.year in years_i)){
                    years_i[d.year] = i - delay_1;
                    years_i_contained[years_i[d.year]] = 1;
                    return xscale(years_i[d.year]);
                }
                else{
                    years_i_contained[years_i[d.year]] += 1;
                    delay_1++;
                }


            })
            .attr("x2", function(d, i){
                if (!(years_i[d.year] in years_i_contained_x2)){
                    years_i_contained_x2[years_i[d.year]] = 1;
                    d3.select(this).style("opacity",1);
                    return xscale(years_i[d.year]);
                }
                else{
                    d3.select(this).style("opacity",0);
                }

            })
            .transition()
            .duration(time)
            .ease(d3.easeLinear)
            //.attr("class", "lollipop-line")


           /*.attr("y2", hscale(0))*/


           //d3.select("#lollipop").selectAll("line[year='0']").style("opacity",0);


        }



    }

    else {
        var delay = 0;
        var linesYears = [];
        svg.selectAll("myline")
            .data(dataset)
            .enter()
            .append("line")
            .attr("class", "lollipop-line")
            .attr("x1", function(d, i) {
                //console.log(d.year + " " + xscale(i));
                if (!(d.year in years_i)){
                    years_i[d.year] = i - delay;
                    if (d.milestone === "-1")
                        num_events_per_year[d.year] = 0;
                    else
                        num_events_per_year[d.year] = 1;
                    return xscale(years_i[d.year]);
                }
                else{
                    delay++;
                    num_events_per_year[d.year]++;
                    d3.select(this).remove();
                }

            })
            .attr("x2", function(d, i) {
                return xscale(years_i[d.year]);

                })
             .transition()
             .duration(time)
             .ease(d3.easeLinear)
            .attr("y1", function(d) {
                return hscale(num_events_per_year[d.year]);
                 })
            .attr("y2", hscale(0))
            .attr("party", function(d){return d.political_party;})
            .attr("stroke", "white");
        }

}

function createCircles(dataset, notFirstTime, changingParties){
    var time = 0;
    if (notFirstTime > 0){
        time = animTime;

        var delay_2 = 1;

        if (selectedParty.includes("Republican") && selectedParty.includes("Democratic")){
            if (changingParties){
                d3.selectAll("circle[party='Republican']")
                .attr("cx", function(d, i) {
                    if (num_events_per_year[d.year] > 0){
                        return xscale(years_i[d.year]);
                    }
                    else
                        d3.select(this).style("opacity",0)
                         })
                .transition()
                 .attr("cy", function(d) {
                     if(delay_2 < num_events_per_year[d.year]){
                         return hscale(delay_2++);
                     }
                     if(delay_2 === num_events_per_year[d.year]){
                         var new_delay = delay_2;
                         delay_2 = 1;
                         return hscale(new_delay);
                     }
                     else{
                         delay_2 = 1;
                         return hscale(1);
                     }
                 })
                 .duration(time)
                 .ease(d3.easeLinear)
                 .style("opacity",function(d){
                     if (d.year < first_year || d.year > final_year){
                         return 0;
                     }
                     else
                        return 1;
                 })



               d3.selectAll("circle[party='Democratic']")
               .attr("cx", function(d, i) {
                   if (num_events_per_year[d.year] > 0){
                       return xscale(years_i[d.year]);
                   }
                   else
                       d3.select(this).style("opacity",0)
                        })
               .transition()
                .attr("cy", function(d){
                    if(delay_2 < num_events_per_year[d.year]){
                        return hscale(delay_2++);
                    }
                    if(delay_2 === num_events_per_year[d.year]){
                        var new_delay = delay_2;
                        delay_2 = 1;
                        return hscale(new_delay);
                    }
                    else{
                        delay_2 = 1;
                        return hscale(1);
                    }
                })
                .duration(time)
                .ease(d3.easeLinear)
                .style("opacity",function(d){
                    if (d.year < first_year || d.year > final_year){
                        return 0;
                    }
                    else
                       return 1;
                })

            }
            else
            {
                d3.selectAll("circle[party='Republican']")
                .attr("cx", function(d, i) {
                    if (num_events_per_year[d.year] > 0){
                        return xscale(years_i[d.year]);
                    }
                    else
                        d3.select(this).style("opacity",0)
                         })
                .attr("cy", function(d) {
                    if (d.year >= first_year && d.year <= final_year){
                        if(delay_2 < num_events_per_year[d.year]){
                            return hscale(delay_2++);
                        }
                        if(delay_2 === num_events_per_year[d.year]){
                            var new_delay = delay_2;
                            delay_2 = 1;
                            return hscale(new_delay);
                        }
                        else{
                            delay_2 = 1;
                            return hscale(1);
                        }
                    }
                    else
                         return hscale(0);
                })
                /*.transition()
                .duration(time)
                .ease(d3.easeLinear)*/
                .style("opacity",function(d){
                    if (d.year < first_year || d.year > final_year)
                        return 0;
                    else
                        return 1;
                })


                   d3.selectAll("circle[party='Democratic']")
                   .attr("cx", function(d, i) {
                       if (num_events_per_year[d.year] > 0){
                           return xscale(years_i[d.year]);
                       }
                       else
                           d3.select(this).style("opacity",0)
                            })
                   .attr("cy", function(d){
                       if (d.year >= first_year && d.year <= final_year){
                           if(delay_2 < num_events_per_year[d.year]){
                               return hscale(delay_2++);
                           }
                           if(delay_2 === num_events_per_year[d.year]){
                               var new_delay = delay_2;
                               delay_2 = 1;
                               return hscale(new_delay);
                           }
                           else{
                               delay_2 = 1;
                               return hscale(1);
                           }
                       }
                       else
                             return hscale(0);
                   })
                   /*.transition()
                   .duration(time)
                   .ease(d3.easeLinear)*/
                   .style("opacity",function(d){
                       if (d.year < first_year || d.year > final_year)
                           return 0;
                       else
                           return 1;
                   })
            }



        }
        if (!selectedParty.includes("Republican")){
            d3.selectAll("circle[party='Republican']")
            .transition()
            .duration(time)
            .ease(d3.easeLinear)
            .style("opacity",0)
           .attr("cy", hscale(0));

           d3.selectAll("circle[party='Democratic']")
           .attr("cx", function(d, i) {
               if (num_events_per_year[d.year] > 0){
                   return xscale(years_i[d.year]);
               }
               else
                   d3.select(this).style("opacity",0)
                    })
           .attr("cy", function(d){
               if (d.year >= first_year && d.year <= final_year){
                   if(delay_2 < num_events_per_year[d.year]){
                       return hscale(delay_2++);
                   }
                   if(delay_2 === num_events_per_year[d.year]){
                       var new_delay = delay_2;
                       delay_2 = 1;
                       return hscale(new_delay);
                   }
                   else{
                       delay_2 = 1;
                       return hscale(1);
                   }
               }
               else
                     return hscale(0);
           })


        }
        if (!selectedParty.includes("Democratic")){
            d3.selectAll("circle[party='Democratic']")
            .transition()
            .duration(time)
            .ease(d3.easeLinear)
            .style("opacity",0)
           .attr("cy", hscale(0));

           d3.selectAll("circle[party='Republican']")
           .attr("cx", function(d, i) {
               if (num_events_per_year[d.year] > 0){
                   return xscale(years_i[d.year]);
               }
               else
                   d3.select(this).style("opacity",0)
                    })
           .attr("cy", function(d) {
               if (d.year >= first_year && d.year <= final_year){
                   if(delay_2 < num_events_per_year[d.year]){
                       return hscale(delay_2++);
                   }
                   if(delay_2 === num_events_per_year[d.year]){
                       var new_delay = delay_2;
                       delay_2 = 1;
                       return hscale(new_delay);
                   }
                   else{
                       delay_2 = 1;
                       return hscale(1);
                   }
               }
               else
                    return hscale(0);
           })
           /*.transition()
           .duration(time)
           .ease(d3.easeLinear)*/
           .style("opacity",function(d){
               if (d.year < first_year || d.year > final_year)
                   return 0;
               else
                   return 1;
           })

        }
    }
    else{
            var delay = 1;
            svg.selectAll("mycircle")
                .data(dataset)
                .enter()
                .append("circle")
                    .transition()
                    .duration(time)
                    .ease(d3.easeLinear)
                    .attr("cx", function(d, i) {
                        if (num_events_per_year[d.year] > 0){
                            return xscale(years_i[d.year]);
                        }
                             })
                    .attr("cy", function(d) {
                        if (num_events_per_year[d.year] > 0){
                            if(delay < num_events_per_year[d.year]){
                                return hscale(delay++);
                            }
                            if(delay === num_events_per_year[d.year]){
                                var new_delay = delay;
                                delay = 1;
                                return hscale(new_delay);
                            }
                            else{
                                delay = 1;
                                return hscale(1);
                            }
                        }
                        else{
                            d3.select(this).remove();
                        }
                         })
                    .attr("r", "3")
                    .attr("year", function(d){return d.year;})
                    .attr("party", function(d){return d.political_party;})
                    .style("fill", function(d, i){
                        var split = d.sentiment.split("|");
                        if (split.length > 1){
                            if (d3.select(this).attr("sentiment") === 'Acceptance')
                                return sentimentColor['Acceptance'];
                            else
                                return sentimentColor['Protest'];
                        }
                        else{
                            if (d.sentiment === "Acceptance")
                                return sentimentColor['Acceptance'];
                            else
                                return sentimentColor['Protest'];
                        }

                    })
                    .attr("stroke", "black");

                    //adding a title for each circle
                    d3.selectAll("circle")
                    .on("mouseover", function(d) {
                        dispatchLollipopLineOver.call("lineOver", d.year, d.year);
                        tooltipAux.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltipAux.html(d.milestone)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                        })
                    .on("mouseout", function(d) {
                        dispatchLollipopLineOut.call("lineOut", d.year, d.year);
                        tooltipAux.transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
                    /*.append("title")
                    .text(function(d){
                        return d.milestone;
                    });*/

                }

}
