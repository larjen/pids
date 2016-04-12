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
    setDataSet: function (dataSet) {

        // sets the dataset into the object

        this.dataSet = dataSet;
        console.log("DATA RECIEVED");
        console.log(dataSet);
    },
    renderMarketShareCompany: function () {

    },

    getLowHighNumber: function (dataSet) {
        console.log("Now finding largest number:");
        console.log(dataSet);
        var largestNumber = dataSet[0].sales;
        var lowestNumber = dataSet[0].sales;
        for (var i = 0; i < dataSet.length; i++) {
            if (dataSet[i].sales > largestNumber) {
                largestNumber = dataSet[i].sales;
            }
            if (dataSet[i].sales < lowestNumber) {
                lowestNumber = dataSet[i].sales;
            }
            console.log(largestNumber, lowestNumber);
        }
        return { "higest": largestNumber, "lowest": lowestNumber };
    },

    getDate: function(s){
        var strDate = new String(s);
        var year = strDate.substr(0, 4);
        var month = strDate.substr(4, 2);
        var day = strDate.substr(6, 2);
        return new Date(year, month, day);
    },

    getSvg: function (ds) {

        // create or get the reference to the svg object for the type of dataset
        var svgIdentifier = ds.type;
        console.log("svgIdentifier", svgIdentifier);

        var svg = d3.select("svg#" + svgIdentifier);

        console.log('svg', svg[0][0]);

        if (svg[0][0] === null) {

            // create the svg to hold the graph and return the svg

            svg = d3.select("#" + svgIdentifier).append("svg").attr({
                width: this.width,
                height: this.height,
                id: svgIdentifier
            });
        }
        return svg;
    },


    /*

    Draw one line from a dataset

    */
    drawLine: function (ds) {

        var self = this;

        var svg = this.getSvg(ds);



        //var lineFun = d3.svg.line()
        //.x(function (d) { return d.month * 2; })
        //.y(function (d) { return d.sales; })
        //.interpolate("linear");
        var ds = this.dataSet.company[0].market_share;

        //var rangeY = this.getLowHighNumber(ds);

        //console.log("rangeY", rangeY);

        console.log("MIN sales", d3.min(ds, function (d) { return d.sales; }));
        console.log("MAX sales", d3.max(ds, function (d) { return d.sales; }));
        console.log("MIN month", this.getDate(d3.min(ds, function (d) { return d.month; })));
        console.log("MAX month", this.getDate(d3.max(ds, function (d) { return d.month; })));

        // add tooltip
        var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        var xScale = d3.time.scale()
            .domain([
            this.getDate(d3.min(ds, function (d) { return d.month; })),
            this.getDate(d3.max(ds, function (d) { return d.month; }))
            ])
            .range([this.padding, this.width - this.padding])
            .nice();

        var yScale = d3.scale.linear()
            .domain([
                d3.min(ds, function (d) { return d.sales; }),
                d3.max(ds, function (d) { return d.sales; })
            ])
            .range([this.height-this.padding, this.padding])
            .nice();

        var yAxisGen = d3.svg.axis().scale(yScale).orient("left").ticks(5);
        var xAxisGen = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.time.format("%b"));

        var lineFun = d3.svg.line()
          .x(function (d) { return xScale(self.getDate(d.month)); })
          .y(function (d) { return yScale(d.sales); })
          .interpolate("linear");

        var yAxis = svg.append("g").call(yAxisGen)
            .attr("class", "y-axis")
            .attr("transform", "translate(" + this.padding + ",0)");

        var xAxis = svg.append("g").call(xAxisGen)
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + (this.height - this.padding) + ")");



        console.log('DATAPOINT');
        console.log();

        var viz = svg.append("path")
        .attr({
            d: lineFun(ds),
            "stroke": "purple",
            "stroke-width": 2,
            "fill": "none"
        });

        var dots = svg.selectAll("circle")
        .data(ds)
        .enter()
        .append("circle")
        .attr({
            cx: function (d) { return xScale(self.getDate(d.month)); },
            cy: function (d) { return yScale(d.sales); },
            r: 4,
            "fill": "#00ff88",
            class: "circle-"+ds.category
        })
        .on("mouseover", function (d) {
            tooltip.transition()
            .duration(500)
            .style("opacity", .85)
            tooltip.html("<strong>sales " + d.sales + "</strong>")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 20) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
    },
    renderGraphs: function(dataSet){

        // this function draws all graphs

        console.log(dataSet);

        // first set the dataSet
        this.dataSet = dataSet;

        // first draw the marketshare graph

        // THIS IS THE HARDCODED PARTS THAT NEEDS TO BE DYNAMIC
        
        var ds = dataSet.company[0].datasets[0];
        console.log(ds);

        this.drawLine(ds);
    }
}