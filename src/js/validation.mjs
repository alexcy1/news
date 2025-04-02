export class Validator {
    static validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) throw new Error("Email is required");
      if (!emailRegex.test(email)) throw new Error("Please enter a valid email");
      return true;
    }
  
    static validateRequiredFields(data, fields) {
      const missingFields = fields.filter(field => !data[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }
      return true;
    }
  
    static validateElement(element, name = "Element") {
      if (!element) throw new Error(`${name} not found`);
      return true;
    }
  
    static validateTemplate(template) {
      if (!template || typeof template !== "string") {
        throw new Error("Invalid template");
      }
      return true;
    }


    // Sign Up / User Registration

    static validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) throw new Error("Email is required");
      if (!emailRegex.test(email)) throw new Error("Please enter a valid email");
      return true;
    }
  
    static validateRequiredFields(data, fields) {
      const missingFields = fields.filter(field => !data[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }
      return true;
    }
  
    static validateElement(element, name = "Element") {
      if (!element) throw new Error(`${name} not found`);
      return true;
    }
  
    static validateTemplate(template) {
      if (!template || typeof template !== "string") {
        throw new Error("Invalid template");
      }
      return true;
    }
  
    static validatePassword(password) {
      if (!password) throw new Error("Password is required");
      if (password.length < 8) throw new Error("Password must be at least 8 characters");
      if (!/[A-Z]/.test(password)) throw new Error("Password must contain at least one uppercase letter");
      if (!/[a-z]/.test(password)) throw new Error("Password must contain at least one lowercase letter");
      if (!/[0-9]/.test(password)) throw new Error("Password must contain at least one number");
      if (!/[!@#$%^&*]/.test(password)) throw new Error("Password must contain at least one special character");
      return true;
    }
  
    static validateUsername(username) {
      if (!username) throw new Error("Username is required");
      if (username.length < 3) throw new Error("Username must be at least 3 characters");
      if (username.length > 20) throw new Error("Username must be less than 20 characters");
      if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new Error("Username can only contain letters, numbers and underscores");
      return true;
    }

  }


