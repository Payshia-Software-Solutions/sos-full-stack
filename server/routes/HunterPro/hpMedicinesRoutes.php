<?php
// routes/hpMedicinesRoutes.php

require_once './controllers/HunterPro/HpMedicinesController.php';

// Instantiate the controller
$pdo = $GLOBALS['pdo'];
$hpMedicinesController = new HpMedicinesController($pdo);

// Define routes
return [
    'GET /hp-medicines/' => [$hpMedicinesController, 'getAllMedicines'],
    'GET /hp-medicines/{id}/' => [$hpMedicinesController, 'getMedicineById'],
    'POST /hp-medicines/' => [$hpMedicinesController, 'createMedicine'],
    'PUT /hp-medicines/{id}/' => [$hpMedicinesController, 'updateMedicine'],
    'DELETE /hp-medicines/{id}/' => [$hpMedicinesController, 'deleteMedicine']
];
