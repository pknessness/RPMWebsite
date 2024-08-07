
const ctx = document.getElementById('graph_canvas');
const param1 = document.getElementById("param1");
const controlPanel = document.getElementById("control_panel");

const tabInput = document.getElementById("input_tab");
const tabControlPanel = document.getElementById("control_tab");

const xyz_check = document.getElementById("xyz");
const eff_check = document.getElementById("effective");
const inst_check = document.getElementById("instantaneous");

let startOrStop = false;
let continueInterval;

let pointCount = 0;

const data = {
  datasets: [{
    label: 'Accel.x',
    data: [],
    fill: false,
    borderColor: 'rgb(220, 32, 52)',
    tension: 0.1,
    pointStyle: false
  },
  {
    label: 'Accel.y',
    data: [],
    fill: false,
    borderColor: 'rgb(52, 220, 32)',
    tension: 0.1,
    pointStyle: false
  },
  {
    label: 'Accel.z',
    data: [],
    fill: false,
    borderColor: 'rgb(32, 52, 220)',
    tension: 0.1,
    pointStyle: false
  },
  {
    label: 'Effective Accel',
    data: [],
    fill: false,
    borderColor: 'rgb(190, 70, 200)',
    tension: 0.1,
    pointStyle: false
  },
  {
    label: 'Instantaneous Accel',
    data: [],
    fill: false,
    borderColor: 'rgb(200, 190, 70)',
    tension: 0.1,
    pointStyle: false
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
                        return `${value}m/s²`;
                    }
                }
            },
            x: {
				type: 'linear',
                ticks: {
                    callback: function(value, index, ticks) {
                        return `${value}_`;
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

function updateParams(){
  
}
updateParams();

function inputTab(){
	param1.hidden = false;
	controlPanel.hidden = true;
	tabInput.setAttribute('aria-selected','true');
	tabControlPanel.setAttribute('aria-selected','false');
}
function controlPanelTab(){
	param1.hidden = true;
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
	//myChart.data.datasets[1].data = [];
	dataReset();
	pointCount = 0;
	continueInterval = setInterval(dataGet, 1000);
	
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
		let text = data['status'].replace("+","").replace("#","");
		let values = text.split("=");
		let accel = Math.sqrt(parseFloat(values[0])*parseFloat(values[0]) + parseFloat(values[1])*parseFloat(values[1]) + parseFloat(values[2])*parseFloat(values[2]));
		myChart.data.datasets[0].data.push({x: pointCount, y: parseFloat(values[0])});
		myChart.data.datasets[1].data.push({x: pointCount, y: parseFloat(values[1])});
		myChart.data.datasets[2].data.push({x: pointCount, y: parseFloat(values[2])});
		
		myChart.data.datasets[4].data.push({x: pointCount, y: accel});
		
		let avg = [0,0,0];
		for(let i = 0; i < pointCount+1; i ++){
		    avg[0] += myChart.data.datasets[0].data[i].y;
		    avg[1] += myChart.data.datasets[1].data[i].y;
		    avg[2] += myChart.data.datasets[2].data[i].y;
		    
		}
		console.log(avg);
		
		let averg = Math.sqrt(
		Math.pow(avg[0]/(pointCount+1),2) + 
		Math.pow(avg[1]/(pointCount+1),2) +
		Math.pow(avg[2]/(pointCount+1),2));
		
		if(pointCount < 100 || (pointCount < 1000 && pointCount % 10 == 0) || (pointCount % 50 == 0)){
		  myChart.data.datasets[3].data.push({x: pointCount, y: averg});
		}
		//myChart.data.datasets[3].data.push({x: pointCount, y: averg});
		
		document.getElementById("x_r").innerHTML = "Acceleration X:" + parseFloat(values[0]);
		document.getElementById("y_r").innerHTML = "Acceleration Y:" + parseFloat(values[1]);
		document.getElementById("z_r").innerHTML = "Acceleration Z:" + parseFloat(values[2]);
		
		document.getElementById("inst_r").innerHTML = "Instantaneous Accel:" + accel;
		document.getElementById("eff_r").innerHTML = "Effective Accel:" + averg;
		
		document.getElementById("a_r").innerHTML = "Encoder A:" + parseFloat(values[3]);
		document.getElementById("b_r").innerHTML = "Encoder B:" + parseFloat(values[4]);
		
		
		pointCount++;
		myChart.update();
		
	});
	
  }
  
function dataReset(){
  myChart.data.datasets[0].data = [];
  myChart.data.datasets[1].data = [];
  myChart.data.datasets[2].data = [];
  myChart.data.datasets[3].data = [];
  myChart.data.datasets[4].data = [];
  myChart.update();
}
 
function linesUpdate(){
  console.log("clicked");
  myChart.data.datasets[0].hidden = !xyz_check.checked;
  myChart.data.datasets[1].hidden = !xyz_check.checked;
  myChart.data.datasets[2].hidden = !xyz_check.checked;
  myChart.data.datasets[3].hidden = !eff_check.checked;
  myChart.data.datasets[4].hidden = !inst_check.checked;
		
  myChart.update();
}
  
linesUpdate();
