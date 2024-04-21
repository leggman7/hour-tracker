function loadHours() {
    const tag = document.getElementById('tag-input').value;
    if (tag) {
      fetch(`/api/equipment-hours/${tag}`)
        .then(response => response.json())
        .then(data => {
          const list = document.getElementById('hours-list');
          list.innerHTML = ''; // Clear previous entries
          if (data && data.length > 0) {
            data.forEach(hour => {
              const div = document.createElement('div');
              div.textContent = `Date: ${new Date(hour.entry_date).toISOString().substring(0, 10)}, Total Counter Hours: ${hour.total_counter_hours}, Meter Hours: ${hour.meter_hours}, Entered By: ${hour.entered_by}, Notes: ${hour.notes}`;
              list.appendChild(div);
            });
          } else {
            list.textContent = 'No hours found for this equipment tag.';
          }
        })
        .catch(error => console.error('Error loading equipment hours:', error));
    } else {
      alert('Please enter an equipment tag.');
    }
  }
  
//look for the equipment_tag for which to load data for
function loadHoursForTag() {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get('tag');
    if (tag) {
      loadHours(tag);
    }
  }
  
  document.addEventListener('DOMContentLoaded', loadHoursForTag);
  