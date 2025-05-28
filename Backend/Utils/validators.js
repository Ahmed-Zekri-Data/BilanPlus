// Validate required fields
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      errors: [`Les champs suivants sont requis: ${missingFields.join(', ')}`]
    };
  }
  
  return { isValid: true };
};

// Validate numeric fields
const validateNumericFields = (data, numericFields) => {
  const invalidFields = [];
  
  for (const field of numericFields) {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const num = Number(data[field]);
      if (isNaN(num)) {
        invalidFields.push(field);
      }
    }
  }
  
  if (invalidFields.length > 0) {
    return {
      isValid: false,
      errors: [`Les champs suivants doivent être numériques: ${invalidFields.join(', ')}`]
    };
  }
  
  return { isValid: true };
};

// Validate positive numeric fields
const validatePositiveNumericFields = (data, numericFields) => {
  const invalidFields = [];
  
  for (const field of numericFields) {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const num = Number(data[field]);
      if (isNaN(num) || num <= 0) {
        invalidFields.push(field);
      }
    }
  }
  
  if (invalidFields.length > 0) {
    return {
      isValid: false,
      errors: [`Les champs suivants doivent être des nombres positifs: ${invalidFields.join(', ')}`]
    };
  }
  
  return { isValid: true };
};

// Validate email format
const validateEmail = (email) => {
  if (!email) return { isValid: true }; // Skip if not required
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      errors: ['Format d\'email invalide']
    };
  }
  
  return { isValid: true };
};

// Validate string length
const validateStringLength = (data, field, minLength, maxLength) => {
  if (!data[field]) return { isValid: true }; // Skip if not required
  
  const length = String(data[field]).length;
  if (length < minLength || length > maxLength) {
    return {
      isValid: false,
      errors: [`Le champ ${field} doit contenir entre ${minLength} et ${maxLength} caractères`]
    };
  }
  
  return { isValid: true };
};

// Validate enum values
const validateEnumValues = (data, field, allowedValues) => {
  if (!data[field]) return { isValid: true }; // Skip if not required
  
  if (!allowedValues.includes(data[field])) {
    return {
      isValid: false,
      errors: [`La valeur du champ ${field} doit être l'une des suivantes: ${allowedValues.join(', ')}`]
    };
  }
  
  return { isValid: true };
};

// Validate MongoDB ObjectId
const validateObjectId = (id) => {
  if (!id) return { isValid: false, errors: ['ID requis'] };
  
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return {
      isValid: false,
      errors: ['Format d\'ID invalide']
    };
  }
  
  return { isValid: true };
};

module.exports = {
  validateRequiredFields,
  validateNumericFields,
  validatePositiveNumericFields,
  validateEmail,
  validateStringLength,
  validateEnumValues,
  validateObjectId
}; 