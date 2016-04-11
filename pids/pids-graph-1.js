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
    renderMarketShareCompany: function(){
       
    },

    getLowHighNumber: function (dataSet){
        console.log("Now finding largest number:");
        console.log(dataSet);
        var largestNumber = dataSet[0].sales;
        var lowestNumber = dataSet[0].sales;
        for (var i = 0; i < dataSet.length; i++) {
            if (dataSet[i].sales > largestNumber) {
                largestNumber = dataSet[i].sales;
            }
            if (dataSet[i].sales < lowestNumber) {
                largestNumber = dataSet[i].sales;
            }
            console.log(largestNumber);
        }
        return { "higest": largestNumber, "lowest": lowestNumber };
    },



    drawLine: function () {

        //var lineFun = d3.svg.line()
        //.x(function (d) { return d.month * 2; })
        //.y(function (d) { return d.sales; })
        //.interpolate("linear");
        var ds = this.dataSet.company[0].market_share;

        var rangeY = this.getLowHighNumber(ds);

        var maxY = rangeY.highest;
        var minY = rangeY.lowest;

        var yScale ) d3.scale.linear.range([])

        yScale.domain([yMin, yMax]);

        
        var lineFun = d3.svg.line()
          .x(function (d) { return ((d.month - 20130001) / 1.25); })
          .y(function (d) { return h - d.sales; })
          .interpolate("linear");


        var svg = d3.select("#market-share-container").append("svg").attr({
            width: this.width, height: this.height
        });

        console.log('DATAPOINT');
        console.log();

        var viz = svg.append("path")
        .attr({
            d: lineFun(ds),
            "stroke": "purple",
            "stroke-width": 2,
            "fill": "none"
    });
    }
}