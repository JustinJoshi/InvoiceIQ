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


const ctx = document.getElementById('activityChart');




window.onload = async function makeChart() {
  const url = "/makeChart";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json()
    
    const charts = result.charts

    //create chart variables
    let value = []
    let lables = []

    result.charts.forEach((e, i) => {
      value.push(result.charts[i].value)
      lables.push(result.charts[i].date)
    })

    category = charts[0].category

    //create chart
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: lables,
        datasets: [{
          label: category,
          data: value,
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
  } catch (error) {
    console.error(error.message);
  }
}
