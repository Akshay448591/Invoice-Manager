const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/clientController');

// Only business users can manage clients
router.use(protect, requireRole('business'));

router.route('/').get(c.getClients).post(c.createClient);
router.route('/:id').get(c.getClient).put(c.updateClient).delete(c.deleteClient);

module.exports = router;
