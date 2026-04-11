<?php
// helpers/CertificateHelper.php

function GenerateCertificateId($name, $prefix)
{
    return $prefix . '-' . strtoupper(substr($name, 0, 3)) . '-' . uniqid();
}
