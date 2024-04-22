document.addEventListener('DOMContentLoaded', function() {
  fetch('/api/latest-equipment-hours')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('formContainer').querySelector('tbody');
      data.forEach(entry => {
        const row = document.createElement('tr');
        const today = getCurrentDate();
        const input = document.createElement('input');
        input.type = 'number';
        input.name = `new-meter-hours-${entry.equipment_tag}`;
        input.placeholder = "Enter New Meter Hours";
        input.required = true;

        input.addEventListener('input', () => validateMeterInput(input, entry.meter_hours, entry.entry_date));

        row.innerHTML = `
          <td>${entry.equipment_tag}</td>
          <td>${new Date(entry.entry_date).toLocaleDateString()}</td>
          <td>${entry.total_counter_hours}</td>
          <td>${entry.meter_hours}</td>
          <td></td>
        `;

        row.cells[4].appendChild(input); // Append the input to the fifth column
        container.appendChild(row);
      });
    })
    .catch(error => console.error('Failed to fetch latest equipment hours:', error));
});


function getCurrentDate() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Formats date as "YYYY-MM-DD"
}

function submitAllForms() {
  const enteredBy = document.getElementById('enteredBy').value;
  if (!enteredBy) {
      alert("Please enter your name in the 'Entered By' field.");
      return;
  }

  let requests = []; // Array to hold all fetch promises
  const rows = document.querySelectorAll('#formContainer tbody tr');
  rows.forEach(row => {
      const equipmentTag = row.cells[0].textContent.trim();
      const inputField = row.querySelector(`input[name='new-meter-hours-${equipmentTag}']`);
      const newMeterHours = inputField ? parseFloat(inputField.value) : null;

      if (newMeterHours && !isNaN(newMeterHours)) {
          const request = fetch(`/api/latest-equipment-hours/${encodeURIComponent(equipmentTag)}`)
              .then(response => response.json())
              .then(latestData => {
                  const lastMeterHours = latestData.meter_hours;
                  const lastTotalCounterHours = latestData.total_counter_hours;
                  let newTotalCounterHours = lastTotalCounterHours;

                  if (newMeterHours > lastMeterHours) {
                      const increment = newMeterHours - lastMeterHours;
                      newTotalCounterHours += increment;
                  }
                  
                  return fetch('/api/equipment-hours', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                          equipmentTag: equipmentTag,
                          entryDate: new Date().toISOString(), // Assuming immediate submission
                          totalCounterHours: newTotalCounterHours,
                          meterHours: newMeterHours,
                          enteredBy: enteredBy,
                      }),
                  });
              });
          requests.push(request);
      }
  });

  // Wait for all requests to complete
  Promise.all(requests).then(() => {
      window.location.reload(); // Reload the page after all submissions
  }).catch(error => {
      console.error('An error occurred:', error);
  });
}

function validateMeterInput(inputField, latestMeterHours, lastMeasurementDate) {
  const inputValue = parseFloat(inputField.value);
  const currentDate = new Date();
  const lastDate = new Date(lastMeasurementDate);
  const timeDifference = currentDate - lastDate; // Difference in milliseconds
  const daysDifference = timeDifference / (1000 * 60 * 60 * 24); // Convert to days
  const maxAllowedHours = 24 * daysDifference + latestMeterHours;

  // Clear any previous styles or tooltips
  inputField.style.backgroundColor = '';
  inputField.title = '';

  // Check if the input is not a number
  if (inputValue < latestMeterHours) {
      inputField.style.backgroundColor = 'orange'; // Highlight in orange for values less than the latest
      inputField.title = 'Caution: Input value is less than the latest meter reading.';
  }
  // Check if the input is too high compared to the allowed maximum
  else if (inputValue > maxAllowedHours) {
      inputField.style.backgroundColor = 'red'; // Lighter shade of red for too high values
      inputField.title = `Input value exceeds the maximum allowed meter hours based on the number of days since the last measurement (allowed: ${maxAllowedHours}).`;
  }

  else if (inputValue > latestMeterHours) {
    inputField.style.backgroundColor = 'lightgreen'; // Lighter shade of red for too high values
    inputField.title = `Input value seems ok (allowed: ${maxAllowedHours}).`;
  }
}
