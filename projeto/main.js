//main.js

// https://simplicable.com/new/pale-colors

// obj with color of each party
export const partyColor = {
    "Democratic": "#799FCB", //blue  estava -> "#000080" , 2833c9 , 6767e4
    "Republican": "#F9665E", //red   estava -> "#ff0000" treemap_red -> #fbb4ae , outro valor #c93528, ff4d4d
};

// obj with color of each ethnicity 70% saturação
export const ethnicityColor = {
    "White": "#a2ab21", //yellow
    "Black": "#7de87d", //green
    "Asian": "#E67300",  //Orange
    "Hispanic": "#C70085", //purple
};

//years first and last value
export const years = [1928, 2015];


//animation
//Time duration of the animation
export const animTime = 1000;

export var dispatchLollipopLineOver = d3.dispatch("lineOver");
export var dispatchLollipopLineOut = d3.dispatch("lineOut");


//event
export var dispatchParty = d3.dispatch("partyEvent");
export var dispatchParty2 = d3.dispatch("partyEvent2");
export var dispatchBlock = d3.dispatch("partyBlockEvent");
//grouped bars to party checkbox
export var dispatchPartyControls = d3.dispatch("PartyControlsEvent");
//party checkbox to grouped bars
export var dispatchControlsParty = d3.dispatch("ControlsPartyEvent");
//category checkbox to groupedbars
export var dispatchControlsCategory = d3.dispatch("ControlsCategoryEvent");
//years checkbox to grouped bars
export var dispatchControlsYears = d3.dispatch("ControlsYearsEvent");
//Ehtnicity checkbox to other idioms
export var dispatchControlsEthnicity = d3.dispatch("ControlsEthnicityEvent");
//Linechart ehtnicity changed
export var dispatchEhtnicityLinechart = d3.dispatch("ehtnicityLinechartEvent");
export var dispatchEhtnicityLinechartAux = d3.dispatch("ehtnicityLinechartEventAux");


export const defaultYears = [1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];

 // Define the div for the tooltip
export const tooltipAux = d3.select("body").append("div")
    .attr("class", "my-tooltip")
    .style("opacity", 0);
