function buildPlot(sampleId) {
    /* data route */
    var  url = "/samples/" + sampleId;
    Plotly.d3.json(url, function (error, response) {
        var otu_desc = [];
        console.log(response);

        var  sample_labels= response['otu_ids'].slice(0,10);
        console.log("sample_values " ,sample_labels);
        var sample_values = response['sample_values'].slice(0,10);
        console.log("sample_labels " ,sample_values);

        //get out descriptions for each of the out IDs and save it to an array
        sample_labels.forEach(function (item){
            var otu_url = "/otu/" +item;
            Plotly.d3.json(otu_url, function (error, response) {
                console.log("otu desc" ,response);
                otu_desc.push(response[0]);

            });
        });

        console.log("otu desc array" ,otu_desc);
        
        var data = [{
            values: sample_values,
            labels: sample_labels,
            type: 'pie',
            text: otu_desc
          }];
          
          var layout = {
            height: 600,
            width: 600
          };
          
          Plotly.newPlot('plot', data, layout);
    });
}

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

function optionChanged(sampleId){
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

    buildPlot(sampleId);
}

//populate drop down for the first time
populateSelection()


