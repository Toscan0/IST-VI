//variables

import  { tooltipAux } from "./main.js";
import { dispatchParty2, animTime } from "./main.js"
import { dispatchControlsYears } from "./main.js"; //year -> grouped bars
import { dispatchControlsEthnicity } from "./main.js";
import { dispatchControlsCategory } from "./main.js";
import { dispatchParty } from "./main.js";

var treemap_dataset;
var selectedYears = [1928, 2015];
var ethnicities = ["Asian", "Black", "Hispanic", "White"];
var parties = ["Democratic", "Republican"];
var selectedCategories = ["1","0"];

var treemapBeingDeleted = false;


var states = {
  "Alabama" : "AL",
  "Alaska" : "AK",
  "Arizona" : "AZ",
  "Arkansas" : "AR",
  "California" : "CA",
  "Colorado" : "CO",
  "Connecticut" : "CT",
  "Delaware" : "DE",
  "Florida" : "FL",
  "Georgia" : "GA",
  "Hawaii" : "HI",
  "Idaho" : "ID",
  "Illinois" : "IL",
  "Indiana" : "IN",
  "Iowa" : "IA",
  "Kansas" : "KS",
  "Kentucky" : "KY",
  "Louisiana" : "LA",
  "Maine" : "ME",
  "Maryland" : "MD",
  "Massachusetts" : "MA",
  "Michigan" : "MI",
  "Minnesota" : "MN",
  "Mississippi" : "MS",
  "Missouri" : "MO",
  "Montana" : "MT",
  "Nebraska" : "NE",
  "Nevada" : "NV",
  "New Hampshire" : "NH",
  "New Jersey" : "NJ",
  "New Mexico" : "NM",
  "New York" : "NY",
  "North Carolina" : "NC",
  "North Dakota" : "ND",
  "Ohio" : "OH",
  "Oklahoma" : "OK",
  "Oregon" : "OR",
  "Pennsylvania" : "PA",
  "Rhode Island" : "RI",
  "South Carolina" : "SC",
  "South Dakota" : "SD",
  "Tennessee" : "TN",
  "Texas" : "TX",
  "Utah" : "UT",
  "Vermont" : "VT",
  "Virginia" : "VA",
  "Washington" : "WA",
  "West Virginia" : "WV",
  "Wisconsin" : "WI",
  "Wyoming" : "WY",
  "Belgium" : "BE",
  "Spain" : "ES",
  "Austria" : "AT",
  "Ireland": "IE",
  "Sweden": "SE",
  "United Kingdom" : "UK",
  "France": "FR",
  "England": "ENG",
  "Wales": "WAL",
  "Ukraine": "UA",
  "Italy": "IT",
  "Hungary": "HU",
  "Germany":"DE",
  "Lithuania":"LT",
  "Scotland": "SCO",
  "Netherlands":"NL",
  "Canada": "CA",
  "USA": "USA",
  "Mexico" : "MX",
  "India" : "IN",
  "China": "CN",
  "Russia": "RU",
  "Israel": "IL",
  "Cambodia": "KH",
  "Japan": "JP",
  "Iran": "IR",
  "Australia": "AU",
  "New Zealand": "NZ",
  "Greece": "GR",
  "Somalia": "SO",
  "Cuba": "CU",
  "Brasil": "BR",
  "Colombia": "CO",
  "Benin": "BJ",
  "South Africa": "ZA",
  "Puerto Rico": "PR",
  "Romania": "RO",
  "Argentina": "AR"
};

dispatchControlsYears.on("ControlsYearsEvent.treemap", function(yearsSelected){
  selectedYears = yearsSelected;
  var final_dataset = updateTreeMapData(treemap_dataset);
  reloadTreemap(final_dataset);
});

dispatchControlsEthnicity.on("ControlsEthnicityEvent.treemap", function(ethnicitySelected){
  ethnicities = ethnicitySelected;
  var final_dataset = updateTreeMapData(treemap_dataset);
  reloadTreemap(final_dataset);
});

dispatchParty.on("partyEvent.treemap", function(partysSelected){
  if(parties.toString() != partysSelected.toString()){
    parties = partysSelected; 
    var final_dataset = updateTreeMapData(treemap_dataset);
    reloadTreemap(final_dataset);
  }
});

var prevCat = null;
dispatchControlsCategory.on("ControlsCategoryEvent.treemap", function(categorysSelected){
  if(prevCat == null) prevCat = categorysSelected;
  if(prevCat.toString() == categorysSelected){return;}
  else prevCat = categorysSelected;

  if(categorysSelected.includes("Nominees") && categorysSelected.includes("Winners")){
    selectedCategories = ["1","0"];
  }
  else if(categorysSelected.includes("Winners")){
    selectedCategories = ["1"];
  }
  else selectedCategories = ["0"];
  var final_dataset = updateTreeMapData(treemap_dataset);
  reloadTreemap(final_dataset);
});


//Carrega o dataset
d3.csv("datasets/treemap_oscars.csv").then(function (data) {
  treemap_dataset = d3.nest()
  .key(function(d) { return d.Ano; })
  .entries(data);

  //Filtra o dataset
  var final_dataset = updateTreeMapData(treemap_dataset);

  //Desenha o treemap
  updateDrillDown(final_dataset);
});


function updateTreeMapData(ds){

  //Filtra por anos
  var tmp = ds.filter(item => item.key >= selectedYears[0] && item.key <= selectedYears[1]);

  //Remove os anos
  var children = []
  tmp.forEach(function(ele){
      var rows = ele.values
      rows.forEach(function(row){
          delete row["Ano"]
          delete row["Categoria"]
          //delete row["Nome"]
          children.push(row)
      });
  });

  //Filtra por etnia, partido e categoria
  var children2 = []

  children.forEach(function(e){ 
    if(ethnicities.includes(e.Etnia) && parties.includes(e.Partido) && selectedCategories.includes(e.Winner) ){
      children2.push(e);
    }

  });
  children = children2;


  //Agrupa por continente
    children = children.reduce(function (r, a) {
      r[a.Continente] = r[a.Continente] || [];
      r[a.Continente].push(a);
      return r;
  }, Object.create(null));

  //Agrupa por paises
  Object.keys(children).forEach(function(key) {
      
    //cada key e um continente

        children[key] = children[key].reduce(function (r, a) {
            r[a.Pais] = r[a.Pais] || [];
            r[a.Pais].push(a);
            return r;
        }, Object.create(null));
        
        delete children[key].Continente;
        delete children[key].Estado;
        delete children[key].Partido;
        delete children[key].Etnia;
        delete children[key].Pais;
        delete children[key].Winner; 


  });


  //Agrupa por estados
  var estados = []
  if(Object.keys(children).includes("North America") && Object.keys(children["North America"]).includes("USA")){
    children["North America"]["USA"].forEach(function(ele){ estados.push(ele)});
    var estados = estados.reduce(function (r, a) {
        r[a.Estado] = r[a.Estado] || [];
        r[a.Estado].push(a);
        return r;
    }, Object.create(null));
    children["North America"]["USA"] = estados;
    delete children["North America"]["USA"].Continente;
    delete children["North America"]["USA"].Estado;
    delete children["North America"]["USA"].Partido;
    delete children["North America"]["USA"].Etnia;
    delete children["North America"]["USA"].Pais;
    delete children["North America"]["USA"].Winner;
  }



  //Cria contagens
  Object.keys(children).forEach(function(continent) {
     Object.keys(children[continent]).forEach(function(pais){
          if(pais === "USA"){
              Object.keys(children[continent]["USA"]).forEach(function(state){
                  children[continent][pais][state] = children[continent][pais][state].length;
              });
          }
          else{
            children[continent][pais] = children[continent][pais].length;
          }
     });
  });



  //Formata children incluido do USA.

  //Itera um continente.
  Object.keys(children).forEach(function(continent) {
      tmp = []

      //Itera um pais
      Object.keys(children[continent]).forEach(function(pais){

          //Caso particular porque tem estados.
          if(pais === "USA"){
              var counter = 0;
              tmp2 = [] //Vai guardar todos os estados
              Object.keys(children[continent][pais]).forEach(function(state){
                  var tmp3 = {}
                  counter += children[continent][pais][state];
                  tmp3["shortName"] = state;
                  tmp3["sig"] = states[state];
                  tmp3["size"] = children[continent][pais][state];
                  tmp3["count"] = children[continent][pais][state];
                  tmp3["leaf"] = true;
                  tmp2.push(tmp3);

                  //var estados = Object.keys(states);
                  //if(!estados.includes(state)){console.log(state);}
              });
              var usa = {}
              usa["children"] = tmp2;
              usa["shortName"] = "USA";
              usa["sig"] = "USA";
              usa["size"] = counter;
              usa["count"] = null //counter;
              usa["leaf"] = false;
              tmp.push(usa);
          }

          else{
              var tmp2 = {}
              tmp2["shortName"] = pais;
              tmp2["sig"] = states[pais];
              tmp2["size"] = children[continent][pais];
              tmp2["count"] = children[continent][pais];
              tmp2["leaf"] = true;
              tmp.push(tmp2);
              //var estados = Object.keys(states);
              //if(!estados.includes(pais)){console.log(pais);}

          }
     });
     children[continent] = tmp;
  });


  var new_children = []
  //Formata continentes
  Object.keys(children).forEach(function(e){
      tmp = {};
      tmp["children"] = children[e];
      tmp["shortName"] = e;
      tmp["sig"] = e;
      tmp["leaf"] = false;
      var counter = 0;
      //console.log("Estou a iterar: " + e);
      Object.keys(children[e]).forEach(function(p){
          counter += children[e][p]["count"];
      });
      tmp["size"] = counter;
      tmp["count"] = null; //counter;
      new_children.push(tmp);
  });



    //Cria o others
    var others = {}
    var others_children = []
    var others_counter = 0;

    //last children array
    var newest_children = []
    Object.keys(new_children).forEach(function(e){
      var continent = new_children[e]["shortName"]

      //Se o continente nao for nenhum dos grandes.
      if(continent != "North America" && continent != "Europe"){
        others_children.push(new_children[e])
        others_counter += new_children[e].count;
      }
      else{
        newest_children.push(new_children[e]);
      }
    });



    //completa others
    if(others_children.length > 0){
      others["children"] = others_children;
      others["size"] = others_counter;
      others["count"] = others_counter;
      others["sig"] = "Others"
      others["shortName"] = "Others";
      others["leaf"] = false;
      
      //adiciona others, europe  north america a newest children
      newest_children.push(others);

    }
    else{
      others["children"] = [];
      others["size"] = 0;
      others["count"] = 0;
      others["sig"] = null;
      others["shortName"] = null;
      others["leaf"] = false;
      //console.log("nao entrei no others");
    }



    var final_res = {};
    final_res["sig"] = "Countries";
    final_res["shortName"] = "World";
    final_res["leaf"] = false;
    final_res["children"] = newest_children;
    final_res["size"] = null;
    final_res["count"] = null;

    var canadaCount = null;
    var usaCount = null;


    final_res["children"].forEach(function(e){
      if(e.shortName == "North America"){
        e["children"].forEach(function(ele){
            if("Canada" == ele.shortName) canadaCount = ele.size;
            if("USA" == ele.sig) usaCount = ele.size;
        });
      }

      //Altera o valor do canada para ser sempre visivel
      if(canadaCount != null && usaCount != null){
          e["children"].forEach(function(ele){
            if("Canada" == ele.shortName){
              ele.size = usaCount * 0.2;
            }

          });
      };


    });
  


  return final_res;
}




























































var margin = {top: 20, right: 0, bottom: 0, left: 0},
width = d3.select('#treemap').node().getBoundingClientRect().width,
height = d3.select('#treemap').node().getBoundingClientRect().height - 19.5,
transitioning;

var coordenada_x = d3.scaleLinear()
.domain([0, width])
.range([0, width]);

var coordenada_y = d3.scaleLinear()
.domain([0, height - margin.top - margin.bottom])
.range([0, height - margin.top - margin.bottom]);


var color = d3.scaleOrdinal()
.range(d3.schemePastel1
    .map(function(c) { 
      c = d3.rgb(c); 
      c.opacity = 1;
      c.r = 222;
      c.g = 203;
      c.b = 228;
      return c;
    
    }));


var fader = function(color) { return d3.interpolateRgb(color, "#fff")(1.0); };
var format = d3.format(",d");
var treemap;
var treemap_svg, grandparent,tip;
var choosenParty = "";
















/*
 *FUNCTIONS
 */
function initialize(root) {
  root.x = root.y = 0;
  root.x1 = width;
  root.y1 = height;
  root.depth = 0;
}

// Aggregate the values for internal nodes. This is normally done by the
// treemap layout, but not here because of our custom implementation.
// We also take a snapshot of the original children (_children) to avoid
// the children being overwritten when when layout is computed.
function accumulate(d) {
  return (d._children = d.children)
      ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
      : d.value;
}


// Compute the treemap layout recursively such that each group of siblings
// uses the same size (1×1) rather than the dimensions of the parent cell.
// This optimizes the layout for the current zoom state. Note that a wrapper
// object is created for the parent node for each group of siblings so that
// the parent’s dimensions are not discarded as we recurse. Since each group
// of sibling was laid out in 1×1, we must rescale to fit using absolute
// coordinates. This lets us use a viewport to zoom.
function layout(d) {
if (d._children) {
  d._children.forEach(function(c) {
    c.x0 = d.x0 + c.x0 * d.x1;
    c.y0 = d.y0 + c.y0 * d.y1;
    c.x1 *= d.x1;
    c.y1 *= d.y1;
    c.parent = d;
    layout(c);
  });
}
}


function display(d) {
  //Bar with treemap title
  grandparent
    .datum(d.parent)
    .on("click", transition)
    .select("text")
    .attr("class", "legend-text")
    .text( choosenParty + name(d,""))


  var g1 = treemap_svg.insert("g", ".grandparent")
      .datum(d)
      .attr("class", "depth");

  var g = g1.selectAll("g")
    .data(d._children)
    .enter().append("g");



  g.filter(function(d) { return d._children; })
      .classed("children", true)
      .on("click", transition);

  var children = g.selectAll(".child")
    .data(function(d) { return d._children || [d]; })
    .enter().append("g");

  children.append("rect")
      .attr("class", "child")
      .call(rect);



    children.append("text")
        .attr("class", "legend-text-treemap")
        .attr("class", "ctext").attr("dy", "2em")
        .text(function(d) { return d.data.sig; })
        .attr("class", "legend-text-treemap")
        .call(text2);

  
//E aqui onde os rectangulos voltam a aparecer
  g.append("rect")
    .attr("class", "parent")
    .style("stroke","black")
    .style("fill", function(d) { return color(d.data.sig); })
    .on('mousemove', function(d){return toolTip(d)})
    .on('mouseout', function(d){return toolTipOff(d)})
    .attr("y", 400)
    .transition().duration(300)
    .ease(d3.easeLinear)
    .attr("y", 0)

    .call(rect);

  var t = g.append("text")
    .attr("class", "legend-text-treemap")
    .attr("dy", "0.5em")

  t.append("tspan")
    .text(function(d) { return d.data.sig; });
  t.append("tspan")
    .attr("dy", "2em")
  t.call(text);








function transition(d) {

  if (transitioning || !d){
    return;
  }
  transitioning = true;

  var g2 = display(d),
      t1 = g1.transition().duration(250),
      t2 = g2.transition().duration(250);

  // Update the domain only after entering new elements.
  coordenada_x.domain([d.x0, 0 + d.x1]);
  coordenada_y.domain([d.y0, 0 + d.y1]);


  // Enable anti-aliasing during the transition.
  treemap_svg.style("shape-rendering", null);

  // Draw child nodes on top of parent nodes.
  treemap_svg.selectAll(".depth")


  .sort(function(a, b) {
    return a.depth - b.depth;
  });

  // Fade-in entering text.
  g2.selectAll("text").style("fill-opacity", 0).attr("class", "legend-text-treemap");

  // Transition to the new view.
  t1.selectAll("text").call(text).style("fill-opacity", 1);
  t2.selectAll("text").call(text).style("fill-opacity", 1);
  t1.selectAll("rect").call(rect);
  t2.selectAll("rect").call(rect);

  // Remove the old node when the transition is finished.
  t1.remove().on("end", function() {
    treemap_svg.style("shape-rendering", "crispEdges");

    transitioning = false;
  });
}

return g;
}

function text(text) {
  text.selectAll("tspan")
      .attr("x", function(d) { return coordenada_x(d.x0) + 6; })
  text.attr("x", function(d) { return coordenada_x(d.x0) + 6; })
      .attr("y", function(d) { return coordenada_y(d.y0) + 10; })
      .style("opacity", function(d) {
        return this.getComputedTextLength() < coordenada_x(d.x0 + d.x1) - coordenada_x(d.x0) ? 1 : 0;
      });
}

function text2(text) {
  text.attr("x", function(d) { return coordenada_x(d.x0 + d.x1) - this.getComputedTextLength() - 6; })
      .attr("y", function(d) { return coordenada_y(d.y0 + d.y1) - 6; })
      .style("opacity", function(d) {
        return this.getComputedTextLength() < coordenada_x(d.x0 + d.x1) - coordenada_x(d.x0) ? 1 : 0; });
}

function rect(rect) {
  rect.attr("x", function(d) { return coordenada_x(d.x0); })
      .attr("y", function(d) { return coordenada_y(d.y0); })
      .attr("width", function(d) {
        return coordenada_x(d.x0 + d.x1) - coordenada_x(d.x0);

        })
      .attr("height", function(d) {
        return coordenada_y(d.y0 + d.y1) - coordenada_y(d.y0);

        });
}


function name(d,res) {

  var count = d.sum((d) => d.count).value
  if(res != "")
    res =   d.data.shortName +  "(" + count + ") " + " > " + res
  else res =  d.data.shortName +  "(" + count + ") " + res

  if(d.parent!= null) return  name(d.parent,res);
  else return  res;

}

function updateDrillDown(real_data) {


  //Se houver um svg a mais.
  if(d3.select("#treemap").select("svg").size() != 0){
    d3.selectAll("#treemap").select("svg").remove(); 
    d3.selectAll("#treemap").select("tooltip").remove(); 

  }


  //Cria um novo svg
  treemap_svg = d3.select("#treemap").append("svg")
      .attr("class", "treemap_svg")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.bottom - margin.top)
      .style("margin-left", -margin.left + "px")
      .style("margin.right", -margin.right + "px")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges");



  tip=d3.select ('#treemap').append('div')
        .attr('class', 'tooltip')
        .style('position','absolute')
        .style('padding','5px 10px')
        .style('opacity',0)



    grandparent = treemap_svg.append("g")
        .attr("class", "grandparent")

    grandparent.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top);

    grandparent.append("text")
        .attr("class", "legend-text")
        .attr("x", 6)
        .attr("y", 14 - margin.top)
        .style("fill","white") //mudar a cor do titulo.

  treemap = d3.treemap()
    .size([width, height])
    .round(false)
    .paddingInner(1);

  var root = d3.hierarchy(real_data)
      .eachBefore(function(d) { d.id = (d.parent ? d.parent.id + "." : "") + d.data.sig; })
      .sum((d) => d.size)
      .sort(function(a, b) {
        return b.height - a.height || b.value - a.value; });

  initialize(root);
  accumulate(root);
  layout(root);
  treemap(root);
  display(root);

};

//Redraws treemap with new data
function reloadTreemap(new_dataset){
  margin = {top: 20, right: 0, bottom: 0, left: 0},
  width = d3.select('#treemap').node().getBoundingClientRect().width,
  height = d3.select('#treemap').node().getBoundingClientRect().height - 19.5,
  transitioning;
  coordenada_x = d3.scaleLinear()
  .domain([0, width])
  .range([0, width]);
  
  coordenada_y = d3.scaleLinear()
  .domain([0, height - margin.top - margin.bottom])
  .range([0, height - margin.top - margin.bottom]);
  

  treemapBeingDeleted = true;

  //Apaga treemap
  d3.selectAll("#treemap_svg *")
  .attr("y", 0)
  .transition().duration(300)
  .ease(d3.easeLinear)
  .attr("y", 400)
  .remove();

  d3.selectAll("#treemap_svg").select("tooltip").remove(); 


  var delayInMilliseconds = 300; //1 second
  setTimeout(function() {
    treemapBeingDeleted = false;
    updateDrillDown(new_dataset);
  }, delayInMilliseconds);
}



  function endall(transition, callback) {
    if (typeof callback !== "function") throw new Error("Wrong callback in endall");
    if (transition.size() === 0) { callback() }
    var n = 0;
    transition
        .each(function() { ++n; })
        .each("end", function() { if (!--n) callback.apply(this, arguments); });
  }




function toolTip(d) {
    if(d.data.leaf == true){
        tooltipAux.transition()
            .duration(200)
            .style("opacity", .9);
        tooltipAux.html(d.data.shortName + ": " + d.data.count +  " Nominees")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }
}

function toolTipOff(d) {
  tooltipAux.transition()
            .duration(500)
            .style("opacity", 0);
};
