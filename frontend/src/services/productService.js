import { products } from '@/data/products';

// Product schema validation
const requiredFields = ['id', 'name', 'price', 'image', 'brandUrl', 'description', 'ingredients'];
const fieldTypes = {
    id: 'number',
    name: 'string',
    price: 'number',
    image: 'string',
    brandUrl: 'string',
    description: 'string',
    ingredients: 'object' // Array is object type in JS
};

/**
 * Validates if a product matches the required schema
 * @param {Object} product - Product object to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateProductSchema = (product) => {
    const errors = [];

    if (!product || typeof product !== 'object') {
        return { valid: false, errors: ['Product must be an object'] };
    }

    // Check required fields
    for (const field of requiredFields) {
        if (!(field in product)) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Check field types
    for (const [field, expectedType] of Object.entries(fieldTypes)) {
        if (product[field] !== undefined) {
            const actualType = Array.isArray(product[field]) ? 'object' : typeof product[field];
            
            if (field === 'ingredients') {
                if (!Array.isArray(product[field])) {
                    errors.push(`Field '${field}' must be an array`);
                }
            } else if (actualType !== expectedType) {
                errors.push(`Field '${field}' must be of type ${expectedType}, got ${actualType}`);
            }
        }
    }

    // Validate specific field constraints
    if (product.id !== undefined && (!Number.isInteger(product.id) || product.id <= 0)) {
        errors.push('Field "id" must be a positive integer');
    }

    if (product.price !== undefined && (typeof product.price !== 'number' || product.price < 0)) {
        errors.push('Field "price" must be a non-negative number');
    }

    if (product.ingredients && !Array.isArray(product.ingredients)) {
        errors.push('Field "ingredients" must be an array');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Validates all products in the database
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export const validateAllProducts = () => {
    const allErrors = [];
    
    products.forEach((product, index) => {
        const validation = validateProductSchema(product);
        if (!validation.valid) {
            allErrors.push({
                productIndex: index,
                productId: product.id,
                errors: validation.errors
            });
        }
    });

    return {
        valid: allErrors.length === 0,
        errors: allErrors
    };
};

/**
 * Returns all products
 * @returns {Array} - Array of all products
 */
export const getAllProducts = () => {
    try {
        // Validate all products before returning
        const validation = validateAllProducts();
        if (!validation.valid) {
            console.warn('Some products have validation errors:', validation.errors);
        }
        
        return [...products]; // Return a copy to prevent mutations
    } catch (error) {
        console.error('Error getting all products:', error);
        return [];
    }
};

/**
 * Finds a product by ID
 * @param {number} id - Product ID
 * @returns {Object|null} - Product object or null if not found
 */
export const getProductById = (id) => {
    try {
        // Validate input
        if (id === undefined || id === null) {
            console.warn('getProductById: ID is required');
            return null;
        }

        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            console.warn('getProductById: ID must be a positive integer');
            return null;
        }

        // Find product
        const product = products.find(p => p.id === numericId);
        
        if (!product) {
            console.warn(`getProductById: Product with ID ${id} not found`);
            return null;
        }

        // Validate product schema
        const validation = validateProductSchema(product);
        if (!validation.valid) {
            console.warn(`getProductById: Product ${id} has validation errors:`, validation.errors);
            // Still return the product, but log the warning
        }

        // Return a copy to prevent mutations
        return { ...product };
    } catch (error) {
        console.error('Error getting product by ID:', error);
        return null;
    }
};

/**
 * Finds multiple products by IDs
 * @param {Array<number>} ids - Array of product IDs
 * @returns {Array} - Array of found products
 */
export const getProductsByIds = (ids) => {
    try {
        if (!Array.isArray(ids)) {
            console.warn('getProductsByIds: IDs must be an array');
            return [];
        }

        return ids
            .map(id => getProductById(id))
            .filter(product => product !== null);
    } catch (error) {
        console.error('Error getting products by IDs:', error);
        return [];
    }
};

/**
 * Safely gets a product field value
 * @param {number} id - Product ID
 * @param {string} field - Field name
 * @param {*} defaultValue - Default value if field is missing
 * @returns {*} - Field value or default value
 */
export const getProductField = (id, field, defaultValue = null) => {
    try {
        const product = getProductById(id);
        if (!product) {
            return defaultValue;
        }

        return product[field] !== undefined ? product[field] : defaultValue;
    } catch (error) {
        console.error('Error getting product field:', error);
        return defaultValue;
    }
};

/**
 * Checks if a product exists
 * @param {number} id - Product ID
 * @returns {boolean} - True if product exists
 */
export const productExists = (id) => {
    try {
        return getProductById(id) !== null;
    } catch (error) {
        console.error('Error checking if product exists:', error);
        return false;
    }
};

// Export default service object
const productService = {
    getAllProducts,
    getProductById,
    getProductsByIds,
    getProductField,
    productExists,
    validateProductSchema,
    validateAllProducts
};

export default productService;

