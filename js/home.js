$(function(){  




//d3 stuff
var getData = function(stock) {
	var index = $.inArray(stock,pluck(marketData.stockList,stock));
	var arr = [];
	arr.push(marketData.stockList[0],marketData.stockList[1],marketData.stockList[index]);
	return arr;
};


var drawGraph = function(arr,attribute) {

	var margin = {top: 20, right: 30, bottom: 30, left: 40},
	    width = $(document).width()*0.4,
	    height = $(document).height()*0.3;

	var x = d3.scale.ordinal()
	    .rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .ticks(10);

	var chart = d3.select(".chart")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var datax = arr;
	var datay = 
	  x.domain(data.map(function(d) { return d.niceName; }));
	  y.domain([0, d3.max(data, function(d) { return d.attribute; })]);

	  chart.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  chart.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
		    .attr("transform", "rotate(-90)")
		    .attr("y", 6)
		    .attr("dy", ".71em")
		    .style("text-anchor", "end")
		    .text(attribute);

	  chart.selectAll(".bar")
	      .data(data)
	    .enter().append("rect")
	      .attr("class", "bar")
	      .attr("x", function(d) { return x(d.niceName); })
	      .attr("y", function(d) { return y(d.attribute); })
	      .attr("height", function(d) { return height - y(d.attribute); })
	      .attr("width", x.rangeBand());
}

drawGraph(getData('GOOG'),'Price');


//ui stuff
	$('.ui.dropdown')
		.dropdown({
		on: 'hover'
	});


});	



	//consider using this for a stock ticker
	// $.getJSON('https://finance.google.com/finance/info?client=ig&q=NYSE:GOOG&callback=?',function(response){
	// 	var stockInfo = response[0];
	// 	var stockString ='<div class="stockWrapper">STOCK:';
	// 	stockString +='<span class="stockSymbol">'+stockInfo.t+'</span>';
	// 	stockString +='<span class="stockPrice">'+stockInfo.l+'</span>';
	// 	stockString +='<span class="stockChange">'+stockInfo.c+'</span>';
	// 	stockString +='<span>at</span> <span class="stockTime">'+stockInfo.ltt+'</span>';
	// 	stockString +='</div>';
	// 	$('.stockTick').prepend(stockString);
	// });
