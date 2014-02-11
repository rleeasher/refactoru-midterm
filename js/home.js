$(function(){  




//d3 stuff getting the data
	var getData = function(stocks,attr) {
		var arr = [];
		var indicies = [];
		arr.push(
			{	'name': 		marketData.stockList[0].niceName,
				'metric':	marketData.stockList[0][attr]},
			{	'name': 		marketData.stockList[1].niceName,
				'metric':	marketData.stockList[1][attr]});

		for (var i = 0; i < stocks.length; i++) {
			var index = $.inArray(stocks[i],pluck(marketData.stockList,'ticker'));
			arr.push({'name': marketData.stockList[index].niceName,'metric': marketData.stockList[index][attr]})
		};
		console.log(arr);
		
		return arr;
	};

// get an individual object back
	var getStock = function(stock) {
		var index = $.inArray(stock,pluck(marketData.stockList,'niceName'));
		return marketData.stockList[index];
	}


// this draws the graph 
	var drawGraph = function(stocks,attribute,graphnum) {

		var data = getData(stocks,attribute);
		var graph = "."+graphnum;

		var margin = {top: 0, right: 30, bottom: 30, left: 40},
		    width = $(window).width()*0.4,
		    height = $(window).height()*0.3;

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


		//select the dom element here
		var chart = d3.select(graph)
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


		//set the x an y domain
		  x.domain(data.map(function(d) { return d.name; }));
		  y.domain([0, d3.max(data, function(d) { return d.metric; })]);

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
		      .attr("class", "bar ")
		      //added in a data class
		      .attr("data-class", function(d){
		      	return d.name;
		      })
		      .attr("x", function(d) { return x(d.name); })
		      .attr("y", function(d) { return y(d.metric); })
		      .attr("height", function(d) { return height - y(d.metric); })
		      .attr("width", x.rangeBand());
	};

	//make a function that can display stats
	var displayStats = function () {
		var obj = getStock($(this).data("class"));
		console.log(obj);
		var fadeout = 500;
		var fadein = 500;
		$('#ticker').fadeOut(fadeout,function(){
			$(this).text(obj.ticker).fadeIn(fadein);
		});
		$('#niceName').fadeOut(fadeout,function(){
			$(this).text(obj.niceName).fadeIn(fadein);
		});
		$('#30').fadeOut(fadeout,function(){
			$(this).text(obj[30]).fadeIn(fadein);
		});
		$('#60').fadeOut(fadeout,function(){
			$(this).text(obj[60]).fadeIn(fadein);
		});
		$('#90').fadeOut(fadeout,function(){
			$(this).text(obj[90]).fadeIn(fadein);
		});
		$('#120').fadeOut(fadeout,function(){
			$(this).text(obj[120]).fadeIn(fadein);
		});
		$('#Price').fadeOut(fadeout,function(){
			$(this).text(obj.Price).fadeIn(fadein);
		});
		$('#PE').fadeOut(fadeout,function(){
			$(this).text(obj.PE).fadeIn(fadein);
		});
		$('#EPS').fadeOut(fadeout,function(){
			$(this).text(obj.EPS).fadeIn(fadein);
		});
		$('#Beta').fadeOut(fadeout,function(){
			$(this).text(obj.Beta).fadeIn(fadein);
		});

	};


//ui stuff
	$('.ui.dropdown')
		.dropdown({
		on: 'hover'
	});

//Event Handlers
	



	$(document).on('click','.bar',displayStats);



	//draw some bs stuff
	drawGraph(["AAPL","MSFT"],"30","chart1");
	drawGraph(["GOOG","LNKD"],"60","chart2");




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
