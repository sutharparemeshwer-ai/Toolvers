const batteryLevel = document.getElementById('battery-level');
const batteryPercent = document.getElementById('battery-percent');
const batteryStatus = document.getElementById('battery-status');

// Show loading animation instantly
batteryPercent.textContent = 'Loading...';
batteryStatus.textContent = 'Detecting battery...';
batteryLevel.style.width = '0%';
batteryLevel.style.background = 'lightgray';

if ('getBattery' in navigator) {
  navigator.getBattery().then(battery => {
    function updateAllBatteryInfo() {
      updateLevelInfo();
      updateChargeInfo();
    }

    function updateLevelInfo() {
      const level = Math.floor(battery.level * 100);
      batteryPercent.textContent = level + '%';
      batteryLevel.style.width = level + '%';

      // Smooth color transition
      if (level > 60) batteryLevel.style.background = 'green';
      else if (level > 30) batteryLevel.style.background = 'orange';
      else batteryLevel.style.background = 'red';
    }

    function updateChargeInfo() {
      batteryStatus.textContent = battery.charging ? 'Charging ⚡' : 'Not Charging';
    }

    // Listen for battery updates
    battery.addEventListener('levelchange', updateLevelInfo);
    battery.addEventListener('chargingchange', updateChargeInfo);

    // Initial load
    updateAllBatteryInfo();
  }).catch(() => {
    batteryStatus.textContent = 'Battery info not supported ⚠️';
    batteryPercent.textContent = 'Unavailable';
  });
} else {
  batteryStatus.textContent = 'Battery API not supported ⚠️';
  batteryPercent.textContent = 'Unavailable';
}
