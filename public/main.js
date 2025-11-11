document.querySelector('button').addEventListener('click', run)

function run() {
  console.log('hi')
  const age = document.querySelector('input').value
  if (!+age) return console.log('has to be number')
  fetch('/api', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'age': age
    })
  })
}

//claude code
const ctx = document.getElementById('activityChart');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Steps',
      data: [6500, 7200, 8100, 7800, 8400, 9200, 8247],
      borderColor: '#5794f2',
      backgroundColor: 'rgba(87, 148, 242, 0.1)',
      tension: 0.4,
      fill: true
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#2d2f33' },
        ticks: { color: '#9fa3af' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9fa3af' }
      }
    }
  }
});