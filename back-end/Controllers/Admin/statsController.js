/*const statsService = require('../../services/admin/statsService');

class StatsController {
  async getAdminStats(req, res) {
    try {
      const stats = await statsService.getAdminStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching admin statistics'
      });
    }
  }

  async getSessionStats(req, res) {
    try {
      const stats = await statsService.getSessionStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching session stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching session statistics'
      });
    }
  }
}

module.exports = new StatsController();*/