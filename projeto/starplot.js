import { partyColor } from "./main.js";
import  { animTime } from "./main.js";
import { dispatchBlock } from "./main.js";
import { dispatchParty } from "./main.js";
import { dispatchControlsParty } from "./main.js";
import { dispatchPartyControls } from "./main.js";
import { dispatchControlsYears } from "./main.js"; //year -> grouped bars
import { dispatchControlsCategory } from "./main.js";
import { dispatchControlsEthnicity } from "./main.js";
import  { tooltipAux } from "./main.js";

var full_dataset, dataset; // all the csv file;
var first_year, final_year;
var dic_democratic = {}, dic_republican = {};
var democratic_points = [], republican_points=[];
var ethnicities = ["Asian", "Black", "Hispanic", "White"];
var selectedParty = ["Democratic", "Republican"];
var curr_d;

const parties = ["Democratic", "Republican"];
// Array with category selected
var selectedCategory = ["Winners", "Nominees"];

var g, cfg, total, radius, Format;
var legend;

var w = d3.select('#lollipop').node().getBoundingClientRect().width;
var h = d3.select('#lollipop').node().getBoundingClientRect().height;
var blocked = false;

//load data and call func to generate the bar
d3.csv("datasets/linechart.csv").then(function (data) {
    full_dataset = data;
    dataset = full_dataset;
	first_year = 1928;
	final_year = 2015;

	getDictFromData();

    starPlot();
});

dispatchBlock.on("partyBlockEvent.starplot", function(block_value){
    blocked = block_value;
    console.log(blocked)

    parties.forEach(function (party){
        d3.selectAll(".legend-square." + party)
            .attr("class", function (d){
                var class_str = "legend-square " + party;
                if(blocked === true){
                    console.log("ddd")
                    return class_str;
                }
                else{
                    console.log("eee")
                    return class_str + " " + "interactable";
                }
        })
    })
});


dispatchControlsEthnicity.on("ControlsEthnicityEvent.starplot", function(ethnicitySelected){
	//console.log(ethnicitySelected);
	ethnicities = ethnicitySelected;
	getDictFromData();
	update();
})

dispatchControlsCategory.on("ControlsCategoryEvent", function(categorysSelected){
    selectedCategory = categorysSelected;
		getDictFromData();
		update();
});

dispatchControlsParty.on("ControlsPartyEvent.starplot", function(partysSelected){
	if(partysSelected === selectedParty){
        //dont do shit beaceusa everthing is equal
    }
    else{
        updateParty(partysSelected, true);
    }
})
dispatchPartyControls.on("PartyControlsEvent.starplot", function(partysSelected){
	if(partysSelected === selectedParty){
        //dont do shit beaceusa everthing is equal
    }
    else{
        updateParty(partysSelected, true);
    }
})

dispatchControlsYears.on("ControlsYearsEvent.starplot", function(yearsSelected){
    first_year = yearsSelected[0];
    final_year = yearsSelected[1];
		var newData = [];
		for(var i = 0; i < full_dataset.length; i++){
		  if(full_dataset[i].year >= parseInt(first_year) && full_dataset[i].year <= parseInt(final_year)){
		    newData.push(full_dataset[i]);
		  }
		}
		dataset = newData;
		getDictFromData();
		update();
});

function getDictFromData(){
	var count_democratic = 0, count_republican = 0;
	dic_democratic["Asian"] = 0.001;
	dic_democratic["Black"] = 0.001;
	dic_democratic["Hispanic"] = 0.001;
	dic_democratic["White"] = 0.001;
	dic_republican["Asian"] = 0.001;
	dic_republican["Black"] = 0.001;
	dic_republican["Hispanic"] = 0.001;
	dic_republican["White"] = 0.001;

	var winner;
	if (selectedCategory.length === 2)
		winner = 2;
	else if (selectedCategory[0] === "Winners")
		winner = 1;
	else if (selectedCategory[0] === "Nominees")
		winner = 0;

	for (var i = 0; i < dataset.length; i++){
		var percentage = parseInt(dataset[i].percentage_race_win_nom);
		if (dataset[i].political_party === "Democratic"){
			count_democratic++;
			if (parseInt(dataset[i].winner) === winner){
				if (dataset[i].race_ethnicity in dic_democratic ){
					dic_democratic[dataset[i].race_ethnicity] += percentage;
				}
				else {
					dic_democratic[dataset[i].race_ethnicity] = percentage;
				}
			}
		}
		if (dataset[i].political_party === "Republican"){
			count_republican++;
			if (parseInt(dataset[i].winner) === winner){
				if (dataset[i].race_ethnicity in dic_republican){
					dic_republican[dataset[i].race_ethnicity] += percentage;
				}
				else {
					dic_republican[dataset[i].race_ethnicity] = percentage;
				}
			}
		}
	}
	var sum_democratic = 0;
	Object.keys(dic_democratic).map(function(key, index) {
  		sum_democratic += dic_democratic[key];
	});
	Object.keys(dic_democratic).map(function(key, index) {
		// quando o partido nao está seleccionado isto dá .004 e fica tudo a 0.25
		if (sum_democratic != 0.004)
  		dic_democratic[key] = dic_democratic[key]  / sum_democratic;
		else
			dic_democratic[key] = 0.001;
	});
	var sum_republican = 0;
	Object.keys(dic_republican).map(function(key, index) {
  		sum_republican += dic_republican[key];
	});
	Object.keys(dic_republican).map(function(key, index) {
		if (sum_republican != 0.004)
  		dic_republican[key] = dic_republican[key]  / sum_republican;
		else
			dic_republican[key]  = 0.001;
	});

	for (var key in dic_democratic){
		if (!ethnicities.includes(key) || dic_democratic[key] < 0.001)
			dic_democratic[key] = 0.001;
	}
	for (var key in dic_republican){
		if (!ethnicities.includes(key) || dic_republican[key] < 0.001)
			dic_republican[key] = 0.001;
	}

	//console.log("first_year " + first_year + " final_year " + final_year)
	//console.log(dic_democratic);
	//console.log(dic_republican);
}

function update(){
	d3.selectAll(".coco").remove();
	var allAxis = (curr_d[0].map(function(i, j){return i.axis}));
	for(var j=0; j<cfg.levels-1; j++){
		var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
		g.selectAll(".levels")
		 .data(allAxis)
		 .enter()
		 .append("line")
		 .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
		 .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
		 .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
		 .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
		 .attr("class", "coco")
		 .style("stroke", "white") //grey
					 .style("opacity", "1")
		 .style("stroke-opacity", "1") //0.75
		 .style("stroke-width", "0.3") //0.3
		 .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
	}
	d3.selectAll(".caxis").remove();
	var axis = g.selectAll(".axis")
			.data(allAxis)
			.enter()
			.append("g")
			.attr("class", "caxis");

	axis.append("line")
		.attr("x1", cfg.w/2)
		.attr("y1", cfg.h/2)
		.attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
		.attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
		.attr("class", "kaka")
						.style("stroke", "white") //grey
						.style("opacity", "1")
		 .style("stroke-opacity", "1")
		.style("stroke-width", "1px");

		axis.append("text")
			.attr("class", "legend-text")
			.text(function(d){return d})
			.attr("text-anchor", "middle")
			.attr("dy", "1.5em")
			.attr("transform", function(d, i){return "translate(0, -10)"})
			.attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total);})
			.attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);});


	//Data
	var new_d = [
			  [
				{axis:"Asian",value:dic_democratic["Asian"]},
				{axis:"Black",value:dic_democratic["Black"]},
				{axis:"Hispanic",value:dic_democratic["Hispanic"]},
				{axis:"White",value:dic_democratic["White"]},
			  ],[
				{axis:"Asian",value:dic_republican["Asian"]},
				{axis:"Black",value:dic_republican["Black"]},
				{axis:"Hispanic",value:dic_republican["Hispanic"]},
				{axis:"White",value:dic_republican["White"]},
			  ]
			];

	curr_d = new_d;

	//Options for the Radar chart, other than default
	var mycfg = {
	  w: 300,
	  h: 300,
	  maxValue: 1,
	  levels: 3,
	}
	var democratic_values = [], republican_values = [];
	var flag = 0;
	//Call function to draw the Radar chart
	//Will expect that data is in %'s
	//RadarChart.draw("#starplot", new_d, mycfg, false);

	var dataValues = [];
	new_d.forEach(function(y, x){
		if (dataValues.length > 0){
			flag++;
			democratic_points = dataValues;
		}
	  dataValues = [];
	  g.selectAll(".nodes")
		.data(y, function(j, i){
			if (flag === 0){
				democratic_values.push(j.value);
			}
			else
				republican_values.push(j.value);
		  dataValues.push([
				mycfg.w/2*(1-(parseFloat(getLogScale(j.value)))*cfg.factor*Math.sin(i*cfg.radians/total)),
				mycfg.h/2*(1-(parseFloat(getLogScale(j.value)))*cfg.factor*Math.cos(i*cfg.radians/total))
		  ]);
		});
	});
	republican_points = dataValues;

	var strDemocrats="";
	for(var pti = 0; pti < democratic_points.length; pti++){
		strDemocrats = strDemocrats + democratic_points[pti][0] + "," + democratic_points[pti][1] + " ";
	}

	var strRepublicans="";
	for(var pti = 0; pti < republican_points.length; pti++){
		strRepublicans = strRepublicans + republican_points[pti][0] + "," + republican_points[pti][1] + " ";
	}

	d3.select("#gg").select("polygon.radar-chart-serie0")
	.transition()
	.duration(animTime)
	.attr("points", strDemocrats);

	d3.select("#gg").select("polygon.radar-chart-serie1")
	.transition()
	.duration(animTime)
	.attr("points", strRepublicans);

	d3.select("#gg").selectAll("circle.radar-chart-serie0")
	.transition()
	.duration(animTime)
	.attr("alt", function(d,i){return democratic_values[i];})
	.attr("cx",function(d,i){ return democratic_points[i][0];})
	.attr("cy", function(d,i){ return democratic_points[i][1];});
	d3.select("#gg").selectAll("circle.radar-chart-serie0").on("mouseover", function(d, i) {
					tooltipAux.transition()
							.duration(200)
							.style("opacity", .9);
					tooltipAux.html("" + (democratic_values[i] * 100).toFixed(2) + "% " + d.axis + " Nominees with <br> Democratic political party in power") //party + ": " + (d.value * 100).toFixed(2) + "%"
							.style("left", (d3.event.pageX) + "px")
							.style("top", (d3.event.pageY - 28) + "px");
					})

	d3.select("#gg").selectAll("circle.radar-chart-serie1")
	.transition()
	.duration(animTime)
	.attr("cx",function(d,i){ return republican_points[i][0];})
	.attr("cy", function(d,i){ return republican_points[i][1];});
	d3.select("#gg").selectAll("circle.radar-chart-serie1").on("mouseover", function(d, i) {
					tooltipAux.transition()
							.duration(200)
							.style("opacity", .9);
					tooltipAux.html("" + (republican_values[i] * 100).toFixed(2) + "% " + d.axis + " Nominees with <br> Republican political party in power") //party + ": " + (d.value * 100).toFixed(2) + "%"
							.style("left", (d3.event.pageX) + "px")
							.style("top", (d3.event.pageY - 28) + "px");
					})



}

function starPlot() {



	//Data
	var d = [
			  [
				{axis:"Asian",value:dic_democratic["Asian"]},
				{axis:"Black",value:dic_democratic["Black"]},
				{axis:"Hispanic",value:dic_democratic["Hispanic"]},
				{axis:"White",value:dic_democratic["White"]},
			  ],[
				{axis:"Asian",value:dic_republican["Asian"]},
				{axis:"Black",value:dic_republican["Black"]},
				{axis:"Hispanic",value:dic_republican["Hispanic"]},
				{axis:"White",value:dic_republican["White"]},
			  ]
			];

	curr_d = d;

	//Options for the Radar chart, other than default
	var mycfg = {
	  w: 300,
	  h: 300,
	  maxValue: 1,
	  levels: 3,
	}

	//Call function to draw the Radar chart
	//Will expect that data is in %'s
	RadarChart.draw("#starplot", d, mycfg, true);

}
// passar de linear scale para log scale
function getLogScale(z){
	var xmin = 0.1, xmax = 100;
	return Math.abs((Math.log(z*100) - Math.log(xmin)) / (Math.log(xmin) - Math.log(xmax)));
}

function getPartyColor(d){
	return partyColor[d];
}

function updateParty(party, fromControls){
	d3.selectAll(".coco").remove();
	var allAxis = (curr_d[0].map(function(i, j){return i.axis}));
	for(var j=0; j<cfg.levels-1; j++){
		var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
		g.selectAll(".levels")
		 .data(allAxis)
		 .enter()
		 .append("line")
		 .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
		 .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
		 .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
		 .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
		 .attr("class", "coco")
		 .style("stroke", "white") //grey
					 .style("opacity", "1")
		 .style("stroke-opacity", "1") //0.75
		 .style("stroke-width", "0.3") //0.3
		 .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
	}
	d3.selectAll(".caxis").remove();
	var axis = g.selectAll(".axis")
			.data(allAxis)
			.enter()
			.append("g")
			.attr("class", "caxis");

	axis.append("line")
		.attr("x1", cfg.w/2)
		.attr("y1", cfg.h/2)
		.attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
		.attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
		.attr("class", "kaka")
						.style("stroke", "white") //grey
						.style("opacity", "1")
		 .style("stroke-opacity", "1")
		.style("stroke-width", "1px");

		axis.append("text")
			.attr("class", "legend-text")
			.text(function(d){return d})
			.attr("text-anchor", "middle")
			.attr("dy", "1.5em")
			.attr("transform", function(d, i){return "translate(0, -10)"})
			.attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total);})
			.attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);});



	var partyNotSelected = "";
	if (party.length === 1 && party.includes("Democratic")){
		selectedParty = ["Democratic"];
		partyNotSelected = "Republican";
		if (!fromControls){
			dispatchParty.call("partyEvent", selectedParty, selectedParty);
			dispatchPartyControls.call("PartyControlsEvent", selectedParty, selectedParty);
			dispatchControlsParty.call("ControlsPartyEvent", selectedParty, selectedParty);
		}
		g.selectAll("polygon.radar-chart-serie1")
		.transition()
		.duration(animTime)
		 .style("opacity",0);
		 var c1 = g.selectAll("circle.radar-chart-serie1");
		 c1.transition()
		.duration(animTime)
			.style("opacity",0);
			//c1.on("mouseover", function(d){console.log("mouse")});
		g.selectAll("polygon.radar-chart-serie0")
		.transition()
		.duration(animTime)
		 .style("opacity",1);
		 var c2 = g.selectAll("circle.radar-chart-serie0");
		 c2.transition()
		.duration(animTime)
			.style("opacity",1);
			// c2.on("mouseover", function(d, i) {
			// 				tooltipAux.transition()
			// 						.duration(200)
			// 						.style("opacity", .9);
			// 				tooltipAux.html("" + (d.value * 100).toFixed(2) + "% " + d.axis + " Nominees with <br> Democratic political party in power") //party + ": " + (d.value * 100).toFixed(2) + "%"
			// 						.style("left", (d3.event.pageX) + "px")
			// 						.style("top", (d3.event.pageY - 28) + "px");
			// 				})


	}
	if (party.length === 1 && party.includes("Republican")){
		selectedParty = ["Republican"];
		partyNotSelected = "Democratic";
		if (!fromControls){
			dispatchParty.call("partyEvent", selectedParty, selectedParty);
			dispatchPartyControls.call("PartyControlsEvent", selectedParty, selectedParty);
			dispatchControlsParty.call("ControlsPartyEvent", selectedParty, selectedParty);
		}
		g.selectAll("polygon.radar-chart-serie0")
		.transition()
		.duration(animTime)
		 .style("opacity",0);
		 var c3 = g.selectAll("circle.radar-chart-serie0");
		 c3.transition()
		.duration(animTime)
			.style("opacity",0);
			//c3.on("mouseover",function(d){console.log("mouse")});
		g.selectAll("polygon.radar-chart-serie1")
		.transition()
		.duration(animTime)
		 .style("opacity",1);
		 var c4 = g.selectAll("circle.radar-chart-serie1");
		 c4.transition()
		.duration(animTime)
			.style("opacity",1);
			// c4.on("mouseover", function(d, i) {
			// 				tooltipAux.transition()
			// 						.duration(200)
			// 						.style("opacity", .9);
			// 				tooltipAux.html("" + (d.value * 100).toFixed(2) + "% " + d.axis + " Nominees with <br> Republican political party in power") //party + ": " + (d.value * 100).toFixed(2) + "%"
			// 						.style("left", (d3.event.pageX) + "px")
			// 						.style("top", (d3.event.pageY - 28) + "px");
			// 				});

	}
	if (party.length === 2){
		selectedParty = ["Democratic", "Republican"];
		if (!fromControls){
			dispatchParty.call("partyEvent", selectedParty, selectedParty);
			dispatchPartyControls.call("PartyControlsEvent", selectedParty, selectedParty);
			dispatchControlsParty.call("ControlsPartyEvent", selectedParty, selectedParty);
		}
		g.selectAll("polygon.radar-chart-serie0")
		.transition()
		.duration(animTime)
		 .style("opacity",1);
		 var c5 = g.selectAll("circle.radar-chart-serie0");
		 c5.transition()
		.duration(animTime)
			.style("opacity",1);
			// c5.on("mouseover", function(d, i) {
			// 				tooltipAux.transition()
			// 						.duration(200)
			// 						.style("opacity", .9);
			// 				tooltipAux.html("" + (d.value * 100).toFixed(2) + "% " + d.axis + " Nominees with <br> Democratic political party in power") //party + ": " + (d.value * 100).toFixed(2) + "%"
			// 						.style("left", (d3.event.pageX) + "px")
			// 						.style("top", (d3.event.pageY - 28) + "px");
			// 				});
		g.selectAll("polygon.radar-chart-serie1")
		.transition()
		.duration(animTime)
		 .style("opacity",1);
		 var c6 = g.selectAll("circle.radar-chart-serie1");
		 c6.transition()
		.duration(animTime)
			.style("opacity",1);
			// c6.on("mouseover", function(d, i) {
			// 				tooltipAux.transition()
			// 						.duration(200)
			// 						.style("opacity", .9);
			// 				tooltipAux.html("" + (d.value * 100).toFixed(2) + "% " + d.axis + " Nominees with <br> Republican political party in power") //party + ": " + (d.value * 100).toFixed(2) + "%"
			// 						.style("left", (d3.event.pageX) + "px")
			// 						.style("top", (d3.event.pageY - 28) + "px");
			// 				});
	}
	//update the legends square
  if(partyNotSelected !== ""){
      legend.selectAll(".legend-square." + partyNotSelected)
          .transition()
          .style("fill", "#ffffff")
          .duration(animTime);
  }


  //update the legends square
  selectedParty.forEach( function(party, index){
      legend.selectAll(".legend-square." + party)
          .transition()
          .style("fill", partyColor[party])
          .duration(animTime);
  });


}


    //Practically all this code comes from https://github.com/alangrafu/radar-chart-d3
//I only made some additions and aesthetic adjustments to make the chart look better
//(of course, that is only my point of view)
//Such as a better placement of the titles at each line end,
//adding numbers that reflect what each circular level stands for
//Not placing the last level and slight differences in color
//
//For a bit of extra information check the blog about it:
//http://nbremer.blogspot.nl/2013/09/making-d3-radar-chart-look-bit-better.html


var RadarChart = {
  draw: function(id, d, options, firstTime){
		var series = 0;
		//if (firstTime){
			cfg = {
			 radius: 5,
			 w: 600,
			 h: 600,
			 factor: 1,
			 factorLegend: .85,
			 levels: 3,
			 maxValue: 100,
			 radians: 2 * Math.PI,
			 opacityArea: 0.5,
			 ToRight: 5,
			 TranslateX: 80,
			 TranslateY: 50, //30,
			 ExtraWidthX: 100,
			 ExtraWidthY: 100,
			};

			if('undefined' !== typeof options){
			  for(var i in options){
				if('undefined' !== typeof options[i]){
				  cfg[i] = options[i];
				}
			  }
			}
			//cfg.maxValue = 100;
			//cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
			var allAxis = (d[0].map(function(i, j){return i.axis}));
			total = allAxis.length;
			 radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
			 Format = d3.format('~%');
			d3.select(id).select("svg").remove();

			g = d3.select(id)
					.append("svg")
					.attr("width", 500)
					.attr("height", 400)
					.attr("id", "gg")
					.append("g")
					.attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
					;

					//Create the title for the legend
					var text = g.append("text")
						.attr("class", "title")
						.attr('transform', 'translate(90,0)')
						.attr("x", w - 70)
						.attr("y", 10)
						.attr("font-size", "12px")
						.attr("fill", "#404040")
						.text("What % of owners use a specific service in a week");

						//Legend
					   legend = g.selectAll(".legend")
					        .data(parties)
					        .enter().append("g")
					        .attr("class", "legend")
					        .attr("transform", function(d,i) { return "translate(-125," + i * 20 + ")"; })
					        .style("opacity","1");

					    //create a square with color
					    legend.append("rect")
					        .attr("class", function(party) {
					            return "legend-square " + party + " " + "interactable";
					        })
					        .attr("x", w - 150)
					        .style("fill", function(party) {
					            return partyColor[party];
					        })
					        .attr("stroke", function(party) {
					            return partyColor[party];
					        })
									.on("click", function(party){
                                        if(blocked === false){
                                            if (selectedParty.length === 2){
                                                if (party === "Democratic")
                                                    updateParty(["Republican"], false);
                                                if (party === "Republican")
                                                        updateParty(["Democratic"], false)
                                            }
                                            else{
                                                if (party.includes("Democratic")){
                                                    if (selectedParty.includes("Democratic")){
                                                        updateParty(["Republican"], false);
                                                    }
                                                    else{
                                                        updateParty(["Democratic", "Republican"], false);
                                                    }
                                                }
                                                else if (party.includes("Republican")){
                                                    if (selectedParty.includes("Republican")){
                                                        updateParty(["Democratic"], false);
                                                    }
                                                    else{
                                                        updateParty(["Democratic", "Republican"], false);
                                                    }
                                                }
                                            }
                                        }
									})

					    //add text
					    legend.append("text")
					        .attr("class", "legend-text")
					        .attr("x", w - 130)
					        .attr("y", 8)
					        //.attr("font-family", "sans-serif")
					        //.attr("font-size", 12)
					        .attr("dy", ".35em")
					        //.style("text-anchor", "end")
					        .text(function(d) {
					            return d;
					        });


			var tooltip;
			var customScale = [0.01, 0.1, 1]
			//Circular segments
			for(var j=0; j<cfg.levels-1; j++){
				var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
			  g.selectAll(".levels")
			   .data(allAxis)
			   .enter()
			   .append("line")
			   .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
			   .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
			   .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
			   .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
			   .attr("class", "coco")
			   .style("stroke", "white") //grey
               .style("opacity", "1")
			   .style("stroke-opacity", "1") //0.75
			   .style("stroke-width", "0.3") //0.3
			   .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
			}

			//Text indicating at what % each level is
			for(var j=0; j<cfg.levels; j++){
			  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
				  g.selectAll(".levels")
				   .data([1]) //dummy data
				   .enter()
				   .append("svg:text")
				   .attr("x", function(d){
						 return levelFactor*(1-cfg.factor*Math.sin(0));})
				   .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
				   .attr("class", "starplotlegend")
					 .attr("class", "legend-text")
				   .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
				   //.text(Format((j+1)*cfg.maxValue/cfg.levels));

					 .text(Format(customScale[j]));
			}

			series = 0;

			var axis = g.selectAll(".axis")
					.data(allAxis)
					.enter()
					.append("g")
					.attr("class", "caxis");

			axis.append("line")
				.attr("x1", cfg.w/2)
				.attr("y1", cfg.h/2)
				.attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
				.attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
				.attr("class", "kaka")
                .style("stroke", "white") //grey
                .style("opacity", "1")
			   .style("stroke-opacity", "1")
				.style("stroke-width", "1px");

			axis.append("text")
				.attr("class", "legend-text")
				.text(function(d){return d})
				.attr("text-anchor", "middle")
				.attr("dy", "1.5em")
				.attr("transform", function(d, i){return "translate(0, -10)"})
				.attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total);})
				.attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);});
		//}


	var dataValues = [];
	var index = 0;
	var z;
	d.forEach(function(y, x){
		if (dataValues.length > 0){
			democratic_points = dataValues;
		}
	  dataValues = [];
	  g.selectAll(".nodes")
		.data(y, function(j, i){
		  dataValues.push([
				cfg.w/2*(1-(parseFloat(getLogScale(j.value)))*cfg.factor*Math.sin(i*cfg.radians/total)),
				cfg.h/2*(1-(parseFloat(getLogScale(j.value)))*cfg.factor*Math.cos(i*cfg.radians/total))
		  ]);
		});
	  //dataValues.push(dataValues[0]);
	  g.selectAll(".area")
					 .data([dataValues])
					 .enter()
					 .append("polygon")
					 .attr("class", "radar-chart-serie"+series)
					 .style("stroke-width", "2px")
					 .style("stroke", partyColor[parties[series]])
					 .attr("points",function(d) {
						 var str="";
						 for(var pti=0;pti<d.length;pti++){
							 str=str+d[pti][0]+","+d[pti][1]+" ";
						 }
						 return str;
					  })
					 .style("fill", function(j, i){ return partyColor[parties[series]]})
					 .style("fill-opacity", 0)
					 /*.on('mouseover', function (d){
										var z = "polygon."+d3.select(this).attr("class");
										g.selectAll("polygon")
										 .transition(200)
										 .style("fill-opacity", 0.1);
										g.selectAll(z)
										 .transition(200)
										 .style("fill-opacity", .7);
									  })
					 .on('mouseout', function(){
										g.selectAll("polygon")
										 .transition(200)
										 .style("fill-opacity", cfg.opacityArea);
					 })
					 .on("click", function(){
                        console.log("1")
                        if(blocked === false){
                            console.log("2")
                            // democratic
						 if (d3.select(this).attr("class") === "radar-chart-serie0" && !(selectedParty.length === 1 && selectedParty[0] === "Democratic")){
							 updateParty(["Democratic"], false);
							 }
						 // republican
						 else if (d3.select(this).attr("class") === "radar-chart-serie1" && !(selectedParty.length === 1 && selectedParty[0] === "Republican")){
							updateParty(["Republican"], false);
						 }
                        }

					 });*/
	  series++;
	});
	republican_points = dataValues;
	series=0;
	var party;

	d.forEach(function(y, x){
	  g.selectAll(".nodes")
		.data(y).enter()
		.append("svg:circle")
		.attr("class", "radar-chart-serie"+series)
		.attr('r', cfg.radius)
		.attr("alt", function(j){return Math.max(j.value, 0)})
		.attr("cx", function(j, i){
			return cfg.w/2*(1-(getLogScale(j.value))*cfg.factor*Math.sin(i*cfg.radians/total));
		})
		.attr("cy", function(j, i){
		  return cfg.h/2*(1-(getLogScale(j.value))*cfg.factor*Math.cos(i*cfg.radians/total));
		})
		.attr("data-id", function(j){return j.axis})
		.style("fill", partyColor[parties[series]]).style("fill-opacity", .9)
		.on("mouseover", function(d) {
            tooltipAux.transition()
                .duration(200)
                .style("opacity", .9);
						if (d3.select(this).attr("class") === "radar-chart-serie0")
							party = "Democratic";
						else if (d3.select(this).attr("class") === "radar-chart-serie1")
							party = "Republican";
            let partyAux = this.className.baseVal === "radar-chart-serie0"? "Democratic" : "Republican" ;
            tooltipAux.html("" + (d.value * 100).toFixed(2) + "% " + d.axis + " Nominees with <br> " +  partyAux + " political party in power") //party + ": " + (d.value * 100).toFixed(2) + "%"
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
						/*var z = "polygon."+d3.select(this).attr("class");
						g.selectAll("polygon")
							.transition(200)
							.style("fill-opacity", 0.1);
						g.selectAll(z)
							.transition(200)
							.style("fill-opacity", .7);*/
            })
        .on("mouseout", function(d) {
            tooltipAux.transition()
                .duration(500)
                .style("opacity", 0);
						/*g.selectAll("polygon")
							.transition(200)
							.style("fill-opacity", cfg.opacityArea);*/
        })

	  series++;
	});
	//Tooltip
	tooltip = g.append('text')
			   .style('opacity', 0)
			   .style('font-family', 'sans-serif')
			   .style('font-size', '13px');
  }
};
