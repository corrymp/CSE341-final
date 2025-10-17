const router = require('express').Router();
const theme = require('../controllers/theme');
const themeValidator = require('../validation/theme');
const { validator, requiredPermissionLevel, requiresAuth } = require('../utils');

router.post('/', requiresAuth(), requiredPermissionLevel('ADMIN'), themeValidator.create(), validator, theme.postTheme); // /theme POST => (protected:admin) create theme

router.get('/', requiresAuth(), requiredPermissionLevel('ORGANIZER'), theme.getThemes); // /theme GET => read all themes

router.get('/:idOrName', requiresAuth(), requiredPermissionLevel('ORGANIZER'), theme.getThemeByIdOrName); // /theme/{idOrName} GET => read theme

router.put('/:id', requiresAuth(), requiredPermissionLevel('ADMIN'), themeValidator.update(), validator, theme.putTheme); // /theme/{id} PUT => (protected:admin) update theme

router.delete('/:id', requiresAuth(), requiredPermissionLevel('ADMIN'), validator.path(), validator, theme.deleteTheme); // /theme/{id} DEL => (protected:admin) delete theme

module.exports = router;
