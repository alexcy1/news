import { qs } from '../utils.mjs';
import { Validator } from '../validation.mjs';

export class DOMService {
  static createElement(tag, attributes = {}, children = []) {
    try {
      Validator.validateRequiredFields({ tag }, ["tag"]);
      
      const element = document.createElement(tag);
      Object.entries(attributes).forEach(([key, value]) => {
        element[key] = value;
      });
      
      children.forEach(child => {
        if (child instanceof Node) element.appendChild(child);
      });
      
      return element;
    } catch (error) {
      console.error("DOMService.createElement error:", error);
      throw error;
    }
  }

  static injectLogo(containerSelector, logoData) {
    try {
      Validator.validateRequiredFields(logoData, ["src", "alt", "url"]);
      const container = qs(containerSelector);
      Validator.validateElement(container, "Logo container");

      const logoLink = this.createElement("a", { href: logoData.url });
      const image = this.createElement("img", {
        src: logoData.src,
        alt: logoData.alt,
        className: logoData.class || "",
        width: logoData.width || "",
        height: logoData.height || "",
        loading: "lazy"
      });
      
      logoLink.appendChild(image);
      container.innerHTML = "";
      container.appendChild(logoLink);
    } catch (error) {
      console.error("DOMService.injectLogo error:", error);
      throw error;
    }
  }

  static injectCompanyName(containerSelector, companyData) {
    try {
      Validator.validateRequiredFields(companyData, ["nameTop", "url"]);
      const container = qs(containerSelector);
      Validator.validateElement(container, "Company name container");

      const nameContainer = this.createElement("div", { className: "company-name ms-2" });
      const nameLink = this.createElement("a", { href: companyData.url });
      const nameTop = this.createElement("span", { 
        className: "company-name-top",
        textContent: companyData.nameTop
      });

      nameLink.appendChild(nameTop);
      nameContainer.appendChild(nameLink);
      container.appendChild(nameContainer);
    } catch (error) {
      console.error("DOMService.injectCompanyName error:", error);
      throw error;
    }
  }
}