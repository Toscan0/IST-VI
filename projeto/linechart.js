import  { animTime } from "./main.js";
import { ethnicityColor } from "./main.js";
import { defaultYears } from "./main.js";
import  { tooltipAux } from "./main.js";
//events
import { dispatchParty } from "./main.js";
import { dispatchControlsParty } from "./main.js";
import { dispatchControlsCategory } from "./main.js";
import { dispatchControlsYears } from "./main.js";
import { dispatchControlsEthnicity } from "./main.js";
import { dispatchEhtnicityLinechart } from "./main.js";
import { dispatchEhtnicityLinechartAux } from "./main.js";
import  { dispatchLollipopLineOver } from "./main.js";
import  { dispatchLollipopLineOut } from "./main.js";


var full_dataset; // all the csv file;
//var defaultYears = []; //the possible years;
var defaultObj = [];
const aux_Ethnicity = ["Asian", "Black", "Hispanic", "White"]; //never changes
var selectedEthnicity = ["Asian", "Black", "Hispanic", "White"];
// Array with party selected
var selectedParty = ["Democratic", "Republican"];
// Array with category selected
var selectedCategory = ["Winners", "Nominees"];
//Array with interval of years
var selectedYears = [1928, 2015];
//min and max os yy axis
var min = 0;
var max = 100;

//line css
var lineOpacity = "1";
var lineOpacityHover = "1.5";
var otherLinesOpacityHover = "0.3";
var lineStroke = "1.5px";
var lineStrokeHover = "2.5px";

//circle css
var circleOpacity = '0.85';
var circleOpacityOnLineHover = '0.15';
var circleRadius = 2.5;
var circleRadiusOnHover = 5;

var svg, xScale, yScale, yAxis, xAxis, lineWhite, lineBlack, lineAsian, lineHispa, lines, circles, legend;
var container = d3.select('#linechart'),
    width = d3.select('#linechart').node().getBoundingClientRect().width,
    height = 405,    //d3.select('#linechart').node().getBoundingClientRect().height - 19.5, //title size
    margin = { top: 30, right: 20, bottom: 30, left: 50 };

//load data and call func to generate the bar
d3.csv("datasets/linechart.csv").then(function (data) {
    full_dataset = data;

    lineChart();
});

dispatchParty.on("partyEvent.linechart", function(partysSelected){
    selectedParty = partysSelected;

    //console.log(selectedParty);
    update();
});


dispatchControlsEthnicity.on("ControlsEthnicityEvent.linechart", function(ethnicitysSelected){
    selectedEthnicity = ethnicitysSelected;

    //console.log(selectedEthnicity);
    update();
});

dispatchControlsCategory.on("ControlsCategoryEvent.linechart", function(categorysSelected){
    selectedCategory = categorysSelected;

    //console.log(selectedCategory);
    update();
});

dispatchControlsYears.on("ControlsYearsEvent.linechart", function(yearsSelected){
    selectedYears = yearsSelected;

    //console.log(selectedYears);
    update();
});

dispatchLollipopLineOver.on("lineOver.linechart", function(year){
	lines.selectAll("myline")
		.data([1])
		.enter()
		.append("line")
		.attr("x1",xScale(year))
		.attr("x2",xScale(year))
		.attr("y1", 0)
		.attr("y2", height - margin.top - margin.bottom)
		.attr("class", "templine")
		.style("stroke-width", 2)
		.style("stroke", "white")
		.style("stroke-dasharray", ("3, 3"))
		.style("opacity", 0.5)
		.style("fill", "none");
})
dispatchLollipopLineOut.on("lineOut.linechart", function(year){
	d3.selectAll(".templine").remove();
})

function lineChart() {

    makeObjByData();

    svg = container
       .append("svg")
       .attr("width", width)
       .attr("height", height)
       .append("g")
       .attr("transform", `translate(${margin.left},${margin.top})`);
    var oi = container
        .append("svg")
        .attr("width", width)
        .attr("height", 20)
        .append("g");
        //.attr("transform", `translate(${0},${-2})`);

    //scale of axxis
    xScale = d3.scaleLinear()
		.domain(selectedYears) //
        .range([0, width - margin.left - margin.right]);

	yScale = d3.scaleLinear()
        .domain([min, max])
		.range([height - margin.top - margin.bottom, 0]);

	//  yy axis
    yAxis = d3.axisLeft()
        .scale(yScale);//.ticks(5); // fit to our scale

    // xx axys
    xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));



    /*var line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.White));*/

    // curvas -> http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8
    lineWhite = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.White));

    lineBlack = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.Black));

    lineAsian = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.Asian));

    lineHispa = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.Hispanic));

    lines = svg.append('g')
        .attr('class', 'lines');

    circles = svg.append('g')
        .attr('class', 'circles');

    //design each line
    aux_Ethnicity.forEach(function (ethnicity){
        lines.append("path")
            .data(defaultObj)
            .attr("class", "line-linechart " + ethnicity)
            .attr('d', function(d){
                if(ethnicity === "White"){
                    return lineWhite(defaultObj)
                }
                if(ethnicity === "Black"){
                    return lineBlack(defaultObj)
                }
                if(ethnicity === "Asian"){
                    return lineAsian(defaultObj)
                }
                if(ethnicity === "Hispanic"){
                    return lineHispa(defaultObj)
                }
            })
            .style("stroke", ethnicityColor[ethnicity])
            .style("stroke-width", lineStroke)
            .style("opacity", lineOpacity)
            .on("mouseover", function(d) {
                //esconde as outras linhas
                d3.selectAll(".line-linechart")
                    .style('opacity', otherLinesOpacityHover);
                //esconde os outors circulos
                d3.selectAll('.circle-linechart')
                    .style('opacity', circleOpacityOnLineHover);
                //realce da linha
                d3.select(this)
                    .style('opacity', lineOpacityHover)
                    .style("stroke-width", lineStrokeHover)
                    .style("cursor", "pointer");

                //esconde as outras legendas
                legend.selectAll(".legend-square")
                    .style('opacity', otherLinesOpacityHover);
                legend.selectAll(".legend-text")
                    .style('opacity', otherLinesOpacityHover);

                //realça a legenda da linha
                legend.selectAll(".legend-square." + ethnicity)
                    .style('opacity', lineOpacityHover);
                legend.selectAll(".legend-text." + ethnicity)
                    .style('opacity', lineOpacityHover);
            })
            .on("mouseout", function(d) {
                //lines
                selectedEthnicity.forEach(function(eth){
                    if(selectedEthnicity.includes(eth)){
                        d3.selectAll(".line-linechart." + eth)
                            .style("opacity", lineOpacity);
                    }
                    else{
                        d3.selectAll(".line-linechart." + eth)
                            .style("opacity", otherLinesOpacityHover);
                    }
                });

                //circles
                selectedEthnicity.forEach(function(eth){
                    if(selectedEthnicity.includes(eth)){
                        d3.selectAll(".circle-linechart." + eth)
                            .style("opacity", circleOpacity);
                    }
                    else{
                        console.log(eth);
                        d3.selectAll(".circle-linechart." + eth)
                            .style("opacity", circleOpacityOnLineHover);
                    }
                });

                d3.select(this)
                    .style("stroke-width", lineStroke)
                    .style("cursor", "none");

                //normaliza as legendas
                legend.selectAll(".legend-square")
                    .style('opacity', 1);
                legend.selectAll(".legend-text")
                    .style('opacity', 1);
            })
            // Select this ethnicity
            .on("click", function(d){
                //console.log(ethnicity);
                // selectedEthnicity array com todas as etnidades selecionas
                // so queremos enviar as que nao foram selecionas
                var ethNotSelected = removeEleFromArray(selectedEthnicity, ethnicity);
                //console.log(ethNotSelected, ethnicity)
                dispatchEhtnicityLinechartAux.call("ehtnicityLinechartEventAux", ethnicity, ethnicity);
                dispatchEhtnicityLinechart.call("ehtnicityLinechartEvent", ethNotSelected, ethNotSelected);

            });
    });



    /* Add circles */
    aux_Ethnicity.forEach(function (ethnicity){
        circles.selectAll(".circle-linechart." + ethnicity)
            .data(defaultObj).enter()
            .append("circle")
            .style("fill", ethnicityColor[ethnicity]) //color
            .attr("class", "circle-linechart " + ethnicity) // class
            .attr("cx", function(d, i) {
                return xScale(d.year)
            })
            .attr("cy", function(d) {
                return yScale(d[ethnicity])
            })
            .attr("r", circleRadius)
            .attr("year", function(d) {
                  return d.year;
            })
            .on("mouseover", function(d) {
                //make tooltip
                tooltipAux.transition()
                    .duration(200)
                    .style("opacity", .9);
                //var str_tool = "Year: " + d.year + " Percentage: " + d[ethnicity] + "% Ethnicity: " + ethnicity
                var str_tool = "In Year: " + d.year + ", <br>" + d[ethnicity] + "% of " + ethnicity + " Nominees"
                tooltipAux.html(str_tool)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");

                //increment size on circle
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", circleRadiusOnHover);
            })
            .on("mouseout", function(d) {
                //resize circle
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("r", circleRadius);

                //remove tooltip
                tooltipAux.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    });

    // XX axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform",`translate(0,${height - margin.top - margin.bottom})`)
        .call(xAxis);

    // YY axis
    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis);

     //XX axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "end")
        .attr("x", width - margin.bottom -22)
        .attr("y", height - margin.top ) //360
        .text("Year");

    //YY axis label
     svg.append("text")
          .attr("class", "axis-label")
          .attr("text-anchor", "end")
          .attr("y", margin.left - 61)
          .attr("x", margin.top + 50)
          .text("Nominees / Ethnicity");


    //Legend
    //vertical legend
    /*legend = oi.selectAll(".legend")
        .data(aux_Ethnicity)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d,i) {
            return "translate(0," + (110 + (i * 20)) + ")"; //vertical one
        })
        .style("opacity","1");*/

    legend = oi.selectAll(".legend")
        .data(aux_Ethnicity)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d,i) {
            return "translate(" + (-300 + (i * 100)) + "," + 0 + ")"; //horizontal one
        })
        .style("opacity","1");

    //create a square with color
    legend.append("rect")
        .attr("class", function(e) {
            return "legend-square " + e + " " + "interactable";
        })
        .attr("x", width - 150)
        .style("fill", function(e) {
            return ethnicityColor[e];
        })
        .attr("stroke", function(e) {
            return ethnicityColor[e];
        })
        // select ethnicity
        .on("click", function(ethnicity){  //on mouse click
            if(selectedEthnicity.includes(ethnicity)){
                //send the not selected ethnicity
                dispatchEhtnicityLinechart.call("ehtnicityLinechartEvent", [ethnicity], [ethnicity]);
            }
            else{
                if(selectedEthnicity.length === 3){
                    //show all the ethnicitys
                    dispatchEhtnicityLinechart.call("ehtnicityLinechartEvent", [], []);
                }
                else{
                    selectedEthnicity.push(ethnicity)

                    // send ethnicity not selected
                    var ethNotSelected = diff(selectedEthnicity, aux_Ethnicity)
                    dispatchEhtnicityLinechart.call("ehtnicityLinechartEvent", ethNotSelected, ethNotSelected);

                    // send ethnicity selected
                    dispatchEhtnicityLinechartAux.call("ehtnicityLinechartEventAux", ethnicity, ethnicity);

                }


            }
        });

    //add text
    legend.append("text")
        .attr("class", function(e) {
            return "legend-text " + e;
        })
        .attr("x", width - 130)
        .attr("y", 8)
        .attr("dy", ".35em")
        .text(function(d) {
            return d;
        });

}

/* dataset fields
* Aux -> to delete
* percentage_race_win_nom -> y dot
* political_party -> change with checkbox
* race_ethnicity -> line color
* winner -> change with checkbox
* year -> x axis
*/
function makeObjByData(){

    //console.log(defaultObj);
     makeObjStructure();

    //fill the object
    full_dataset.forEach(function (d){
        /*  each d -> {
            aux: "0"
            percentage_race_win_nom: "100.0"
            political_party: "Republican"
            race_ethnicity: "White"
            winner: "0"
            year: "1928" }
        */
        //console.log(selectedParty.includes(d.political_party), selectedParty, d.political_party)
        if(selectedYears[0] <= parseInt(d.year) &&
               parseInt(d.year) <= selectedYears[1] &&
               selectedParty.includes(d.political_party)){ /*&&
               selectedEthnicity.includes(d.race_ethnicity)){ */
             defaultObj.forEach(function (e){
                 /*
                 * each e -> {year: 2015, White: 0, Black: 0, Hispanic: 0, Asian: 0}
                 */
                if(parseInt(d.year) === e.year){
                    if(d.race_ethnicity === "White"){
                        if(selectedCategory.includes("Winners") && selectedCategory.includes("Nominees")){
                            if(d.winner === "2"){
                                e["White"] += parseInt(d.percentage_race_win_nom);
                            }
                        }
                        else if(selectedCategory.includes("Winners") ){
                            if(d.winner === "1" ){
                                e["White"] += parseInt(d.percentage_race_win_nom);
                            }
                        }
                        else if(selectedCategory.includes("Nominees") ){
                            if(d.winner === "0"){
                                e["White"] += parseInt(d.percentage_race_win_nom);
                            }
                        }
                        else{
                            e["White"] += parseInt(0);
                        }
                    }
                   else if(d.race_ethnicity === "Black"){
                        if(selectedCategory.includes("Winners") && selectedCategory.includes("Nominees")){
                            if(d.winner === "2"){
                                e["Black"] += parseInt(d.percentage_race_win_nom);
                            }
                        }
                        else if(selectedCategory.includes("Winners") ){
                            if(d.winner === "1" ){
                                e["Black"] += parseInt(d.percentage_race_win_nom);
                            }
                        }
                        else if(selectedCategory.includes("Nominees") ){
                            if(d.winner === "0"){
                                e["Black"] += parseInt(d.percentage_race_win_nom);
                            }
                        }
                        else{
                            e["Black"] += parseInt(0);
                        }
                    }
                    else if(d.race_ethnicity === "Asian"){
                        if(selectedCategory.includes("Winners") && selectedCategory.includes("Nominees")){
                            if(d.winner === "2"){
                                e["Asian"] += parseInt(d.percentage_race_win_nom);
                            }
                        }
                        else if(selectedCategory.includes("Winners") ){
                            if(d.winner === "1" ){
                                e["Asian"] += parseInt(d.percentage_race_win_nom);
                            }
                        }
                        else if(selectedCategory.includes("Nominees") ){
                            if(d.winner === "0"){
                                e["Asian"] += parseInt(d.percentage_race_win_nom);
                            }
                        }
                        else{
                            e["Asian"] += parseInt(0);
                        }
                    }
                    else if(d.race_ethnicity === "Hispanic"){
                        if(selectedCategory.includes("Winners") && selectedCategory.includes("Nominees")){
                            if(d.winner === "2"){
                                e["Hispanic"] += parseInt(d.percentage_race_win_nom);
                            }
                        }
                        else if(selectedCategory.includes("Winners") ){
                            if(d.winner === "1" ){
                                e["Hispanic"] += parseInt(d.percentage_race_win_nom);
                            }
                        }
                        else if(selectedCategory.includes("Nominees") ){
                            if(d.winner === "0"){
                                e["Hispanic"] += parseInt(d.percentage_race_win_nom);
                            }
                        }
                        else{
                            e["Hispanic"] += parseInt(0);
                        }
                    }
                }
            });
         }

    });
    //console.log(defaultObj);

    // recalculate min and max
    calMinAndMax();
}


function makeObjStructure(){
    //console.log(defaultYears);
    defaultObj = [];

    // slice obj to years in range min
    var yearsSlicedMin = defaultYears.slice(defaultYears.indexOf(selectedYears[0]));

    var yearsSlicedMax = yearsSlicedMin.slice(0, yearsSlicedMin.indexOf(selectedYears[1]) + 1);

    var yearsSliced = yearsSlicedMax;
    //console.log(yearsSliced)
    //make the structure of the object
    yearsSliced.forEach(function (d){
        defaultObj.push({year : d,
                        White: 0,
                        Black: 0,
                        Hispanic: 0,
                        Asian: 0});
    });
}

function update(){
    makeObjByData();

    /* Update XX axis */
    xScale.domain(selectedYears);
    var n = xScale.domain()[1] - xScale.domain()[0]
    if (n === 0){
			n = 1;
		}
    if (xScale.domain()[1] - xScale.domain()[0] < 10) {
        xAxis.ticks(n)
    }

    svg.select(".x")
        .transition()
        .call(xAxis)
        .duration(animTime);


    /* Update YY axis
    yScale.domain([min, max])
    svg.select(".y")
        .transition()
        .call(yAxis)
        .duration(animTime); */

    //d3.selectAll('.circle-linechart').attr("r", 0);
    var list, index;
    list = document.getElementsByClassName("circle-linechart");
    for (index = 0; index < list.length; ++index) {
        list[index].setAttribute("r", 0);
    }

     d3.selectAll(".circle-linechart" )
            .attr("r", 0)

    var aux_year_aux = [];
    aux_Ethnicity.forEach(function (ethnicity){
        //update lines
        lines.selectAll(".line-linechart." + ethnicity)
            .transition()
            .attr('d', function(d){
                if(ethnicity === "White"){
                    return lineWhite(defaultObj)
                }
                if(ethnicity === "Black"){
                    return lineBlack(defaultObj)
                }
                if(ethnicity === "Asian"){
                    return lineAsian(defaultObj)
                }
                if(ethnicity === "Hispanic"){
                    return lineHispa(defaultObj)
                }
            })
            .style("stroke", ethnicityColor[ethnicity])
            //.style("stroke-width", lineStroke)
            .style("opacity", function(){
                if(selectedEthnicity.includes(ethnicity)){
                        return lineOpacity;
                    }
                    else{
                        return otherLinesOpacityHover;
                    }
            })
            .duration(animTime);

        //console.log(defaultObj, selectedYears[1] - selectedYears[0])
        //update circles
        circles.selectAll(".circle-linechart." + ethnicity)
            .data(defaultObj) // really necessary
            .transition()
            .attr("cx", function(d, i) {
                return xScale(d.year)
            })
            .attr("cy", function(d) {
                return yScale(d[ethnicity])
            })
            .attr("r", function(d) {
                var aux_str = d.year + ethnicity;
                if(d.year < selectedYears[0] || d.year > selectedYears[1]){
                    return 0;
                }
                /*if(!selectedEthnicity.includes(ethnicity)){
                    return 0;
                }*/
                if(aux_year_aux.includes(aux_str)){
                    return 0;
                }
                if(d[ethnicity] === 0){
                    return 0;
                }
                return circleRadius;
            })
            .style("fill", ethnicityColor[ethnicity])
            .style("opacity", function(){
                if(selectedEthnicity.includes(ethnicity)){
                        return circleOpacity;
                    }
                    else{
                        return circleOpacityOnLineHover;
                    }
            })
            .duration(animTime);

        d3.selectAll(".circle-linechart." + ethnicity)
            .attr("r", function(d) {
                var aux_str = d.year + ethnicity;
                if(d.year < selectedYears[0] || d.year > selectedYears[1]){
                    return 0;
                }
                /*if(!selectedEthnicity.includes(ethnicity)){
                    return 0;
                }*/
                if(aux_year_aux.includes(aux_str)){
                    return 0;
                }
                aux_year_aux.push(aux_str);
                if(d[ethnicity] === 0){
                    return 0;
                }
                return circleRadius;
            })
    });

    //update the legends square
    aux_Ethnicity.forEach(function (ethnicity){
        legend.selectAll(".legend-square." + ethnicity)
            .transition()
            .style("fill", "#ffffff")
            .duration(animTime);
    });


    //update the legends square
    selectedEthnicity.forEach( function(ethnicity, index){
        legend.selectAll(".legend-square." + ethnicity)
            .transition()
            .style("fill", ethnicityColor[ethnicity])
            .duration(animTime);
    });
}

function removeEleFromArray(arr, value) {

   return arr.filter(function(ele){
       return ele !== value;
   });
}

function diff(arr1, arr2) {
  var filteredArr1 = arr1.filter(function(ele) {
    return arr2.indexOf(ele) == -1;
  });

  var filteredArr2 = arr2.filter(function(ele) {
    return arr1.indexOf(ele) == -1;
  });
  return filteredArr1.concat(filteredArr2);
}

function calMinAndMax(){
    //reset values
    min = 0;
    max = 0;
    if(selectedEthnicity.length === 1){
        var minAndMax = d3.extent(defaultObj, d => d[selectedEthnicity[0]]);

        min = minAndMax[0];
        max = minAndMax[1];
    }
    else{
        selectedEthnicity.forEach(function (eth) {
            //calculate the min / max of each line
            var minAndMax = d3.extent(defaultObj, d => d[eth]);

            var min_aux = minAndMax[0];
            var max_aux = minAndMax[1];

            //update the min / max
            if(min_aux < min){
                min = min_aux;
            }
            if(max_aux > max){
                max = max_aux;
            }
        });
    }
}
