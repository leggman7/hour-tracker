//import Chart from '/scripts/chart.js/dist/chart.js';
import 'https://cdn.jsdelivr.net/npm/chart.js';

//import '/scripts/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.js';


// Data for the chart
const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [{
      label: 'Demo Data',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: [0, 10, 5, 2, 20, 30, 45],
  }]
};

// Configuration options go here
const config = {
  type: 'line',
  data: data,
  options: {}
};

// Create the chart
const myChart = new Chart(
  document.getElementById('myChart'),
  config
);