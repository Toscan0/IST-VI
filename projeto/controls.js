import { partyColor } from "./main.js";
import  { animTime } from "./main.js";
import { dispatchBlock } from "./main.js";
import { dispatchPartyControls } from "./main.js"; // grouped bars (party) -> party (checkbox)
import { dispatchControlsParty } from "./main.js"; // party -> grouped bars
import { dispatchControlsCategory } from "./main.js"; // category -> grouped bars
import { dispatchControlsYears } from "./main.js"; //year -> grouped bars
import { dispatchControlsEthnicity } from "./main.js";
import { dispatchEhtnicityLinechart } from "./main.js";
import { dispatchEhtnicityLinechartAux } from "./main.js";

import { defaultYears } from "./main.js";
var yearsData = defaultYears;

const defaultEthnicity = ["Black", "Asian", "Hispanic", "White"];

var selectedParty = [], selectedCategory = [] , selectedEthnicity = [];
var aux_party, aux_category, aux_ethnicity = [];

var blocked = false;

/* PARTY CHECKBOX */
document.getElementById("Democratic-box")
    .addEventListener ("click", checkParty);

document.getElementById("Republican-box")
    .addEventListener ("click", checkParty);

dispatchBlock.on("partyBlockEvent.controls", function(block_value){
    blocked = block_value;
    
    if(blocked === true){
        document.getElementById("Democratic-box").disabled = true;
        document.getElementById("Republican-box").disabled = true;
    }
    else{
        document.getElementById("Democratic-box").disabled = false;
        document.getElementById("Republican-box").disabled = false;
    }
});


function checkParty(){
        document.getElementById("Republican-box").disabled = false;
        document.getElementById("Democratic-box").disabled = false;
        
        selectedParty = []
        if(document.getElementById("Democratic-box").checked === true){
            selectedParty.push("Democratic");
        }
        if(document.getElementById("Republican-box").checked === true){
            selectedParty.push("Republican");
        }
        aux_party = selectedParty;

        if(document.getElementById("Democratic-box").checked === false
          && document.getElementById("Republican-box").checked === false){
            //console.log("ddd", aux);
            var elm = (aux_party === "Democratic" ? "Republican" : "Democratic")
            document.getElementById( elm + "-box").checked = true;
            selectedParty = [elm];
            aux_party = elm;
        }


        //alet grouped bars to change
        dispatchControlsParty.call("ControlsPartyEvent", selectedParty, selectedParty);

}

//partys changed in grouped bars
dispatchPartyControls.on("PartyControlsEvent", function(partysSelected){
    if(partysSelected.length === 1){
        document.getElementById(partysSelected[0] + "-box").checked = true;
        var other = partysSelected[0] === "Democratic" ? "Republican" : "Democratic";
        document.getElementById(other + "-box").checked = false;
    }
    else{
        document.getElementById(partysSelected[0] + "-box").checked = true;
        document.getElementById(partysSelected[1] + "-box").checked = true;
    }
});

// Range slide
/*d3.csv("datasets/years_controls.csv").then(function (data) {

    data.forEach(function(d){
        yearsData.push(parseInt(d.year));
    })

    console.log(yearsData);
    //slider();
});*/

slider();

function slider(){
    var sliderRange = d3
    .sliderBottom()
    .min(d3.min(yearsData))
    .max(d3.max(yearsData))
    .width(500-25)
    .tickFormat(d3.format(".4r"))
    //.ticks(5)
    .step(1)
    //.tickValues(yearsData)
    .default([yearsData[0], yearsData[yearsData.length - 1]])
    .fill('#2196f3')
    .on('onchange', val => {
        var value_str = val.map(d3.format(".4r")).join('-')
        d3.select('p#value-range').text(value_str);
        dispatchControlsYears.call("ControlsYearsEvent", val, val); //val is a number
    });

    var gRange = d3
        .select('div#slider-range')
        .append('svg')
        .attr('width', 600)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,5)');

    gRange.call(sliderRange);

    d3.select('p#value-range')
        .text(
            sliderRange.value()
            .map(d3.format('.4r'))
            .join('-')
        )
        .attr("class", "slide-values");
}


/* CATEGORY CHECKBOX */
document.getElementById("Winners-box")
    .addEventListener ("click", checkCategory);

document.getElementById("Nominees-box")
    .addEventListener ("click", checkCategory);

function checkCategory(){
    selectedCategory = [];
    if(document.getElementById("Winners-box").checked === true){
        selectedCategory.push("Winners");
    }
    if(document.getElementById("Nominees-box").checked === true){
        selectedCategory.push("Nominees");
    }

    aux_category = selectedCategory;

    if(document.getElementById("Winners-box").checked === false
      && document.getElementById("Nominees-box").checked === false){
        //console.log("ddd", aux);
        var elm = (aux_category === "Winners" ? "Nominees" : "Winners");
        document.getElementById( elm + "-box").checked = true;
        selectedCategory = [elm];
        aux_category = elm;
    }

    //alert grouped bars to change
    dispatchControlsCategory.call("ControlsCategoryEvent", selectedCategory, selectedCategory);
}


/* ETHNICITY CHECKBOX */
document.getElementById("Asian-box")
    .addEventListener ("click", checkEthnicity);

document.getElementById("Black-box")
    .addEventListener ("click", checkEthnicity);

document.getElementById("Hispanic-box")
    .addEventListener ("click", checkEthnicity);

document.getElementById("White-box")
    .addEventListener ("click", checkEthnicity);

function checkEthnicity(){
    selectedEthnicity = [];

    if(document.getElementById("Asian-box").checked === true){
        selectedEthnicity.push("Asian");
    }
    if(document.getElementById("Black-box").checked === true){
        selectedEthnicity.push("Black");
    }
    if(document.getElementById("Hispanic-box").checked === true){
        selectedEthnicity.push("Hispanic");
    }
    if(document.getElementById("White-box").checked === true){
        selectedEthnicity.push("White");
    }
    
    if(selectedEthnicity.length !== 0){
        aux_ethnicity = selectedEthnicity;
    }
    
    
    // min one checkbox selected
    if(aux_ethnicity.length === 1){
        document.getElementById(aux_ethnicity[0] + "-box").checked = true;
        selectedEthnicity = aux_ethnicity;
    }
    
    //alert
    dispatchControlsEthnicity.call("ControlsEthnicityEvent", selectedEthnicity, selectedEthnicity);   
}

dispatchEhtnicityLinechart.on("ehtnicityLinechartEvent.controls", function(ethnicityNotSelected){
    //the ethnicity that is not select goes to false
    if(ethnicityNotSelected.length === 0){
        defaultEthnicity.forEach(function (e) {
            document.getElementById(e + "-box").checked = true;
        }); 
    }
    else{
        /* defaultEthnicity.forEach(function (e) {
            document.getElementById(e + "-box").checked = true;
        }); */
        
        ethnicityNotSelected.forEach(function (e) {
            document.getElementById(e + "-box").checked = false;
        }); 
    }
    
    checkEthnicity();
});

dispatchEhtnicityLinechartAux.on("ehtnicityLinechartEventAux.controls", function(ethnicitySelected){
    
    document.getElementById(ethnicitySelected + "-box").checked = true;

    checkEthnicity();
});

