$(function(){  

	var stockData = [];

//creates a date formate necessary for yahoo api
	var niceDate = function (offset) {
		var d = new Date();
		var arr = [];
		var year = d.getFullYear()-offset;
		var month = d.getMonth() < 10 ? "0" + (d.getMonth()+1): d.getMonth()+1;
		var day = d.getDate() < 10 ? "0"+d.getDate() : d.getDate();
		arr.push(year,month,day);
		return arr.join("-");
	};

	var calculateVariance = function(arr) {
		var r = {mean: 0, variance: 0, deviation: 0}, t = arr.length;
	 		for(var m, s = 0, l = t; l--; s += arr[l]);
	  		for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(arr[l] - m, 2));
	  	return r.deviation = Math.sqrt(r.variance = s / t), r;
	};


	//create an object using a json pull from yahoo
	var queryYahooFinance = function (ticker, callback) {

		var str1 = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22'
	//ticker
		var str2 = '%22%20and%20startDate%20%3D%20%22'
	//startdate
		var str3 = '%22%20and%20endDate%20%3D%20%22'
	//enddate
		var str4 = '%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='

		var startDate = niceDate(1);
		var endDate = niceDate(0);
		var stktkr = ticker;
		//this data comes back in reverse order so will need to reverse it
		$.getJSON(str1 + stktkr + str2 + startDate + str3 + endDate + str4, function(data) {
		  var items = [];
		  $.each(data.query.results.quote, function(key, val) {
		    items.push(val);
		  });

			var variance = calculateVariance(pluck(items,"Close"));
			console.log(variance);

		  	callback(items);
		});



	}

	var createStockObject = function (ticker) {
		var arr = queryYahooFinance(ticker, function(data){ console.log(data); });
	}

	createStockObject("YHOO");

	console.log(niceDate(0));
	console.log(niceDate(1));


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
			arr.push({	'name': marketData.stockList[index].niceName,
						'metric': marketData.stockList[index][attr], 
						'color': marketData.stockList[index].Color
					})
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
	var drawGraph = function (stocks, attribute, graphnum) {

	    var data = getData(stocks, attribute);
	    var graph = "." + graphnum;

	    $(graph).html("");

	    var margin = {top: 0,right: 30,bottom: 30,left: 40}
	        width = $(window).width() * 0.4,
	        height = $(window).height() * 0.3;

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
	        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    	;

	    //set the x an y domain
	    x.domain(data.map(function (d) {
	        return d.name;
	    }));
	    y.domain([0, d3.max(data, function (d) {
	        return d.metric;
	    })]);

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
	    //added in a data class
		    .attr("data-class", function (d) {return d.name;})
		    .text(function (d) {return d.metric;})
		    .style("fill", function (d) {return d.color;})
	        .attr("x", function (d) {return x(d.name);})
	        .attr("y", height)
	        .attr("height", 0)
	        .attr("width", x.rangeBand())
	        ;
	    chart.selectAll(".bar")
	    	.transition()
	    	.duration(1000)
	    	.attr("x", function (d) {return x(d.name);})
      	 	.attr("height", function(d) { return height - y(d.metric); })
	    	.attr("y", function(d) { return y(d.metric);})
      		;


	};

	var redraw = function (x,y) {

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

	var setGraphs = function () {
		var stockArr = [];
		var graphOne = $('.graph1 > .menu > .active').text().substring(0,2) || "30";
		var graphTwo = $('.graph2 > .menu > .active').text().substring(0,2) || "30";


		graphOne = graphOne === "12" ? "120" : graphOne;
		graphTwo = graphTwo === "12" ? "120" : graphTwo;

		$(".ticker").each(function(){
			stockArr.push($(this).val().toUpperCase() || "GOOG");
		});
		console.log(stockArr,graphOne,graphTwo);
		drawGraph(stockArr,graphOne,"chart1");
		drawGraph(stockArr,graphTwo,"chart2");


	};




//ui stuff
	$('.ui.dropdown')
		.dropdown({
		on: 'hover'
	});

//Event Handlers
	

	
	$(document).on('click','#draw-graph', setGraphs)
	$(document).on('click','.bar',displayStats);
	$(document).on('click','#logout', function(){
		window.location.replace('index.html');
	});



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
