// js/tools/brainstorm-board.js

let nodes = [];
const STORAGE_KEY = "mindMapNodes";

// DOM element references
let boardContainer, nodesContainer, svgLayer, ideaForm, ideaInput;

// Dragging state
let activeNode = null;
let offsetX = 0;
let offsetY = 0;

/**
 * Loads nodes from localStorage.
 */
function loadNodes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  nodes = stored ? JSON.parse(stored) : [];
}

/**
 * Saves the current state of nodes to localStorage.
 */
function saveNodes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
}

/**
 * Renders the entire mind map, including nodes and connectors.
 */
function renderMindMap() {
  nodesContainer.innerHTML = "";
  svgLayer.innerHTML = "";

  nodes.forEach((node) => {
    const nodeEl = createNodeElement(node);
    nodesContainer.appendChild(nodeEl);

    // If the node has a parent, draw a line to it
    if (node.parentId) {
      const parentNode = nodes.find((p) => p.id === node.parentId);
      if (parentNode) {
        drawConnector(parentNode, node);
      }
    }
  });
}

/**
 * Creates a DOM element for a single node.
 * @param {object} node - The node data.
 * @returns {HTMLElement} The created node element.
 */
function createNodeElement(node) {
  const nodeEl = document.createElement("div");
  nodeEl.className = "brainstorm-idea";
  if (!node.parentId) {
    nodeEl.classList.add("root-node"); // Style root nodes differently
  }
  nodeEl.dataset.id = node.id;
  nodeEl.style.left = `${node.x}px`;
  nodeEl.style.top = `${node.y}px`;

  // Add double-click listener for editing
  nodeEl.addEventListener("dblclick", () => {
    makeNodeEditable(nodeEl, node);
  });

  const textEl = document.createElement("p");
  textEl.textContent = node.text;

  // Button to add a child node
  const addChildBtn = document.createElement("button");
  addChildBtn.className = "add-child-btn";
  addChildBtn.innerHTML = "+";
  addChildBtn.title = "Add Child Idea";
  const nodeId = node.id; // Capture the node id
  addChildBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    addNode("New Idea", nodeId);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-idea-btn";
  deleteBtn.innerHTML = "&times;";
  deleteBtn.title = "Delete Idea";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteNode(nodeId);
  });

  nodeEl.appendChild(textEl);
  nodeEl.appendChild(addChildBtn);
  nodeEl.appendChild(deleteBtn);
  return nodeEl;
}

/**
 * Draws an SVG line between two nodes.
 * @param {object} parentNode - The parent node data.
 * @param {object} childNode - The child node data.
 */
function drawConnector(parentNode, childNode) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  const parentEl = nodesContainer.querySelector(`[data-id='${parentNode.id}']`);
  const childEl = nodesContainer.querySelector(`[data-id='${childNode.id}']`);

  if (!parentEl || !childEl) return;

  const x1 = parentEl.offsetLeft + parentEl.offsetWidth / 2;
  const y1 = parentEl.offsetTop + parentEl.offsetHeight / 2;
  const x2 = childEl.offsetLeft + childEl.offsetWidth / 2;
  const y2 = childEl.offsetTop + childEl.offsetHeight / 2;

  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", "var(--bs-gray-500)");
  line.setAttribute("stroke-width", "2");
  svgLayer.appendChild(line);
}

/**
 * Adds a new node to the board.
 * @param {string} text - The content of the node.
 * @param {number|null} parentId - The ID of the parent node, or null for a root node.
 */
function addNode(text, parentId = null) {
  let initialX, initialY;
  const boardRect = boardContainer.getBoundingClientRect();

  if (parentId) {
    const parentNode = nodes.find((n) => n.id === parentId);
    initialX = parentNode.x + 150 + (Math.random() * 50 - 25);
    initialY = parentNode.y + (Math.random() * 100 - 50);
  } else {
    // Place new root ideas near the center
    initialX = boardRect.width / 2 - 100;
    initialY = boardRect.height / 2 - 50;
  }

  const newNode = {
    id: Date.now(),
    text,
    parentId,
    x: Math.max(20, initialX),
    y: Math.max(20, initialY),
  };
  nodes.push(newNode);
  saveNodes();
  renderMindMap();
}

/**
 * Deletes a node and all its descendants by its ID.
 * @param {number} nodeId - The ID of the node to delete.
 */
function deleteNode(nodeId) {
  const idsToDelete = [nodeId];

  // Recursively find all children to delete
  function findChildren(currentId) {
    const children = nodes.filter((n) => n.parentId === currentId);
    children.forEach((child) => {
      idsToDelete.push(child.id);
      findChildren(child.id);
    });
  }

  findChildren(nodeId);

  nodes = nodes.filter((node) => !idsToDelete.includes(node.id));
  saveNodes();
  renderMindMap();
}

/**
 * Makes a node editable by replacing its text with an input field.
 * @param {HTMLElement} nodeEl - The node's div element.
 * @param {object} node - The node data object.
 */
function makeNodeEditable(nodeEl, node) {
  const p = nodeEl.querySelector("p");
  if (!p) return;

  const input = document.createElement("textarea");
  input.className = "idea-edit-input";
  input.value = node.text;

  const saveChanges = () => {
    const newText = input.value.trim();
    if (newText) {
      node.text = newText;
      saveNodes();
    }
    // Re-render to show the updated text as a <p> again
    renderMindMap();
  };

  input.addEventListener("blur", saveChanges);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      input.blur(); // Trigger the blur event to save
    }
  });

  nodeEl.replaceChild(input, p);
  input.focus();
  input.select();
}

function handleMouseDown(e) {
  const nodeElement = e.target.closest(".brainstorm-idea");
  if (nodeElement) {
    // Prevent starting a drag if we are editing
    if (e.target.tagName === "TEXTAREA") return;

    activeNode = nodeElement;
    offsetX = e.clientX - activeNode.offsetLeft;
    offsetY = e.clientY - activeNode.offsetTop;
    activeNode.style.zIndex = 1001; // Bring to front
    activeNode.classList.add("dragging");
  }
}

function handleMouseMove(e) {
  if (!activeNode) return;
  e.preventDefault();
  const x = e.clientX - offsetX;
  const y = e.clientY - offsetY;

  // Constrain the node within the board boundaries
  const boardRect = boardContainer.getBoundingClientRect();
  const nodeRect = activeNode.getBoundingClientRect();
  const constrainedX = Math.max(
    0,
    Math.min(x, boardRect.width - nodeRect.width)
  );
  const constrainedY = Math.max(
    0,
    Math.min(y, boardRect.height - nodeRect.height)
  );
  activeNode.style.left = `${constrainedX}px`;
  activeNode.style.top = `${constrainedY}px`;

  // Live update connectors while dragging
  renderMindMap();
}

function handleMouseUp() {
  if (!activeNode) return;
  const id = parseInt(activeNode.dataset.id, 10);
  const node = nodes.find((i) => i.id === id);
  if (node) {
    node.x = activeNode.offsetLeft;
    node.y = activeNode.offsetTop;
    saveNodes();
  }
  activeNode.style.zIndex = ""; // Reset z-index
  activeNode.classList.remove("dragging");
  activeNode = null;
  renderMindMap(); // Final render to fix lines
}

export function init() {
  boardContainer = document.getElementById("brainstorm-board-container");
  nodesContainer = document.getElementById("mind-map-nodes-container");
  svgLayer = document.getElementById("mind-map-svg-layer");
  ideaForm = document.getElementById("new-idea-form");
  ideaInput = document.getElementById("new-idea-input");

  ideaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = ideaInput.value.trim();
    if (text) {
      // If no nodes exist, add a root node. Otherwise, this form does nothing.
      if (nodes.length === 0) {
        addNode(text, null);
      } else {
        alert(
          "Central idea already exists. Add children using the '+' button on a node."
        );
      }
      ideaInput.value = "";
    }
  });

  boardContainer.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  loadNodes();
  renderMindMap();
}

export function cleanup() {
  // The form event listener is attached to an element that gets removed,
  // so we don't need to manually remove it.
  // However, the document-level listeners for dragging should be cleaned up.
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
}
