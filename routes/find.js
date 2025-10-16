const router = require('express').Router();
const find = require('../controllers/find');

router.get('/', find.info); // /find => usage instructions for /find
router.get('/theme', find.findTheme); // /find/theme => themes
router.get('/ongoing', find.findOngoing); // /find/ongoing => ongoing campaigns
router.get('/concluded', find.findConcluded); // /find/concluded => concluded campaigns
router.get('/ongoing/:idOrName', find.findOngoingWithTheme); // /find/ongoing/{id|name} => ongoing campaigns by theme
router.get('/concluded/:idOrName', find.findConcludedWithTheme); // /find/concluded/{id|name} => concluded campaigns by theme
router.get('/:idOrName', find.findAllOfTheme); // /find/{id|name} => campaigns by theme

module.exports = router;
