//Setting up size of graph
var width = 960,
    height = 500,
    graph,
    graphRec;

//Initiates the force graph to a certain size
//Sets link distance and charge strength
var force = d3.layout.force()
    .charge(-200)
    .linkDistance(80)
    .size([width, height]);

// Creates svg layer to which everything is added
var svg = d3.select("#mainGraph").append("svg")
    .attr("width", width)
    .attr("height", height);

// Appends a def and filter category to the SVG layer
var filter = svg.append("defs")
    .append("filter")
    .attr("id", "BEND")
    .attr("in", "SourceImage");

// Filters must be appended sequentially. If everything is appended at once, D3 nests the filters which doesn't work.
// Creates a "cloud" of color
var turb1 = filter.append("feTurbulence")
    .attr("type", "fractalNoise")
    .attr("baseFrequency", "0.017")
    .attr("numOctaves", "1")
    .attr("result", "turb1");

// Filter connects X and Y coordinates of the "in" graphic to the red "R" and green "G" pixels of the "in2" graphic.
var dispMap = filter.append("feDisplacementMap")
    .attr("in", "SourceGraphic")
    .attr("in2", "turb1")
    .attr("xChannelSelector", "R")
    .attr("yChannelSelector", "G")
    .attr("scale", "40");
//    .append("feGaussianBlur")
//    .attr("stdDeviation", 2);

//Set up tooltip
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
        return "<strong>Name:</strong> <span style='color:red'>" + d.name + "</span>";
    })
svg.call(tip);

//Tooltip for bonds
var linktip = d3.tip()
    .attr('class', 'link-tip')
    .offset([-10, 0])
    .html(function (d) {
        return "<strong>Source:</strong> <span style='color:red'>" + d.source.name + "</span>" + "<strong>Target:</strong> <span style='color:red'>" + d.target.name + "</span>";
    })
svg.call(linktip);

//Announcing global variables for function use
var link;
var node;

//Creates the force graph from unedited data
function initialDraw(error, graph) {
    if (error) throw error;
    console.log(graph);

    //Allows to nodes to be connected by id, not array placement
    var nodeById = d3.map();

    graph.nodes.forEach(function (node) {
        nodeById.set(node.id, node);
    });

    graph.links.forEach(function (link) {
        link.source = nodeById.get(link.source);
        link.target = nodeById.get(link.target);
    });

    //Initiates the force graph
    force
        .nodes(graph.nodes)
        .links(graph.links)
        .linkDistance(80)
        .start();

    //Adds link attributes to svg layer
    link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .on('mouseover', linktip.show)
        .on('mouseout', linktip.hide);

    //Adds node attributes to svg layer
    node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    //Attaches a circle to the node svg
    node.append("circle")
        .attr("r", 8)
        .style("fill", "white");

    //Attaches text to the node
    node.append("text")
        .style("stroke", "#000")
        .attr("dx", -5)
        .attr("dy", ".35em")
        //        .attr("filter", "url(#css_blur)")
        .text(function (d) {
            return d.name
        });

    //Keeps track of all the nodes to calculate movement via charge
    force.on("tick", function () {
        link.attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        svg.selectAll("circle").attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });

        //This connects the text name with the node visually
        svg.selectAll("text").attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y;
            });
    });
    
// Applies the filter to the text group only
    svg.selectAll("text").attr("filter", "url(#BEND)");
    
// Applies the filter to the entire graph layer
//        svg.attr("filter", "url(#BEND)");
}

//Using jquery, this loads the d3 force graph after the page has been fully loaded
$(document).ready(function () {
    d3.json("CalderData.json", function (error, data) {
        graph = data;
        initialDraw(null, graph);
    });
});
