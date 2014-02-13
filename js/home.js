$(function(){  

	var stockDataArr = [];

	var StockObject = function(ticker,niceName,vol30,vol60,vol90,vol120,Bid,Ask,Change,PE,EPS,MktCap,color){
		this.ticker = ticker;
		this.niceName = niceName;
		this.vol30 = vol30;
		this.vol60 = vol60;
		this.vol90 = vol90;
		this.vol120 = vol120;
		this.Bid = Bid;
		this.Ask = Ask;
		this.Change = Change;
		this.PE = PE;
		this.EPS = EPS;
		this.MktCap = MktCap;
		this.color = color
	};

	var randColor = function () {
		var colors = pluck(marketData.stockList,"Color");
		var randomNum = Math.floor((Math.random()*colors.length)+1);
		return colors[randomNum];
	};

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
		var r = {mean: 0, variance: 0, deviation: 0}, t = Math.sqrt(252);
		var sumMean = 0;
		for (i=1;i<arr.length;i++){ sumMean += Math.pow(Math.log(arr[i]/arr[i-1]),2) };
		var stdDev = Math.sqrt(sumMean / arr.length);
		var volatility = stdDev * t;

	  	return volatility;
	};


	//create an object using a json pull from yahoo
	var queryYahooFinance = function (ticker, callback) {
		var str1 = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22'
		var str2 = '%22%20and%20startDate%20%3D%20%22'
		var str3 = '%22%20and%20endDate%20%3D%20%22'
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
		  	callback(items);
		});

	}

	var getStockObject = function(ticker, callback){
		var str = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20%3D%20%22'
		+ ticker +'%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';

		$.getJSON(str,function(stockinfo){

			if (stockinfo.query.results === null) {
				getStockObject(ticker, function(){
					console.log('failed');
				});
			} else {		
				var stockInfo = stockinfo.query.results.quote;
				callback(stockInfo);
			}				
		});
	}


	//create a stock object
	var createStockObject = function (ticker) {
		queryYahooFinance(ticker, function(data){ 
			console.log(data);
			var var1 = map(pluck(data,"Close").slice(0,120),typearr);
			variance1 = calculateVariance(var1);
			var var2 = var1.slice(0,90);
			variance2 = calculateVariance(var2);
			var var3 = var1.slice(0,60);
			variance3 = calculateVariance(var3);
			var var4 = var1.slice(0,30);
			variance4 = calculateVariance(var4);

			getStockObject(ticker, function(stockData){
				console.log(stockData);
				var obj = new StockObject(ticker,stockData.Name,variance4,variance3,variance2,variance1,stockData.Bid
							,stockData.Ask,stockData.Change,stockData.PERatio,stockData.EarningsShare,stockData.MarketCapitalization,randColor());

				if ($.inArray(ticker,pluck(stockDataArr,'ticker')) > -1) {
					stockDataArr[$.inArray(ticker,pluck(stockDataArr,'ticker'))] = obj;
				} else {
					stockDataArr.push(obj);
				}
				console.log(stockDataArr);
				setUpGraph();
			});
		});
	}



//d3 stuff getting the data
	var getData = function(stocks,attr) {
		var arr = [];
		var indicies = [];
		for (var i = 0; i < stocks.length; i++) {
			// var index = $.inArray(stocks[i],pluck(stocks,'ticker'));
			arr.push({	'name': stocks[i].niceName,
						'ticker': stocks[i].ticker,
						'metric': stocks[i][attr], 
						'color': stocks[i].color
					})
		};
		console.log(arr);
		
		return arr;
	};

// get an individual object back
	var getStock = function(stock) {
		var index = $.inArray(stock,pluck(stockDataArr,'ticker'));
		return stockDataArr[index];
	}

//sets up drawing a graph
	var setUpGraph = function () {
		//set the graphs up with vars
		var select1 = $('.graph1 > .menu > .active').text();
		var select2 = $('.graph2 > .menu > .active').text();
		console.log(select1);

		$('#chart1-header').text(select1);
		$('#chart2-header').text(select2);

		var graphOne = ("vol" + select1.substring(0,2)).toString();
		var graphTwo = ("vol" + select2.substring(0,2)).toString();
		graphOne = graphOne === "vol" ? "vol30" : graphOne;
		graphTwo = graphTwo === "vol" ? "vol30" : graphTwo;
		graphOne = graphOne === "vol12" ? "vol120" : graphOne;
		graphTwo = graphTwo === "vol12" ? "vol120" : graphTwo;
		drawGraph(stockDataArr,graphOne,"chart1");
		drawGraph(stockDataArr,graphTwo,"chart2");
	};

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
		    .attr("data-class", function (d) {return d.ticker;})
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

      	displayStats(stockDataArr[stockDataArr.length-1]);
	};


	//make a function that can display stats
	var displayStats = function (obj) {
		// var obj = getStock($(this).data("class"));
		// console.log(obj);
		var fadeout = 500;
		var fadein = 500;
		$('#tickerlabel').fadeOut(fadeout,function(){ $(this).text(obj.ticker).fadeIn(fadein); });
		$('#niceName').fadeOut(fadeout,function(){ $(this).text(obj.niceName).fadeIn(fadein); });
		$('#30').fadeOut(fadeout,function(){ $(this).text(obj.vol30.toFixed(2)).fadeIn(fadein); });
		$('#60').fadeOut(fadeout,function(){ $(this).text(obj.vol60.toFixed(2)).fadeIn(fadein); });
		$('#90').fadeOut(fadeout,function(){ $(this).text(obj.vol90.toFixed(2)).fadeIn(fadein); });
		$('#120').fadeOut(fadeout,function(){ $(this).text(obj.vol120.toFixed(2)).fadeIn(fadein); });
		$('#Change').fadeOut(fadeout,function(){ $(this).text(obj.Change+"%").fadeIn(fadein); });
		$('#Bid').fadeOut(fadeout,function(){ $(this).text(obj.Bid).fadeIn(fadein); });
		$('#Ask').fadeOut(fadeout,function(){ $(this).text(obj.Ask).fadeIn(fadein); });
		$('#PE').fadeOut(fadeout,function(){ $(this).text(obj.PE).fadeIn(fadein); });
		$('#EPS').fadeOut(fadeout,function(){ $(this).text(obj.EPS).fadeIn(fadein); });
		$('#MktCap').fadeOut(fadeout,function(){ $(this).text(obj.MktCap).fadeIn(fadein); });
	};

	var setGraphs = function () {
		var ticker = $("#ticker").val().toUpperCase() || "GOOG";
		createStockObject(ticker);
	};


//ui stuff
	$('.ui.dropdown')
		.dropdown({
		on: 'hover'
	});

//Event Handlers
	$(document).on('click','#draw-graph', setGraphs)
	$(document).on('click','.bar',function () {
		displayStats(getStock($(this).data("class")));
	});;
	$(document).on('click','#logout', function(){
		window.location.replace('index.html');
	});



	//draw some bs stuff
	createStockObject("SPY");	

});	


