/*
 * This is the javascript object that holds the logic to create and instantiate the graphs
 * on the pids main page. This should be as decouples as possible from the rest of the application
 * so as to be reusable in other contexts and frameworks.
 *
 */

var pidsGraph = {
    dataSet: null,
    width: 940,
    height: 400,
    padding: 50,
    scales: [], // holds the calculated scales
    xMin: [],
    yMin: [],
    xMax: [],
    yMax: [],
    axis: [],
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
    setDataSet: function (dataSet) {

        // sets the dataset into the object

        this.dataSet = dataSet;
        console.log("DATA RECIEVED");
        console.log(dataSet);
    },
    renderMarketShareCompany: function () {

    },



    getDate: function(s){
        var strDate = new String(s);
        var year = strDate.substr(0, 4);
        var month = strDate.substr(4, 2);
        var day = strDate.substr(6, 2);
        return new Date(year, month, day);
    },

    getSvg: function (ds) {

        console.log("getSvg", ds);


        // create or get the reference to the svg object for the type of dataset
        var chartid = ds.chartid;
        console.log("chartid", chartid);

        var svg = d3.select("svg#svg-" + chartid);

        console.log('svg', svg[0][0]);

        if (svg[0][0] === null) {

            // create the svg to hold the graph and return the svg

            svg = d3.select("#" + chartid).append("svg").attr({
                width: this.width,
                height: this.height,
                id: "svg-"+chartid
            });
        }
        return svg;
    },
    getScales: function(ds){

        // get scal
        if (this.scales[ds.chartid] === undefined) {

            var xScale = d3.time.scale()
            .domain([
                this.xMin[ds.chartid],
                this.xMax[ds.chartid]
            ])
            .range([this.padding, this.width - this.padding])
            .nice();

            var yScale = d3.scale.linear()
                .domain([
                    this.yMin[ds.chartid],
                    this.yMax[ds.chartid]
                ])
                .range([this.height - this.padding, this.padding])
                .nice();

            this.scales[ds.chartid] = { x: xScale, y: yScale };

        }
        
        return this.scales[ds.chartid];
    },

    getAxisGenerators: function(scale){

        return {
            y: d3.svg.axis().scale(scale.y).orient("left").ticks(5),
            x: d3.svg.axis().scale(scale.x).orient("bottom").tickFormat(d3.time.format("%b"))
        };

               

        //var yAxisGen = d3.svg.axis().scale(scale.y).orient("left").ticks(5);
        //var xAxisGen = d3.svg.axis().scale(scale.x).orient("bottom").tickFormat(d3.time.format("%b"));

    },

    getAxis: function(ds, svg, axisGenerators){

        if (this.axis[ds.chartid] === undefined) {

            this.axis[ds.chartid] = {};
            this.axis[ds.chartid].y = svg.append("g").call(axisGenerators.y)
            .attr("class", "y-axis")
            .attr("transform", "translate(" + this.padding + ",0)");

            this.axis[ds.chartid].x = svg.append("g").call(axisGenerators.x)
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + (this.height - this.padding) + ")");


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
                r: 3,
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

    addLabels: function(ds, svg, scale){
        var self = this;
        var labels = svg.selectAll("text.label-" + ds.entityid)
            .data(ds.data)
            .enter()
            .append("text")
            .text( function(d){return d.y; } )
            .attr({
                x: function (d) { return scale.x(self.getDate(d.x)); },
                y: function (d) { return scale.y(d.y); },
                "data-name": ds.entityid,
                "data-action": "dim",
                class: "label-" + ds.entityid + " dim dim-" + ds.entityid
            });

        return labels;
    },

    /*

    Draw one line from a dataset

    */
    drawLine: function (ds) {


        var svg = this.getSvg(ds);
        var self = this;

        //var lineFun = d3.svg.line()
        //.x(function (d) { return d.month * 2; })
        //.y(function (d) { return d.sales; })
        //.interpolate("linear");
        //var ds = this.dataSet.company[0].market_share;

        //var rangeY = this.getLowHighNumber(ds);

        //console.log("rangeY", rangeY);

        //console.log("MIN sales", d3.min(ds.data, function (d) { return d.y; }));
        //console.log("MAX sales", d3.max(ds.data, function (d) { return d.y; }));
        //console.log("MIN month", this.getDate(d3.min(ds.data, function (d) { return d.x; })));
        //console.log("MAX month", this.getDate(d3.max(ds.data, function (d) { return d.x; })));



        // get the scales
        var scale = this.getScales(ds);

        // get the axis generators
        var axisGenerators = this.getAxisGenerators(scale);

        //var yAxisGen = d3.svg.axis().scale(scale.y).orient("left").ticks(5);
        //var xAxisGen = d3.svg.axis().scale(scale.x).orient("bottom").tickFormat(d3.time.format("%b"));

        var lineFun = d3.svg.line()
          .x(function (d) { return scale.x(self.getDate(d.x)); })
          .y(function (d) { return scale.y(d.y); })
          .interpolate("linear");

        var axis = this.getAxis(ds, svg, axisGenerators);

        var viz = svg.append("path")
            .attr({
                d: lineFun(ds.data),
                "data-name": ds.entityid,
                "data-action":"dim",
                "stroke-width": 2,
                "class": "dim dim-" + ds.entityid + " " + this.getColorClassNameFromEntityId(ds.entityid),
                "fill": "none"
            });

        // add dots
        var dots = this.addDots(ds, svg, scale);

        // add labels
        var labels = this.addLabels(ds, svg, scale);

    },

    calculateScales: function (dataSet) {

        var chartData = [];

        for (var i = 0; i < this.dataSet.datasets.length; i++) {
            console.log(this.dataSet.datasets[i].chartid);

            // concat all ydata for same char

            if (chartData[this.dataSet.datasets[i].chartid] === undefined) {
                chartData[this.dataSet.datasets[i].chartid] = this.dataSet.datasets[i].data;
                console.log("array must be created", this.dataSet.datasets[i].chartid);
            } else {
                console.log("array mereged", this.dataSet.datasets[i].chartid);
                chartData[this.dataSet.datasets[i].chartid] = chartData[this.dataSet.datasets[i].chartid].concat(this.dataSet.datasets[i].data);
            }
        }

        var chartIds = Object.keys(chartData);
        console.log("chartIds",chartIds);
        // iterate over the charts and create the yScale

        for (var i = 0; chartData[chartIds[i]] !== undefined; i++) {
            console.log("chartData[i]", chartData[chartIds[i]]);
            console.log("MIN y " + chartIds[i], d3.min(chartData[chartIds[i]], function (d) { return d.y; }));

            this.yMin[chartIds[i]] = d3.min(chartData[chartIds[i]], function (d) { return d.y; });

            console.log("MAX y " + chartIds[i], d3.max(chartData[chartIds[i]], function (d) { return d.y; }));

            this.yMax[chartIds[i]] = d3.max(chartData[chartIds[i]], function (d) { return d.y; });

            console.log("MIN x " + chartIds[i], this.getDate(d3.min(chartData[chartIds[i]], function (d) { return d.x; })));

            this.xMin[chartIds[i]] = this.getDate(d3.min(chartData[chartIds[i]], function (d) { return d.x; }));

            console.log("MAX x "+chartIds[i], this.getDate(d3.max(chartData[chartIds[i]], function (d) { return d.x; })));

            this.xMax[chartIds[i]] = this.getDate(d3.max(chartData[chartIds[i]], function (d) { return d.x; }));


        };





    },

    renderTable: function(dataSet){

        // draw the table at the start of the page

        // get all entity types

        var entityTypes = [];

        for (var i = 0; i < dataSet.entity.length; i++) {
            if (-1 === $.inArray(dataSet.entity[i].type, entityTypes)) {
                entityTypes.push(dataSet.entity[i].type)
            }

        }

        console.log("entityTypes", entityTypes);

        for (var i = 0; i < entityTypes.length; i++) {

            var tableContainer = $("#table-" + dataSet.entity[i].type);
            console.log(tableContainer);

            var table = $('<table></table>').addClass("table table-bordered");

            var tableBody = $('<tbody></tbody>');

            var headerAdded = false;

            for (var j = 0; j < dataSet.entity.length; j++) {

                //console.log('now only looking for type=' + dataSet.entity[i].type + " - now trying " + dataSet.entity[j].type);

                if (dataSet.entity[j].type == dataSet.entity[i].type) {

                    //console.log(j);
                
                    if (!headerAdded) {
                        headerAdded = true;
                        //console.log('headerAdded ', dataSet.entity[j]);
                        //console.log('headerAdded ', dataSet.entity[j].properties);
                        var headerKeys = Object.keys(dataSet.entity[j].properties);
                        //console.log("headerKeys", headerKeys);
                        //console.log("headerKeys.length", headerKeys.length);

                        var header = $('<thead></thead>');
                        var headerRow = $('<tr></tr>');

                        // first add the entity type to the table
                        headerRow.append('<th>' + dataSet.entity[j].type + '</th>');

                        for (var k = 0; k < headerKeys.length; k++) {
                            console.log("inserting " + headerKeys[k]);
                            headerRow.append('<th>' + headerKeys[k] + '</th>');
                        }
                        header.append(headerRow);
                        table.append(header);
                    }

                    // now add the row of data

                    var dataRow = $('<tr class='+ this.getColorClassName(j)+'></tr>');

                    var keys = Object.keys(dataSet.entity[j].properties);

                    // first add the entity name to the table
                    dataRow.append('<td data-name="' + dataSet.entity[j].entityid + '" data-action="dim">' + dataSet.entity[j].name + '</td>');
                    for (var k = 0; k < keys.length; k++) {
                        console.log("inserting " + dataSet.entity[j].properties[keys[k]]);
                        dataRow.append('<td data-name="' + dataSet.entity[j].entityid + '" data-action="dim">' + dataSet.entity[j].properties[keys[k]] + '</td>');
                    }

                    tableBody.append(dataRow);
                    table.append(tableBody);
                }
            }

            // loop through all companies/products

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

        styleSheet.insertRule(".dim { transition: opacity 500ms ease;}", 0);
        styleSheet.insertRule(".dim .dim {opacity: 0.3 }", 0);


        for (var i = 0; i < dataSet.entity.length; i++) {
            console.log(".dim.dim-" + dataSet.entity[i].entityid + " .dim-" + dataSet.entity[i].entityid + " { opacity: 1 }");
            styleSheet.insertRule(".dim.dim-" + dataSet.entity[i].entityid + " .dim-" + dataSet.entity[i].entityid + " { opacity: 1 }", 0);
        }
    },

    renderGraphs: function(dataSet){

        // this function draws all graphs

        console.log(dataSet);



        //console.log("Now drawing dataset:", this.dataSet.datasets);
        //console.log("Now drawing dataset:", this.dataSet.datasets.length);

        // calculate all the y scales for the graphs in the datasets

        this.calculateScales(dataSet);


        // draw every graph

        for (var i = 0; i < this.dataSet.datasets.length; i++) {

            console.log("Now drawing dataset:", this.dataSet.datasets[i]);
            this.drawLine(this.dataSet.datasets[i]);

            
        }


        // THIS IS THE HARDCODED PARTS THAT NEEDS TO BE DYNAMIC
        
        //var ds = dataSet.company[0].datasets[0];
        //console.log(ds);

        //this.drawLine(ds);
    },
    setPubsub: function () {

        // set up the listener listening for events bubbling up the DOM tree
        jQuery(document).on("click", function (e) {

            var actionType = $(e.originalEvent.target).attr("data-action");
            var actionElement = e.originalEvent.target;

            console.log("Action type:", actionType);
            console.log("Action element:", actionElement);

            if (actionType !== undefined) {
                jQuery(document).trigger(actionType, { "action": e, "element": actionElement });
            }
        });

        // set up the actions that should be taken
        jQuery(document).on("dim", function (e, data) {
            console.log("dim called", e, data);
            var name = $(data.element).attr("data-name");
            if (name === undefined) {
                name = $('[name="greeting"]', data.element).val();
            }

            // hacking together fast

            $("body").removeClass();
            $("body").addClass("dim");
            $("body").addClass("dim-" + name);
        });
    },
    render: function (dataSet) {

        // first set the dataSet
        this.dataSet = dataSet;

        this.setStylesheet(dataSet);

        this.setPubsub();

        this.renderTable(dataSet);

        this.renderGraphs(dataSet);
    }
}