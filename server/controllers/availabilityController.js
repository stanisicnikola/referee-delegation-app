const { availabilityService, refereeService } = require("../services");
const { asyncHandler } = require("../middlewares");

/**
 * @desc    Get referee availability
 * @route   GET /api/availability/referees/:refereeId
 * @access  Private
 */
const getRefereeAvailability = asyncHandler(async (req, res) => {
  const result = await availabilityService.getByReferee(
    req.params.refereeId,
    req.query
  );

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Set referee availability
 * @route   POST /api/availability/referees/:refereeId
 * @access  Private/Admin,Referee (own)
 */
const setAvailability = asyncHandler(async (req, res) => {
  const availability = await availabilityService.setAvailability(
    req.params.refereeId,
    req.body
  );

  res.json({
    success: true,
    data: availability,
  });
});

/**
 * @desc    Set availability for date range
 * @route   POST /api/availability/referees/:refereeId/range
 * @access  Private/Admin,Referee (own)
 */
const setAvailabilityRange = asyncHandler(async (req, res) => {
  const result = await availabilityService.setAvailabilityRange(
    req.params.refereeId,
    req.body
  );

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Delete availability
 * @route   DELETE /api/availability/:id
 * @access  Private/Admin,Referee (own)
 */
const deleteAvailability = asyncHandler(async (req, res) => {
  await availabilityService.delete(req.params.id);

  res.json({
    success: true,
    message: "Availability deleted.",
  });
});

/**
 * @desc    Delete availability by date
 * @route   DELETE /api/availability/referees/:refereeId/date/:date
 * @access  Private/Admin,Referee (own)
 */
const deleteAvailabilityByDate = asyncHandler(async (req, res) => {
  await availabilityService.deleteByDate(req.params.refereeId, req.params.date);

  res.json({
    success: true,
    message: "Availability deleted.",
  });
});

/**
 * @desc    Get unavailable referees for date
 * @route   GET /api/availability/unavailable/:date
 * @access  Private/Admin,Delegate
 */
const getUnavailableReferees = asyncHandler(async (req, res) => {
  const referees = await availabilityService.getUnavailableReferees(
    req.params.date
  );

  res.json({
    success: true,
    data: referees,
  });
});

/**
 * @desc    Get available referees for date
 * @route   GET /api/availability/available/:date
 * @access  Private/Admin,Delegate
 */
const getAvailableReferees = asyncHandler(async (req, res) => {
  const referees = await availabilityService.getAvailableReferees(
    req.params.date
  );

  res.json({
    success: true,
    data: referees,
  });
});

/**
 * @desc    Get referee availability calendar
 * @route   GET /api/availability/referees/:refereeId/calendar
 * @access  Private
 */
const getCalendar = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const calendar = await availabilityService.getCalendar(
    req.params.refereeId,
    parseInt(year),
    parseInt(month)
  );

  res.json({
    success: true,
    data: calendar,
  });
});

/**
 * @desc    Copy availability from previous month
 * @route   POST /api/availability/referees/:refereeId/copy-previous
 * @access  Private/Admin,Referee (own)
 */
const copyFromPreviousMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.body;
  const result = await availabilityService.copyFromPreviousMonth(
    req.params.refereeId,
    parseInt(year),
    parseInt(month)
  );

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get my availability (for logged in referee)
 * @route   GET /api/availability/my-availability
 * @access  Private/Referee
 */
const getMyAvailability = asyncHandler(async (req, res) => {
  const referee = await refereeService.findByUserId(req.user.id);
  const result = await availabilityService.getByReferee(referee.id, req.query);

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Set my availability (for logged in referee)
 * @route   POST /api/availability/my-availability
 * @access  Private/Referee
 */
const setMyAvailability = asyncHandler(async (req, res) => {
  const referee = await refereeService.findByUserId(req.user.id);
  const availability = await availabilityService.setAvailability(
    referee.id,
    req.body
  );

  res.json({
    success: true,
    data: availability,
  });
});

/**
 * @desc    Get my calendar (for logged in referee)
 * @route   GET /api/availability/my-calendar
 * @access  Private/Referee
 */
const getMyCalendar = asyncHandler(async (req, res) => {
  const referee = await refereeService.findByUserId(req.user.id);
  const { year, month } = req.query;
  const calendar = await availabilityService.getCalendar(
    referee.id,
    parseInt(year),
    parseInt(month)
  );

  res.json({
    success: true,
    data: calendar,
  });
});

module.exports = {
  getRefereeAvailability,
  setAvailability,
  setAvailabilityRange,
  deleteAvailability,
  deleteAvailabilityByDate,
  getUnavailableReferees,
  getAvailableReferees,
  getCalendar,
  copyFromPreviousMonth,
  getMyAvailability,
  setMyAvailability,
  getMyCalendar,
};
