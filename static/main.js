// static/main.js

async function fetchData() {
  const response = await fetch('/api/player-stats-history');
  const data = await response.json();
  return data;
}

async function createCharts() {
  const data = await fetchData();
  console.log('Initial data:', data);

  const maxDataPoints = 20;
  const dataPointCount = data.timestamps.length;
  const startIndex = dataPointCount > maxDataPoints ? dataPointCount - maxDataPoints : 0;

  const labels = data.timestamps.slice(startIndex);
  const activePlayersData = data.active_players.slice(startIndex);
  const topScoresData = data.top_scores.slice(startIndex);

  // Active Players Chart
  const ctx1 = document.getElementById('activePlayersChart').getContext('2d');
  const activePlayersChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Active Players',
          data: activePlayersData,
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
          data: topScoresData[topScoresData.length - 1], // Use the latest top scores
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

  // Set up periodic data refresh every 5 seconds
  setInterval(() => {
    updateCharts({ activePlayersChart, topScoresChart, maxDataPoints });
  }, 2000);
}

async function updateCharts(charts) {
  const data = await fetchData();
  console.log('Fetched data:', data);

  // Get the latest data point
  const lastIndex = data.timestamps.length - 1;
  const latestTimestamp = data.timestamps[lastIndex];
  const latestActivePlayers = data.active_players[lastIndex];
  const latestTopScores = data.top_scores[lastIndex];

  // Update Active Players Chart
  updateActivePlayersChart(charts.activePlayersChart, latestTimestamp, latestActivePlayers, charts.maxDataPoints);

  // Update Top Scores Chart
  updateTopScoresChart(charts.topScoresChart, latestTopScores);
}

function updateActivePlayersChart(chart, newLabel, newData, maxDataPoints) {
  chart.data.labels.push(newLabel);
  chart.data.datasets[0].data.push(newData);

  // Limit the number of data points
  if (chart.data.labels.length > maxDataPoints) {
    chart.data.labels.shift(); // Remove oldest label
    chart.data.datasets[0].data.shift(); // Remove oldest data point
  }

  chart.update();
}

function updateTopScoresChart(chart, newData) {
  chart.data.datasets[0].data = newData;
  chart.update();
}

createCharts();
