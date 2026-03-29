const { Op, fn, col, literal } = require("sequelize");
const { Venue } = require("../models");
const { AppError } = require("../middlewares");

class VenueService {
  async findAll(query = {}) {
    const { page = 1, limit = 10, city, search } = query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    if (city) where.city = { [Op.like]: `%${city}%` };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Venue.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [["name", "ASC"]],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    };
  }

  async findById(id) {
    const venue = await Venue.findByPk(id);

    if (!venue) {
      throw new AppError("Venue not found.", 404);
    }

    return venue;
  }

  async create(venueData) {
    const venue = await Venue.create(venueData);
    return venue;
  }

  async update(id, venueData) {
    const venue = await Venue.findByPk(id);

    if (!venue) {
      throw new AppError("Venue not found.", 404);
    }

    await venue.update(venueData);

    return venue;
  }

  async delete(id) {
    const venue = await Venue.findByPk(id);

    if (!venue) {
      throw new AppError("Venue not found.", 404);
    }

    // Check for dependencies (teams using this venue)
    const { Team } = require("../models");
    const teamCount = await Team.count({ where: { primaryVenueId: id } });

    if (teamCount > 0) {
      throw new AppError(
        "Cannot delete venue that is assigned to a team.",
        400,
      );
    }

    await venue.destroy();

    return { message: "Venue deleted successfully." };
  }

  async getStatistics() {
    const total = await Venue.count();

    const citiesResult = await Venue.findAll({
      attributes: [[fn("DISTINCT", col("city")), "city"]],
      where: { city: { [Op.ne]: null } },
      raw: true,
    });
    const cities = citiesResult.length;

    const capacityResult = await Venue.findOne({
      attributes: [
        [fn("SUM", col("capacity")), "totalCapacity"],
        [fn("AVG", col("capacity")), "avgCapacity"],
      ],
      raw: true,
    });

    return {
      total,
      cities,
      totalCapacity: parseInt(capacityResult?.totalCapacity) || 0,
      avgCapacity: Math.round(parseFloat(capacityResult?.avgCapacity)) || 0,
    };
  }
}

module.exports = new VenueService();
