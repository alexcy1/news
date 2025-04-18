
export function qs(selector, parent = document) {
  try {
    return parent.querySelector(selector);
  } catch (error) {
    console.warn(`Element not found: ${selector}`);
    return null;
  }
}

export function getLocalStorage(key) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value);
  } catch (error) {
    console.error(`getLocalStorage error for key "${key}":`, error);
    return null;
  }
}

export function setLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`setLocalStorage error for key "${key}":`, error);
    return false;
  }
}

// URL parameter parser with validation
// export function getParam(param) {
//   try {
//     const queryString = window.location.search;
//     if (!queryString) return null;
    
//     const urlParams = new URLSearchParams(queryString);
//     const value = urlParams.get(param);
    
//     return value || null;
//   } catch (error) {
//     console.error(`getParam error for param "${param}":`, error);
//     return null;
//   }
// }

export function getParam(param) {
  try {
      // Handle both hash and query params
      const url = new URL(window.location.href);
      return url.searchParams.get(param) || url.hashParams?.get(param) || null;
  } catch (error) {
      console.error(`getParam error for param "${param}":`, error);
      return null;
  }
}


// Event listener with validation
export function setClick(selector, callback) {
  try {
    const element = qs(selector);
    element.addEventListener("touchend", (event) => {
      event.preventDefault();
      callback();
    });
    element.addEventListener("click", callback);
  } catch (error) {
    console.error(`setClick error for selector "${selector}":`, error);
  }
}

// Template rendering with validation
export function renderListWithTemplate(templateFn, parentElement, list, position = "afterbegin", clear = false) {
  try {
    if (clear) parentElement.innerHTML = "";
    if (!Array.isArray(list)) throw new Error("List must be an array");
    
    const htmlStrings = list.map(templateFn);
    parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
  } catch (error) {
    console.error("renderListWithTemplate error:", error);
    parentElement.innerHTML = `<div class="error">Content failed to load</div>`;
  }
}

// Template rendering with validation
export function renderWithTemplate(template, parentElement, data, callback) {
  try {
    if (!parentElement) throw new Error("Parent element not found");
    parentElement.innerHTML = template;
    if (callback) callback(data);
  } catch (error) {
    console.error("renderWithTemplate error:", error);
    parentElement.innerHTML = `<div class="error">Template failed to render</div>`;
  }
}

// Template loader with error handling
export async function loadTemplate(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.text();
  } catch (error) {
    console.error(`loadTemplate error for path "${path}":`, error);
    return `<div class="error">Failed to load template</div>`;
  }
}

// Header/footer loader with validation
export async function loadHeaderFooter() {
  try {
    const headerTemplate = await loadTemplate("/partials/header.html");
    const headerElement = qs("#main-header");
    const footerTemplate = await loadTemplate("/partials/footer.html");
    const footerElement = qs("#main-footer");

    renderWithTemplate(headerTemplate, headerElement);
    renderWithTemplate(footerTemplate, footerElement);
  } catch (error) {
    console.error("loadHeaderFooter error:", error);
    throw error;
  }
}