const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const authMiddleware = require('../middleware/auth');

router.get('/', equipmentController.getAllEquipment);
router.get('/:id', equipmentController.getEquipmentById);
router.post('/', authMiddleware, equipmentController.createEquipment);
router.put('/:id', authMiddleware, equipmentController.updateEquipment);
router.delete('/:id', authMiddleware, equipmentController.deleteEquipment);

module.exports = router;
