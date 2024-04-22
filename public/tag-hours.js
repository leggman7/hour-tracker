import 'https://cdn.jsdelivr.net/npm/chart.js'; //other ways of importing dont seem to work

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get('tag');
    loadDataForTag(tag); // Load data and setup chart
});

let myChart = null; // This variable will hold the chart instance


function loadDataForTag(tag) {
    fetch(`/api/equipment-hours/${encodeURIComponent(tag)}`)
    .then(response => response.json())
    .then(data => {
        displayDataPoints(data);
        setupChart(data);
    })
    .catch(error => {
        console.error('Error loading equipment hours:', error);
        document.getElementById('dataPoints').textContent = 'Failed to load data.';
    });
}

function displayDataPoints(data) {
  const dataList = document.getElementById('dataList');
  dataList.innerHTML = ''; // Clear existing entries
  data.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${new Date(entry.entry_date).toLocaleDateString()}</td>
          <td>${entry.total_counter_hours}</td>
          <td>${entry.meter_hours}</td>
          <td>${entry.notes}</td>
          <td>${entry.entered_by}</td>
          <td>
              <button onclick="makeEditable(this, ${entry.id})">Edit</button>
              <button onclick="deleteEntry(${entry.id}, this)">Delete</button>
          </td>
      `;
      dataList.appendChild(row);
      // console.log(`entryID: ${entry.id}`);
  });
}

window.makeEditable = function(button, entryId) {
  const row = button.parentNode.parentNode;
  const cells = row.querySelectorAll('td');
  cells[1].innerHTML = `<input type='number' value='${cells[1].textContent}' />`;
  cells[2].innerHTML = `<input type='number' value='${cells[2].textContent}' />`;
  cells[3].innerHTML = `<input type='text' value='${cells[3].textContent}' />`;
  cells[4].innerHTML = `<input type='text' value='${cells[4].textContent}' />`;
  button.textContent = 'Save';
  button.onclick = function() { saveChanges(this, entryId); };
}

function saveChanges(button, entryId) {
  console.log(`Function Save Changes, entryId: ${entryId}`);
  const row = button.parentNode.parentNode;
  const inputs = row.querySelectorAll('input');
  const totalCounterHours = inputs[0].value;
  const meterHours = inputs[1].value;
  const notes = inputs[2].value;
  const enteredBy = inputs[3].value;

  fetch(`/api/update-equipment-hours/${entryId}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          total_counter_hours: totalCounterHours,
          meter_hours: meterHours,
          notes: notes,
          entered_by: enteredBy
      })
  })
  .then(response => response.json())
  .then(data => {
      alert('Entry updated successfully!');
      const urlParams = new URLSearchParams(window.location.search);
      loadDataForTag(urlParams.get('tag')); // Reload data points to reflect changes
  })
  .catch(error => {
      console.error('Error updating entry:', error);
      alert('Failed to update the entry.');
  });
}

window.deleteEntry = function(entryId, button) {
  if (confirm('Are you sure you want to delete this entry?')) {
      fetch(`/api/delete-equipment-hours/${entryId}`, {
          method: 'DELETE'
      })
      .then(response => {
          if (response.ok) {
              console.log('Entry deleted successfully');
              button.closest('tr').remove(); // Remove the row from the table
          } else {
              throw new Error('Failed to delete the entry');
          }
      })
      .catch(error => {
          console.error('Error deleting entry:', error);
          alert('Failed to delete the entry.');
      });
  }
}

function setupChart(data) {
    const labels = data.map(hour => new Date(hour.entry_date).toLocaleDateString());
    const totalHoursData = data.map(hour => hour.total_counter_hours);
    const meterHoursData = data.map(hour => hour.meter_hours);
    labels.reverse(); totalHoursData.reverse(); meterHoursData.reverse();
    const ctx = document.getElementById('hoursChart').getContext('2d');
    
    // Check if a chart instance already exists
    if (myChart) {
      myChart.destroy(); // Destroy the existing chart
    }
    
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Counter Hours',
                data: totalHoursData,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }, {
                label: 'Meter Hours',
                data: meterHoursData,
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });
}