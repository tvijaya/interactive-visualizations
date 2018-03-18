function buildPlots(sampleId) {
    /* data route to get otu ids and sample values*/
    var  url = "/samples/" + sampleId;
    Plotly.d3.json(url, function (error, response) {
        if (error) return console.warn(error);
        var otu_desc = [];
        var  otu_ids= response['otu_ids'].slice(0,10);
        console.log("sample_values " ,otu_ids);
        var sample_values = response['sample_values'].slice(0,10);
        console.log("otu_ids " ,otu_ids);

        //get out descriptions for each of the out IDs and save it to an array
        otu_ids.forEach(function (item){
            var otu_url = "/otu/" +item;
            Plotly.d3.json(otu_url, function (error, response) {
                if (error) return console.warn(error);
                otu_desc.push(response[0]);

            });
        });
        //wait till descriptions are fetched
        setTimeout(function afterOneSeconds() {
            console.log("otu desc array" ,otu_desc);
            
            // pie chart
            buildPieChart(otu_ids, sample_values, otu_desc);
    
            //scatter plot
            buildScatterPlot(otu_ids, sample_values, otu_desc);
    
            //guage plot
            buildGaugeChart(sampleId);
          }, 1000);

    });  
}

// pie chart
function buildPieChart(otu_ids, sample_values, otu_desc){
    var data = [{
        values: sample_values,
        labels: otu_ids,
        type: 'pie',
        text: otu_desc,
        textinfo: "percent"
      }];
      
      var layout = {
        height: 500,
        width: 500
    };
      
      Plotly.newPlot('plot', data, layout);
}


// scatter plot
function buildScatterPlot(otu_ids, sample_values, otu_desc){
   
    var trace1 = {
        x: otu_ids,
        y: sample_values,
        text: otu_desc,
        hoverinfo: "x+y+text",
        mode: 'markers',
        type: 'scatter',
        marker: { size: sample_values, color: otu_ids }
        
      };
      
      var data = [ trace1 ];
      
      var layout = {          
        xaxis: {
          title: "OTU ID"
        },
        yaxis: {
          title: "Sample Values"
        }
      };
      
      Plotly.newPlot('scatterPlot', data, layout);
}


// build guage chart
function buildGaugeChart(sampleId){
    url = "/wfreq/"+ sampleId;

	Plotly.d3.json(url, function(error, response) {
		if (error) return console.warn(error);
			var level = response * 20;			  		
			console.log('wfreq  ',response);
		
	// Trig to calc meter point
	var degrees = 180 - level,
		 radius = .5;
	var radians = degrees * Math.PI / 180;
	var x = radius * Math.cos(radians);
	var y = radius * Math.sin(radians);
	
	// Path: may have to change to create a better triangle
	var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
		 pathX = String(x),
		 space = ' ',
		 pathY = String(y),
		 pathEnd = ' Z';
	var path = mainPath.concat(pathX,space,pathY,pathEnd);
	
	var data = [{ type: 'scatter',
	   x: [0], y:[0],
		marker: {size: 28, color:'850000'},
		showlegend: false,
		name: 'speed',
		text: level,
		hoverinfo: 'text+name'},
	  { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9,50/9,50/9, 50],
	  rotation: 90,
	  text: ['8-9', '7-8', '6-7', '5-6','4-5', '3-4', '2-3','1-2','0-1',''],
	  textinfo: 'text',
	  textposition:'inside',      
      marker: {colors:['rgba(50, 100, 0, .5)', 'rgba(50, 127, 0, .5)', 'rgba(20, 150, 0, .5)','rgba(50, 175, 22, .5)',
                        'rgba(70, 200, 0, .5)','rgba(170, 202, 42, .5)', 'rgba(200, 210, 100, .5)','rgba(216, 208, 155, .5)', 'rgba(232, 226, 202, .5)',
							 'rgba(255, 255, 255, 0)']},
	  text: ['8-9', '7-8', '6-7', '5-6','4-5', '3-4', '2-3','1-2','0-1',''],
	  hoverinfo: 'text',
	  hole: .5,
	  type: 'pie',
	  showlegend: false
	}];
	
	var layout = {
	  shapes:[{
		  type: 'path',
		  path: path,
		  fillcolor: '850000',
		  line: {
			color: '850000'
		  }
		}],
	  title: 'Belly Button Washing Frequency <br> Scrubs Per Week',
	  height: 450,
	  width: 450,
	  xaxis: {zeroline:false, showticklabels:false,
				 showgrid: false, range: [-1, 1]},
	  yaxis: {zeroline:false, showticklabels:false,
				 showgrid: false, range: [-1, 1]}
	};
	
    Plotly.newPlot('gaugePLot', data, layout);
    restyle = 'yes';		

	});
}


// populate the drop down of our html
function populateSelection(){

    $mySelection = Plotly.d3.select("#selDataset");
    url = "/names";
    Plotly.d3.json(url, function (error, response) {
        
            console.log(response);

            var data = response
            for( i =0; i< data.length; i++){
                $mySelection.append('option').text(data[i]).property('value', data[i]);
            }

            optionChanged(data[0]);

    });        
}

// refresh the data on screen when options chnage
function optionChanged(sampleId){
    buildPlots(sampleId);
    console.log("sampleId ", sampleId);
    url = "/metadata/" + sampleId;
    $myMetadata = Plotly.d3.select("#sampleMetadata");
    $myMetadata.html("");
    Plotly.d3.json(url, function (error, response) {
        
            console.log(response);
            var myKeys = ["AGE", "BBTYPE", "ETHNICITY", "GENDER", "LOCATION", "SAMPLEID"]
            Object.keys(response).forEach(function(key) {
                if(myKeys.includes(key)){
                    var myString = `${key}:  ${response[key]}`
                    $myMetadata.append('li').text(myString)
                }

            });
  
    });    
}

//populate drop down for the first time
populateSelection()


