


const calendrierFormationService = require('../../services/admin/CalendrierFormationService');

const calendrierFormation = async (req, res) => {
  try {
    const sessions = Array.isArray(req.body) ? req.body : [];
    const message = await calendrierFormationService.updateCalendrierFormation(sessions);

    res.json({
      success: true,
      message,
      updatedCount: sessions.length,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getDomainesWithSessions = async (req, res) => {
  try {
    const domaines = await calendrierFormationService.fetchDomainesWithSessions();
    res.json(domaines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCalendarSessions = async (req, res) => {
  try {
    const domaines = await calendrierFormationService.fetchCalendarSessions();
    res.json(domaines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletSessionFromCalendrier = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await calendrierFormationService.removeSessionFromCalendrier(id);

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  calendrierFormation,
  getDomainesWithSessions,
  getCalendarSessions,
  deletSessionFromCalendrier,
};