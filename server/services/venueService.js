const { Op } = require("sequelize");
const { Venue } = require("../models");
const { AppError } = require("../middlewares");

class VenueService {
  async findAll(query = {}) {
    const { page = 1, limit = 10, city, search } = query;
    const offset = (page - 1) * limit;

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
      limit,
      offset,
      order: [["name", "ASC"]],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
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

    await venue.destroy();

    return { message: "Venue deleted successfully." };
  }
}

module.exports = new VenueService();
