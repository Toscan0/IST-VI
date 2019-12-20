var dataset, full_dataset; // new variable;

//another file--> oscar_winners_recent.json
d3.json("oscar_winners.json").then(function (data) {
    full_dataset = data; // this variable is always the full dataset
    dataset = full_dataset.slice(0,35); // most recente movies
    barGraph();
    scarterPlot();
});


function barGraph() {
    var w = 800;
    var h = 400;
    var padding = 30;
    var bar_w = Math.floor((w - padding * 2) / dataset.length) - 1; //size of the bars
    
    var svg = d3.select("#the_chart")
    .append("svg") // we are appending an svg to the div 'the_chart'
    .attr("width", w)
    .attr("height", h);
    
    /* --- Just a example how to create one bar ---
    // we are creating a rectangle
    svg.append("rect")
     .attr("width", 20)
     .attr("height", 150)
     .attr("fill", "purple")
    .attr("y", h - 150); // we are putting the bar on the bottom of the div
    */
    
    /* --- Example how to create a bar graph but wihout scalle ---
    svg.selectAll("rect")
        .data(dataset)
        .enter().append("rect") // for each item, we are appending a bar
            .attr("width", 20)
            .attr("height", function(d) {
                return d.rating * 30; // each bar height is a score
            })
            .attr("fill", "purple")
            .attr("x", function(d, i) { // d -> each item | i -> each item's index
                return i * 21; // we are setting each bar’s position
            })
            .attr("y", function(d) {
                return h - (d.rating * 30); // we are putting each bar on the bottom of the div
            });
    */
    
    // linear scale
    var hscale = d3.scaleLinear() 
        .domain([0, 10]) // values range
        .range([h - padding, padding]); // we are adding our padding to our height scale
    
    var xscale = d3.scaleLinear()
        .domain([0, dataset.length])
        .range([padding, w - padding]); // we are adding our padding to our width scale
    
    //create bar graph
    svg.selectAll("rect")
    .data(dataset)
    .enter().append("rect")
    .attr("width", bar_w)
    .attr("height", function(d) {
        return h - padding - hscale(d.rating); // this was inverted
    })
    .attr("fill", "purple")
    .attr("x", function(d, i) {
        return xscale(i);
    })
    .attr("y", function(d) {
        return hscale(d.rating); // this was inverted
    });

    
    //  yy axis
    var yaxis = d3.axisLeft() 
        .scale(hscale); // fit to our scale
    
    svg.append("g") // we are creating a 'g' element to match our yaxis
        .attr("transform", "translate(30, 0)") // 30 is the padding
        .call(yaxis);

    // xx axys
    var xaxis = d3.axisBottom() 
        .scale(d3.scaleLinear()
               .domain([dataset[0].oscar_year, dataset[dataset.length - 1].oscar_year])
               // values from movies' years
               .range([padding + bar_w / 2, w - padding - bar_w / 2])) // we are adding our padding
        .tickFormat(d3.format("d")) // format of each year
        .ticks(dataset.length/4); // number of bars between each tick

    svg.append("g") // we are creating a 'g' element to match our x axis
        .attr("transform","translate(0," + (h-padding) + ")")
        .attr("class", "xaxis") // we are giving it a css style
              .call(xaxis);
    
    // adding a title for each bar
    svg.selectAll("rect").append("title")
        .data(dataset)
        .text(function(d) { 
            return d.title;
        });   

    
    // Old button
    d3.select("#old") // we are selecting the element with class 'old'
        .on("click", function() { // click event
            dataset = full_dataset.slice(35,70); // temp dataset now has older movies
            bar_w = 0;
            svg.selectAll("rect") // same code, but now we only change values
            .data(dataset)
            .transition() // add a smooth transition
            .duration(1000)
            .attr("height", function(d) {
                return h-padding-hscale(d.rating);
            })
            .attr("fill","red") // color change
            .attr("y", function(d) {
                return hscale(d.rating);
            })
            .select("title")
            .text(function(d) { 
                return d.title;
            });
            xaxis.scale(d3.scaleLinear()
            .domain([dataset[0].oscar_year,dataset[dataset.length-1].oscar_year])
            .range([padding+bar_w/2,w-padding-bar_w/2]));
            d3.select(".xaxis")
            .call(xaxis);
        });
    
    // New button
    d3.select("#new") // we are selecting the element with class ‘new’
        .on("click", function() { // click event
            dataset = full_dataset.slice(0,35); // temp dataset now has recent movies
            bar_w = 0;
            svg.selectAll("rect") // same code, but now we only change values
            .data(dataset)
            .transition() // add a smooth transition
            .duration(1000)
            .attr("height",function(d) {
                return h-padding-hscale(d.rating);
            })
            .attr("fill", "purple") // color change
            .attr("y",function(d) {
                return hscale(d.rating);
            })
            .select("title")
            .text(function(d) { 
                return d.title;
            });
            xaxis.scale(d3.scaleLinear()
            .domain([dataset[0].oscar_year,dataset[dataset.length-1].oscar_year])
            .range([padding+bar_w/2,w-padding-bar_w/2]));
            d3.select(".xaxis")
            .call(xaxis);
         });
}


 //Scarterplot
function scarterPlot() {
    var w = 800;
    var h = 800;
    var padding = 30;
    var bar_w = Math.floor((w - padding * 2) / dataset.length) - 1; //size of the bars
    var r = 5;

    var svg = d3.select("#second_chart")
    .append("svg") // we are appending an svg to the div 'the_chart'
    .attr("width", w)
    .attr("height", h);
    
    
    // linear scale
    var hscale = d3.scaleLinear() 
        .domain([0, 10]) // values range
        .range([h - padding, padding]); // we are adding our padding to our height scale
    
    var xscale = d3.scaleLinear() // // we need to change our x axis scale
    .domain([0,d3.max(full_dataset, function(d) {
       return d.budget;
    }) / 1000000])
    .range([padding,w-padding]);
    
    
   svg.selectAll("circle")
        .data(full_dataset)
        .enter().append("circle") // now we append circles
        .attr("r",r) // neach circle
        .attr("fill","rgba(128,0,128,0.5)")
        .attr("cx", function(d, i) { // we define each circle x position
            if (d.budget == 0) {return padding;}
                return xscale(d.budget/1000000);
        })
        .attr("cy", function(d) {// we define each circle y position
            return hscale(d.rating);
        })
        .append("title")
        .text(function(d) { 
        return d.title;
    });
}
    