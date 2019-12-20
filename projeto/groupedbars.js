import { partyColor } from "./main.js";
import  { animTime } from "./main.js";
import  { years } from "./main.js";
import  { tooltipAux } from "./main.js";
//events
import { dispatchBlock } from "./main.js";
import { dispatchParty } from "./main.js";
import { dispatchPartyControls } from "./main.js";
import { dispatchControlsParty } from "./main.js";
import { dispatchControlsCategory } from "./main.js";
import { dispatchControlsYears } from "./main.js"; //year -> grouped bars
import { dispatchControlsEthnicity } from "./main.js";
import { dispatchEhtnicityLinechart } from "./main.js";

var full_dataset; // all the csv file;

// Array with party selected
var selectedParty = ["Democratic", "Republican"];
// Array with category selected
var selectedCategory = ["Winners", "Nominees"];
// Array with ethnicity selected
var selectedEthnicity = ["Black", "Asian", "Hispanic", "White"];
//Array with interval of years
var selectedYears = [...years]; // ES6 way to copy arrays.

//var selectedParty = ["Democratic", "Republican"];
var aux_party = null;

//https://codepen.io/AmeliaBR/pen/kFDvH

const defaultKeys = ["Bisexual","Gay","Lesbian","Straight"];
const defaultCategories = ["Democratic", "Republican"];

//obj that will have the values to fill the grouped bar chart
var defaultObj = [
    { "orientation": "Straight", "Democratic": 0, "Republican": 0 },{ "orientation": "Bisexual", "Democratic": 0, "Republican": 0 },
    { "orientation": "Gay", "Democratic": 0, "Republican": 0 },
    { "orientation": "Lesbian", "Democratic": 0, "Republican": 0 }
];

var svg, orientation, xScale0, xScale1, yScale, xAxis, yAxis, legend;
var container = d3.select('#groupedbars'),
        width = d3.select('#groupedbars').node().getBoundingClientRect().width,
        height = d3.select('#groupedbars').node().getBoundingClientRect().height - 19.5, //title size
        margin = { top: 30, right: 20, bottom: 30, left: 50 },
        barPadding = 0.2,
        axisTicks = { qty: 5, outerSize: 0, dateFormat: '%m-%d' };

var total = {
    "Democratic": 0, 
    "Republican": 0
}

//load data and call func to generate the bar
//datasets/groupedbars.csv
d3.csv("datasets/groupedbarswithethnicity.csv").then(function (data) {
    full_dataset = data; 
    
    groupedBars();
});

dispatchControlsParty.on("ControlsPartyEvent.groupedbars", function(partysSelected){
    // should never happend but if happend is okay
    if(partysSelected === selectedParty){
        //dont do shit beaceusa everthing is equal
    }
    else{
        selectedParty = partysSelected;
        if(partysSelected.length === 1){
            update( selectedParty, 
                   selectedParty[0] === "Democratic" ? "Republican" : "Democratic", "controls");
        }
        else{
            update( selectedParty, "", "controls");
        }
    }
});

dispatchControlsEthnicity.on("ControlsEthnicityEvent.groupedbars", function(ethnicitysSelected){
    //console.log("ControlsEthnicity", ethnicitysSelected)
    
    selectedEthnicity = ethnicitysSelected
        
    makeObjByData();
    
    block_bug_fix();
    
    updateValues();
});


dispatchControlsCategory.on("ControlsCategoryEvent.groupedbars", function(categorysSelected){
    selectedCategory = categorysSelected;
    

    makeObjByData();
    
    block_bug_fix();
    
    updateValues();
});

dispatchControlsYears.on("ControlsYearsEvent.groupedbars", function(yearsSelected){
    selectedYears = yearsSelected;
    
    //console.log(selectedYears);
    makeObjByData();
    
    updateValues();
});

function groupedBars() {
    var padding = 30;    
    
    makeObjByData();
    
    svg = container
       .append("svg")
       .attr("width", width)
       .attr("height", height)
       .append("g")
       .attr("transform", `translate(${margin.left},${margin.top})`);
    
    //The scale spacing the groups:
    xScale0 = d3.scaleBand().range([0, width - margin.left - margin.right]).padding(barPadding);
    
    // The scale for spacing each group's bar:
    xScale1 = d3.scaleBand().padding(0.02);
    yScale = d3.scaleLog().range([height - margin.top - margin.bottom, 0]);

    xAxis = d3.axisBottom(xScale0).tickSizeOuter(axisTicks.outerSize);
    yAxis = d3.axisLeft(yScale).scale(yScale).ticks(10, d3.format('.0r')); //grouped thousands with two significant digits

    xScale0.domain(defaultObj.map(d => d.orientation));
    xScale1.domain(['Democratic', 'Republican']).range([0, xScale0.bandwidth()]);
    yScale.domain([1, d3.max(defaultObj, d => d.Democratic > d.Republican ? d.Democratic : d.Republican)]);
    
    
    orientation = svg.selectAll(".orientation")
      .data(defaultObj)
      .enter().append("g")
      .attr("class", "orientation")
      .attr("transform", d => `translate(${xScale0(d.orientation)},0)`);
    
    selectedParty.forEach( function(party, index){
        orientation.selectAll(".bar." + party)
        .data(d =>[d])
        .enter().append("rect")
        //bind the partyEvent to the square
        .on("click", function(d){  // partyEvent on mouse click
            if(selectedParty.length === 2){
                if(total.Democratic === 0 || total.Republican === 0){
                    console.log("oioioi")
                }
                else{
                  //update my graph
                    update(party, 
                       index === (selectedParty.length - 1) ? selectedParty[index - 1] : selectedParty[index + 1]);  
                }
                
            }
            else{ // === 1
                if(party !== selectedParty[0]){
                    //update my graph
                    update(party, 
                       index === (selectedParty.length - 1) ? selectedParty[index - 1] : selectedParty[index + 1]);
                }
            }
            
        })
        //adding a title for each bar 
        .on("mouseover", function(d) {		
            tooltipAux.transition()		
                .duration(200)		
                .style("opacity", .9);		 
            tooltipAux.html("" + d[party] + " Nominees with " + party + "<br>political party in power")	//party + ": " + d[party]
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            tooltipAux.transition()		
                .duration(500)		
                .style("opacity", 0);	
        })
        .attr("class", "bar " + party + " interactable")
        .style("fill", partyColor[party]) //blue
        .attr("x", d => xScale1(party))
        .attr("y", d => yScale(d[party]))
        .attr("width", xScale1.bandwidth())
        .attr("height", d => {
          return height - margin.top - margin.bottom - yScale(d[party])
        })
        //adding a title for each bar 
        /*.append("title")
        .text(function (d){
            return party + ": " + d[party];
        });*/
    });
    
    // XX axis
    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
       .call(xAxis);
       

    // YY axis
    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis);
    
    //XX axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "end")
        .attr("x", width - margin.bottom - 20)
        .attr("y", height - margin.top ) //360
        .text("Sexual Orientation");
    
    //YY axis label
     svg.append("text")
          .attr("class", "axis-label")
          .attr("text-anchor", "end")
          //.attr("transform", "rotate(-90)")
          .attr("y", margin.left - 60)
          .attr("x", margin.top )
          .text("Nominees");
    
    //Legend
    legend = svg.selectAll(".legend")
        .data(defaultCategories)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
        .style("opacity","1");
    
    //create a square with color
    legend.append("rect")
        .attr("class", function(party) {
            return "legend-square " + party + " " + "interactable";  
        })
        .attr("x", width - 150)
        .style("fill", function(party) {
            return partyColor[party]; 
        })
        .attr("stroke", function(party) {
            return partyColor[party]; 
        })
        //.attr("stroke-width",2)
        .on("click", function(party){  //on mouse click
            if(total.Democratic === 0 || total.Republican === 0){
                console.log("oioioi legenda")
            }
            else{
                if(party !== aux_party){
                   update( ((party === "Democratic") ? "Republican" : "Democratic"), party, "legend"); 
                }
                else if(selectedParty.length == 1){
                    update( ((party === "Democratic") ? "Republican" : "Democratic"), party, "legend");
                }
                else{ //selectedParty == 2
                    aux_party = null;
                    update( ((party === "Democratic") ? "Republican" : "Democratic"), party, "legend");
                } 
            }
            
        });
    
    //add text
    legend.append("text")
        .attr("class", "legend-text")
        .attr("x", width - 130)
        .attr("y", 8)
        //.attr("font-family", "sans-serif")
        //.attr("font-size", 12)
        .attr("dy", ".35em")
        //.style("text-anchor", "end")
        .text(function(d) {
            return d; 
        });
    
    //add a title idiom
    var title = svg.selectAll(".title")
        .data([1])
        .enter().append("g")
        .attr("class", "idiom-title");
    
    /*title.append("text")
        .attr("transform", `translate(${50}, -10)`)
        .text("Political Parties Impact On Sexual Orientation");*/
    
    
}


function makeObjByData(){
    total.Democratic = 0;
    total.Republican = 0;
    
    resetObj();

    // each key with ratio
    full_dataset.forEach(function(d) {
        /*
        *TO DO => check is value we want
        */
        
        // Fill the defaultObj with values from dataset. go to orientatin -> party -> and plus the ratio value. 
        
        defaultObj.forEach(function (e) {
            //console.log(e);
            if (e.orientation === (d.orientation).trim()) {
                if (selectedParty.includes(d.party) && selectedEthnicity.includes(d.ethnicity)) {
                    if(selectedCategory.includes("Winners") && selectedCategory.includes("Nominees")){
                        if(d.winner === "2"
                            && selectedYears[0] <= parseInt(d.year) && parseInt(d.year) <= selectedYears[1]) {
                            //console.log(2);
                            e[d.party] += parseInt(d.ratio); // Winners + nominees
                            total[d.party] += parseInt(d.ratio)
                        }
                    }
                    else if(selectedCategory.includes("Winners")){
                        if(d.winner === "1"  && selectedYears[0] <= parseInt(d.year) && parseInt(d.year) <= selectedYears[1]){
                            //console.log(1);
                            e[d.party] += parseInt(d.ratio); // winners
                            total[d.party] += parseInt(d.ratio)
                        }
                    }
                    else if(selectedCategory.includes("Nominees")){
                        if(d.winner === "0"  && selectedYears[0] <= parseInt(d.year) && parseInt(d.year) <= selectedYears[1]){
                            //console.log(0);
                            e[d.party] += parseInt(d.ratio); // winners
                            total[d.party] += parseInt(d.ratio)
                        }
                    }
                    else{
                        console.warn ("Grouped bars makeObjByData something happend");
                    }
                    //console.log((selectedParty.includes(d.party)))
                    
                }
            }
            
        })
    });
    //console.log(selectedCategory);
    //console.log(deafultObj);

    //console.log(total)
}

function resetObj(){
     defaultObj.forEach(function (e) {
         e.Democratic = 0;
         e.Republican = 0;
     });      
}

function update(partySelected, partyNotSelected, type) {
    //console.log(partySelected, partyNotSelected);    
    if(type === "legend" && aux_party ===  partyNotSelected){
        selectedParty = [partySelected, partyNotSelected];
        partyNotSelected = null;
    }
    else if(type === "legend" && partyNotSelected === null){
        partyNotSelected = aux_party;
    }
    else if(type === undefined){
        selectedParty = [partySelected];
        partyNotSelected = (partySelected === "Democratic" ? "Republican" : "Democratic");
        aux_party = partyNotSelected;
    }
    else if(type === "controls" && partySelected.length === 2){
        selectedParty = partySelected; //its already come in list
        partyNotSelected = null;
    }
    else if(type === "controls" && partySelected.length === 1){
        selectedParty = partySelected; //its already come in list
    }
    else{
        selectedParty = [partySelected];
        aux_party = partyNotSelected;
    }
    
    //console.log(selectedParty);
    //call dispatch to update other graphs
    dispatchParty.call("partyEvent", selectedParty, selectedParty);
    if(type !== "controls"){
        dispatchPartyControls.call("PartyControlsEvent", selectedParty, selectedParty);
    }

    //console.log(partySelected, partyNotSelected, selectedParty, aux_party, type);

    //update xScale
    xScale1.domain(selectedParty).rangeRound([0, xScale0.bandwidth()]);

    //update yy axis
    yScale.domain([1, d3.max(defaultObj, function(d) {

        if(selectedParty.length == 2){
            return d.Democratic > d.Republican ? d.Democratic : d.Republican;
        }
        else{
           return d[selectedParty[0]] 
        }
    })]);
    svg.select(".y")
        .transition()
        .call(yAxis)
        .duration(animTime);

    //hide the other bars
    if(partyNotSelected !== "" && partyNotSelected !== null){
        svg.selectAll(".bar." + partyNotSelected)
        .transition()
        .attr("height",0)
        .attr("width",0)     
        .attr("y", function(d) {
            return height - margin.top - margin.bottom;
        })
        .duration(animTime);
    }


    //edit width of the other bars
    selectedParty.forEach( function(party, index){
        orientation.selectAll(".bar." + party)
        .transition()
        .attr("class", function(d) {
            var class_str = "bar " + party;
            if(total.Democratic === 0 || total.Republican === 0 || selectedParty.length === 1){
                return class_str;
            }
            else{
                return class_str + " " + "interactable";
            }
        })
        .attr("x", d => xScale1(party))
        .attr("y", d => {
            if(isNaN(yScale(d[party])) === true || yScale(d[party]) === Infinity){
                //console.log("entrei", yScale(d[party]))
                return height - margin.top - margin.bottom; //0;
            }
            else{
                return yScale(d[party]);
            }
        })
        .attr("width", xScale1.bandwidth())
        .attr("height", d => { 
            var h = height - margin.top - margin.bottom - yScale(d[party]);
            
            if(isNaN(h) === true || h === -Infinity){
                //console.log("entrei", h)
                return 0; //0;
            }
            else{
                return h;
            }
        })
        //.attr("fill", "#0000ff")
        .duration(animTime);
    });

    //update the legends square
    if(partyNotSelected !== "" && partyNotSelected !== null){
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
            /*.attr("class", function(d) {
                var class_str = "legend-square " + party;
                if(total.Democratic === 0 || total.Republican === 0){
                    return class_str;
                }
                else{
                    return class_str + " " + "interactable";
                }
            })*/
            .duration(animTime);
    });


}

function updateValues(){
    
    //update xScale
    xScale1.domain(selectedParty).rangeRound([0, xScale0.bandwidth()]);

    //update yy axis
    yScale.domain([1, d3.max(defaultObj, function(d) {

        if(selectedParty.length == 2){
            return d.Democratic > d.Republican ? d.Democratic : d.Republican;
        }
        else{
           return d[selectedParty[0]] 
        }
    })]);
    svg.select(".y")
        .transition()
        .call(yAxis)
        .duration(animTime);
    
    selectedParty.forEach( function(party, index){
        orientation.selectAll(".bar." + party)
        //.data(d =>[d])
        .transition()
        .attr("class", function(d) {
            var class_str = "bar " + party;
            if(total.Democratic === 0 || total.Republican === 0 || selectedParty.length === 1){
                return class_str;
            }
            else{
                return class_str + " " + "interactable";
            }
        })
        .attr("x", d => xScale1(party))
        .attr("y", function(d) {
            if(isNaN(yScale(d[party])) === true || yScale(d[party]) === Infinity){
                //console.log("entrei", yScale(d[party]))
                return height - margin.top - margin.bottom; //0;
            }
            else{
                return yScale(d[party]);
            }
        })
        .attr("width", xScale1.bandwidth())
        .attr("height", d => {
            
            var h = height - margin.top - margin.bottom - yScale(d[party]);
            
            if(isNaN(h) === true || h === -Infinity){
                //console.log("entrei", h)
                return 0; //0;
            }
            else{
                return h;
            }
        })
        .select("title")
        .text(function(d) { 
            return party + ": " + d[party];
        })
        .duration(animTime);
    });
    
    
    //update the legends square
    selectedParty.forEach( function(party, index){
        legend.selectAll(".legend-square." + party)
            .transition()
            .style("fill", partyColor[party])
            .attr("class", function(d) {
                var class_str = "legend-square " + party;
                if(total.Democratic === 0 || total.Republican === 0){
                    return class_str;
                }
                else{
                    return class_str + " " + "interactable";
                }
            })
            .duration(animTime);
    });
}


function block_bug_fix(){
    console.log(total.Democratic,  verifyOtherFilters(), total.Republican)
    if(verifyOtherFilters() === true){
        dispatchBlock.call("partyBlockEvent", false, false);
    }
    else if(total.Democratic === 0 && verifyOtherFilters() === false || 
       total.Republican === 0 && verifyOtherFilters() === false){
        dispatchBlock.call("partyBlockEvent", true, true);
        
    }
    else{
        dispatchBlock.call("partyBlockEvent", false, false);
        
    }
    
    selectedParty.forEach( function(party, index){
            d3.selectAll(".legend-square." + party)
                .attr("class", function(d) {
                    var class_str = "legend-square " + party;
                    if(total.Democratic === 0 && verifyOtherFilters() === false || 
                        total.Republican === 0 && verifyOtherFilters() === false){
                        return class_str;
                    }
                    else{
                        return class_str + " " + "interactable";
                    }
                })
        });
}
    
function verifyOtherFilters(){
    return selectedCategory.includes("Winners") &&
            selectedCategory.includes("Nominees") &&
            selectedEthnicity.includes("Asian") &&
            selectedEthnicity.includes("Black") &&
            selectedEthnicity.includes("Hispanic") &&
            selectedEthnicity.includes("White");
            
}