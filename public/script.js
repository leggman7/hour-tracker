document.addEventListener('DOMContentLoaded', function() {
  fetch('/api/equipment-hours')
    .then(response => response.json())
    .then(data => {
      const list = document.getElementById('equipment-hours-list');
      list.innerHTML = ''; // Clear existing entries
      data.forEach(hour => {
        // Convert the date string to a Date object
        const date = new Date(hour.entry_date);
        const div = document.createElement('div');
        div.textContent = `Tag: ${hour.equipment_tag}, Date: ${date.toISOString().substring(0, 10)}, Total Hours: ${hour.total_counter_hours}, Meter Hours: ${hour.meter_hours}, Entered By: ${hour.entered_by}, Notes: ${hour.notes}`;
        list.appendChild(div);
      });
    })
    .catch(error => console.error('Error:', error));
});


  const form = document.getElementById('new-equipment-hour-form');
  form.onsubmit = function(event) {
    event.preventDefault();
    const data = {
      equipment_tag: document.getElementById('equipment_tag').value,
      entry_date: document.getElementById('entry_date').value,
      total_counter_hours: document.getElementById('total_counter_hours').value,
      meter_hours: document.getElementById('meter_hours').value,
      entered_by: document.getElementById('entered_by').value,
      notes: document.getElementById('notes').value
    };

    fetch('/api/equipment-hours', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(hour => {
      // Add the new hour to the list
      const list = document.getElementById('equipment-hours-list');
      const div = document.createElement('div');
      div.textContent = `Tag: ${hour.equipment_tag}, Date: ${hour.entry_date}, Total Hours: ${hour.total_counter_hours}, Meter Hours: ${hour.meter_hours}, Entered By: ${hour.entered_by}, Notes: ${hour.notes}`;
      list.appendChild(div);
      // Reset the form
      form.reset();
    })
    .catch(error => console.error('Error:', error));
  };

