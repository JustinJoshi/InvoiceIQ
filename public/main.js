const ctx = document.getElementById('activityChart');

let hasChart = false;
let newChart;

document.querySelector('.dashboard-grid').addEventListener('click', makeChart);



async function makeChart(e) {
  const url = "/makeChart";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    const targetId = e.originalTarget.id;

    const dataType = document.querySelector("#chartType").value;

    let prices = [];
    let purchaseDate = [];


    if (dataType === 'unit') {
      result.forEach((e, i) => {
        prices.push(e.aiResponse.items[+targetId].unit_price)
        purchaseDate.push(e.aiResponse.invoice_date)
      });
    } else if (dataType === 'total') {
      result.forEach((e, i) => {
        prices.push(e.aiResponse.items[+targetId].total)
        purchaseDate.push(e.aiResponse.invoice_date)
      });
    }


    document.getElementById(`${targetId}`);
    if (!targetId) return;

    const charts = result.charts

    itemName = result[0].aiResponse.items[+targetId].description
    console.log(itemName)

    if (hasChart) newChart.destroy()
    //create chart
    newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: purchaseDate,
        datasets: [{
          label: itemName,
          data: prices,
          borderColor: '#5794f2',
          backgroundColor: 'rgba(87, 149, 242, 0.97)',
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
        },
        onClick: (event, activeElements) => {
          if (activeElements.length > 0) {
            const element = activeElements[0];
            const datasetIndex = element.datasetIndex;
            const index = element.index;

            const label = newChart.data.labels[index];
            const value = newChart.data.datasets[datasetIndex].data[index];

            const invoice = result[index].file

            document.querySelector('#invoice').innerHTML = `
            <section class="invCont">
              <div>
                <a href=${invoice} target="_blank">View Invoice</a>
              </div>
              <div>
                <form action="/createNote" method="POST">
                  <input type="text">
                  <button type="submit">Create Note</button>
                </form>
                <div id="notes"></div>
              </div>
            </section>
            `

            

            console.log(`Clicked: ${label}, Value: ${value}`);
          }
        }
      }
    })

    hasChart = true;
  } catch (error) {
    console.error(error.message);
  }
}



// //drag
// const dropZone = document.getElementById('drop-zone')
// const fileInput = document.getElementById('file-input')
// const uploadBtn = document.getElementById('upload-button')
// const preview = document.getElementById('file-preview')
// const uploadProgress = document.getElementById('upload-progress')
// const uploadStatusEl = document.getElementById('upload-status')
// let filesToUpload = [] // Renamed for clarity

// // Helper functions for status messages
// function showError(message) {
//   uploadStatusEl.textContent = message
//   uploadStatusEl.className = 'status-message error'
// }

// function showSuccess(message) {
//   uploadStatusEl.textContent = message
//   uploadStatusEl.className = 'status-message success'
// }

// // Click-to-browse fallback and keyboard accessibility
// dropZone.addEventListener('click', () => fileInput.click())
// dropZone.addEventListener('keydown', (e) => {
//   if (e.key === 'Enter' || e.key === ' ') {
//     e.preventDefault()
//     fileInput.click()
//   }
// })

// fileInput.addEventListener('change', () => {
//   if (fileInput.files.length > 0) {
//     handleFiles(fileInput.files)
//   }
// })

//   // Prevent default browser behavior for drag events
//   ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
//     dropZone.addEventListener(eventName, (e) => {
//       e.preventDefault()
//       e.stopPropagation()
//     })
//   })

//   // Add visual feedback for drag events
//   ;['dragenter', 'dragover'].forEach((eventName) => {
//     dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'))
//   })
//   ;['dragleave', 'drop'].forEach((eventName) => {
//     dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'))
//   })

// dropZone.addEventListener('drop', (e) => {
//   if (e.dataTransfer.files.length > 0) {
//     handleFiles(e.dataTransfer.files)
//     fileInput.files = e.dataTransfer.files // Synchronize fileInput.files for consistency
//   }
// })


// function handleFiles(fileList) {
//   filesToUpload = Array.from(fileList)
//   preview.innerHTML = '' // Clear previous previews
//   uploadBtn.disabled = true
//   showError('') // Clear previous errors

//   const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
//   const maxSize = 5 * 1024 * 1024 // 5 MB

//   const validatedFiles = filesToUpload.filter((file) => {
//     if (!validTypes.includes(file.type)) {
//       showError(`${file.name}: Invalid file type. Allowed types: JPEG, PNG, PDF.`)
//       return false
//     }
//     if (file.size > maxSize) {
//       showError(`${file.name}: File is too large. Maximum size is 5 MB.`)
//       return false
//     }
//     addPreview(file)
//     return true
//   })

//   filesToUpload = validatedFiles
//   uploadBtn.disabled = filesToUpload.length === 0
//   if (filesToUpload.length > 0 && filesToUpload.length === fileList.length) {
//     showSuccess(`${filesToUpload.length} file(s) ready for upload.`)
//   }
// }


// function addPreview(file) {
//   const wrapper = document.createElement('div')
//   wrapper.className = 'file-item'
//   const fileName = document.createElement('span')
//   fileName.className = 'file-name'
//   fileName.textContent = file.name
//   const fileSize = document.createElement('span')
//   fileSize.className = 'file-size'
//   fileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`

//   if (file.type.startsWith('image/')) {
//     const img = document.createElement('img')
//     const reader = new FileReader()
//     reader.onload = (e) => {
//       img.src = e.target.result
//     }
//     reader.readAsDataURL(file)
//     wrapper.appendChild(img)
//   } else {
//     const extensionIcon = document.createElement('span')
//     extensionIcon.className = 'file-extension'
//     extensionIcon.textContent = file.name.split('.').pop().toUpperCase()
//     wrapper.appendChild(extensionIcon)
//   }
//   wrapper.appendChild(fileName)
//   wrapper.appendChild(fileSize)
//   preview.appendChild(wrapper)
// }

// // uploadBtn.addEventListener('click', uploadWithFetch)

// //OPTIMIZATION implement as backend only function
// async function uploadWithFetch(file) {
//   const formData = new FormData()
//   formData.append('file', file)

//   // Hide progress bar as Fetch API doesn't support upload progress
//   uploadProgress.hidden = true

//   try {
//     const response = await fetch('/createManualInvoice', { method: 'POST', body: formData })
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`)
//     }
//     const responseData = await response.text() // Or response.json() if applicable
//     showSuccess(`${file.name} uploaded successfully. Server: ${responseData}`)
//   } catch (error) {
//     showError(`Upload of ${file.name} failed: ${error.message}`)
//   } finally {
//     uploadBtn.disabled = filesToUpload.length === 0 // Re-enable if there are still files or based on other logic
//   }
// }
