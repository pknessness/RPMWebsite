
const ctx = document.getElementById('graph_canvas');
const textIn = document.getElementById("input_profile");
const controlPanel = document.getElementById("control_panel");

const tabInput = document.getElementById("input_tab");
const tabControlPanel = document.getElementById("control_tab");

let startOrStop = false;
let continueInterval;

const data = {
  datasets: [{
    label: 'Profile',
    data: [],
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  },
  {
    label: 'Expected',
    data: [],
    fill: false,
    borderColor: 'rgb(22, 150, 200)',
    tension: 0.1
  }]
};

const config = {
  type: 'line',
  data: data,
  responsive: true,
  maintainAspectRatio: false,
  options: {
        scales: {
            y: {
                ticks: {
                    callback: function(value, index, ticks) {
                        return `${value}G`;
                    }
                }
            },
            x: {
				type: 'linear',
                ticks: {
                    callback: function(value, index, ticks) {
                        return `${value}ms`;
                    }
                }
            }
        }
    }
};

var myChart = new Chart(ctx, config);

/*
function parseAndMap(str) {
  let map = new Map();
  let components = str.split('ms');
  components.forEach(component => {
    if(component) {
      let match = component.match(/(\d+)g/);
      if(match) {
	let key = component.replace(match[0], '').trim();
	let value = match[1];
	map.set(parseFloat(key), parseFloat(value));
	}
      }
    }
    return map;
  }*/

function updateChart(){
	var lines = textIn.value.replaceAll(" ","").split("\n");
	myChart.data.datasets[0].data = []
	for(var i = 0; i < lines.length; i ++){
		//console.log(`lines ${lines[i]}`);
		var split = lines[i].split(",");
		//console.log(split);
		if(!split[0].endsWith("MS") | !split[1].endsWith("G")) break;
		var ms = split[0].split("MS")[0];
		var g = split[1].split("G")[0];
		//console.log("AAA",ms,g);
		myChart.data.datasets[0].data.push({x: ms, y: g});
	}
	myChart.update();
}
updateChart();

function inputTab(){
	textIn.hidden = false;
	controlPanel.hidden = true;
	tabInput.setAttribute('aria-selected','true');
	tabControlPanel.setAttribute('aria-selected','false');
}
function controlPanelTab(){
	textIn.hidden = true;
	controlPanel.hidden = false;
	tabInput.setAttribute('aria-selected','false');
	tabControlPanel.setAttribute('aria-selected','true');
}

controlPanelTab();

function start(){
	fetch("/commands", {
	  method: "post",
	  headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	  },
	  //make sure to serialize your JSON body
	  body: JSON.stringify({
		command: "START",
		password: "SOMETHING"
	  })
	})
	.then(response => response.json()).then(data =>{
		console.log(data);
	});
	startOrStop = true;
	myChart.data.datasets[1].data = [];
	continueInterval = setInterval(dataGet, 2000);
	
}

function upload(){
	fetch("/commands", {
	  method: "post",
	  headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	  },
	  //make sure to serialize your JSON body
	  body: JSON.stringify({
		command: "UPLOAD",
		password: "SOMETHING",
		data: textIn.value.replaceAll(" ","")//.replaceAll("\n",";")	
	  })
	})
	.then(response => response.json()).then(data =>{
		console.log(data);
	});
}

function stop(){
	fetch("/commands", {
	  method: "post",
	  headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	  },
	  //make sure to serialize your JSON body
	  body: JSON.stringify({
		command: "STOP",
		password: "SOMETHING"
	  })
	})
	.then(response => response.json()).then(data =>{
		console.log(data);
	});
	startOrStop = false;
	clearInterval(continueInterval);
}

function dataGet(){
  fetch("/commands", {
	  method: "post",
	  headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	  },
	  //make sure to serialize your JSON body
	  body: JSON.stringify({
		command: "REQUEST_DATA",
		password: "SOMETHING"
	  })
	})
	.then(response => response.json()).then(data =>{
		console.log(data);
		//myChart.data.datasets[1].data = [];
		//sort!! with js data
		let text = data['status'];
		
		let lines = text.split('g');
		//let doubleArray = lines.map(Number);
		let map = new Map();
		for (let i = 0; i < 10; i += 1){
		    //console.log(myChart.data.datasets[1].data);
		    //myChart.data.datasets[1].data.push({x: doubleArray[i], y: doubleArray[i+1]});
		    //if(i+1 < doubleArray.length){
		    let smallerChunk = lines[i].split('ms');
		    map.set(parseFloat(smallerChunk[0]), parseFloat(smallerChunk[1]));
		    //}
		}
		let sortedMap = new Map([...map.entries()].sort((a, b) => a[0] - b[0]));
		for(let [key, value] of sortedMap.entries()){
		  myChart.data.datasets[1].data.push({x: key, y: value});
		  console.log({x: key, y: value});

		}
		myChart.update();
		
	});
	
  }
 
  
