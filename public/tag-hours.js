function loadHours(tag) {
    fetch(`/api/equipment-hours/${encodeURIComponent(tag)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const list = document.getElementById('hours-list');
        list.innerHTML = ''; // Clear previous entries
        if (data.length > 0) {
          data.forEach(hour => {
            const div = document.createElement('div');
            div.textContent = `Date: ${new Date(hour.entry_date).toISOString().substring(0, 10)}, Total Counter Hours: ${hour.total_counter_hours}, Meter Hours: ${hour.meter_hours}, Entered By: ${hour.entered_by}, Notes: ${hour.notes}`;
            list.appendChild(div);
          });
        } else {
          list.textContent = 'No hours found for this equipment tag.';
        }
      })
      .catch(error => {
        console.error('Error loading equipment hours:', error);
        document.getElementById('hours-list').textContent = 'Failed to load data.';
      });
  }
  
  function loadHoursForTag() {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get('tag');
    if (tag) {
      loadHours(tag);
    } else {
      document.getElementById('hours-list').textContent = 'No equipment tag specified.';
    }
  }
  
  document.addEventListener('DOMContentLoaded', loadHoursForTag);
  