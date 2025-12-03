const { venueService } = require("../services");
const { asyncHandler } = require("../middlewares");

/**
 * @desc    Get all venues
 * @route   GET /api/venues
 * @access  Private
 */
const getVenues = asyncHandler(async (req, res) => {
  const result = await venueService.findAll(req.query);

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get venue by ID
 * @route   GET /api/venues/:id
 * @access  Private
 */
const getVenue = asyncHandler(async (req, res) => {
  const venue = await venueService.findById(req.params.id);

  res.json({
    success: true,
    data: venue,
  });
});

/**
 * @desc    Create venue
 * @route   POST /api/venues
 * @access  Private/Admin
 */
const createVenue = asyncHandler(async (req, res) => {
  const venue = await venueService.create(req.body);

  res.status(201).json({
    success: true,
    data: venue,
  });
});

/**
 * @desc    Update venue
 * @route   PUT /api/venues/:id
 * @access  Private/Admin
 */
const updateVenue = asyncHandler(async (req, res) => {
  const venue = await venueService.update(req.params.id, req.body);

  res.json({
    success: true,
    data: venue,
  });
});

/**
 * @desc    Delete venue
 * @route   DELETE /api/venues/:id
 * @access  Private/Admin
 */
const deleteVenue = asyncHandler(async (req, res) => {
  await venueService.delete(req.params.id);

  res.json({
    success: true,
    message: "Venue deleted successfully.",
  });
});

module.exports = {
  getVenues,
  getVenue,
  createVenue,
  updateVenue,
  deleteVenue,
};
