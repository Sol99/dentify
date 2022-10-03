const express = require('express');
const router = express.Router();

router.get('/presupuesto', (req, res) => {
    res.render('budgets/presupuesto');
});

module.exports = router;