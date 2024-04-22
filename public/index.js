document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.getElementById('equipment-tag-dropdown');
  
    fetch('/api/equipment-tags')
      .then(response => response.json())
      .then(tags => {
        tags.forEach(tag => {
          const option = document.createElement('option');
          option.value = tag;
          option.textContent = tag;
          dropdown.appendChild(option);
        });
      })
      .catch(error => console.error('Error loading equipment tags:', error));
  
  });
  
  function viewSingleEquipment() {
    const tag = document.getElementById('equipment-tag-dropdown').value;
    if (tag) {
      window.location.href = `tag-hours.html?tag=${encodeURIComponent(tag)}`;
    } else {
      alert('Please select an equipment tag.');
    }
  }
  