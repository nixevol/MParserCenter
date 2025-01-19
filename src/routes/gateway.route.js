const express = require('express');
const router = express.Router();
const {
  registerGateway,
  updateGateway,
  getGatewayList,  
  getGateway,
  deleteGateway,
  logoutGateway,
  getGatewayNDSList,
  updateGatewayNDS,
  addGatewayNDS,
  removeGatewayNDS
} = require('../controllers/gateway.controller');

// 网关路由
router.post('/register', registerGateway);

router.put('/:ID', updateGateway);

router.get('/', getGatewayList);  

router.get('/:ID', getGateway);

router.delete('/:ID', deleteGateway);

router.post('/:ID/logout', logoutGateway);

// 网关关联NDS路由
router.get('/:ID/nds', getGatewayNDSList);

router.put('/:ID/nds', updateGatewayNDS);
router.post('/:ID/nds', addGatewayNDS);  
router.delete('/:ID/nds/:ndsId', removeGatewayNDS);

module.exports = router;
