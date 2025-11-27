const ctx = document.getElementById('activityChart');

let hasChart = false;
let newChart;
let index;
let noteID;

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
      result.userCharts.forEach((e, i) => {
        prices.push(e.aiResponse.items[+targetId].unit_price)
        purchaseDate.push(e.aiResponse.invoice_date)
      });
    } else if (dataType === 'total') {
      result.userCharts.forEach((e, i) => {
        prices.push(e.aiResponse.items[+targetId].total)
        purchaseDate.push(e.aiResponse.invoice_date)
      });
    }


    document.getElementById(`${targetId}`);
    if (!targetId) return;

    const charts = result.charts

    let itemName = result.userCharts[0].aiResponse.items[+targetId].description

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
            ticks: {
              color: '#9fa3af',
              callback: function (value, index, ticks) {
                return '$' + value;
              }
            },
          },
          x: {
            grid: { display: false },
            ticks: { color: '#9fa3af' }
          }
        },
        onClick: (event, activeElements) => {
          if (activeElements.length > 0) {
            const element = activeElements[0];
            index = element.index;

            const invoice = result.userCharts[index].file;

            document.querySelector('#invoice').innerHTML = `
            <div class="invoice-notes-panel">
    <div class="invoice-header">
        <div class="invoice-number">
            Currently Viewing Invoice <span>${index}</span>
        </div>
        <a href="${invoice}" 
           class="view-invoice-btn" 
           target="_blank">
            View Invoice PDF
        </a>
    </div>

    <div class="notes-grid">
        <!-- Note Input Section -->
        <div class="note-input-section">
            <div class="section-title">Create New Note</div>
            <form action="/post/createNote/${index}" method="POST" class="note-form">
                <textarea 
                    class="note-textarea" 
                    name="note" 
                    placeholder="Add notes about this invoice"
                    required></textarea>
            </form>
            <button class="submit-btn">Add Note</button>
        </div>

        <!-- Notes Display Section -->
        <div class="notes-display-section">
            <div class="section-title">Invoice Notes</div>
            <div class="notes-list">
                
            </div>
        </div>
    </div>
</div>
            `
            document.querySelector('.notes-list').innerHTML = ''
            console.log(result.userCharts[index]._id)
            result.notes.forEach((e) => {
              if (result.userCharts[index]._id === e.invoiceID) {
                document.querySelector('.notes-list').innerHTML += `<div><span class="timestamp">[${e.createdAt.slice(0, -14)}]</span> ${e.note} <button class="delBtn" id="${e._id}">Delete</button></div>`
              }
            })
          }

          document.querySelector('.submit-btn').addEventListener('click', addNote)
          document.querySelector('.notes-list').addEventListener('click', deleteNote)

          async function addNote() {
            const note = document.querySelector('.note-textarea').value
            console.log(note)
            if (index === undefined) return console.error('index is undefined!')
            console.log(index)
            const url = `/post/createNote/${index}`;
            try {
              const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  'note': note,
                })
              });
              if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
              }

              const result = await response.json();
              console.log(result);

              const newNote = result[result.length - 1]

              document.querySelector('.notes-list').innerHTML += `<div><span class="timestamp">[${newNote.createdAt.slice(0, -14)}]</span> ${newNote.note}<button class="delBtn" id="${newNote._id}">Delete</button></div>`

              const messageBody = document.querySelector('.notes-list');
              messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;


              console.log('added event listener?');

            } catch (error) {
              console.error(error.message);
            }
          }



          async function deleteNote(e) {
            const target = e.target.closest('.delBtn')

            if (target) {
              console.log(target.id)
              const url = `/post/deleteNote/${target.id}`;
              try {
                const response = await fetch(url, {
                  method: "delete",
                });
                if (!response.ok) {
                  throw new Error(`Response status: ${response.status}`);
                }

                const result = await response.json();
                console.log(result._id, 'id from server');

                target.parentNode.remove()


              } catch (error) {
                console.error(error.message);
              }
            }
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
