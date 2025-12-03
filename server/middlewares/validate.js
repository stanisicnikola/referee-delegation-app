/**
 * Middleware for validation with Zod schema
 * @param {object} schema - Zod schema
 * @param {string} type - Validation type: "body", "query", "params" (default: "body")
 */
const validate = (schema, type = "body") => {
  return (req, res, next) => {
    try {
      let dataToValidate;

      switch (type) {
        case "query":
          dataToValidate = req.query;
          break;
        case "params":
          dataToValidate = req.params;
          break;
        case "body":
        default:
          dataToValidate = req.body;
          break;
      }

      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const errors = result.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Data validation error.",
          errors,
        });
      }

      // Set validated data
      switch (type) {
        case "query":
          req.validatedQuery = result.data;
          break;
        case "params":
          req.validatedParams = result.data;
          break;
        case "body":
        default:
          req.validatedBody = result.data;
          break;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Aliases for simpler usage
const validateBody = (schema) => validate(schema, "body");
const validateQuery = (schema) => validate(schema, "query");
const validateParams = (schema) => validate(schema, "params");

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
};
