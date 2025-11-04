// js/tools/subnet-calculator.js

// --- DOM Elements ---
let ipInput, cidrSlider, cidrValue, errorEl;
const resultEls = {};

// --- Helper Functions ---

/**
 * Converts a dotted-decimal IP string to a 32-bit integer.
 * @param {string} ip - The IP address string.
 * @returns {number} The integer representation of the IP.
 */
function ipToLong(ip) {
  return (
    ip
      .split(".")
      .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
  );
}

/**
 * Converts a 32-bit integer to a dotted-decimal IP string.
 * @param {number} long - The integer representation of the IP.
 * @returns {string} The IP address string.
 */
function longToIp(long) {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255,
  ].join(".");
}

/**
 * Validates if a string is a valid IPv4 address.
 * @param {string} ip - The IP address string.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidIp(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && String(num) === part;
  });
}

// --- Core Calculation Logic ---

function calculateSubnet() {
  const ip = ipInput.value;
  const cidr = parseInt(cidrSlider.value, 10);

  // Update CIDR value display
  cidrValue.textContent = cidr;

  // Validate IP
  if (!isValidIp(ip)) {
    errorEl.textContent = "Invalid IP address format.";
    errorEl.classList.remove("d-none");
    return;
  }
  errorEl.classList.add("d-none");

  const ipLong = ipToLong(ip);

  // Calculate Subnet Mask
  const maskLong = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  resultEls.subnetMask.textContent = longToIp(maskLong);

  // Calculate Network Address
  const networkLong = (ipLong & maskLong) >>> 0;
  resultEls.networkAddress.textContent = longToIp(networkLong);

  // Calculate Wildcard Mask
  const wildcardLong = ~maskLong >>> 0;
  resultEls.wildcardMask.textContent = longToIp(wildcardLong);

  // Calculate Broadcast Address
  const broadcastLong = (networkLong | wildcardLong) >>> 0;
  resultEls.broadcastAddress.textContent = longToIp(broadcastLong);

  // Calculate Hosts
  const totalHosts = Math.pow(2, 32 - cidr);
  resultEls.totalHosts.textContent = totalHosts.toLocaleString();

  if (cidr >= 31) {
    resultEls.usableHosts.textContent = "0";
    resultEls.firstHost.textContent = "N/A";
    resultEls.lastHost.textContent = "N/A";
  } else {
    resultEls.usableHosts.textContent = (totalHosts - 2).toLocaleString();
    resultEls.firstHost.textContent = longToIp(networkLong + 1);
    resultEls.lastHost.textContent = longToIp(broadcastLong - 1);
  }
}

// --- Router Hooks ---

export function init() {
  ipInput = document.getElementById("ip-address");
  cidrSlider = document.getElementById("cidr-prefix");
  cidrValue = document.getElementById("cidr-value");
  errorEl = document.getElementById("subnet-error");

  const resultIds = [
    "network-address",
    "broadcast-address",
    "first-host",
    "last-host",
    "subnet-mask",
    "wildcard-mask",
    "total-hosts",
    "usable-hosts",
  ];
  resultIds.forEach((id) => {
    resultEls[id.replace(/-/g, "")] = document.getElementById(id);
  });

  ipInput.addEventListener("input", calculateSubnet);
  cidrSlider.addEventListener("input", calculateSubnet);

  calculateSubnet(); // Initial calculation
}

export function cleanup() {
  ipInput.removeEventListener("input", calculateSubnet);
  cidrSlider.removeEventListener("input", calculateSubnet);
}
