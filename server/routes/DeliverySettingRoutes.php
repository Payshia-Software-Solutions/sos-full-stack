<?php

require_once './controllers/DeliverySettingController.php';

$pdo = $GLOBALS['pdo'];
$deliverySettingController = new DeliverySettingController($pdo);

return [
    'GET /delivery-settings/$' => function () use ($deliverySettingController) {
        $deliverySettingController->getAll();
    },

    'GET /delivery-settings/by-course/([\w\-]+)/$' => function ($courseId) use ($deliverySettingController) {
        $deliverySettingController->getByCourseId($courseId);
    },

    'GET /delivery-settings/(\d+)/$' => function ($id) use ($deliverySettingController) {
        $deliverySettingController->getById($id);
    },

    'POST /delivery-settings/$' => function () use ($deliverySettingController) {
        $deliverySettingController->create();
    },

    'PUT /delivery-settings/(\d+)/$' => function ($id) use ($deliverySettingController) {
        $deliverySettingController->update($id);
    },

    'DELETE /delivery-settings/(\d+)/$' => function ($id) use ($deliverySettingController) {
        $deliverySettingController->delete($id);
    },

];
