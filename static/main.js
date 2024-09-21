// static/main.js

async function fetchData() {
    const response = await fetch('/api/player-stats-history');
    const data = await response.json();
    return data;
  }
  
  // Function to update the Active Players Chart
  function updateActivePlayersChart(chart, newLabel, newData) {
    chart.data.labels.push(newLabel);
    chart.data.datasets[0].data.push(newData);
  
    // Limit the number of data points to 20
    const maxDataPoints = 20;
    if (chart.data.labels.length > maxDataPoints) {
      chart.data.labels.shift(); // Remove oldest label
      chart.data.datasets[0].data.shift(); // Remove oldest data point
    }
  
    chart.update();
  }
  
  // Function to update the Top Scores Chart
  function updateTopScoresChart(chart, newData) {
    chart.data.datasets[0].data = newData;
    chart.update();
  }
  
  async function updateCharts(charts) {
    const data = await fetchData();
  
    // Get current time for the label
    const currentTime = new Date().toLocaleTimeString();
  
    // Update Active Players Chart
    updateActivePlayersChart(charts.activePlayersChart, currentTime, data.active_players);
  
    // Update Top Scores Chart
    updateTopScoresChart(charts.topScoresChart, data.top_scores);
  }
  
  async function createCharts() {
    const data = await fetchData();
  
    // Active Players Chart
    const ctx1 = document.getElementById('activePlayersChart').getContext('2d');
    const activePlayersChart = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: [], // Start with empty labels
        datasets: [
          {
            label: 'Active Players',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Active Players',
            },
          },
        },
      },
    });
  
    // Top Scores Chart
    const ctx2 = document.getElementById('topScoresChart').getContext('2d');
    const topScoresChart = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
        datasets: [
          {
            label: 'Top Scores',
            data: data.top_scores,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Score',
            },
          },
        },
      },
    });
  
    // Initialize the Active Players Chart with the first data point
    const initialTime = new Date().toLocaleTimeString();
    updateActivePlayersChart(activePlayersChart, initialTime, data.active_players);
  
    // Set up periodic data refresh every 5 seconds
    setInterval(() => {
      updateCharts({ activePlayersChart, topScoresChart });
    }, 5000);
  }
  
  createCharts();
  