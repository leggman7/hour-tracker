function loadHours(tag) {
    fetch(`/api/equipment-hours/${encodeURIComponent(tag)}`)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const ctx = document.getElementById('hoursChart').getContext('2d');
          new Chart(ctx, {
            type: 'line', // Line chart to show hours over time
            data: {
              labels: data.map(hour => new Date(hour.entry_date).toISOString().substring(0, 10)), // Dates
              datasets: [{
                  label: 'Total Counter Hours',
                  data: data.map(hour => hour.total_counter_hours),
                  borderColor: 'red',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  fill: false
              }, {
                  label: 'Meter Hours',
                  data: data.map(hour => hour.meter_hours),
                  borderColor: 'blue',
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  fill: false
              }]
            },
            options: {
              scales: {
                  x: {
                      type: 'time',
                      time: {
                          unit: 'day'
                      }
                  },
                  y: {
                      beginAtZero: true
                  }
              }
            }
          });
        } else {
          document.getElementById('hours-list').textContent = 'No hours found for this equipment tag.';
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
