/*
 * This is the javascript object that holds the logic to create and instantiate the graphs
 * on the pids main page. This should be as decouples as possible from the rest of the application
 * so as to be reusable in other contexts and frameworks.
 *
 */

var pidsGraph = {
    dataSet: {},
    padding: 50,
    entity: {}, // list of all entities
    entityTypes: [], // holds entity types
    chartId: [], // an array of chart ids
    chart: {}, // a collection of charts
    svg: {}, // holds svg
    getColorClassName: function(number){
        // gets a code for a specific color
        return "color-"+number % 9;
    },
    getColorClassNameFromEntityId: function (id) {
        // gets a code for a specific color

        // loop through enities until id match established

        for (var i = 0; i < this.dataSet.entity.length; i++) {
            if (this.dataSet.entity[i].entityid == id) {
                return this.getColorClassName(i);
            }
        }
    },
    getDate: function(s){
        var strDate = new String(s);
        var year = strDate.substr(0, 4);
        var month = strDate.substr(4, 2);
        var day = strDate.substr(6, 2);
        return new Date(year, month, day);
    },
    isLastSlice: function(ds){
        if (this.chart[ds.chartid].slicenumber == this.chart[ds.chartid].slicetotal) {
            return true;
        } else {
            return false;
        }
    },

    getSvg: function (ds) {

        // get the svgid correlating to the chartid
        var svgid = this.chart[ds.chartid].svgid;

        //console.log("svgid", svgid);

        var svg = d3.select("svg#svg-" + svgid);

        if (svg[0][0] === null) {
            
            

            // create the svg to hold the graph and return the svg
            svg = d3.select("#svg-container-" + svgid)
                .classed("svg-container",true)
                .append("svg")
                .attr("preserveAspectRatio","xMinYMin meet")
                .attr("viewBox","0 0 "+this.svg[svgid].width+" "+this.svg[svgid].height)
                .attr({
                    id: "svg-" + svgid,
                    "data-action":"dim"
            });
        }
        return svg;
    },
    getScales: function(ds){
        if (this.chart[ds.chartid].scales === undefined) {
            var xScale = d3.time.scale()
            .domain([
                this.chart[ds.chartid].xMin,
                this.chart[ds.chartid].xMax
            ])
            .range([
                this.chart[ds.chartid].xStart, 
                this.chart[ds.chartid].xEnd
                ])
            .nice();
            
            var yScale = d3.scale.linear()
                .domain([
                    this.chart[ds.chartid].yMin,
                    this.chart[ds.chartid].yMax
                ])
                .range([
                    this.chart[ds.chartid].yEnd, 
                    this.chart[ds.chartid].yStart
                ])
                .nice();

            this.chart[ds.chartid].scales = { x: xScale, y: yScale };
        }
        return this.chart[ds.chartid].scales;
    },
    getAxisGenerators: function (ds, scale) {
        var self = this;
        if (this.isLastSlice(ds)) {
            return {
                y: d3.svg.axis()
                    .scale(scale.y)
                    .orient("left")
                    .ticks(4)
                    .tickFormat(function(d){return d+self.chart[ds.chartid].yTickDenomination;})
                    .innerTickSize([
                        -this.chart[ds.chartid].width
                    ])
                    .outerTickSize(0),
                x: d3.svg.axis()
                    .scale(scale.x)
                    .orient("bottom")
                    .ticks(6)
                    .tickFormat(d3.time.format("%B %y"))
                    .innerTickSize([
                        -this.chart[ds.chartid].height
                    ])
                    .outerTickSize(0)
            };
        } else {
            return {
                y: d3.svg.axis()
                .scale(scale.y)
                .orient("left")
                .ticks(4)
                .tickFormat(function(d){return d+self.chart[ds.chartid].yTickDenomination;})
                .innerTickSize([
                    -this.chart[ds.chartid].width
                ])
                .outerTickSize(0),
                x: d3.svg.axis()
                .scale(scale.x)
                .orient("bottom")
                .ticks(6)
                .tickFormat("")
                .innerTickSize([
                    -this.chart[ds.chartid].height
                ])
                .outerTickSize(0)
            };
        }
    },
    getAxis: function(ds, svg, axisGenerators){
        if (this.chart[ds.chartid].axis === undefined) {
            this.chart[ds.chartid].axis = {};
            this.chart[ds.chartid].axis.x = svg.append("g")
                .call(axisGenerators.x)
                .attr("class", "x-axis x-axis-"+ds.chartid)
                .attr("transform", "translate(0," + this.chart[ds.chartid].yEnd + ")");
            this.chart[ds.chartid].axis.y = svg.append("g")
                .call(axisGenerators.y)
                .attr("class", "y-axis y-axis-"+ds.chartid)
                .attr("transform", "translate(" + this.chart[ds.chartid].xStart + ",0)");
                
            svg.selectAll(".x-axis-"+ds.chartid+" text").attr({
                "dy": this.padding/1.5
            });
            
            svg.selectAll(".y-axis-"+ds.chartid+" text").attr({
                "dx": -this.padding/6
            });
            
            var lastXTick = d3.select( svg.selectAll(".x-axis-"+ds.chartid+" text")[0].pop() );
            lastXTick.remove();

            var lastYTick = d3.select( svg.selectAll(".y-axis-"+ds.chartid+" text")[0].shift() );
            //console.log("lastYtick",lastYTick);
            lastYTick.remove();

        }
    },
    addDots: function (ds, svg, scale) {

        var self = this;

        // add tooltip
        var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        var dots = svg.selectAll("circle.circle-" + ds.entityid)
            .data(ds.data)
            .enter()
            .append("circle")
            .attr({
                cx: function (d) { return scale.x(self.getDate(d.x)); },
                cy: function (d) { return scale.y(d.y); },
                "data-name": ds.entityid,
                "data-action": "dim",
                r: 2,
                "stroke-width": 4,
                "fill":"none",
                class: "circle-" + ds.entityid + " " + this.getColorClassNameFromEntityId(ds.entityid) + " dim dim-" + ds.entityid
            })
            .on("mouseover", function (d) {
                tooltip.transition()
                .duration(500)
                .style("opacity", .85)
                tooltip.html("<strong>sales " + d.y + "</strong>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 20) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            });

        return dots;
    },
    addLabelPosition: function (ds) {

        //console.log('lpos called', ds);

        var calY = 20; // the y shift
        var calX = 5; // the x shift

        for (var i = 0; i < ds.data.length ; i++) {

            var thisY = ds.data[i].y;
            var prevY = thisY;
            var nextY = thisY;
            if (i > 0) {
                prevY = ds.data[i - 1].y;
            }
            if (i+1 < ds.data.length) {
                nextY = ds.data[i + 1].y;
            }

            //console.log('lpos', prevY, nextY, thisY);
            if (
                prevY > thisY && nextY > thisY ||
                prevY > thisY && nextY == thisY ||
                prevY == thisY && nextY > thisY
                ) {
                //console.log("downcenter");
                ds.data[i].modLabel = { "x": 0, "y": calY, "anchor": "middle" };
            }

            if (
                prevY == thisY && nextY == thisY ||
                prevY == thisY && nextY < thisY ||
                prevY < thisY && nextY == thisY ||
                prevY < thisY && nextY < thisY
                ) {
                //console.log("upcenter");
                ds.data[i].modLabel = { "x": 0, "y": -calY/3, "anchor": "middle" };
            }

            if (
                prevY > thisY && nextY < thisY 
                ) {
                //console.log("upright");
                ds.data[i].modLabel = { "x": calX, "y": -calY/3, "anchor": "start" };
            }

            if (
                prevY < thisY && nextY > thisY
                ) {
                //console.log("downright");
                ds.data[i].modLabel = { "x": calX, "y": calY, "anchor": "start" };
            }
        }
    },
    addLabels: function(ds, svg, scale){
        var self = this;
        var labels = svg.selectAll("text.label-" + ds.entityid)
            .data(ds.data)
            .enter()
            .append("text")
            .text( function(d){return d.y; } )
            .attr({
                x: function (d) { return scale.x(self.getDate(d.x)) + d.modLabel.x; },
                y: function (d) { return scale.y(d.y) + d.modLabel.y; },
                "data-name": ds.entityid,
                "text-anchor": function (d) { return d.modLabel.anchor },
                "data-action": "dim",
                class: "label-" + ds.entityid + " dim dim-" + ds.entityid
            });
            
           

        return labels;
    },
    addText: function(ds, svg, scale){

        
        //console.log('addText',ds);
        //console.log('this.chart[ds.chartid]',this.chart[ds.chartid]);
        
        var title = d3.select(".chart-title-"+this.chart[ds.chartid].svgid);

        //console.log(title, ".chart-title-"+this.chart[ds.chartid].svgid);


        if (title[0][0] === null) {

        svg.append("text")
            .attr('class','chart-title chart-title-'+this.chart[ds.chartid].svgid)
            .attr('text-anchor','start')
            .attr('transform','translate('+this.chart[ds.chartid].xStart+','+this.padding+')')
            .text(this.svg[this.chart[ds.chartid].svgid].title);
        
        svg.append("text")
            .attr('class','chart-yaxis-title-'+this.chart[ds.chartid].svgid)
            .attr('text-anchor','middle')
            .attr('transform','translate('+this.padding/2+',200)rotate(-90)')
            .text(this.chart[ds.chartid].ylabel);
            
        }
        
        
        
            
            //console.log(yaxislabel);                 'transform':'rotate(-90)',


    },
    drawLine: function (ds) {

        var self = this;
        var svg = this.getSvg(ds);
        
        // get the scales
        var scale = this.getScales(ds);

        // get the axis generators
        var axisGenerators = this.getAxisGenerators(ds, scale);

        // function that draws line
        var lineFun = d3.svg.line()
          .x(function (d) { return scale.x(self.getDate(d.x)); })
          .y(function (d) { return scale.y(d.y); })
          .interpolate("cardinal");

        
        var axis = this.getAxis(ds, svg, axisGenerators);

        var viz = svg.append("path")
            .attr({
                d: lineFun(ds.data),
                "data-name": ds.entityid,
                "data-action":"dim",
                "stroke-width": 3,
                "class": "dim dim-" + ds.entityid + " " + this.getColorClassNameFromEntityId(ds.entityid),
                "fill": "none"
            });

        // add dots
        var dots = this.addDots(ds, svg, scale);

        // add labels
        var labels = this.addLabels(ds, svg, scale);
        
        // add text explanations
        var text = this.addText(ds, svg, scale);
    },
    calculateScales: function () {

        var chartData = [];

        for (var i = 0; i < this.dataSet.datasets.length; i++) {
            //console.log(this.dataSet.datasets[i].chartid);

            // concat all ydata for same char

            if (chartData[this.dataSet.datasets[i].chartid] === undefined) {
                chartData[this.dataSet.datasets[i].chartid] = this.dataSet.datasets[i].data;
                //console.log("array must be created", this.dataSet.datasets[i].chartid);
            } else {
                //console.log("array merged", this.dataSet.datasets[i].chartid);
                chartData[this.dataSet.datasets[i].chartid] = chartData[this.dataSet.datasets[i].chartid].concat(this.dataSet.datasets[i].data);
            }
        }

        var chartIds = Object.keys(chartData);
        //console.log("chartIds",chartIds);
        // iterate over the charts and create the yScale

        for (var i = 0; chartData[chartIds[i]] !== undefined; i++) {
            //console.log("chartData[i]", chartData[chartIds[i]]);
            //console.log("MIN y " + chartIds[i], d3.min(chartData[chartIds[i]], function (d) { return d.y; }));

            this.chart[chartIds[i]].yMin = d3.min(chartData[chartIds[i]], function (d) { return d.y; });

            //console.log("MAX y " + chartIds[i], d3.max(chartData[chartIds[i]], function (d) { return d.y; }));

            this.chart[chartIds[i]].yMax = d3.max(chartData[chartIds[i]], function (d) { return d.y; });

            //console.log("MIN x " + chartIds[i], this.getDate(d3.min(chartData[chartIds[i]], function (d) { return d.x; })));

            this.chart[chartIds[i]].xMin = this.getDate(d3.min(chartData[chartIds[i]], function (d) { return d.x; }));

            //console.log("MAX x "+chartIds[i], this.getDate(d3.max(chartData[chartIds[i]], function (d) { return d.x; })));

            this.chart[chartIds[i]].xMax = this.getDate(d3.max(chartData[chartIds[i]], function (d) { return d.x; }));
        };
    },
    renderTable: function(){

        // draw the table at the start of the page
        //console.log("entityTypes", this.entityTypes);

        for (var i = 0; i < this.entityTypes.length; i++) {

            var tableContainer = $("#table-" + this.dataSet.entity[i].type);
            var table = $('<table></table>').addClass("table");
            var tableBody = $('<tbody></tbody>');
            var headerAdded = false;

            for (var j = 0; j < this.dataSet.entity.length; j++) {

                //console.log('now only looking for type=' + this.entityTypes[i] + " - now trying " + dataSet.entity[j].type);
                if (this.dataSet.entity[j].type == this.entityTypes[i]) {
                
                    if (!headerAdded) {
                        headerAdded = true;
                        var headerKeys = Object.keys(this.dataSet.entity[j].properties);
                        //console.log("headerKeys", headerKeys);
                        //console.log("headerKeys.length", headerKeys.length);

                        var header = $('<thead></thead>');
                        var headerRow = $('<tr></tr>');

                        // append the color legend
                        headerRow.append('<th></th>');

                        // add the entity type to the table
                        headerRow.append('<th>' + this.dataSet.entity[j].type + '</th>');

                        for (var k = 0; k < headerKeys.length; k++) {
                            //console.log("inserting " + headerKeys[k]);
                            headerRow.append('<th>' + headerKeys[k] + '</th>');
                        }
                        header.append(headerRow);
                        table.append(header);
                    }

                    // now add the row of data
                    var dataRow = $('<tr class="dim dim-' + this.dataSet.entity[j].entityid + '"></tr>');
                    var keys = Object.keys(this.dataSet.entity[j].properties);

                    dataRow.append('<td data-name="' + this.dataSet.entity[j].entityid + '" data-action="dim"><div data-name="' + this.dataSet.entity[j].entityid + '" data-action="dim" class="picker ' + this.getColorClassName(j) + '"></div></td>');
                    
                    // add the entity name to the table
                    dataRow.append('<td data-name="' + this.dataSet.entity[j].entityid + '" data-action="dim">' + this.dataSet.entity[j].name + '</td>');
                    for (var k = 0; k < keys.length; k++) {
                        //console.log("inserting " + dataSet.entity[j].properties[keys[k]]);
                        dataRow.append('<td data-name="' + this.dataSet.entity[j].entityid + '" data-action="dim">' + this.dataSet.entity[j].properties[keys[k]] + '</td>');
                    }

                    tableBody.append(dataRow);
                    table.append(tableBody);
                }
            }
            tableContainer.append(table);
        }
    },
    setStylesheet(dataSet) {

        var styleEl = document.createElement('style');
        var styleSheet;

        // Append style element to head
        document.head.appendChild(styleEl);

        // Grab style sheet
        styleSheet = styleEl.sheet;

        // insert rules
        styleSheet.insertRule(".dim { transition: opacity 500ms ease;}", 0);
        styleSheet.insertRule(".dim .dim {opacity: 0.3 }", 0);
        styleSheet.insertRule(".dim text.dim {opacity: 0 }", 0);
        styleSheet.insertRule(".dim circle.dim {opacity: 0 }", 0);


        for (var i = 0; i < this.dataSet.entity.length; i++) {
            //console.log(".dim.dim-" + dataSet.entity[i].entityid + " .dim-" + dataSet.entity[i].entityid + " { opacity: 1 }");
            styleSheet.insertRule(".dim.dim-" + this.dataSet.entity[i].entityid + " .dim-" + this.dataSet.entity[i].entityid + " { opacity: 1 }", 0);
        }
    },
    renderGraphs: function(){

        // calculate the scales
        this.calculateScales();

        // draw every graph
        for (var i = 0; i < this.dataSet.datasets.length; i++) {
            this.drawLine(this.dataSet.datasets[i]);
        }
    },
    setActionHandlers: function () {

        // set up the listener listening for events bubbling up the DOM tree
        jQuery(document).on("click", function (e) {

            var actionType = $(e.originalEvent.target).attr("data-action");
            var actionElement = e.originalEvent.target;

            //console.log("Action type:", actionType);
            //console.log("Action element:", actionElement);

            if (actionType !== undefined) {
                jQuery(document).trigger(actionType, { "action": e, "element": actionElement });
            }
        });

        // set up the actions that should be taken
        jQuery(document).on("dim", function (e, data) {
            //console.log("dim called", e, data);
            var name = $(data.element).attr("data-name");
            $("body").removeClass();

            if (name !== undefined) {
                $("body").addClass("dim");
                $("body").addClass("dim-" + name);
            }

        });
    },
    initializeDataSet: function (dataSet) {

        // set dataSet
        this.dataSet = dataSet;
        
        // get all entity types
        for (var i = 0; i < this.dataSet.entity.length; i++) {
            if (-1 === $.inArray(this.dataSet.entity[i].type, this.entityTypes)) {
                this.entityTypes.push(this.dataSet.entity[i].type)
            }
        }

        // get all charts
        for (var i = 0; i < this.dataSet.chart.length; i++) {
            this.chart[this.dataSet.chart[i].chartid] = this.dataSet.chart[i];
            
            // also add this to chartId keys if not already present
            this.chartId.push(this.dataSet.chart[i].chartid);
        }

        // enrich all chart data with label positions so labels are placed
        // correctly according to the graph
        for (var i = 0; i < this.dataSet.datasets.length; i++) {
            this.addLabelPosition(this.dataSet.datasets[i]);
        }

        //console.log(this.dataSet.datasets);

        // get all entities
            for (var i = 0; i < this.dataSet.entity.length; i++) {
                this.entity[this.dataSet.entity[i].entityid] = this.dataSet.entity[i];
        }

        // get all svg
        for (var i = 0; i < this.dataSet.svg.length; i++) {
            this.svg[this.dataSet.svg[i].svgid] = this.dataSet.svg[i];
        }
    },
    setSizes: function(){
        
        
        //console.log("this",this);
        // set height and width for all svg
        for (var i = 0; i < this.dataSet.chart.length ; i++) {
            var h = $("#svg-container-" + this.dataSet.chart[i].svgid).height();
            if (h<400){
                h = 400;
            }
            this.svg[this.dataSet.chart[i].svgid].height = h;
            this.svg[this.dataSet.chart[i].svgid].width = $("#svg-container-" + this.dataSet.chart[i].svgid).width();
        }
        
        console.log("height width calculated this.svg",this.svg);
        
        // set toppadding for the chart
        for (var i = 0; i < this.chartId.length ; i++){
            //console.log("now calculating for",this.chartId[i]);

            var slicetotal = this.chart[this.chartId[i]].slicetotal;
            var slicenumber = this.chart[this.chartId[i]].slicenumber;
            var isFirst = (slicenumber == 1 );
            var isLast = (slicenumber == slicetotal );


            //console.log("isFirst",isFirst,"isLast", isLast);
            
            
            this.chart[this.chartId[i]].height = (this.svg[this.chart[this.chartId[i]].svgid].height  - 3 * this.padding ) / slicetotal;
            this.chart[this.chartId[i]].width = (this.svg[this.chart[this.chartId[i]].svgid].width  - 3 * this.padding );

            
            //console.log("this.chart[this.chartId[i]].svgid",this.chart[this.chartId[i]].svgid);
            //console.log("this.svg[this.chart[this.chartId[i]].svgid].height",this.svg[this.chart[this.chartId[i]].svgid].height);

            //console.log("this.chart[this.chartId[i]].height",this.chart[this.chartId[i]].height);

            this.chart[this.chartId[i]].yStart = this.padding * 2 + this.chart[this.chartId[i]].height * (slicenumber - 1);
            this.chart[this.chartId[i]].yEnd = this.padding * 2  + this.chart[this.chartId[i]].height * slicenumber;
            
            this.chart[this.chartId[i]].xStart = 2 * this.padding;
            this.chart[this.chartId[i]].xEnd = 2 * this.padding + this.chart[this.chartId[i]].width;


            //console.log("yStart",this.chart[this.chartId[i]].yStart);
            //console.log("yEnd",this.chart[this.chartId[i]].yEnd);
            //console.log("xStart",this.chart[this.chartId[i]].xStart);
            //console.log("xEnd",this.chart[this.chartId[i]].xEnd);

        }


    },
    render: function (dataSet) {
        this.initializeDataSet(dataSet);
        this.setSizes();
        this.setStylesheet();
        this.setActionHandlers();
        this.renderTable();
        this.renderGraphs();
        console.log("this",this);
    }
}