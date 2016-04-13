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
                r: 4,
                "fill": "#00ff88",
                class: "circle-"+ds.entityid
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
                y: function (d) { return scale.y(d.y); }
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
                "stroke": "purple",
                "stroke-width": 2,
                "fill": "none",
                "class": ds.entityid
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


    renderGraphs: function(dataSet){

        // this function draws all graphs

        console.log(dataSet);

        // first set the dataSet
        this.dataSet = dataSet;

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
    }
}